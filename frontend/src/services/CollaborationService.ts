import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: 'editor' | 'viewer' | 'admin';
  color: string;
  cursor?: {
    x: number;
    y: number;
    timestamp: number;
  };
  selection?: {
    clipId?: string;
    trackId?: string;
    propertyName?: string;
    timeRange?: { start: number; end: number };
  };
}

export interface Comment {
  id: string;
  userId: string;
  timestamp: number;
  text: string;
  resolved: boolean;
  replies: Comment[];
  attachments?: {
    type: 'image' | 'timestamp' | 'drawing';
    content: string;
  }[];
  timelinePosition?: {
    time: number;
    trackId?: string;
  };
}

export interface Change {
  id: string;
  userId: string;
  timestamp: number;
  type: 'add' | 'update' | 'delete';
  target: {
    type: 'clip' | 'track' | 'effect' | 'transition' | 'property';
    id: string;
  };
  data: any;
  undoData?: any;
}

export interface Version {
  id: string;
  name: string;
  timestamp: number;
  userId: string;
  description?: string;
  thumbnail?: string;
  changes: string[];
}

class CollaborationService extends EventEmitter {
  private socket: Socket;
  private projectId: string;
  private user: User;
  private users: Map<string, User> = new Map();
  private changes: Change[] = [];
  private versions: Version[] = [];
  private comments: Comment[] = [];
  private undoStack: Change[] = [];
  private redoStack: Change[] = [];

  constructor(serverUrl: string, projectId: string, user: User) {
    super();
    this.projectId = projectId;
    this.user = user;

    this.socket = io(serverUrl, {
      query: {
        projectId,
        userId: user.id
      }
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // User presence
    this.socket.on('user-joined', (user: User) => {
      this.users.set(user.id, user);
      this.emit('users-changed', Array.from(this.users.values()));
    });

    this.socket.on('user-left', (userId: string) => {
      this.users.delete(userId);
      this.emit('users-changed', Array.from(this.users.values()));
    });

    this.socket.on('cursor-moved', ({ userId, cursor }) => {
      const user = this.users.get(userId);
      if (user) {
        user.cursor = cursor;
        this.emit('cursor-moved', { userId, cursor });
      }
    });

    this.socket.on('selection-changed', ({ userId, selection }) => {
      const user = this.users.get(userId);
      if (user) {
        user.selection = selection;
        this.emit('selection-changed', { userId, selection });
      }
    });

    // Changes
    this.socket.on('change', (change: Change) => {
      this.changes.push(change);
      this.emit('change', change);
    });

    this.socket.on('undo', (userId: string) => {
      this.handleRemoteUndo(userId);
    });

    this.socket.on('redo', (userId: string) => {
      this.handleRemoteRedo(userId);
    });

    // Comments
    this.socket.on('comment-added', (comment: Comment) => {
      this.comments.push(comment);
      this.emit('comment-added', comment);
    });

    this.socket.on('comment-updated', (comment: Comment) => {
      const index = this.comments.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        this.comments[index] = comment;
        this.emit('comment-updated', comment);
      }
    });

    // Versions
    this.socket.on('version-created', (version: Version) => {
      this.versions.push(version);
      this.emit('version-created', version);
    });
  }

  // User presence methods
  updateCursor(x: number, y: number) {
    const cursor = { x, y, timestamp: Date.now() };
    this.socket.emit('cursor-moved', cursor);
  }

  updateSelection(selection: User['selection']) {
    this.socket.emit('selection-changed', selection);
  }

  // Change management
  applyChange(change: Omit<Change, 'id' | 'userId' | 'timestamp'>) {
    const fullChange: Change = {
      ...change,
      id: `change-${Date.now()}`,
      userId: this.user.id,
      timestamp: Date.now()
    };

    this.changes.push(fullChange);
    this.undoStack.push(fullChange);
    this.redoStack = [];
    this.socket.emit('change', fullChange);
    this.emit('change', fullChange);
  }

  undo() {
    const change = this.undoStack.pop();
    if (change) {
      this.redoStack.push(change);
      this.socket.emit('undo', this.user.id);
      this.emit('undo', change);
    }
  }

  redo() {
    const change = this.redoStack.pop();
    if (change) {
      this.undoStack.push(change);
      this.socket.emit('redo', this.user.id);
      this.emit('redo', change);
    }
  }

  private handleRemoteUndo(userId: string) {
    const lastChange = this.changes.findLast(c => c.userId === userId);
    if (lastChange) {
      this.emit('undo', lastChange);
    }
  }

  private handleRemoteRedo(userId: string) {
    // Implementation depends on how redo is tracked server-side
    this.emit('redo', { userId });
  }

  // Comments
  addComment(text: string, timelinePosition?: Comment['timelinePosition'], attachments?: Comment['attachments']) {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: this.user.id,
      timestamp: Date.now(),
      text,
      resolved: false,
      replies: [],
      timelinePosition,
      attachments
    };

    this.socket.emit('comment-added', comment);
    return comment;
  }

  updateComment(commentId: string, updates: Partial<Comment>) {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      Object.assign(comment, updates);
      this.socket.emit('comment-updated', comment);
    }
  }

  replyToComment(commentId: string, text: string) {
    const reply: Comment = {
      id: `comment-${Date.now()}`,
      userId: this.user.id,
      timestamp: Date.now(),
      text,
      resolved: false,
      replies: []
    };

    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.replies.push(reply);
      this.socket.emit('comment-updated', comment);
    }
  }

  // Version control
  createVersion(name: string, description?: string) {
    const version: Version = {
      id: `version-${Date.now()}`,
      name,
      description,
      timestamp: Date.now(),
      userId: this.user.id,
      changes: this.changes.map(c => c.id)
    };

    this.socket.emit('version-created', version);
    return version;
  }

  switchToVersion(versionId: string) {
    const version = this.versions.find(v => v.id === versionId);
    if (version) {
      this.socket.emit('version-switched', versionId);
      this.emit('version-switched', version);
    }
  }

  // Cleanup
  disconnect() {
    this.socket.disconnect();
    this.removeAllListeners();
  }
}

export default CollaborationService;
