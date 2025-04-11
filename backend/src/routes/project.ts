import express, { Request, Response } from 'express';
import { Project, IProject } from '../models/Project';
import mongoose from 'mongoose';

const router = express.Router();

interface ProjectRequest extends Request {
  user: {
    _id: mongoose.Types.ObjectId;
  };
}

// Get all projects for user
router.get('/', async (req: ProjectRequest, res: Response) => {
  try {
    const projects = await Project.find({ owner: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
});

// Create new project
router.post('/', async (req: ProjectRequest, res: Response) => {
  try {
    const { title, description, settings, tags } = req.body;
    
    const project = new Project({
      title,
      description,
      settings,
      tags,
      owner: req.user._id,
      collaborators: [req.user._id]
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Error creating project' });
  }
});

// Get project by ID
router.get('/:id', async (req: ProjectRequest, res: Response) => {
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
});

// Update project
router.patch('/:id', async (req: ProjectRequest, res: Response) => {
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

    const allowedUpdates = ['title', 'description', 'settings', 'scenes', 'tags'];
    const updates = req.body;

    allowedUpdates.forEach(key => {
      if (key in updates) {
        (project as any)[key] = updates[key];
      }
    });

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: 'Error updating project' });
  }
});

// Delete project
router.delete('/:id', async (req: ProjectRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project' });
  }
});

// Add collaborator
router.post('/:id/collaborators', async (req: ProjectRequest, res: Response) => {
  try {
    const { userId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const collaboratorId = new mongoose.Types.ObjectId(userId);
    
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.collaborators.includes(collaboratorId)) {
      return res.status(400).json({ error: 'User is already a collaborator' });
    }

    project.collaborators.push(collaboratorId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: 'Error adding collaborator' });
  }
});

export default router;
