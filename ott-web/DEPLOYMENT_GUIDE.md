# 🚀 ShortCinema Complete Deployment Guide

This guide will walk you through deploying your entire ShortCinema OTT platform to Vercel, including the backend API, admin dashboard, and main OTT platform.

## 📋 Prerequisites

Before starting, make sure you have:

- [ ] Node.js 18+ installed
- [ ] Vercel account created
- [ ] Supabase project set up
- [ ] AWS S3 bucket (if using for media storage)
- [ ] Git repository with your code

## 🔧 Environment Setup

### 1. Backend Environment Variables

Navigate to `ott-web/backend/` and create a `.env` file:

```bash
cd ott-web/backend
cp env.example .env
```

Edit `.env` with your production values:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-media-bucket-name

# Admin User Configuration
ADMIN_EMAIL=admin@shortcinema.com
ADMIN_PASSWORD=admin123

# Media Processing
MAX_FILE_SIZE=500MB
ALLOWED_VIDEO_FORMATS=mp4,avi,mov,mkv,webm
ALLOWED_IMAGE_FORMATS=jpg,jpeg,png,webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

## 🚀 Deployment Steps

### Option A: Automated Deployment (Recommended)

Run the master deployment script:

```bash
cd ott-web
./deploy-all.sh
```

This script will:
1. Deploy your backend API
2. Deploy your admin dashboard
3. Deploy your main OTT platform
4. Automatically configure API endpoints

### Option B: Manual Deployment

#### Step 1: Deploy Backend API

```bash
cd ott-web/backend
vercel --prod
```

**Important:** Note down the backend URL from the output (e.g., `https://your-backend.vercel.app`)

#### Step 2: Update Admin Dashboard Configuration

Edit `ott-web/admin-dashboard/vercel.json` and replace:
```json
"REACT_APP_API_URL": "https://your-backend-url.vercel.app/api"
```

With your actual backend URL:
```json
"REACT_APP_API_URL": "https://your-actual-backend.vercel.app/api"
```

#### Step 3: Deploy Admin Dashboard

```bash
cd ott-web/admin-dashboard
npm install
npm run build
vercel --prod
```

#### Step 4: Deploy Main OTT Platform

```bash
cd ott-web
npm install
npm run build
vercel --prod
```

## 🔗 Post-Deployment Configuration

### 1. Update CORS Origins

In your backend `.env` file, add your Vercel domains:

```env
CORS_ORIGINS=https://your-main-app.vercel.app,https://your-admin-dashboard.vercel.app
```

### 2. Test Admin Dashboard Login

1. Visit your admin dashboard URL
2. Login with the credentials from your `.env` file
3. Test adding/editing content

### 3. Verify Content Sync

1. Add content through admin dashboard
2. Check if it appears on your main OTT platform
3. Verify media uploads work correctly

## 🌐 Custom Domains (Optional)

### Set up custom domains in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain
5. Update DNS records as instructed

## 🔍 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version (requires 18+)
   - Clear `node_modules` and reinstall
   - Check for TypeScript/ESLint errors

2. **API Connection Issues**
   - Verify backend URL in admin dashboard config
   - Check CORS settings in backend
   - Ensure environment variables are set correctly

3. **Media Upload Issues**
   - Verify AWS S3 credentials
   - Check file size limits
   - Ensure upload directory permissions

### Debug Commands:

```bash
# Check backend logs
vercel logs your-backend-project

# Check admin dashboard logs
vercel logs your-admin-project

# Check main platform logs
vercel logs your-main-project
```

## 📱 Accessing Your Applications

After deployment, you'll have:

- **Backend API**: `https://your-backend.vercel.app`
- **Admin Dashboard**: `https://your-admin-dashboard.vercel.app`
- **Main OTT Platform**: `https://your-main-app.vercel.app`

## 🔄 Updating Deployments

### Backend Updates:
```bash
cd ott-web/backend
vercel --prod
```

### Admin Dashboard Updates:
```bash
cd ott-web/admin-dashboard
npm run build
vercel --prod
```

### Main Platform Updates:
```bash
cd ott-web
npm run build
vercel --prod
```

## 🎯 Next Steps

1. **Content Management**: Start adding movies/shows through admin dashboard
2. **User Management**: Set up user roles and permissions
3. **Analytics**: Monitor user engagement and content performance
4. **Customization**: Brand your platform with custom themes
5. **SEO**: Optimize for search engines
6. **Mobile**: Consider mobile app development

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints manually
4. Check browser console for errors
5. Review this guide for common solutions

---

**Remember:** Your admin dashboard and OTT platform are connected through the shared backend API. Changes made in the admin panel will automatically sync to your main platform! 🎬✨
