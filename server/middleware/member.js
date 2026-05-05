import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authorizeMember = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (user.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Member access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const validateTaskOwnership = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = req.user.id;

  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, assignedTo: true }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assignedTo !== userId) {
      return res.status(403).json({ error: 'Access denied: Task not assigned to you' });
    }

    next();
  } catch (error) {
    console.error('Task ownership validation error:', error);
    res.status(500).json({ error: 'Failed to validate task ownership' });
  }
};
