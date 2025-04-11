import { Schema, model, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  owner: Schema.Types.ObjectId;
  collaborators: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
  settings: {
    visibility: 'public' | 'private' | 'unlisted';
    allowComments: boolean;
    monetization: boolean;
  };
}

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  settings: {
    visibility: { 
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'private'
    },
    allowComments: { type: Boolean, default: true },
    monetization: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export const Project = model<IProject>('Project', projectSchema);
