# ShortCinema Admin Dashboard

A modern, responsive admin dashboard built with React and Material-UI for managing the ShortCinema OTT platform.

## 🚀 Quick Start

### 1. **Start Backend Server**
```bash
cd ott-web/backend
npm install
npm start
# Backend will run on http://localhost:5001
```

### 2. **Start Admin Dashboard**
```bash
cd ott-web/admin-dashboard
npm install
npm start
# Dashboard will run on http://localhost:3000
```

### 3. **Configure API Connection**
Create a `.env` file in the admin-dashboard directory:
```bash
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

## Features

### 🎨 **Black & Red Theme**
- Sleek dark interface with red accents
- Modern gradient backgrounds
- Professional admin portal appearance

### 👥 **User Management**
- **View All Users**: See complete user list with details
- **Online Users**: Real-time display of currently logged-in users
- **User Status**: Track active, suspended, and banned users
- **Current Activity**: See what users are doing (watching content, browsing, etc.)
- **Last Activity**: Track when users were last active
- **User Analytics**: View individual user statistics and preferences

### 📊 **Dashboard Overview**
- Real-time statistics cards
- User growth charts
- Content distribution analytics
- Quick action buttons

### 🎬 **Content Management**
- Add/edit/delete content
- Manage movies, series, and shorts
- Upload media files (videos, posters, hero images)

### 📈 **Analytics**
- User engagement metrics
- Content performance tracking
- Platform growth visualization

## How to See Logged-In Users

### 1. **Navigate to User Management**
- Click on "User Management" in the left sidebar
- This section shows all users with their current status

### 2. **Online Status Indicators**
- **Green Badge**: Users currently online
- **Online Chip**: Shows "Online" status with green color
- **Current Activity**: Displays what the user is doing (e.g., "Watching: Avengers Endgame")
- **Last Activity**: Shows time since last activity (e.g., "2m ago")

### 3. **Real-Time Updates**
- User data refreshes every 30 seconds automatically
- Online status updates in real-time
- Current activity tracking

### 4. **User Details**
- **Avatar**: User profile picture with online indicator
- **Status**: Active, suspended, or banned
- **Role**: User, admin, or moderator
- **Subscription**: Free, premium, or pro
- **Actions**: Edit, delete, or change user status

## Stats Cards

The dashboard shows key metrics at the top:
- **Total Users**: All registered users
- **Online Now**: Currently active users
- **Premium Users**: Users with premium subscriptions
- **Active Users**: Users with active status

## 🔧 Troubleshooting

### Common Issues

1. **"Actions are not working"**
   - Make sure backend server is running on port 5001
   - Check browser console for API errors
   - Verify CORS settings in backend

2. **"Backend not showing users"**
   - Check if backend is running: `curl http://localhost:5001/health`
   - Verify API endpoints are accessible
   - Check authentication token

3. **"Last Activity shows NaN"**
   - This was a JavaScript date parsing issue (now fixed)
   - Refresh the page to see correct data

### Testing API Connection

Run the test script to verify backend connectivity:
```bash
cd ott-web/admin-dashboard
node test-api.js
```

### Debug Mode

Set `REACT_APP_DEBUG=true` in your `.env` file to see detailed API request/response logs in the console.

## Technology Stack

- **Frontend**: React 18, Material-UI 5
- **Charts**: Recharts
- **Icons**: Material Icons
- **Styling**: Material-UI with custom theme
- **State Management**: React hooks
- **API Client**: Axios with centralized configuration

## API Integration

The dashboard integrates with the ShortCinema backend API:
- **Base URL**: `http://localhost:5001/api`
- **Authentication**: JWT token-based
- **Endpoints**: Users, Content, Analytics, Media

### Key Endpoints
- `GET /api/users` - List all users
- `PATCH /api/users/:id/status` - Update user status
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user
- `GET /api/analytics/overview` - Platform statistics

## Customization

The theme can be customized by modifying:
- `src/App.js` - Main theme configuration
- `src/components/` - Individual component styling
- `src/config/api.js` - API configuration
- Color scheme: Currently uses black (#000000) and red (#dc2626) palette

## Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Verify backend server is running
3. Check browser console for errors
4. Review API_SETUP.md for detailed configuration
