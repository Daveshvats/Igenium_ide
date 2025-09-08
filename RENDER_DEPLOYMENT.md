# Render Deployment Guide

This guide will help you deploy your IdeaRpit application to Render using PostgreSQL.

## Prerequisites

1. **GitHub Repository**: Your code should be pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Neon Database**: You already have a Neon PostgreSQL database configured

## Deployment Options

### Option 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** with the `render.yaml` file
2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy

### Option 2: Manual Setup

1. **Create a Web Service**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Build Command**: `npm run build:prod`
     - **Start Command**: `npm start`
     - **Environment**: `Node`

2. **Set Environment Variables**:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_fgahGqk3trW1@ep-lingering-smoke-a70s84j6-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `JWT_SECRET`: Generate a secure random string

3. **Deploy**: Click "Create Web Service"

## Environment Variables

Set these in your Render dashboard:

```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_fgahGqk3trW1@ep-lingering-smoke-a70s84j6-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-secure-jwt-secret-here
```

## Database Setup

The deployment will automatically:
1. Install dependencies
2. Run `npm run db:setup` which:
   - Generates Prisma client
   - Pushes schema to PostgreSQL
   - Creates admin user

## Admin Access

After deployment, you can access the admin panel with:
- **Username**: `hellblazer`
- **Password**: `Egon_the_dragon_slayer`
- **Email**: `admin@idearpit.com`

## Custom Domain (Optional)

1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain
4. Update DNS records as instructed

## Monitoring

Render provides:
- **Logs**: View application logs in real-time
- **Metrics**: Monitor performance and usage
- **Health Checks**: Automatic health monitoring

## Troubleshooting

### Common Issues:

1. **Turbopack Build Errors**:
   - ✅ **Fixed**: Turbopack is now disabled for production builds
   - Uses standard Next.js build process for reliability

2. **Tailwind CSS Build Errors**:
   - ✅ **Fixed**: Moved Tailwind CSS dependencies to production dependencies
   - Added proper Tailwind configuration files
   - Updated PostCSS configuration for compatibility

3. **Package Lock File Sync Issues**:
   - ✅ **Fixed**: Updated package-lock.json to sync with new dependencies
   - Changed build process to use `npm install` instead of `npm ci`
   - Added robust build script for better dependency handling

4. **Production Build Not Found**:
   - ✅ **Fixed**: Separated build and database setup processes
   - Build now happens after database setup to preserve `.next` directory
   - Added startup script that handles database setup on first run

5. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Verify build command is correct
   - Ensure `NODE_ENV=production` is set

6. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check that Neon database is accessible
   - Ensure database is not sleeping (Neon free tier)

7. **Application Crashes**:
   - Check logs in Render dashboard
   - Verify environment variables are set
   - Check database connection status

### Logs Access:
- Go to your service dashboard
- Click "Logs" tab
- View real-time application logs

## Scaling

### Free Tier Limitations:
- **Sleep**: App sleeps after 15 minutes of inactivity
- **Build Time**: 90 minutes per month
- **Bandwidth**: 100GB per month

### Upgrade Options:
- **Starter Plan**: $7/month - No sleep, more resources
- **Standard Plan**: $25/month - Better performance
- **Pro Plan**: $85/month - High availability

## Security Notes

1. **Environment Variables**: Never commit sensitive data to Git
2. **JWT Secret**: Use a strong, random secret in production
3. **Database**: Your Neon database is already secure with SSL
4. **HTTPS**: Render provides free SSL certificates

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: [render.com/community](https://render.com/community)
- **Status Page**: [status.render.com](https://status.render.com)

---

Your IdeaRpit application is now ready for production deployment on Render! 🚀
