# Railway Deployment Guide

This guide will help you deploy the Team Task Manager application to Railway.

## 🚀 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your project is already on GitHub
3. **Railway CLI** (Optional): For advanced deployment

## 📋 Step-by-Step Deployment

### Step 1: Prepare Project for Railway

#### 1.1 Update Database Configuration
Railway uses PostgreSQL instead of SQLite. Update your database configuration:

```javascript
// server/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 1.2 Update Package.json Scripts
Ensure your `server/package.json` has the correct scripts:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "build": "echo 'No build step required'",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:seed": "node prisma/seed.js"
  }
}
```

#### 1.3 Create Railway Configuration File
Create `railway.toml` in the root directory:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "teamtask-api"

[services.variables]
NODE_ENV = "production"
PORT = "5000"
```

### Step 2: Deploy to Railway

#### 2.1 Connect GitHub to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Authorize Railway to access your GitHub account
4. Select the `teamtask` repository

#### 2.2 Configure Environment Variables
In Railway dashboard, add these environment variables:

**Required Variables:**
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://username:password@host:port/database
```

**Database Setup:**
1. In Railway dashboard, click "New Service" → "PostgreSQL"
2. Once created, click on the PostgreSQL service
3. Go to "Connect" tab and copy the DATABASE_URL
4. Paste it in your main service's environment variables

#### 2.3 Configure Deployment Settings
1. **Build Command**: `npm install && npm run prisma:generate && npm run prisma:migrate`
2. **Start Command**: `npm start`
3. **Health Check Path**: `/api/health`

#### 2.4 Deploy
Click "Deploy" to start the deployment process.

### Step 3: Frontend Configuration

#### 3.1 Update API URL
In `client/src/services/api.js`, update the base URL:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
```

#### 3.2 Create Frontend Build Configuration
Create `client/vite.config.js` updates:

```javascript
export default defineConfig({
  // ... existing config
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  server: {
    host: true,
    port: 3000
  }
})
```

#### 3.3 Deploy Frontend (Separate Service)
1. Create a new Railway service for the frontend
2. Set build command: `cd client && npm install && npm run build`
3. Set start command: `cd client && npm run preview`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.railway.app/api`

### Step 4: Database Migration

#### 4.1 Automatic Migration
Railway will automatically run migrations if configured properly:

```bash
# In your server.js, add this before starting the server:
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

main();
```

#### 4.2 Seed Data
Update `prisma/seed.js` to work with PostgreSQL:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@teamtask.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@teamtask.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create member users
  const memberPassword = await bcrypt.hash('member123', 12);
  
  const john = await prisma.user.upsert({
    where: { email: 'john@teamtask.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@teamtask.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: 'jane@teamtask.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@teamtask.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: 'sample-project' },
    update: {},
    create: {
      id: 'sample-project',
      name: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX',
      creatorId: admin.id,
    },
  });

  // Add members to project
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: john.id } },
    update: {},
    create: {
      projectId: project.id,
      userId: john.id,
    },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: project.id, userId: jane.id } },
    update: {},
    create: {
      projectId: project.id,
      userId: jane.id,
    },
  });

  // Create sample tasks
  await prisma.task.upsert({
    where: { id: 'task-1' },
    update: {},
    create: {
      id: 'task-1',
      title: 'Design Homepage Mockup',
      description: 'Create a modern, responsive homepage design',
      status: 'COMPLETED',
      dueDate: new Date('2026-05-01'),
      projectId: project.id,
      assignedTo: john.id,
    },
  });

  await prisma.task.upsert({
    where: { id: 'task-2' },
    update: {},
    create: {
      id: 'task-2',
      title: 'Implement Navigation Component',
      description: 'Build the main navigation component with responsive design',
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-05-10'),
      projectId: project.id,
      assignedTo: jane.id,
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Step 5: Verify Deployment

#### 5.1 Check Backend
1. Visit `https://your-backend-url.railway.app/api/health`
2. Should return: `{"message":"Team Task Manager API is running"}`

#### 5.2 Check Frontend
1. Visit `https://your-frontend-url.railway.app`
2. Should see the login page

#### 5.3 Test Authentication
1. Login with admin credentials: `admin@teamtask.com` / `admin123`
2. Verify dashboard loads correctly

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Can't reach database server
```
**Solution**: 
- Check DATABASE_URL environment variable
- Ensure PostgreSQL service is running
- Verify network connectivity

#### 2. Migration Failed
```
Error: Migration failed
```
**Solution**:
- Check Prisma schema compatibility
- Run `prisma migrate reset` in Railway console
- Verify database permissions

#### 3. Build Timeout
```
Error: Build timeout
```
**Solution**:
- Optimize package.json dependencies
- Use Railway's build cache
- Split frontend and backend into separate services

#### 4. CORS Issues
```
Error: CORS policy blocked
```
**Solution**:
- Update CORS configuration in server.js
- Add frontend URL to allowed origins
- Use environment variables for CORS settings

### Railway Console Commands

You can run commands in Railway's console:

```bash
# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Check logs
railway logs

# Restart service
railway restart
```

## 🌟 Advanced Configuration

### Custom Domain
1. In Railway dashboard, go to "Settings" → "Networking"
2. Add your custom domain
3. Configure DNS records

### Environment-Specific Configs
Create different configurations for development, staging, and production:

```javascript
// server/config/database.js
const config = {
  development: {
    database: "./dev.db"
  },
  production: {
    url: process.env.DATABASE_URL
  }
};

module.exports = config[process.env.NODE_ENV];
```

### Monitoring
1. Enable Railway's built-in monitoring
2. Set up alerts for errors and performance
3. Use Railway's logs for debugging

## 📋 Checklist Before Deploy

- [ ] Update Prisma schema to use PostgreSQL
- [ ] Configure environment variables
- [ ] Test database migrations
- [ ] Verify CORS settings
- [ ] Update API URLs for production
- [ ] Test health endpoints
- [ ] Configure custom domains (if needed)
- [ ] Set up monitoring and alerts

## 🚀 Going Live

Once deployed:
1. Share your Railway URL with stakeholders
2. Monitor performance and logs
3. Set up backup strategies
4. Plan for scaling if needed

Your Team Task Manager is now live on Railway! 🎉
