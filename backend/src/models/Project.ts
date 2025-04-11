import mongoose, { Document, Schema } from 'mongoose';

export interface IScene {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio';
  content: string;
  duration: number;
  effects: Array<{
    id: string;
    options?: any;
  }>;
  transitions: Array<{
    id: string;
    duration: number;
  }>;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
  };
  rotation: number;
  opacity: number;
}

export interface ISettings {
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  quality: 'low' | 'medium' | 'high';
  format: 'mp4' | 'webm';
  maxDuration: number;
}

export interface IProject extends Document {
  title: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  settings: ISettings;
  scenes: IScene[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    aspectRatio: {
      type: String,
      enum: ['16:9', '9:16', '1:1', '4:3'],
      default: '16:9'
    },
    resolution: {
      width: {
        type: Number,
        default: 1920
      },
      height: {
        type: Number,
        default: 1080
      }
    },
    fps: {
      type: Number,
      default: 30
    },
    quality: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'high'
    },
    format: {
      type: String,
      enum: ['mp4', 'webm'],
      default: 'mp4'
    },
    maxDuration: {
      type: Number,
      default: 60 // 60 seconds
    }
  },
  scenes: [{
    id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['video', 'image', 'text', 'audio'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    effects: [{
      id: {
        type: String,
        required: true
      },
      options: {
        type: Schema.Types.Mixed
      }
    }],
    transitions: [{
      id: {
        type: String,
        required: true
      },
      duration: {
        type: Number,
        required: true
      }
    }],
    position: {
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      z: {
        type: Number,
        default: 0
      }
    },
    scale: {
      x: {
        type: Number,
        default: 1
      },
      y: {
        type: Number,
        default: 1
      }
    },
    rotation: {
      type: Number,
      default: 0
    },
    opacity: {
      type: Number,
      default: 1
    }
  }],
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ owner: 1, title: 1 });
projectSchema.index({ collaborators: 1 });
projectSchema.index({ 'settings.aspectRatio': 1 });
projectSchema.index({ tags: 1 });

export const Project = mongoose.model<IProject>('Project', projectSchema);
