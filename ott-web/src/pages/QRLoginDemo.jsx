import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Smartphone, ArrowLeft, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import QRCodeLogin from '../components/auth/QRCodeLogin';
import MobileAppSimulator from '../components/auth/MobileAppSimulator';
import { AnimatePresence } from 'framer-motion';

const QRLoginDemo = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [demoMode, setDemoMode] = useState('split'); // 'split', 'qr-only', 'mobile-only'

  if (!showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-3xl mb-6">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">QR Code Login Demo</h1>
            <p className="text-xl text-gray-400 mb-8">
              Experience the future of authentication with QR code and phone number login
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-dark-700">
                <QrCode className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">QR Code Login</h3>
                <p className="text-sm text-gray-400">Generate QR codes for instant mobile authentication</p>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-dark-700">
                <Smartphone className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Phone OTP</h3>
                <p className="text-sm text-gray-400">Secure login with SMS verification</p>
              </div>
              
              <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-dark-700">
                <Play className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Live Demo</h3>
                <p className="text-sm text-gray-400">Test the complete authentication flow</p>
              </div>
            </div>

            <button
              onClick={() => setShowDemo(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900"
            >
              <Play className="w-5 h-5 inline mr-2" />
              Start Demo
            </button>

            <div className="mt-6">
              <Link
                to="/login"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Back to Login
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">QR Code Login Demo</h1>
            <p className="text-gray-400 mt-2">Interactive demonstration of the authentication system</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setDemoMode('split')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                demoMode === 'split'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setDemoMode('qr-only')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                demoMode === 'qr-only'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              QR Only
            </button>
            <button
              onClick={() => setDemoMode('mobile-only')}
              className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                demoMode === 'mobile-only'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              Mobile Only
            </button>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {demoMode === 'split' && (
            <motion.div
              key="split"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Side - QR Code Login */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Web App Login</h2>
                <QRCodeLogin 
                  onBack={() => setShowDemo(false)}
                  onSuccess={() => console.log('Login successful!')}
                />
              </div>
              
              {/* Right Side - Mobile App Simulator */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Mobile App Simulator</h2>
                <MobileAppSimulator 
                  qrData="demo-qr-data"
                  onScanComplete={() => console.log('Mobile scan complete!')}
                />
              </div>
            </motion.div>
          )}

          {demoMode === 'qr-only' && (
            <motion.div
              key="qr-only"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">QR Code Login</h2>
              <QRCodeLogin 
                onBack={() => setDemoMode('split')}
                onSuccess={() => console.log('Login successful!')}
              />
            </motion.div>
          )}

          {demoMode === 'mobile-only' && (
            <motion.div
              key="mobile-only"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Mobile App Simulator</h2>
              <MobileAppSimulator 
                qrData="demo-qr-data"
                onScanComplete={() => console.log('Mobile scan complete!')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Back Button */}
      <div className="fixed bottom-6 left-6">
        <button
          onClick={() => setShowDemo(false)}
          className="bg-dark-800/80 backdrop-blur-sm hover:bg-dark-700 text-white px-4 py-2 rounded-lg transition-all duration-200 border border-dark-600"
        >
          <ArrowLeft className="w-4 h-4 inline mr-2" />
          Back to Overview
        </button>
      </div>
    </div>
  );
};

export default QRLoginDemo;
