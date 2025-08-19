# OTT Platform Setup Guide

This guide will help you set up the complete OTT platform with Supabase backend and React frontend.

## 🚀 **Quick Start**

### 1. **Database Setup**

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/zefhgbbaohovxngsxwlv)
2. Navigate to **SQL Editor**
3. Run the following files in order:

   **Step 1: Content Schema**
   ```sql
   -- Copy and paste the contents of: supabase-content-schema.sql
   ```

   **Step 2: Mock Data**
   ```sql
   -- Copy and paste the contents of: supabase-mock-data.sql
   ```

### 2. **Environment Variables**

Ensure your `.env.local` file has:
```env
VITE_SUPABASE_URL=https://zefhgbbaohovxngsxwlv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZmhnYmJhb2hvdnhuZ3N4d2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjUwMjgsImV4cCI6MjA3MDk0MTAyOH0.zdVTMyy4hlIIdrghg1lU_A4D5X5i6pXdRT78U36V3zg
```

### 3. **Start Development Server**

```bash
cd ott-web
npm run dev
```

## 📋 **Implementation Checklist**

### ✅ **Completed Features**

- [x] **Content Data Model** - Complete database schema with titles, seasons, episodes
- [x] **API Contracts** - REST endpoints for catalog, user features, and billing
- [x] **Search & Pagination** - Full-text search, filtering, sorting, and pagination
- [x] **Title Summary Shape** - Lightweight data structure for lists
- [x] **Mock Data** - 20 movies + 10 series with 2 seasons each
- [x] **Dynamic Rows** - Popular, trending, new, continue, mylist, genre-based
- [x] **User Features** - Watchlist, progress tracking, continue watching
- [x] **React Query Hooks** - Optimized data fetching and caching
- [x] **Updated Components** - ContentCard, ContentRow, HeroSection
- [x] **Authentication Integration** - Supabase auth with protected routes

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

### **Key Features**

- **Row Level Security (RLS)** - Users can only access their own data
- **Validation Constraints** - Ensures data integrity
- **Optimized Indexes** - Fast queries for search and filtering
- **JSONB Support** - Flexible subtitle and metadata storage

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

## 🎨 **UI Components**

### **ContentCard**
- Poster with 2:3 aspect ratio
- Hover effects with play button
- Watchlist toggle (authenticated users)
- Progress bar for continue watching
- Genre tags and metadata

### **ContentRow**
- Horizontal scrolling with navigation
- Smooth animations and transitions
- Responsive design for all screen sizes
- Gradient fade effects

### **HeroSection**
- Full-width hero with background image
- Content information and call-to-action
- Watchlist integration
- Responsive button layout

## 📱 **Responsive Design**

- **Mobile First** - Optimized for small screens
- **Breakpoints** - sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Friendly** - Swipe gestures for mobile
- **Performance** - Lazy loading and optimized images

## 🚀 **Performance Features**

### **Caching Strategy**
- **React Query** - 5-minute stale time for home rows
- **Optimistic Updates** - Immediate UI feedback
- **Background Refetching** - Keeps data fresh
- **Memory Management** - Automatic garbage collection

### **Image Optimization**
- **WebP/AVIF Support** - Modern image formats
- **Lazy Loading** - Defer offscreen images
- **Responsive Images** - Different sizes for different screens
- **Placeholder Images** - Smooth loading experience

## 🔒 **Security Features**

### **Authentication**
- **Supabase Auth** - Secure user management
- **Protected Routes** - Guard sensitive pages
- **Session Management** - Automatic token refresh
- **Row Level Security** - Database-level protection

### **Data Validation**
- **Input Sanitization** - Prevent malicious input
- **Type Checking** - Runtime validation
- **Constraint Validation** - Database-level rules
- **Error Handling** - Graceful failure modes

## 🧪 **Testing Strategy**

### **Unit Tests**
- Component rendering
- Hook functionality
- Service methods
- Utility functions

### **Integration Tests**
- API endpoints
- Database operations
- Authentication flow
- User interactions

### **E2E Tests**
- User journeys
- Cross-browser compatibility
- Performance metrics
- Accessibility compliance

## 📊 **Monitoring & Analytics**

### **Performance Metrics**
- **Core Web Vitals** - LCP, FID, CLS
- **Bundle Analysis** - Code splitting optimization
- **Network Performance** - API response times
- **User Experience** - Interaction metrics

### **Error Tracking**
- **Error Boundaries** - Graceful error handling
- **Logging** - Structured error logs
- **Alerting** - Critical error notifications
- **Debugging** - Development tools integration

## 🚀 **Deployment**

### **Build Process**
```bash
npm run build
npm run preview
```

### **Environment Variables**
- Production Supabase credentials
- CDN configuration
- Analytics keys
- Error tracking setup

### **Optimization**
- Code splitting
- Tree shaking
- Minification
- Gzip compression

## 📚 **Additional Resources**

### **Documentation**
- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)

### **Code Examples**
- [Authentication Flow](./src/features/auth/)
- [Content Management](./src/services/)
- [UI Components](./src/components/)
- [Data Hooks](./src/hooks/)

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Database Connection**
   - Check environment variables
   - Verify Supabase project status
   - Check network connectivity

2. **Authentication Errors**
   - Clear browser storage
   - Check redirect URLs
   - Verify email confirmation settings

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

### **Support**
- Check console for error messages
- Review network tab for failed requests
- Verify database schema matches expectations
- Test with minimal data set

## 🎯 **Success Metrics**

### **Phase 3 Goals**
- [x] Home page loads with 4+ content rows
- [x] Search returns filtered results
- [x] Title pages show seasons/episodes
- [x] Watchlist toggle works correctly
- [x] Continue watching updates progress

### **Phase 4 Goals**
- [ ] Video player with HLS support
- [ ] Progress tracking every 10 seconds
- [ ] Subtitle support (WebVTT)
- [ ] Advanced search and filtering
- [ ] User preferences and settings

---

**Ready to launch your OTT platform! 🚀**

For questions or support, check the troubleshooting section or review the code examples in the respective directories.
