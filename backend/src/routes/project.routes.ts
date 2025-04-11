import express, { Router } from 'express';
import { auth } from '../middleware/auth';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  renderProject,
  addCollaborator
} from '../controllers/project.controller';

const router: Router = express.Router();

// All routes require authentication
router.use(auth);

// Project routes
router.post('/', createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

// Project actions
router.post('/:id/render', renderProject);
router.post('/:id/collaborators', addCollaborator);

export default router;
