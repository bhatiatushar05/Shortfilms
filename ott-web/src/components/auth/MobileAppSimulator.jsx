import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, QrCode, CheckCircle, X, Camera, ArrowRight } from 'lucide-react';

const MobileAppSimulator = ({ qrData, onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('ready'); // 'ready', 'scanning', 'success', 'error'
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (qrData) {
      setScanStatus('ready');
    }
  }, [qrData]);

  const handleScanQR = async () => {
    if (!qrData) return;

    setIsScanning(true);
    setScanStatus('scanning');

    // Simulate scanning process
    setTimeout(() => {
      setScanStatus('success');
      setIsScanning(false);
      
      // Simulate successful authentication
      setTimeout(() => {
        onScanComplete?.();
      }, 2000);
    }, 3000);
  };

  const handleManualEntry = () => {
    setShowInstructions(true);
  };

  if (!qrData) {
    return (
      <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700 text-center">
        <Smartphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Mobile App Simulator</h3>
        <p className="text-gray-400">Generate a QR code first to test mobile scanning</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-700">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-3">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Mobile App Simulator</h3>
        <p className="text-sm text-gray-400">Simulate QR code scanning from mobile device</p>
      </div>

      <div className="space-y-4">
        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-lg flex justify-center">
          <div className="relative">
            <QrCode className="w-32 h-32 text-gray-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            {scanStatus === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-400"
              >
                <p className="text-sm">QR Code Ready</p>
                <p className="text-xs mt-1">Tap scan button to simulate</p>
              </motion.div>
            )}

            {scanStatus === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-primary-400"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">Scanning QR Code...</span>
                </div>
              </motion.div>
            )}

            {scanStatus === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-green-400"
              >
                <div className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Authentication Successful!</span>
                </div>
                <p className="text-xs mt-1">Redirecting to web app...</p>
              </motion.div>
            )}

            {scanStatus === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-400"
              >
                <div className="flex items-center justify-center space-x-2">
                  <X className="w-4 h-4" />
                  <span className="text-sm">Scan Failed</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleScanQR}
            disabled={isScanning || scanStatus === 'success'}
            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-800 text-white py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Camera className="w-4 h-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Scan QR Code'}
          </button>
          
          <button
            onClick={handleManualEntry}
            className="flex-1 bg-dark-600 hover:bg-dark-500 text-white py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Manual
          </button>
        </div>

        {/* Instructions */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-dark-700/50 rounded-lg p-4 text-sm"
            >
              <h4 className="font-medium text-white mb-2">Manual Entry Instructions:</h4>
              <ol className="text-gray-400 space-y-1 text-xs">
                <li>1. Open ShortCinema mobile app</li>
                <li>2. Go to Settings → QR Login</li>
                <li>3. Enter the session ID manually</li>
                <li>4. Complete authentication on mobile</li>
                <li>5. Return to web app to continue</li>
              </ol>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileAppSimulator;
