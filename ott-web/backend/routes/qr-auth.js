const express = require('express');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();

// In-memory storage for QR codes (in production, use Redis or database)
const qrCodeStore = new Map();

// Generate QR code for login
router.post('/generate-qr', async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      throw new AppError('Phone number is required', 400, 'Validation Error');
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      throw new AppError('Invalid phone number format', 400, 'Validation Error');
    }

    // Generate unique session ID
    const sessionId = uuidv4();
    
    // Create QR code data
    const qrData = {
      sessionId,
      phoneNumber,
      timestamp: Date.now(),
      status: 'pending',
      attempts: 0,
      maxAttempts: 3
    };

    // Store QR code data
    qrCodeStore.set(sessionId, qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify({
      sessionId,
      phoneNumber,
      timestamp: qrData.timestamp
    }));

    // Set expiration (5 minutes)
    setTimeout(() => {
      qrCodeStore.delete(sessionId);
    }, 5 * 60 * 1000);

    res.json({
      success: true,
      data: {
        sessionId,
        qrCode: qrCodeDataUrl,
        expiresIn: '5 minutes',
        phoneNumber
      }
    });

  } catch (error) {
    next(error);
  }
});

// Verify phone number and send OTP
router.post('/send-otp', async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      throw new AppError('Phone number is required', 400, 'Validation Error');
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      throw new AppError('Invalid phone number format', 400, 'Validation Error');
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with phone number (in production, use proper SMS service)
    const otpData = {
      phoneNumber,
      otp,
      timestamp: Date.now(),
      attempts: 0,
      maxAttempts: 3
    };

    // Store OTP data (in production, use Redis with TTL)
    qrCodeStore.set(`otp_${phoneNumber}`, otpData);

    // Set expiration (10 minutes)
    setTimeout(() => {
      qrCodeStore.delete(`otp_${phoneNumber}`);
    }, 10 * 60 * 1000);

    // In production, integrate with SMS service here
    // For now, we'll return the OTP in response (remove this in production)
    console.log(`OTP for ${phoneNumber}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        phoneNumber,
        expiresIn: '10 minutes',
        // Remove this in production
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      }
    });

  } catch (error) {
    next(error);
  }
});

// Verify OTP and authenticate user
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    if (!phoneNumber || !otp) {
      throw new AppError('Phone number and OTP are required', 400, 'Validation Error');
    }

    // Get stored OTP data
    const storedOtpData = qrCodeStore.get(`otp_${phoneNumber}`);
    
    if (!storedOtpData) {
      throw new AppError('OTP expired or not found', 400, 'OTP Error');
    }

    // Check attempts
    if (storedOtpData.attempts >= storedOtpData.maxAttempts) {
      qrCodeStore.delete(`otp_${phoneNumber}`);
      throw new AppError('Maximum OTP attempts exceeded', 400, 'OTP Error');
    }

    // Increment attempts
    storedOtpData.attempts++;

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      throw new AppError('Invalid OTP', 400, 'OTP Error');
    }

    // OTP is valid, remove it from store
    qrCodeStore.delete(`otp_${phoneNumber}`);

    // Check if user exists in database
    let { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, phone_number, role')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw new AppError('Database error', 500, 'Database Error');
    }

    let userId;
    let userRole = 'user';

    if (!user) {
      // Create new user if doesn't exist
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          phone_number: phoneNumber,
          role: 'user',
          created_at: new Date().toISOString()
        })
        .select('id, role')
        .single();

      if (createError) {
        throw new AppError('Failed to create user', 500, 'Database Error');
      }

      userId = newUser.id;
      userRole = newUser.role;
    } else {
      userId = user.id;
      userRole = user.role;
    }

    // Generate JWT token
    const token = generateToken(userId);

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        user: {
          id: userId,
          phoneNumber,
          role: userRole
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    next(error);
  }
});

// Check QR code status (for mobile app polling)
router.get('/qr-status/:sessionId', (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      throw new AppError('Session ID is required', 400, 'Validation Error');
    }

    const qrData = qrCodeStore.get(sessionId);
    
    if (!qrData) {
      throw new AppError('QR code session not found or expired', 404, 'Not Found');
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
    next(error);
  }
});

// Complete QR code authentication (called by mobile app)
router.post('/complete-qr-auth', async (req, res, next) => {
  try {
    const { sessionId, userId, userData } = req.body;
    
    if (!sessionId || !userId) {
      throw new AppError('Session ID and user ID are required', 400, 'Validation Error');
    }

    const qrData = qrCodeStore.get(sessionId);
    
    if (!qrData) {
      throw new AppError('QR code session not found or expired', 404, 'Not Found');
    }

    // Update QR code status
    qrData.status = 'completed';
    qrData.userId = userId;
    qrData.completedAt = Date.now();

    // Generate JWT token
    const token = generateToken(userId);

    res.json({
      success: true,
      message: 'QR authentication completed',
      data: {
        user: {
          id: userId,
          phoneNumber: qrData.phoneNumber,
          ...userData
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      }
    });

  } catch (error) {
    next(error);
  }
});

// Get QR code statistics (for admin purposes)
router.get('/qr-stats', (req, res, next) => {
  try {
    const stats = {
      activeSessions: qrCodeStore.size,
      totalSessions: Array.from(qrCodeStore.values()).filter(qr => qr.status === 'completed').length,
      pendingSessions: Array.from(qrCodeStore.values()).filter(qr => qr.status === 'pending').length
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
