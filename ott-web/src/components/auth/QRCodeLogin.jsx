import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, QrCode, ArrowLeft, RefreshCw, CheckCircle, X, Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSession } from '../../hooks/useSession';
import { buildApiUrl } from '../../config/api';

const QRCodeLogin = ({ onBack, onSuccess }) => {
  const [loginMethod, setLoginMethod] = useState('qr'); // 'qr' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [qrStatus, setQrStatus] = useState('pending'); // 'pending', 'scanning', 'completed', 'expired'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  
  const { login } = useAuth();
  const { isAuthed } = useSession();
  const qrPollingRef = useRef(null);
  const countdownRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthed) {
      onSuccess?.();
    }
  }, [isAuthed, onSuccess]);

  // Generate QR code when component mounts
  useEffect(() => {
    if (loginMethod === 'qr') {
      generateQRCode();
    }
  }, [loginMethod]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && qrStatus === 'pending') {
      countdownRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setQrStatus('expired');
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, qrStatus]);

  // Poll QR code status
  useEffect(() => {
    if (sessionId && qrStatus === 'pending') {
      qrPollingRef.current = setInterval(() => {
        checkQRStatus();
      }, 2000); // Check every 2 seconds
    }

    return () => {
      if (qrPollingRef.current) {
        clearInterval(qrPollingRef.current);
      }
    };
  }, [sessionId, qrStatus]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(buildApiUrl('/api/qr-auth/generate-qr'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber || '+91' }),
      });

      const data = await response.json();

      if (data.success) {
        // Generate QR code from the data on the frontend
        const qrDataString = JSON.stringify(data.data.qrCodeData);
        setQrCodeData(qrDataString);
        setSessionId(data.data.sessionId);
        setQrStatus('pending');
        setCountdown(300);
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkQRStatus = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(buildApiUrl(`/api/qr-auth/qr-status/${sessionId}`));
      const data = await response.json();

      if (data.success) {
        if (data.data.status === 'completed') {
          setQrStatus('completed');
          setSuccess('QR authentication successful!');
          // Handle successful authentication
          setTimeout(() => {
            onSuccess?.();
          }, 1500);
        }
      }
    } catch (err) {
      console.error('Error checking QR status:', err);
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(buildApiUrl('/api/qr-auth/send-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setShowOtpInput(true);
        setSuccess('OTP sent successfully!');
        // In development, show OTP in console
        if (data.data.otp) {
          console.log(`OTP: ${data.data.otp}`);
        }
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(buildApiUrl('/api/qr-auth/verify-otp'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Authentication successful!');
        // Store token and redirect
        localStorage.setItem('authToken', data.data.token);
        setTimeout(() => {
          onSuccess?.();
        }, 1500);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const refreshQRCode = () => {
    setQrStatus('pending');
    setCountdown(300);
    generateQRCode();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Login with QR Code</h2>
        <p className="text-gray-400">Scan QR code or use phone number to login</p>
      </div>

      {/* Method Toggle */}
      <div className="flex bg-dark-700 rounded-lg p-1 mb-6">
        <button
          onClick={() => setLoginMethod('qr')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
            loginMethod === 'qr'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </button>
        <button
          onClick={() => setLoginMethod('phone')}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all duration-200 ${
            loginMethod === 'phone'
              ? 'bg-primary-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Phone Number
        </button>
      </div>

      {/* QR Code Section */}
      <AnimatePresence mode="wait">
        {loginMethod === 'qr' && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* QR Code Display */}
            <div className="bg-white p-6 rounded-lg flex justify-center">
              {loading ? (
                <div className="flex items-center justify-center w-48 h-48">
                  <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
              ) : qrCodeData ? (
                <div className="relative">
                  <QRCodeSVG
                    value={qrCodeData}
                    size={192}
                    level="M"
                    includeMargin={true}
                  />
                  {/* Logo overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SC</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-48 h-48 text-gray-400">
                  <QrCode className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Status and Instructions */}
            <div className="text-center space-y-3">
              {qrStatus === 'pending' && (
                <>
                  <div className="text-sm text-gray-400">
                    <p>Use your ShortCinema mobile app to scan this QR code</p>
                    <p className="mt-1">or</p>
                    <p>Open camera app and scan to redirect to mobile app</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires in {formatCountdown(countdown)}
                  </div>
                </>
              )}
              
              {qrStatus === 'scanning' && (
                <div className="text-primary-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                  <p>Scanning QR code...</p>
                </div>
              )}
              
              {qrStatus === 'completed' && (
                <div className="text-green-400">
                  <CheckCircle className="w-5 h-5 mx-auto mb-2" />
                  <p>Authentication successful!</p>
                </div>
              )}
              
              {qrStatus === 'expired' && (
                <div className="text-red-400">
                  <X className="w-5 h-5 mx-auto mb-2" />
                  <p>QR code expired</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={refreshQRCode}
                disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 inline mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setLoginMethod('phone')}
                className="flex-1 bg-dark-600 hover:bg-dark-500 text-white py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Use Phone
              </button>
            </div>
          </motion.div>
        )}

        {/* Phone Number Section */}
        {loginMethod === 'phone' && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Phone Number Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Send OTP Button */}
            {!showOtpInput && (
              <button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </div>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    Send OTP
                  </>
                )}
              </button>
            )}

            {/* OTP Input */}
            <AnimatePresence>
              {showOtpInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-center text-lg tracking-widest"
                    />
                  </div>
                  
                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || !otp}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Verifying...
                      </div>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back to QR */}
            <button
              onClick={() => setLoginMethod('qr')}
              className="w-full bg-dark-600 hover:bg-dark-500 text-white py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to QR Code
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error and Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-900/20 border border-green-800 text-green-400 rounded-lg text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back to Login
        </button>
      </div>
    </motion.div>
  );
};

export default QRCodeLogin;
