# QR Code Login System for ShortCinema

A comprehensive QR code and phone number authentication system that provides users with multiple login options for enhanced security and convenience.

## 🚀 Features

### QR Code Authentication
- **Dynamic QR Code Generation**: Creates unique QR codes for each login session
- **Session Management**: Tracks QR code status and expiration
- **Mobile App Integration**: Designed to work with ShortCinema mobile app
- **Real-time Status Updates**: Polling system to check authentication progress
- **Automatic Expiration**: QR codes expire after 5 minutes for security

### Phone Number Authentication
- **SMS OTP Verification**: Secure one-time password system
- **Phone Number Validation**: International format support
- **Rate Limiting**: Prevents abuse with attempt limits
- **Auto-user Creation**: Creates new accounts for first-time users

### Security Features
- **JWT Token Authentication**: Secure session management
- **Session Expiration**: Automatic cleanup of expired sessions
- **Attempt Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive phone number and OTP validation

## 🏗️ Architecture

### Backend Components
```
ott-web/backend/
├── routes/qr-auth.js          # QR authentication endpoints
├── middleware/auth.js         # JWT token handling
├── middleware/errorHandler.js # Error handling middleware
└── config/database.js         # Supabase database connection
```

### Frontend Components
```
ott-web/src/
├── components/auth/
│   ├── QRCodeLogin.jsx       # Main QR login component
│   └── MobileAppSimulator.jsx # Mobile app simulation
├── features/auth/pages/
│   └── Login.jsx             # Enhanced login page
└── pages/
    └── QRLoginDemo.jsx       # Interactive demo page
```

## 🔧 Installation & Setup

### Backend Dependencies
```bash
cd ott-web/backend
npm install qrcode uuid
```

### Frontend Dependencies
```bash
cd ott-web
npm install qrcode.react
```

### Environment Variables
Add these to your `.env` file:
```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

## 📱 API Endpoints

### QR Code Authentication
- `POST /api/qr-auth/generate-qr` - Generate new QR code
- `POST /api/qr-auth/send-otp` - Send OTP to phone number
- `POST /api/qr-auth/verify-otp` - Verify OTP and authenticate
- `GET /api/qr-auth/qr-status/:sessionId` - Check QR code status
- `POST /api/qr-auth/complete-qr-auth` - Complete mobile authentication
- `GET /api/qr-auth/qr-stats` - Get authentication statistics

### Request/Response Examples

#### Generate QR Code
```json
POST /api/qr-auth/generate-qr
{
  "phoneNumber": "+91 98765 43210"
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "uuid-here",
    "qrCode": "data:image/png;base64,...",
    "expiresIn": "5 minutes",
    "phoneNumber": "+91 98765 43210"
  }
}
```

#### Send OTP
```json
POST /api/qr-auth/send-otp
{
  "phoneNumber": "+91 98765 43210"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phoneNumber": "+91 98765 43210",
    "expiresIn": "10 minutes",
    "otp": "123456" // Only in development
  }
}
```

## 🎯 Usage

### 1. QR Code Login Flow
1. User selects "QR Code & Phone" option
2. System generates unique QR code
3. User scans QR code with mobile app
4. Mobile app authenticates user
5. Web app receives confirmation and logs user in

### 2. Phone Number Login Flow
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP code
4. System verifies OTP and authenticates user

### 3. Demo Mode
Visit `/qr-demo` to see an interactive demonstration:
- **Split View**: Shows both web and mobile interfaces
- **QR Only**: Focused QR code experience
- **Mobile Only**: Mobile app simulation

## 🔒 Security Considerations

### Production Deployment
- **SMS Service Integration**: Replace console.log OTP with actual SMS service
- **Redis Storage**: Use Redis instead of in-memory storage for sessions
- **Rate Limiting**: Implement proper rate limiting for OTP requests
- **HTTPS**: Ensure all API calls use HTTPS
- **Environment Variables**: Secure all sensitive configuration

### Mobile App Integration
- **Deep Linking**: Implement app-to-app communication
- **Session Validation**: Verify session integrity on mobile
- **Biometric Auth**: Add fingerprint/face recognition support
- **Offline Support**: Handle offline scenarios gracefully

## 🧪 Testing

### Backend Testing
```bash
cd ott-web/backend
npm test
```

### Frontend Testing
```bash
cd ott-web
npm run test
```

### Manual Testing
1. Start backend server: `npm run dev`
2. Start frontend: `npm run dev`
3. Navigate to `/login` and test QR code option
4. Visit `/qr-demo` for comprehensive testing

## 📱 Mobile App Integration

### QR Code Data Format
```json
{
  "sessionId": "uuid-here",
  "phoneNumber": "+91 98765 43210",
  "timestamp": 1640995200000
}
```

### Mobile App Requirements
- QR code scanner capability
- Network connectivity for API calls
- Secure storage for user credentials
- Push notification support (optional)

### Integration Steps
1. Scan QR code and extract session data
2. Authenticate user on mobile device
3. Call `/api/qr-auth/complete-qr-auth` with user data
4. Handle success/error responses appropriately

## 🚀 Future Enhancements

### Planned Features
- **Biometric Authentication**: Fingerprint and face recognition
- **Multi-factor Authentication**: Combine QR + OTP for high security
- **Social Login Integration**: Google, Facebook, Apple Sign-In
- **Offline QR Codes**: Generate codes that work without internet
- **Analytics Dashboard**: Track authentication patterns and success rates

### Performance Optimizations
- **WebSocket Support**: Real-time status updates instead of polling
- **Caching Layer**: Redis caching for frequently accessed data
- **CDN Integration**: Serve QR codes from CDN for faster loading
- **Progressive Web App**: Offline-capable web application

## 🐛 Troubleshooting

### Common Issues

#### QR Code Not Generating
- Check backend server status
- Verify database connection
- Check console for error messages

#### OTP Not Sending
- Verify phone number format
- Check SMS service configuration
- Review rate limiting settings

#### Authentication Failing
- Verify JWT secret configuration
- Check token expiration settings
- Review database user table structure

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=qr-auth:*
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions and support:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Note**: This is a development implementation. For production use, ensure all security measures are properly configured and tested.
