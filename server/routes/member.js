import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authorizeMember, validateTaskOwnership } from '../middleware/member.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get assigned projects for member
router.get('/projects', authorizeMember, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          select: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get member projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get member's assigned tasks
router.get('/tasks', authorizeMember, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: req.user.id
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        dueDate: true,
        createdAt: true,
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get member tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Update task status (member can only update their own tasks)
router.put('/tasks/:id', authorizeMember, validateTaskOwnership, async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
        project: {
          select: { id: true, name: true }
        }
      }
    });

    res.json({ task: updatedTask });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Failed to update task status' });
  }
});

// Get member dashboard data
router.get('/dashboard', authorizeMember, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await prisma.task.findMany({
      where: {
        assignedTo: req.user.id
      },
      select: {
        id: true,
        status: true,
        dueDate: true
      }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
    const overdueTasks = tasks.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < today && 
      t.status !== 'COMPLETED'
    ).length;

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks
      }
    });
  } catch (error) {
    console.error('Get member dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

export default router;
