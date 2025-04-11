import { Request, Response } from 'express';
import { Project, IProject, ISettings, IScene } from '../models/Project';
import { VideoService } from '../services/video.service';
import { AIService } from '../services/ai.service';
import mongoose from 'mongoose';

const videoService = new VideoService();
const aiService = new AIService();

interface ProjectUpdateBody {
  title?: string;
  description?: string;
  scenes?: IProject['scenes'];
  settings?: IProject['settings'];
  tags?: string[];
}

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error creating project' });
  }
};

export const getProjects = async (req: Request, res: Response) => {
  try {
    const match: any = { owner: req.user._id };
    const sort: any = {};

    if (req.query.status) {
      match.status = req.query.status;
    }

    if (req.query.sortBy) {
      const parts = (req.query.sortBy as string).split(':');
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const projects = await Project.find(match)
      .sort(sort)
      .limit(parseInt(req.query.limit as string) || 10)
      .skip(parseInt(req.query.skip as string) || 0);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

export const getProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { collaborators: req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'settings', 'scenes', 'tags'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    updates.forEach((update) => {
      const value = req.body[update];
      switch (update) {
        case 'settings':
          project.settings = value as ISettings;
          break;
        case 'scenes':
          project.scenes = value as IScene[];
          break;
        case 'tags':
          project.tags = value as string[];
          break;
        default:
          (project as any)[update] = value;
      }
    });

    await project.save();
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Error updating project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project' });
  }
};

export const renderProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create a new project version for rendering
    const renderVersion = {
      ...project.toObject(),
      _id: new mongoose.Types.ObjectId(),
      renderStatus: 'rendering'
    };

    // Start rendering process
    const videoService = new VideoService();
    const aiService = new AIService();

    try {
      // Process scenes with AI enhancements
      for (const scene of project.scenes) {
        await aiService.enhanceScene(scene);
      }

      // Generate the final video
      const videoUrl = await videoService.generateVideo(project.scenes, project.settings);

      // Update render version with success
      renderVersion.renderStatus = 'completed';
      renderVersion.videoUrl = videoUrl;

      await Project.create(renderVersion);
      res.json({ videoUrl });
    } catch (error) {
      // Update render version with failure
      renderVersion.renderStatus = 'failed';
      renderVersion.error = error instanceof Error ? error.message : 'Unknown error';

      await Project.create(renderVersion);
      throw error;
    }
  } catch (error) {
    console.error('Error rendering project:', error);
    res.status(500).json({ error: 'Failed to render project' });
  }
};

export const addCollaborator = async (req: Request<{ id: string }, {}, { collaboratorId: string }>, res: Response) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.collaborators.includes(new mongoose.Types.ObjectId(req.body.collaboratorId))) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    project.collaborators.push(new mongoose.Types.ObjectId(req.body.collaboratorId));
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error adding collaborator' });
  }
};

// Helper function to process individual scenes
async function processScene(scene: IProject['scenes'][0]): Promise<Buffer> {
  // This is a placeholder implementation
  // You would need to implement the actual scene processing logic
  // based on your specific requirements
  return Buffer.from('');
}
