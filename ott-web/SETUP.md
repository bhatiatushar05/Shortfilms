# OTT Platform Setup Guide

This guide will help you set up the complete OTT platform with Supabase backend and React frontend.

## 🚀 **Quick Start**

### 1. **Database Setup**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Run the following files in order:

   **Step 1: Admin Functions**
   ```sql
   -- Copy and paste the contents of: backend/supabase-admin-functions.sql
   ```

   **Step 2: OTT Platform Control Tables**
   ```sql
   -- Copy and paste the contents of: backend/ott-platform-control-tables.sql
   ```

### 2. **Environment Variables**

Ensure your `.env.local` file has:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. **Start Development Servers**

```bash
# Start Backend
cd ott-web/backend
npm start

# Start OTT Frontend (in new terminal)
cd ott-web
npm run dev

# Start Admin Dashboard (in new terminal)
cd ott-web/admin-dashboard
npm start
```

## 📋 **Implementation Checklist**

### ✅ **Completed Features**

- [x] **Content Data Model** - Complete database schema with titles, seasons, episodes
- [x] **API Contracts** - REST endpoints for catalog, user features, and billing
- [x] **Search & Pagination** - Full-text search, filtering, sorting, and pagination
- [x] **Title Summary Shape** - Lightweight data structure for lists
- [x] **Dynamic Rows** - Popular, trending, new, continue, mylist, genre-based
- [x] **User Features** - Watchlist, progress tracking, continue watching
- [x] **React Query Hooks** - Optimized data fetching and caching
- [x] **Updated Components** - ContentCard, ContentRow, HeroSection
- [x] **Authentication Integration** - Supabase auth with protected routes
- [x] **Admin Dashboard** - Complete user management system
- [x] **User Control System** - Suspend/restrict users with OTT platform enforcement

### 🔄 **Next Steps (Phase 4)**

- [ ] **Video Player** - HLS playback with progress tracking
- [ ] **Title Detail Pages** - Full content information with seasons/episodes
- [ ] **Search Implementation** - Advanced search with filters
- [ ] **User Preferences** - Settings and customization
- [ ] **Billing Integration** - Subscription management
- [ ] **Performance Optimization** - Image lazy loading, virtual scrolling

## 🗄️ **Database Schema Overview**

### **Core Tables**

1. **`titles`** - Main content table (movies & series)
2. **`seasons`** - Series seasons
3. **`episodes`** - Series episodes
4. **`watchlist`** - User watchlists
5. **`progress`** - Viewing progress tracking
6. **`user_controls`** - User access control (suspend/restrict)
7. **`user_subscriptions`** - User subscription management

### **Key Features**

- **Row Level Security (RLS)** - Users can only access their own data
- **Validation Constraints** - Ensures data integrity
- **Optimized Indexes** - Fast queries for search and filtering
- **JSONB Support** - Flexible subtitle and metadata storage
- **Admin Control** - Complete user management system

## 🔧 **API Endpoints**

### **Public Endpoints**
- `GET /catalog` - Browse content with filters
- `GET /title/:id` - Content details
- `GET /rows` - Dynamic home page rows

### **Protected Endpoints**
- `POST /user/watchlist` - Toggle watchlist
- `GET /user/watchlist` - Get user's watchlist
- `GET /user/continue` - Continue watching
- `POST /progress` - Update viewing progress

### **Admin Endpoints**
- `POST /admin-control/ott-user/control` - Suspend/activate/restrict users
- `POST /admin-control/ott-user/subscription` - Change user subscriptions
- `GET /admin-control/ott-user/:id/status` - Get user status

## 🎨 **UI Components**

### **ContentCard**
- Poster with 2:3 aspect ratio
- Hover effects with play button
- Watchlist toggle (authenticated users)
- Progress bar for continue watching
- Genre tags and metadata

### **Admin Dashboard**
- User management with real-time status
- User suspension and restriction
- Subscription management
- Analytics and monitoring

## 🚀 **Deployment**

See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions to Vercel.
