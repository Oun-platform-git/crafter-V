import mongoose, { Schema, Document } from 'mongoose';

interface IVideoAnalytics extends Document {
  userId: string;
  videoId: string;
  category: string;
  duration: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  retentionRate: number;
  retentionGraph: number[];
  createdAt: Date;
  updatedAt: Date;
}

interface IAIGeneration extends Document {
  userId: string;
  type: string;
  prompt: string;
  style?: string;
  status: 'started' | 'processing' | 'completed' | 'failed';
  processingTime: number;
  timestamp: Date;
}

interface IUserEngagement extends Document {
  userId: string;
  videoId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  retentionRate: number;
  timestamp: Date;
}

const VideoAnalyticsSchema = new Schema({
  userId: { type: String, required: true, index: true },
  videoId: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  duration: { type: Number, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  retentionRate: { type: Number, default: 0 },
  retentionGraph: [Number],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const AIGenerationSchema = new Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  prompt: { type: String, required: true },
  style: String,
  status: {
    type: String,
    enum: ['started', 'processing', 'completed', 'failed'],
    default: 'started'
  },
  processingTime: Number,
  timestamp: { type: Date, default: Date.now }
});

const UserEngagementSchema = new Schema({
  userId: { type: String, required: true, index: true },
  videoId: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  retentionRate: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

// Indexes
VideoAnalyticsSchema.index({ userId: 1, createdAt: -1 });
VideoAnalyticsSchema.index({ category: 1, views: -1 });

AIGenerationSchema.index({ userId: 1, timestamp: -1 });
AIGenerationSchema.index({ status: 1, timestamp: -1 });

UserEngagementSchema.index({ userId: 1, timestamp: -1 });
UserEngagementSchema.index({ videoId: 1, timestamp: -1 });

export const VideoAnalytics = mongoose.model<IVideoAnalytics>('VideoAnalytics', VideoAnalyticsSchema);
export const AIGeneration = mongoose.model<IAIGeneration>('AIGeneration', AIGenerationSchema);
export const UserEngagement = mongoose.model<IUserEngagement>('UserEngagement', UserEngagementSchema);
