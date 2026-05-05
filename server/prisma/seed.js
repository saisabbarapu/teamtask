import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.projectMember.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@teamtask.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@teamtask.com',
      password: memberPassword,
      role: 'MEMBER'
    }
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@teamtask.com',
      password: memberPassword,
      role: 'MEMBER'
    }
  });

  console.log('👥 Created users');

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      createdBy: admin.id
    }
  });

  console.log('📁 Created project');

  // Add members to project
  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: member1.id },
      { projectId: project.id, userId: member2.id }
    ]
  });

  console.log('👥 Added members to project');

  // Create tasks
  const tasks = [
    {
      title: 'Design Homepage Mockup',
      description: 'Create a modern, responsive homepage design',
      status: 'COMPLETED',
      dueDate: new Date('2026-05-01'),
      assignedTo: member1.id,
      projectId: project.id
    },
    {
      title: 'Implement Navigation Component',
      description: 'Build the main navigation component with dropdown menus',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-05-10'),
      assignedTo: member2.id,
      projectId: project.id
    },
    {
      title: 'Setup Database Schema',
      description: 'Design and implement the database schema for the new features',
      status: 'PENDING',
      dueDate: new Date('2026-05-15'),
      assignedTo: member1.id,
      projectId: project.id
    }
  ];

  await prisma.task.createMany({
    data: tasks
  });

  console.log('📋 Created tasks');

  // Display created data
  const createdUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });

  const createdProject = await prisma.project.findFirst({
    include: {
      members: {
        include: { user: { select: { name: true, email: true } } }
      },
      tasks: true,
      _count: true
    }
  });

  console.log('\n✅ Seeding completed successfully!');
  console.log('\n📊 Created Data Summary:');
  console.log('Users:', createdUsers.length);
  console.log('Projects:', 1);
  console.log('Tasks:', 3);
  
  console.log('\n👤 Login Credentials:');
  console.log('Admin: admin@teamtask.com / admin123');
  console.log('Member 1: john@teamtask.com / member123');
  console.log('Member 2: jane@teamtask.com / member123');
  
  console.log('\n📋 Project Details:');
  console.log(`Project: ${createdProject.name}`);
  console.log(`Members: ${createdProject.members.length}`);
  console.log(`Tasks: ${createdProject.tasks.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
