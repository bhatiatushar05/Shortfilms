const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// In-memory storage for QR codes
const qrCodeStore = new Map();

// Generate QR code for login
app.post('/api/qr-auth/generate-qr', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Generate unique session ID
    const sessionId = uuidv4();
    
    // Create QR code data
    const qrData = {
      sessionId,
      phoneNumber,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Store QR code data
    qrCodeStore.set(sessionId, qrData);

    // Generate QR code with minimal data (just session ID)
    const qrCodeData = {
      sessionId,
      phoneNumber: phoneNumber || '+91'
    };
    
    // Set expiration (5 minutes)
    setTimeout(() => {
      qrCodeStore.delete(sessionId);
    }, 5 * 60 * 1000);

    res.json({
      success: true,
      data: {
        sessionId,
        qrCodeData: qrCodeData, // Send the data, not the image
        expiresIn: '5 minutes',
        phoneNumber
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Send OTP
app.post('/api/qr-auth/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP data
    const otpData = {
      phoneNumber,
      otp,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    };

    qrCodeStore.set(`otp_${phoneNumber}`, otpData);

    // Set expiration (10 minutes)
    setTimeout(() => {
      qrCodeStore.delete(`otp_${phoneNumber}`);
    }, 10 * 60 * 1000);

    // In development, return OTP in response
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber,
        expiresIn: '10 minutes',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Verify OTP
app.post('/api/qr-auth/verify-otp', async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    // Get stored OTP data
    const storedOtpData = qrCodeStore.get(`otp_${phoneNumber}`);
    
    if (!storedOtpData) {
      return res.status(400).json({ success: false, message: 'OTP expired or not found' });
    }

    // Check attempts
    if (storedOtpData.attempts >= storedOtpData.maxAttempts) {
      qrCodeStore.delete(`otp_${phoneNumber}`);
      return res.status(400).json({ success: false, message: 'Maximum OTP attempts exceeded' });
    }

    // Increment attempts
    storedOtpData.attempts++;

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP is valid, remove it from store
    qrCodeStore.delete(`otp_${phoneNumber}`);

    // Generate mock user data
    const userId = `user_${Date.now()}`;

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: userId,
          phoneNumber,
          role: 'user'
        },
        token: `mock_token_${userId}`,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check QR status
app.get('/api/qr-auth/qr-status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const qrData = qrCodeStore.get(sessionId);
    
    if (!qrData) {
      return res.status(404).json({ success: false, message: 'QR code session not found or expired' });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        status: qrData.status,
        phoneNumber: qrData.phoneNumber,
        timestamp: qrData.timestamp
      }
    });

  } catch (error) {
    console.error('Error checking QR status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'QR Auth Test Server Running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 QR Auth Test Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 QR Auth endpoints: http://localhost:${PORT}/api/qr-auth`);
});
