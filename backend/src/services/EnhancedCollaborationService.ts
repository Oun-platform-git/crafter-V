import { Server, Socket } from 'socket.io';
import { Cache } from '../utils/cache';
import { RoomManager } from '../utils/RoomManager';
import { ProjectService } from './ProjectService';
import { NotificationService } from './NotificationService';

interface CollaborationSession {
  projectId: string;
  users: Map<string, {
    socket: Socket;
    role: string;
    lastActivity: Date;
  }>;
  state: {
    currentEditor?: string;
    lockExpiry?: Date;
    changes: any[];
  };
}

export class EnhancedCollaborationService {
  private io: Server;
  private cache: Cache;
  private rooms: RoomManager;
  private projectService: ProjectService;
  private notificationService: NotificationService;
  private sessions: Map<string, CollaborationSession>;

  constructor(io: Server) {
    this.io = io;
    this.cache = new Cache();
    this.rooms = new RoomManager();
    this.projectService = new ProjectService();
    this.notificationService = new NotificationService();
    this.sessions = new Map();

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const { projectId, userId, role } = socket.handshake.query;

      if (!projectId || !userId) {
        socket.disconnect();
        return;
      }

      this.handleUserJoin(socket, projectId as string, userId as string, role as string);

      socket.on('project:update', (data) => this.handleProjectUpdate(socket, data));
      socket.on('editor:request-lock', () => this.handleEditorLockRequest(socket));
      socket.on('editor:release-lock', () => this.handleEditorLockRelease(socket));
      socket.on('chat:message', (message) => this.handleChatMessage(socket, message));
      socket.on('cursor:move', (position) => this.handleCursorMove(socket, position));
      socket.on('annotation:add', (annotation) => this.handleAnnotation(socket, annotation));
      socket.on('comment:add', (comment) => this.handleComment(socket, comment));
      socket.on('reaction:add', (reaction) => this.handleReaction(socket, reaction));
      
      socket.on('disconnect', () => this.handleUserLeave(socket));
    });
  }

  private async handleUserJoin(socket: Socket, projectId: string, userId: string, role: string) {
    const session = this.getOrCreateSession(projectId);
    
    // Add user to session
    session.users.set(userId, {
      socket,
      role,
      lastActivity: new Date()
    });

    // Join room
    socket.join(`project:${projectId}`);
    
    // Notify others
    socket.to(`project:${projectId}`).emit('user:joined', {
      userId,
      role,
      timestamp: new Date()
    });

    // Send current project state
    const projectState = await this.getProjectState(projectId);
    socket.emit('project:state', projectState);

    // Send active users list
    this.broadcastActiveUsers(projectId);
  }

  private handleUserLeave(socket: Socket) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    const session = this.sessions.get(projectId as string);
    if (!session) return;

    // Remove user from session
    session.users.delete(userId as string);

    // Notify others
    socket.to(`project:${projectId}`).emit('user:left', {
      userId,
      timestamp: new Date()
    });

    // Release editor lock if user had it
    if (session.state.currentEditor === userId) {
      this.releaseEditorLock(projectId as string);
    }

    // Broadcast updated active users list
    this.broadcastActiveUsers(projectId as string);
  }

  private async handleProjectUpdate(socket: Socket, data: any) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    const session = this.sessions.get(projectId as string);
    if (!session) return;

    // Verify user has edit permission
    if (!this.canUserEdit(session, userId as string)) {
      socket.emit('error', { message: 'No edit permission' });
      return;
    }

    // Save change to history
    session.state.changes.push({
      ...data,
      userId,
      timestamp: new Date()
    });

    // Broadcast change to others
    socket.to(`project:${projectId}`).emit('project:updated', {
      ...data,
      userId,
      timestamp: new Date()
    });

    // Save project state
    await this.saveProjectState(projectId as string, data);
  }

  private async handleEditorLockRequest(socket: Socket) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    const session = this.sessions.get(projectId as string);
    if (!session) return;

    if (this.canAcquireEditorLock(session, userId as string)) {
      this.setEditorLock(projectId as string, userId as string);
      socket.emit('editor:lock-granted', { expiry: session.state.lockExpiry });
      socket.to(`project:${projectId}`).emit('editor:locked', { userId });
    } else {
      socket.emit('editor:lock-denied', {
        currentEditor: session.state.currentEditor
      });
    }
  }

  private handleEditorLockRelease(socket: Socket) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    this.releaseEditorLock(projectId as string);
    this.io.to(`project:${projectId}`).emit('editor:unlocked');
  }

  private handleChatMessage(socket: Socket, message: any) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    const enrichedMessage = {
      ...message,
      userId,
      timestamp: new Date()
    };

    this.io.to(`project:${projectId}`).emit('chat:message', enrichedMessage);
    this.notificationService.sendMessageNotification(projectId as string, enrichedMessage);
  }

  private handleCursorMove(socket: Socket, position: any) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    socket.to(`project:${projectId}`).emit('cursor:moved', {
      userId,
      position,
      timestamp: new Date()
    });
  }

  private handleAnnotation(socket: Socket, annotation: any) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    const enrichedAnnotation = {
      ...annotation,
      userId,
      timestamp: new Date()
    };

    this.io.to(`project:${projectId}`).emit('annotation:added', enrichedAnnotation);
  }

  private handleComment(socket: Socket, comment: any) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    const enrichedComment = {
      ...comment,
      userId,
      timestamp: new Date()
    };

    this.io.to(`project:${projectId}`).emit('comment:added', enrichedComment);
    this.notificationService.sendCommentNotification(projectId as string, enrichedComment);
  }

  private handleReaction(socket: Socket, reaction: any) {
    const { projectId, userId } = socket.handshake.query;
    if (!projectId || !userId) return;

    this.io.to(`project:${projectId}`).emit('reaction:added', {
      ...reaction,
      userId,
      timestamp: new Date()
    });
  }

  private getOrCreateSession(projectId: string): CollaborationSession {
    if (!this.sessions.has(projectId)) {
      this.sessions.set(projectId, {
        projectId,
        users: new Map(),
        state: {
          changes: []
        }
      });
    }
    return this.sessions.get(projectId)!;
  }

  private async getProjectState(projectId: string) {
    const cacheKey = `project_state_${projectId}`;
    let state = await this.cache.get(cacheKey);
    
    if (!state) {
      state = await this.projectService.getProjectState(projectId);
      await this.cache.set(cacheKey, state, 300); // Cache for 5 minutes
    }
    
    return state;
  }

  private async saveProjectState(projectId: string, state: any) {
    const cacheKey = `project_state_${projectId}`;
    await this.cache.set(cacheKey, state, 300);
    await this.projectService.saveProjectState(projectId, state);
  }

  private broadcastActiveUsers(projectId: string) {
    const session = this.sessions.get(projectId);
    if (!session) return;

    const activeUsers = Array.from(session.users.entries()).map(([id, data]) => ({
      id,
      role: data.role,
      lastActivity: data.lastActivity
    }));

    this.io.to(`project:${projectId}`).emit('users:active', activeUsers);
  }

  private canUserEdit(session: CollaborationSession, userId: string): boolean {
    const user = session.users.get(userId);
    return user?.role === 'editor';
  }

  private canAcquireEditorLock(session: CollaborationSession, userId: string): boolean {
    if (!this.canUserEdit(session, userId)) return false;
    
    if (!session.state.currentEditor) return true;
    
    if (session.state.currentEditor === userId) return true;
    
    if (session.state.lockExpiry && session.state.lockExpiry < new Date()) {
      return true;
    }
    
    return false;
  }

  private setEditorLock(projectId: string, userId: string) {
    const session = this.sessions.get(projectId);
    if (!session) return;

    session.state.currentEditor = userId;
    session.state.lockExpiry = new Date(Date.now() + 30000); // 30 second lock
  }

  private releaseEditorLock(projectId: string) {
    const session = this.sessions.get(projectId);
    if (!session) return;

    session.state.currentEditor = undefined;
    session.state.lockExpiry = undefined;
  }
}
