# 🚀 ShortCinema Admin Backend Setup Guide

This guide will walk you through setting up your custom admin backend for the ShortCinema OTT platform.

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ Node.js 18+ installed
- ✅ Supabase account and project
- ✅ FFmpeg installed on your system
- ✅ Git (to clone/manage your project)

## 🎯 What We're Building

Your admin backend will include:

1. **Content Management** - Add/edit/delete movies, series, episodes
2. **User Management** - View users, manage roles, analytics
3. **Media Upload** - Handle video files, images, thumbnails
4. **Analytics Dashboard** - Platform statistics, user engagement
5. **Admin Portal** - Beautiful web interface for management

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd ott-web/backend
npm install
```

### Step 2: Environment Configuration

1. Copy the environment template:
```bash
cp env.example .env
```

2. Edit `.env` with your actual values:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=24h

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase

# AWS S3 Configuration (optional for now)
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
```

### Step 3: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the additional schema from `supabase-admin-schema.sql`
4. This creates the new tables needed for admin functionality

### Step 4: Create Admin User

1. In Supabase Auth, create a new user with your admin email
2. In SQL Editor, run:
```sql
INSERT INTO public.profiles (id, email, role) 
VALUES ('your-user-id-from-auth', 'admin@shortcinema.com', 'admin');
```

**Note**: Replace `your-user-id-from-auth` with the actual UUID from the auth.users table.

### Step 5: Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

### Step 6: Start the Backend

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Your server should start on `http://localhost:5000`

### Step 7: Test the Backend

1. Check health endpoint: `http://localhost:5000/health`
2. Test admin login: `http://localhost:5000/api/auth/login`

## 🌐 Using the Admin Frontend

1. Open `admin-frontend/index.html` in your browser
2. Login with your admin credentials
3. Start managing your platform!

## 🔧 Configuration Options

### File Upload Limits

Adjust in `.env`:
```env
MAX_FILE_SIZE=1GB
ALLOWED_VIDEO_FORMATS=mp4,avi,mov,mkv,webm,flv
ALLOWED_IMAGE_FORMATS=jpg,jpeg,png,webp,gif
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window
```

### CORS Settings

In `server.js`, update the CORS origins for production:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://yourdomain.com', 'https://admin.yourdomain.com'] 
  : ['http://localhost:3000', 'http://localhost:5173']
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get admin profile

### Content Management
- `GET /api/content/titles` - List all titles
- `POST /api/content/titles` - Create new title
- `PUT /api/content/titles/:id` - Update title
- `DELETE /api/content/titles/:id` - Delete title
- `POST /api/content/episodes` - Add episode

### User Management
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details
- `PATCH /api/users/:id/role` - Change user role
- `PATCH /api/users/:id/status` - Change user status
- `GET /api/users/:id/analytics` - User analytics

### Analytics
- `GET /api/analytics/overview` - Platform overview
- `GET /api/analytics/content` - Content performance
- `GET /api/analytics/engagement` - User engagement
- `GET /api/analytics/genres` - Genre analytics
- `GET /api/analytics/timeline` - Time-based data

### Media Upload
- `POST /api/media/upload/video` - Upload video
- `POST /api/media/upload/image` - Upload image
- `GET /api/media/title/:titleId` - Get media for title
- `DELETE /api/media/:id` - Delete media

## 🚀 Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-jwt-secret
```

### 2. Process Manager (PM2)
```bash
npm install -g pm2
pm2 start server.js --name "shortcinema-admin"
pm2 save
pm2 startup
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate
```bash
sudo certbot --nginx -d admin.yourdomain.com
```

## 🔒 Security Considerations

1. **JWT Secret**: Use a strong, random secret
2. **Rate Limiting**: Adjust based on your traffic
3. **CORS**: Restrict origins in production
4. **File Uploads**: Validate file types and sizes
5. **Admin Access**: Use strong passwords and 2FA if possible

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase URL and service role key
   - Verify database is accessible

2. **FFmpeg Not Found**
   - Install FFmpeg on your system
   - Add to PATH if needed

3. **Port Already in Use**
   - Change PORT in .env
   - Kill process using the port

4. **CORS Errors**
   - Check CORS configuration in server.js
   - Verify frontend URL is allowed

5. **File Upload Fails**
   - Check file size limits
   - Verify file formats are allowed
   - Check upload directory permissions

### Debug Mode

Enable detailed logging:
```env
NODE_ENV=development
```

Check server logs for detailed error information.

## 📈 Next Steps

After setup, consider:

1. **Cloud Storage**: Set up AWS S3 for media files
2. **CDN**: Configure CDN for faster media delivery
3. **Monitoring**: Add logging and monitoring tools
4. **Backup**: Set up database backups
5. **Scaling**: Plan for horizontal scaling

## 🆘 Getting Help

If you encounter issues:

1. Check the logs for error messages
2. Verify all environment variables are set
3. Test individual API endpoints
4. Check database permissions
5. Review the README.md for detailed documentation

## 🎉 You're All Set!

Your ShortCinema admin backend is now ready to:

- ✅ Manage content (movies, series, episodes)
- ✅ Handle user accounts and roles
- ✅ Upload and process media files
- ✅ View platform analytics
- ✅ Control access and permissions

Start building your content library and managing your OTT platform!

---

**Need help?** Check the main README.md or create an issue in your repository.
