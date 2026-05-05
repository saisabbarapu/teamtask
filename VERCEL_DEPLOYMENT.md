# Vercel Deployment Guide

This guide will help you deploy the Team Task Manager application to Vercel with both frontend and backend.

## 🚀 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your project is already on GitHub
3. **Database**: External database (PostgreSQL recommended)

## 📋 Step-by-Step Deployment

### Option 1: Monorepo Deployment (Recommended)

#### Step 1: Configure Vercel Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your `teamtask` repository
4. Vercel will automatically detect the `vercel.json` configuration

#### Step 2: Set Up External Database
Since Vercel doesn't provide databases, set up an external one:

**Recommended Options:**
- **Supabase** (Free PostgreSQL)
- **PlanetScale** (Free MySQL/PostgreSQL)
- **Neon** (Free PostgreSQL)
- **Railway** (PostgreSQL only)

**Supabase Setup (Recommended):**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
5. Add to Vercel environment variables

#### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://username:password@host:port/database
```

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Test the deployment

### Option 2: Separate Deployments

#### Frontend on Vercel
1. Create new Vercel project
2. Set root directory to `client`
3. Build command: `npm install && npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.vercel.app/api`

#### Backend on Vercel
1. Create new Vercel project
2. Set root directory to `api`
3. Build command: `npm install`
4. Add all environment variables including DATABASE_URL

## 🔧 Configuration Files Created

### `vercel.json`
- Configures both frontend and backend
- Sets up routing for API calls
- Defines build settings

### `api/index.js`
- Serverless function entry point
- Imports all backend routes
- Handles database connection

## 🌍 Database Setup

### Supabase (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Create project and get connection string
# Add to Vercel environment variables
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

### Railway PostgreSQL
```bash
# Create PostgreSQL service on Railway
# Copy DATABASE_URL from Railway dashboard
# Add to Vercel environment variables
```

## 📱 Testing Deployment

### Frontend Test
1. Visit your Vercel URL
2. Should see login page
3. Test with credentials:
   - Admin: `admin@teamtask.com` / `admin123`
   - Member: `john@teamtask.com` / `member123`

### Backend Test
1. Visit `https://your-url.vercel.app/api/health`
2. Should return: `{"message":"Team Task Manager API is running"}`

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
Error: Can't reach database server
```
**Solution**: 
- Check DATABASE_URL format
- Ensure database allows external connections
- Verify connection string credentials

#### 2. CORS Issues
```
Error: CORS policy blocked
```
**Solution**:
- Update CORS configuration in api/index.js
- Add frontend URL to allowed origins

#### 3. Build Timeout
```
Error: Build timeout
```
**Solution**:
- Optimize package.json dependencies
- Use Vercel's build cache
- Split into separate deployments

#### 4. Function Timeout
```
Error: Function timeout
```
**Solution**:
- Increase maxDuration in vercel.json
- Optimize database queries
- Use edge functions for simple endpoints

## 🎯 Best Practices

### Performance
- Use Vercel Edge Functions for simple APIs
- Implement proper caching
- Optimize database queries

### Security
- Use environment variables for secrets
- Implement rate limiting
- Validate all inputs

### Monitoring
- Set up Vercel Analytics
- Monitor function performance
- Track error rates

## 📋 Deployment Checklist

Before deploying to Vercel:

- [ ] ✅ vercel.json configuration created
- [ ] ✅ api/index.js serverless function created
- [ ] ✅ Frontend API URL updated
- [ ] ✅ External database set up
- [ ] ✅ Environment variables configured
- [ ] ✅ Routes tested locally
- [ ] ✅ Build process verified

## 🌟 Advantages of Vercel

- **Zero-config deployment** from GitHub
- **Automatic HTTPS** and CDN
- **Global edge network**
- **Instant rollbacks**
- **Preview deployments**
- **Excellent performance**
- **Generous free tier**

## 🚀 Going Live

Once deployed:
1. **Custom domain**: Add your domain in Vercel dashboard
2. **Monitor performance**: Use Vercel Analytics
3. **Set up alerts**: Configure error notifications
4. **Scale as needed**: Upgrade plan for higher limits

Your Team Task Manager is now live on Vercel! 🎉
