import { Cache } from './cache';

interface Room {
  id: string;
  users: Set<string>;
  metadata: {
    name: string;
    type: string;
    createdAt: Date;
    lastActivity: Date;
    [key: string]: any;
  };
}

export class RoomManager {
  private rooms: Map<string, Room>;
  private cache: Cache;

  constructor() {
    this.rooms = new Map();
    this.cache = new Cache();
  }

  createRoom(roomId: string, metadata: any = {}): Room {
    if (this.rooms.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`);
    }

    const room: Room = {
      id: roomId,
      users: new Set(),
      metadata: {
        name: metadata.name || roomId,
        type: metadata.type || 'default',
        createdAt: new Date(),
        lastActivity: new Date(),
        ...metadata
      }
    };

    this.rooms.set(roomId, room);
    this.updateCache(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  async getRoomFromCache(roomId: string): Promise<Room | null> {
    const cacheKey = `room_${roomId}`;
    return await this.cache.get(cacheKey);
  }

  deleteRoom(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    this.rooms.delete(roomId);
    this.deleteFromCache(roomId);
    return true;
  }

  addUserToRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.users.add(userId);
    room.metadata.lastActivity = new Date();
    this.updateCache(roomId, room);
    return true;
  }

  removeUserFromRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    const removed = room.users.delete(userId);
    if (removed) {
      room.metadata.lastActivity = new Date();
      this.updateCache(roomId, room);

      // Auto-delete empty rooms after a delay
      if (room.users.size === 0) {
        setTimeout(() => {
          const currentRoom = this.rooms.get(roomId);
          if (currentRoom && currentRoom.users.size === 0) {
            this.deleteRoom(roomId);
          }
        }, 300000); // 5 minutes
      }
    }
    return removed;
  }

  getRoomUsers(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.users) : [];
  }

  isUserInRoom(roomId: string, userId: string): boolean {
    const room = this.rooms.get(roomId);
    return room ? room.users.has(userId) : false;
  }

  updateRoomMetadata(roomId: string, metadata: Partial<Room['metadata']>): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.metadata = {
      ...room.metadata,
      ...metadata,
      lastActivity: new Date()
    };

    this.updateCache(roomId, room);
    return true;
  }

  getRoomMetadata(roomId: string): Room['metadata'] | undefined {
    const room = this.rooms.get(roomId);
    return room?.metadata;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomsByType(type: string): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.metadata.type === type);
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getTotalUsers(): number {
    let total = 0;
    for (const room of this.rooms.values()) {
      total += room.users.size;
    }
    return total;
  }

  private async updateCache(roomId: string, room: Room) {
    const cacheKey = `room_${roomId}`;
    await this.cache.set(cacheKey, room, 3600); // Cache for 1 hour
  }

  private async deleteFromCache(roomId: string) {
    const cacheKey = `room_${roomId}`;
    await this.cache.delete(cacheKey);
  }
}
