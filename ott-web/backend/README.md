# ShortCinema Admin Backend

A powerful Node.js backend for managing your OTT platform with comprehensive content management, user analytics, and media processing capabilities.

## 🚀 Features

### **Content Management**
- ✅ Add/Edit/Delete movies and series
- ✅ Episode management for series
- ✅ Bulk content operations
- ✅ Content approval workflow
- ✅ Metadata management

### **User Management**
- ✅ User profiles and roles (user, admin, moderator)
- ✅ User analytics and preferences
- ✅ Subscription management
- ✅ User status control (active, suspended, banned)

### **Media Management**
- ✅ Video upload and processing (MP4, AVI, MOV, MKV, WebM)
- ✅ Image upload and optimization (Poster, Hero, Thumbnail)
- ✅ Automatic thumbnail generation
- ✅ Video transcoding and optimization
- ✅ Bulk media upload

### **Analytics Dashboard**
- ✅ Platform overview statistics
- ✅ User engagement metrics
- ✅ Content performance analytics
- ✅ Genre-based insights
- ✅ Time-based trend analysis

### **Security & Admin**
- ✅ JWT-based authentication
- ✅ Role-based access control
- ✅ Admin action logging
- ✅ Rate limiting
- ✅ Input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Supabase Auth
- **File Processing**: FFmpeg, Sharp
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account and project
- FFmpeg installed on your system
- AWS S3 account (optional, for cloud storage)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# AWS S3 Configuration (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-media-bucket-name

# Admin User Configuration
ADMIN_EMAIL=admin@shortcinema.com
ADMIN_PASSWORD=admin123
```

### 3. Database Setup

Run the additional schema in your Supabase SQL Editor:

```sql
-- Run the contents of supabase-admin-schema.sql
```

### 4. Create Admin User

1. Create a user in Supabase Auth
2. Insert into profiles table with admin role:

```sql
INSERT INTO public.profiles (id, email, role) 
VALUES ('your-user-id', 'admin@shortcinema.com', 'admin');
```

### 5. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication

#### POST `/api/auth/login`
Admin login endpoint.

**Request:**
```json
{
  "email": "admin@shortcinema.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@shortcinema.com",
      "role": "admin"
    },
    "token": "jwt-token",
    "expiresIn": "24h"
  }
}
```

### Content Management

#### GET `/api/content/titles`
Get all titles with pagination and filters.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)
- `kind` (movie/series)
- `genre` (genre filter)
- `year` (year filter)
- `rating` (rating filter)
- `search` (title search)

#### POST `/api/content/titles`
Create a new title.

**Request:**
```json
{
  "id": "movie_123",
  "kind": "movie",
  "slug": "the-avengers",
  "title": "The Avengers",
  "synopsis": "Earth's mightiest heroes...",
  "year": 2012,
  "rating": "PG-13",
  "genres": ["action", "adventure", "sci-fi"],
  "poster_url": "https://example.com/poster.jpg",
  "hero_url": "https://example.com/hero.jpg"
}
```

### User Management

#### GET `/api/users`
Get all users with pagination.

#### GET `/api/users/:id/analytics`
Get user analytics and preferences.

### Analytics

#### GET `/api/analytics/overview`
Get platform overview statistics.

#### GET `/api/analytics/content`
Get content performance analytics.

#### GET `/api/analytics/engagement`
Get user engagement metrics.

### Media Upload

#### POST `/api/media/upload/video`
Upload and process video files.

**Form Data:**
- `video`: Video file
- `title_id`: Title ID
- `episode_id`: Episode ID (optional)

#### POST `/api/media/upload/image`
Upload and process images.

**Form Data:**
- `image`: Image file
- `title_id`: Title ID
- `type`: Image type (poster/hero/thumbnail)
- `episode_id`: Episode ID (optional)

## 🔧 Configuration

### File Upload Limits

Configure in `.env`:
```env
MAX_FILE_SIZE=500MB
ALLOWED_VIDEO_FORMATS=mp4,avi,mov,mkv,webm
ALLOWED_IMAGE_FORMATS=jpg,jpeg,png,webp
```

### Rate Limiting

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set up cloud storage (AWS S3)
4. Use PM2 or similar process manager
5. Set up reverse proxy (Nginx)

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📊 Database Schema

The backend extends your existing Supabase schema with:

- **profiles**: User management and roles
- **media**: File storage and metadata
- **subscriptions**: User billing
- **admin_actions**: Audit logging
- **content_approvals**: Content moderation

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- Admin action logging

## 🧪 Testing

```bash
npm test
```

## 📝 Development

### Project Structure

```
backend/
├── config/          # Database and configuration
├── middleware/      # Auth and error handling
├── routes/          # API endpoints
├── uploads/         # File uploads (gitignored)
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Adding New Routes

1. Create route file in `routes/`
2. Add to `server.js`
3. Implement middleware as needed
4. Add to API documentation

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the documentation
- Review existing issues
- Create new issue with details

## 🔄 Updates

Keep dependencies updated:
```bash
npm update
npm audit fix
```

---

**Built with ❤️ for ShortCinema**
