# ShortCinema OTT Platform - Complete Setup Guide

## 🚀 Project Overview

ShortCinema is a modern OTT (Over-The-Top) streaming platform built with React, Node.js, Supabase, and AWS. This guide will help you set up the entire project for development and deployment.

## 📋 Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account and project
- AWS account with S3, CloudFront, and MediaConvert access
- Vercel account (for deployment)

## 🏗️ Project Structure

```
shortcinema.com/
├── ott-web/                    # Main frontend application
│   ├── src/                   # React source code
│   ├── public/                # Static assets
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
├── backend/                   # Node.js backend API
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── config/               # Configuration files
│   ├── package.json          # Backend dependencies
│   └── server.js             # Main server file
├── admin-dashboard/          # Admin panel (React)
└── docs/                     # Documentation
```

## 🔧 Environment Configuration

### 1. Frontend Environment (.env.local)

Create `ott-web/.env.local`:

```bash
# App Configuration
VITE_APP_NAME=ShortCinema
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_TIMEOUT=30000

# Stripe Configuration (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Feature Flags
VITE_ENABLE_QR_LOGIN=true
VITE_ENABLE_STRIPE_BILLING=true
VITE_ENABLE_ANALYTICS=true
```

### 2. Backend Environment (.env)

Create `ott-web/backend/.env`:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_EMAIL=admin@shortcinema.com
ADMIN_PASSWORD=admin123

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=shortcinema-ott-content

# CloudFront Configuration (Optional)
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-cloudfront-distribution-id
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net
AWS_CLOUDFRONT_KEY_PAIR_ID=your-cloudfront-key-pair-id
AWS_CLOUDFRONT_PRIVATE_KEY=your-cloudfront-private-key

# MediaConvert Configuration (Optional)
AWS_MEDIACONVERT_ENDPOINT=https://mediaconvert.us-east-1.amazonaws.com
AWS_TRANSCODER_PIPELINE_ID=your-transcoder-pipeline-id

# Security Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,https://yourdomain.com
CORS_CREDENTIALS=true
SESSION_SECRET=your-session-secret-key
SESSION_MAX_AGE=86400000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=combined
ENABLE_REQUEST_LOGGING=true
ENABLE_ERROR_LOGGING=true
```

## 🗄️ Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and API keys

### 2. Database Schema

Run the SQL scripts in this order:

1. `ott-platform-control-tables.sql` - Core tables
2. `supabase-admin-functions.sql` - Admin functions
3. `working-bollywood-images.sql` - Sample data

### 3. Configure Row Level Security (RLS)

Enable RLS on all tables and configure policies for:
- Public read access to titles and episodes
- Authenticated user access to user-specific data
- Admin access to all data

## ☁️ AWS Setup

### 1. IAM User Creation

Create an IAM user with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::shortcinema-ott-content",
        "arn:aws:s3:::shortcinema-ott-content/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:GetDistribution",
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "mediaconvert:CreateJob",
        "mediaconvert:GetJob",
        "mediaconvert:ListJobs"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. S3 Bucket Setup

1. Create bucket: `shortcinema-ott-content`
2. Enable public read access for media files
3. Configure CORS for web access
4. Set up lifecycle policies for cost optimization

### 3. CloudFront Distribution (Optional)

1. Create CloudFront distribution
2. Point to S3 bucket
3. Configure caching policies
4. Set up custom domain with SSL

### 4. MediaConvert Pipeline (Optional)

1. Create MediaConvert endpoint
2. Set up transcoding presets
3. Configure output formats

## 🚀 Development Setup

### 1. Install Dependencies

```bash
# Frontend
cd ott-web
npm install

# Backend
cd backend
npm install

# Admin Dashboard
cd admin-dashboard
npm install
```

### 2. Start Development Servers

```bash
# Terminal 1 - Frontend
cd ott-web
npm run dev

# Terminal 2 - Backend
cd ott-web/backend
npm run dev

# Terminal 3 - Admin Dashboard
cd ott-web/admin-dashboard
npm start
```

### 3. Test Configuration

```bash
# Test AWS connection
cd ott-web/backend
npm run test:aws

# Test Supabase connection
cd ott-web/backend
npm run test:server

# Test hybrid pipeline
cd ott-web/backend
npm run test:pipeline
```

## 🚀 Deployment

### 1. Vercel Frontend Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy frontend and admin dashboard

### 2. Backend Deployment

#### Option A: Vercel Functions

1. Move backend code to `ott-web/api/` directory
2. Convert to Vercel serverless functions
3. Set environment variables in Vercel

#### Option B: Separate Backend Server

1. Deploy to your preferred hosting (DigitalOcean, AWS EC2, etc.)
2. Set production environment variables
3. Configure domain and SSL

### 3. Environment Variables for Production

Update your production environment variables:

```bash
# Frontend (Vercel)
VITE_APP_ENV=production
VITE_API_BASE_URL=https://your-backend-domain.com
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET=your-production-jwt-secret
```

## 🔍 Troubleshooting

### Common Issues

1. **Missing Supabase Environment Variables**
   - Check `.env.local` file exists
   - Verify variable names start with `VITE_`
   - Restart development server

2. **AWS Connection Errors**
   - Verify IAM credentials
   - Check bucket permissions
   - Ensure region is correct

3. **CORS Errors**
   - Update CORS_ORIGIN in backend
   - Check frontend API base URL
   - Verify credentials setting

4. **Database Connection Issues**
   - Check Supabase project status
   - Verify service role key
   - Check RLS policies

### Health Checks

Use these endpoints to diagnose issues:

```bash
# Backend health
GET /api/health

# Database health
GET /api/health/database

# AWS health
GET /api/health/aws

# Storage health
GET /api/health/storage
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [AWS SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev/)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review environment configuration
3. Check service health endpoints
4. Review console logs for errors
5. Create an issue in the repository

## 🔄 Updates and Maintenance

- Regularly update dependencies
- Monitor AWS costs and usage
- Check Supabase project limits
- Review security policies
- Backup database regularly

---

**Happy Streaming! 🎬✨**
