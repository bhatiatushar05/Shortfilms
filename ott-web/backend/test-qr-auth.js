const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testQRAuth() {
  console.log('🧪 Testing QR Authentication Endpoints...\n');

  try {
    // Test 1: Generate QR Code
    console.log('1️⃣ Testing QR Code Generation...');
    const qrResponse = await axios.post(`${BASE_URL}/qr-auth/generate-qr`, {
      phoneNumber: '+91 98765 43210'
    });
    
    if (qrResponse.data.success) {
      console.log('✅ QR Code generated successfully');
      console.log(`   Session ID: ${qrResponse.data.data.sessionId}`);
      console.log(`   Expires in: ${qrResponse.data.data.expiresIn}`);
      
      const sessionId = qrResponse.data.data.sessionId;
      
      // Test 2: Check QR Status
      console.log('\n2️⃣ Testing QR Status Check...');
      const statusResponse = await axios.get(`${BASE_URL}/qr-auth/qr-status/${sessionId}`);
      
      if (statusResponse.data.success) {
        console.log('✅ QR Status checked successfully');
        console.log(`   Status: ${statusResponse.data.data.status}`);
      }
      
      // Test 3: Send OTP
      console.log('\n3️⃣ Testing OTP Sending...');
      const otpResponse = await axios.post(`${BASE_URL}/qr-auth/send-otp`, {
        phoneNumber: '+91 98765 43210'
      });
      
      if (otpResponse.data.success) {
        console.log('✅ OTP sent successfully');
        console.log(`   Expires in: ${otpResponse.data.data.expiresIn}`);
        
        // In development, OTP is returned
        if (otpResponse.data.data.otp) {
          console.log(`   OTP: ${otpResponse.data.data.otp}`);
          
          // Test 4: Verify OTP
          console.log('\n4️⃣ Testing OTP Verification...');
          const verifyResponse = await axios.post(`${BASE_URL}/qr-auth/verify-otp`, {
            phoneNumber: '+91 98765 43210',
            otp: otpResponse.data.data.otp
          });
          
          if (verifyResponse.data.success) {
            console.log('✅ OTP verified successfully');
            console.log(`   User ID: ${verifyResponse.data.data.user.id}`);
            console.log(`   Token: ${verifyResponse.data.data.token.substring(0, 20)}...`);
          } else {
            console.log('❌ OTP verification failed:', verifyResponse.data.message);
          }
        }
      } else {
        console.log('❌ OTP sending failed:', otpResponse.data.message);
      }
      
      // Test 5: Get QR Stats
      console.log('\n5️⃣ Testing QR Statistics...');
      const statsResponse = await axios.get(`${BASE_URL}/qr-auth/qr-stats`);
      
      if (statsResponse.data.success) {
        console.log('✅ QR Statistics retrieved successfully');
        console.log(`   Active Sessions: ${statsResponse.data.data.activeSessions}`);
        console.log(`   Total Sessions: ${statsResponse.data.data.totalSessions}`);
        console.log(`   Pending Sessions: ${statsResponse.data.data.pendingSessions}`);
      }
      
    } else {
      console.log('❌ QR Code generation failed:', qrResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
  
  console.log('\n🎉 QR Authentication testing completed!');
}

// Run the test
testQRAuth();
