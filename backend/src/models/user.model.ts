import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  roles: string[];
  chatColor: string;
  badges: string[];
  profile: {
    avatar?: string;
    bio?: string;
    socialLinks?: {
      youtube?: string;
      twitter?: string;
      instagram?: string;
    };
  };
  settings: {
    emailNotifications: boolean;
    twoFactorEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
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
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  roles: {
    type: [String],
    default: ['user'],
    enum: ['user', 'admin', 'moderator']
  },
  chatColor: { 
    type: String,
    default: '#000000'
  },
  badges: [String],
  profile: {
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    },
    socialLinks: {
      youtube: String,
      twitter: String,
      instagram: String
    }
  },
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    twoFactorEnabled: {
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
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export const User = model<IUser>('User', userSchema);
