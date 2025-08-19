# ShortCinema OTT Platform

A modern, feature-rich OTT (Over-The-Top) streaming platform built with React, Tailwind CSS, and Supabase.

## 🚀 Features

- **Modern Authentication** - Supabase-powered auth with email/password
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Smooth Animations** - Framer Motion for delightful user experience
- **Content Discovery** - Hero sections, category rows, and search
- **Protected Routes** - Secure access to user-specific features
- **Real-time Updates** - Live session management and state sync

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS with custom OTT theme
- **Authentication**: Supabase Auth
- **State Management**: React Hooks + Supabase
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios with auth interceptors

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🔧 Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ott-web
npm install
```

### 2. Supabase Project Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project credentials**:
   - Go to Settings → API
   - Copy your Project URL and anon public key

### 3. Environment Configuration

1. **Copy the environment template**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update `.env.local`** with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 4. Supabase Dashboard Configuration

1. **Enable Email Authentication**:
   - Go to Authentication → Settings
   - Enable "Enable email confirmations" (optional for development)
   - Set "Site URL" to `http://localhost:5173`

2. **Add Redirect URLs**:
   - Go to Authentication → URL Configuration
   - Add `http://localhost:5173/login`
   - Add `http://localhost:5173/signup`

3. **Set up Database Tables**:
   - Go to SQL Editor
   - Copy and run the contents of `supabase-schema.sql`

### 5. Run the Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## 🗄️ Database Schema

The platform includes two main tables with Row Level Security:

### `watchlist`
- `user_id` - References auth.users
- `title_id` - Content identifier
- `added_at` - Timestamp when added

### `progress`
- `user_id` - References auth.users  
- `title_id` - Content identifier
- `position_sec` - Current playback position
- `duration_sec` - Total content duration
- `updated_at` - Last update timestamp

## 🔐 Authentication Flow

1. **Signup**: Users create accounts with email/password
2. **Login**: Email/password authentication
3. **Session Management**: Automatic token refresh and persistence
4. **Protected Routes**: Automatic redirects for unauthenticated users
5. **Logout**: Clean session termination

## 🎨 Customization

### Tailwind Configuration
- OTT-specific color palette
- Custom animations and transitions
- Responsive breakpoints
- Component-specific utilities

### Component Structure
- Feature-based organization
- Reusable UI components
- Layout components
- Media-specific components

## 📱 Available Routes

### Public Routes
- `/` - Home/Browse page
- `/login` - Authentication
- `/signup` - User registration
- `/search` - Content search
- `/title/:id` - Content details
- `/watch/:id` - Video player

### Protected Routes
- `/account` - User profile and settings
- `/my-list` - User's watchlist
- `/continue` - Continue watching
- `/plans` - Subscription plans

## 🚀 Development

### Project Structure
```
src/
├── app/           # App configuration
├── api/           # API client and endpoints
├── components/    # Reusable components
├── features/      # Feature-based pages
├── hooks/         # Custom React hooks
├── lib/           # Third-party libraries
├── types/         # Type definitions
└── utils/         # Utility functions
```

### Adding New Features
1. Create feature directory in `src/features/`
2. Add pages in `src/features/[feature]/pages/`
3. Update routes in `src/app/routes.jsx`
4. Add any new components to `src/components/`

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the established color scheme
- Use Framer Motion for animations
- Maintain responsive design principles

## 🧪 Testing

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Build and Deploy

```bash
# Build for production
npm run build

# The built files will be in the `dist/` directory
```

## 🤝 Contributing

1. Follow the established project structure
2. Use consistent naming conventions
3. Add proper error handling
4. Include loading states
5. Test on multiple screen sizes

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the Supabase documentation
2. Review the component structure
3. Check the authentication flow
4. Verify environment variables

## 🔄 Updates and Maintenance

- Keep dependencies updated
- Monitor Supabase usage and limits
- Regular security audits
- Performance optimization
