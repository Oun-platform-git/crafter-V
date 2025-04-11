import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import config from './config';
import path from 'path';
import videoEffectsRouter from './routes/videoEffects';

// Routes
import authRoutes from './routes/auth';
import videoRoutes from './routes/video';
import projectRoutes from './routes/project';
import analyticsRoutes from './routes/analytics';
import aiRoutes from './routes/ai';

// Middleware
import { authMiddleware } from './middleware/auth';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/video', authMiddleware, videoRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/videos', videoEffectsRouter);

// WebSocket handling
io.on('connection', (socket) => {
  const { projectId, userId } = socket.handshake.query;

  if (projectId && userId) {
    socket.join(`project:${projectId}`);
    
    // Notify others about new collaborator
    socket.to(`project:${projectId}`).emit('collaborator:join', {
      id: userId,
      joinedAt: new Date()
    });

    // Handle project updates
    socket.on('project:update', (data) => {
      socket.to(`project:${projectId}`).emit('project:update', data);
    });

    // Handle chat messages
    socket.on('chat:message', (message) => {
      io.to(`project:${projectId}`).emit('chat:message', {
        ...message,
        userId,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      socket.to(`project:${projectId}`).emit('collaborator:leave', userId);
    });
  }
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app, httpServer, io };
