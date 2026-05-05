import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

connectDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
import authRoutes from '../server/routes/auth.js';
import projectRoutes from '../server/routes/projects.js';
import taskRoutes from '../server/routes/tasks.js';
import userRoutes from '../server/routes/users.js';
import memberRoutes from '../server/routes/member.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/member', memberRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Team Task Manager API is running' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
