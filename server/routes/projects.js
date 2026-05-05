import express from 'express';
import { PrismaClient } from '@prisma/client';
import { projectSchema, addMemberSchema } from '../utils/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Create project (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = projectSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description } = value;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdBy: req.user.id
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tasks: true,
        _count: {
          select: { tasks: true, members: true }
        }
      }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get projects (User-specific)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { createdBy: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
            assignedTo: true
          }
        },
        _count: {
          select: { tasks: true, members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { createdBy: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        tasks: {
          include: {
            assignee: {
              select: { id: true, name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
});

// Add member to project (Admin only)
router.post('/:id/members', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = addMemberSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { userId } = value;

    // Check if project exists and user is admin/creator
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only project creator can add members' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: req.params.id,
          userId: userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        projectId: req.params.id,
        userId: userId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json({
      message: 'Member added successfully',
      member
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from project (Admin only)
router.delete('/:id/members/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if project exists and user is admin/creator
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only project creator can remove members' });
    }

    // Remove member
    const member = await prisma.projectMember.deleteMany({
      where: {
        projectId: req.params.id,
        userId: req.params.userId
      }
    });

    if (member.count === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Get project members (for task assignment)
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { createdBy: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        creator: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Include creator and members in the list
    const allMembers = [
      {
        id: project.creator.id,
        name: project.creator.name,
        email: project.creator.email
      },
      ...project.members.map(member => member.user)
    ];

    // Remove duplicates
    const uniqueMembers = allMembers.filter((member, index, self) => 
      index === self.findIndex(m => m.id === member.id)
    );

    res.json({ members: uniqueMembers });
  } catch (error) {
    console.error('Get project members error:', error);
    res.status(500).json({ error: 'Failed to get project members' });
  }
});

// Delete project (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Check if project exists and user is admin/creator
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (project.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only project creator can delete project' });
    }

    // Delete project (cascades will delete related tasks and members)
    await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
