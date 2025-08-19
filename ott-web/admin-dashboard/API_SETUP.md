# API Setup Guide for Admin Dashboard

## Configuration

The admin dashboard needs to be configured to connect to your backend API. Here's how to set it up:

### 1. Environment Variables

Create a `.env` file in the `ott-web/admin-dashboard/` directory:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:5001/api

# Development settings
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

### 2. Backend Server

Make sure your backend server is running on port 5001:

```bash
cd ott-web/backend
npm start
# or
node server.js
```

### 3. Admin Dashboard

Start the admin dashboard:

```bash
cd ott-web/admin-dashboard
npm start
```

The dashboard will run on `http://localhost:3000`

## API Endpoints

The dashboard connects to these backend endpoints:

### Users
- `GET /api/users` - List all users
- `PATCH /api/users/:id/role` - Update user role
- `PATCH /api/users/:id/status` - Update user status
- `DELETE /api/users/:id` - Delete user

### Content
- `GET /api/content/titles` - List all content titles

### Analytics
- `GET /api/analytics/overview` - Platform overview statistics

### Media
- `POST /api/media/upload/video` - Upload video files
- `POST /api/media/upload/image` - Upload image files

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend allows requests from `http://localhost:3000`
2. **Connection Refused**: Ensure backend is running on port 5001
3. **API Errors**: Check browser console for detailed error messages

### Debug Mode

Set `REACT_APP_DEBUG=true` in your `.env` file to see detailed API request/response logs in the console.

## Testing the Connection

1. Open the admin dashboard
2. Navigate to "User Management"
3. Check the browser console for API calls
4. Verify that users are loaded from your backend

If you see mock data, it means the API connection failed and the dashboard is using fallback data.
