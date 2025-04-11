import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
  roles: string[];
  chatColor?: string;
  badges?: string[];
  streamKey?: string;
  channelId?: string;
  streamSettings?: {
    title: string;
    description: string;
    isLive: boolean;
    visibility: 'public' | 'private' | 'unlisted';
    quality: 'HIGH' | 'STANDARD';
    chatEnabled: boolean;
    recordingEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profilePicture: {
    type: String,
    default: ''
  },
  roles: {
    type: [String],
    default: ['user']
  },
  chatColor: {
    type: String,
    default: '#FF6B6B'
  },
  badges: {
    type: [String],
    default: []
  },
  streamKey: {
    type: String,
    unique: true,
    sparse: true
  },
  channelId: {
    type: String,
    unique: true,
    sparse: true
  },
  streamSettings: {
    title: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    isLive: {
      type: Boolean,
      default: false
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public'
    },
    quality: {
      type: String,
      enum: ['HIGH', 'STANDARD'],
      default: 'HIGH'
    },
    chatEnabled: {
      type: Boolean,
      default: true
    },
    recordingEnabled: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);
