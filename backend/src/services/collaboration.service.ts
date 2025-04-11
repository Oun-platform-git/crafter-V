import { Schema, Types } from 'mongoose';
import { WebSocket } from 'ws';
import { Project, IProject } from '../models/Project';
import { User, IUser } from '../models/User';

interface CollaborationSession {
  projectId: Schema.Types.ObjectId;
  participants: Map<Schema.Types.ObjectId, WebSocket>;
  changes: Array<{
    userId: Schema.Types.ObjectId;
    timestamp: number;
    action: string;
    data: any;
  }>;
}

export class CollaborationService {
  private sessions: Map<string, CollaborationSession>;

  constructor() {
    this.sessions = new Map();
  }

  async createSession(projectId: Schema.Types.ObjectId, owner: Schema.Types.ObjectId): Promise<void> {
    if (this.sessions.has(projectId.toString())) {
      throw new Error('Session already exists');
    }

    this.sessions.set(projectId.toString(), {
      projectId,
      participants: new Map(),
      changes: []
    });
  }

  async joinSession(projectId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId, socket: WebSocket): Promise<void> {
    const session = this.sessions.get(projectId.toString());
    if (!session) {
      throw new Error('Session not found');
    }

    // Add participant to session
    session.participants.set(userId, socket);

    // Set up message handlers
    socket.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        await this.handleMessage(projectId, userId, data);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle disconnection
    socket.on('close', () => {
      this.leaveSession(projectId, userId).catch(console.error);
    });

    // Notify other participants
    this.broadcastToSession(projectId, {
      type: 'participant_joined',
      userId: userId.toString()
    });
  }

  async leaveSession(projectId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId): Promise<void> {
    const session = this.sessions.get(projectId.toString());
    if (!session) return;

    session.participants.delete(userId);

    // Clean up empty sessions
    if (session.participants.size === 0) {
      this.sessions.delete(projectId.toString());
    } else {
      // Notify remaining participants
      this.broadcastToSession(projectId, {
        type: 'participant_left',
        userId: userId.toString()
      });
    }
  }

  private async handleMessage(projectId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId, message: {
    type: string;
    data: any;
  }): Promise<void> {
    const session = this.sessions.get(projectId.toString());
    if (!session) return;

    // Record the change
    session.changes.push({
      userId,
      timestamp: Date.now(),
      action: message.type,
      data: message.data
    });

    // Broadcast to other participants
    this.broadcastToSession(projectId, {
      type: message.type,
      userId: userId.toString(),
      data: message.data
    }, [userId.toString()]); // Exclude sender
  }

  private broadcastToSession(projectId: Schema.Types.ObjectId, message: any, excludeUsers: string[] = []): void {
    const session = this.sessions.get(projectId.toString());
    if (!session) return;

    const messageStr = JSON.stringify(message);

    session.participants.forEach((socket, userId) => {
      if (!excludeUsers.includes(userId.toString()) && socket.readyState === WebSocket.OPEN) {
        socket.send(messageStr);
      }
    });
  }

  async getSessionParticipants(projectId: Schema.Types.ObjectId): Promise<string[]> {
    const session = this.sessions.get(projectId.toString());
    if (!session) return [];

    return Array.from(session.participants.keys()).map(id => id.toString());
  }

  async getSessionChanges(projectId: Schema.Types.ObjectId): Promise<Array<{
    userId: Schema.Types.ObjectId;
    timestamp: number;
    action: string;
    data: any;
  }>> {
    const session = this.sessions.get(projectId.toString());
    if (!session) return [];

    return session.changes;
  }

  async shareProject(projectId: Schema.Types.ObjectId, userId: Schema.Types.ObjectId, collaboratorEmails: string[]): Promise<void> {
    const project = await Project.findById(projectId).exec();
    if (!project) {
      throw new Error('Project not found');
    }

    // Find collaborators
    const collaborators = await User.find({
      email: { $in: collaboratorEmails }
    }).exec();

    // Add collaborators to project
    project.collaborators = project.collaborators || [];
    project.collaborators.push(...collaborators.map(c => c._id as Schema.Types.ObjectId));
    await project.save();

    // Create collaboration session if it doesn't exist
    if (!this.sessions.has(projectId.toString())) {
      await this.createSession(projectId, userId);
    }
  }
}
