import express from 'express';
import { PrismaClient } from '@prisma/client';
import { taskSchema, updateTaskSchema } from '../utils/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create task (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, description, dueDate, assignedTo, projectId } = value;

    // Check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdBy: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or access denied' });
    }

    // Check if assigned user exists and is a project member
    const assignedUser = await prisma.user.findUnique({
      where: { id: assignedTo }
    });

    if (!assignedUser) {
      return res.status(404).json({ error: 'Assigned user not found' });
    }

    const isMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: assignedTo
        }
      }
    });

    if (!isMember && project.createdBy !== assignedTo) {
      return res.status(400).json({ error: 'Assigned user must be a project member' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        projectId
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get tasks (filter by user/project)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;

    let whereClause = {
      project: {
        OR: [
          { createdBy: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    };

    if (projectId) {
      whereClause.projectId = projectId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (assignedTo) {
      whereClause.assignedTo = assignedTo;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
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
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Get single task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: {
          OR: [
            { createdBy: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task' });
  }
});

// Update task status (Members can update their own tasks, Admin can update any)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { status } = value;

    // Find task and check access
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: {
          OR: [
            { createdBy: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      },
      include: {
        project: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions: Admin can update any, Members can only update their own tasks
    const isAdmin = req.user.role === 'ADMIN';
    const isAssignedToUser = task.assignedTo === req.user.id;
    const isProjectCreator = task.project.createdBy === req.user.id;

    if (!isAdmin && !isAssignedToUser && !isProjectCreator) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        project: {
          select: { id: true, name: true }
        },
        assignee: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Find task and check if user has access
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        project: {
          OR: [
            { createdBy: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const now = new Date();
    
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          OR: [
            { createdBy: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length;
    const pendingTasks = tasks.filter(task => task.status === 'PENDING').length;
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
    
    const overdueTasks = tasks.filter(task => {
      return task.dueDate && 
             new Date(task.dueDate) < now && 
             task.status !== 'COMPLETED';
    }).length;

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

export default router;
