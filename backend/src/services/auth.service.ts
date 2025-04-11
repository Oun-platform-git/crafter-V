import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

interface TokenPayload {
  userId: string;
  username: string;
  roles: string[];
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
  }

  async register(username: string, email: string, password: string): Promise<{ user: Partial<IUser>; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] }).exec();
      if (existingUser) {
        throw new Error('Username or email already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        roles: ['user'],
        chatColor: this.generateRandomColor(),
        badges: []
      });

      // Generate token
      const token = this.generateToken({
        userId: (user._id as Types.ObjectId).toString(),
        username: user.username,
        roles: user.roles
      });

      return { user: this.sanitizeUser(user), token };
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  }

  async login(usernameOrEmail: string, password: string): Promise<{ user: Partial<IUser>; token: string }> {
    try {
      // Find user
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
      }).exec();

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken({
        userId: (user._id as Types.ObjectId).toString(),
        username: user.username,
        roles: user.roles
      });

      return { user: this.sanitizeUser(user), token };
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  }

  async validateToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  async updateUser(userId: string, updates: Partial<IUser>): Promise<Partial<IUser>> {
    try {
      // Don't allow updating sensitive fields
      delete updates.password;
      delete updates.roles;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      ).exec();

      if (!user) {
        throw new Error('User not found');
      }

      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findById(userId).exec();
      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new Error('Invalid old password');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await User.findByIdAndUpdate(userId, {
        $set: { password: hashedPassword }
      }).exec();
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async addUserRole(userId: string, role: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { roles: role }
      }).exec();
    } catch (error) {
      console.error('Error adding user role:', error);
      throw error;
    }
  }

  async removeUserRole(userId: string, role: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { roles: role }
      }).exec();
    } catch (error) {
      console.error('Error removing user role:', error);
      throw error;
    }
  }

  private generateToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.JWT_EXPIRES_IN,
      algorithm: 'HS256'
    };
    return jwt.sign(payload, this.JWT_SECRET, options);
  }

  private sanitizeUser(user: IUser): Partial<IUser> {
    const sanitized = user.toObject();
    delete sanitized.password;
    return sanitized;
  }

  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9B9B9B', '#588C7E',
      '#FFD93D', '#FF8E72'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
