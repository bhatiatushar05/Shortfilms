# ShortCinema Backend Server

A robust Node.js backend for the ShortCinema OTT platform with hybrid storage (Supabase + AWS S3), authentication, and media management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project
- AWS account (optional, for media storage)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   # Option 1: Use the startup script (recommended)
   ./start.sh
   
   # Option 2: Use npm
   npm start
   
   # Option 3: Development mode
   npm run dev
   ```

4. **Stop the server:**
   ```bash
   ./stop.sh
   ```

## ⚙️ Configuration

### Required Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS (optional)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Admin
ADMIN_EMAIL=admin@shortcinema.com
ADMIN_PASSWORD=admin123
```

### Optional Environment Variables

```bash
# CloudFront CDN
AWS_CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
AWS_CLOUDFRONT_DOMAIN=your-domain.cloudfront.net

# Media Convert
AWS_MEDIACONVERT_ENDPOINT=https://mediaconvert.us-east-1.amazonaws.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 API Endpoints

### Health & Status
- `GET /health` - Basic health check
- `GET /api/health` - Comprehensive system health
- `GET /` - API information

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/debug` - Debug authentication

### Content Management
- `GET /api/content` - Get content
- `POST /api/content` - Create content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Media Management
- `POST /api/media/upload` - Upload media files
- `GET /api/media/:id` - Get media info
- `DELETE /api/media/:id` - Delete media

### User Management
- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Analytics
- `GET /api/analytics` - Get analytics data
- `POST /api/analytics` - Log analytics event

## 🗄️ Database Schema

The backend uses Supabase with the following main tables:
- `titles` - Movie/Series metadata
- `episodes` - Series episode information
- `profiles` - User profiles
- `media` - Media file references
- `analytics` - User behavior tracking

## ☁️ Storage Architecture

### Hybrid Storage System
- **Metadata**: Stored in Supabase PostgreSQL
- **Media Files**: Stored in AWS S3 (optional)
- **Fallback**: Supabase Storage when AWS unavailable

### Supported Media Types
- **Video**: MP4, AVI, MOV, MKV, WebM
- **Images**: JPG, JPEG, PNG, WebP
- **Max File Size**: 500MB (configurable)

## 🧪 Testing

### Run Connection Test
```bash
node test-connection.js
```

### Health Check
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3001
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Connection Failed**
   - Verify Supabase credentials in `.env`
   - Check network connectivity
   - Verify database permissions

3. **AWS Services Not Working**
   - Verify AWS credentials in `.env`
   - Check IAM permissions
   - Verify S3 bucket exists

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration
   - Verify token format

### Debug Mode

Enable debug logging by setting:
```bash
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true
```

## 📊 Monitoring

### Health Endpoints
- `/health` - Basic status
- `/api/health` - Detailed system health
- `/api/health/database` - Database status
- `/api/health/aws` - AWS services status
- `/api/health/storage` - Storage system status

### Logs
The server logs important events including:
- Server startup/shutdown
- Database connections
- AWS service status
- Authentication attempts
- Error details

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevent abuse
- **CORS Protection** - Cross-origin security
- **Helmet.js** - Security headers
- **Input Validation** - Request sanitization
- **Error Handling** - Secure error responses

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT_SECRET
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all endpoints

### Environment Variables
Ensure all required environment variables are set in production:
```bash
# Required
PORT, NODE_ENV, JWT_SECRET
SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Optional but recommended
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
```

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Support

For issues and questions:
1. Check this README
2. Review error logs
3. Test with `test-connection.js`
4. Check health endpoints
5. Verify environment configuration
