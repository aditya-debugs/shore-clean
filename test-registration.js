// Test script for QR code registration system
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api';

async function testRegistrationSystem() {
  try {
    console.log('🧪 Testing Event Registration System with QR Codes');
    console.log('================================================');

    // Step 1: Register a test user
    console.log('\n📝 Step 1: Creating test user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Volunteer',
      email: 'volunteer@test.com',
      password: 'password123',
      role: 'volunteer'
    });
    console.log('✅ User created successfully');

    // Step 2: Login to get JWT token
    console.log('\n🔐 Step 2: Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'volunteer@test.com',
      password: 'password123'
    });
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user._id;
    console.log('✅ Login successful, JWT token obtained');

    // Step 3: Create axios instance with auth headers
    const authenticatedApi = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 4: Get available events
    console.log('\n📅 Step 3: Fetching events...');
    const eventsResponse = await authenticatedApi.get('/events');
    const events = eventsResponse.data;
    
    if (events.length === 0) {
      console.log('❌ No events found. Please create an event first.');
      return;
    }

    const testEvent = events[0];
    console.log(`✅ Found ${events.length} events. Using event: "${testEvent.title}"`);

    // Step 5: Check registration status (should be not registered)
    console.log('\n🔍 Step 4: Checking registration status...');
    try {
      const statusResponse = await authenticatedApi.get(`/registrations/${testEvent._id}/status`);
      console.log('📊 Registration status:', statusResponse.data);
    } catch (error) {
      if (error.response?.status === 200) {
        console.log('📊 Not registered for this event (expected)');
      } else {
        console.log('❌ Error checking status:', error.response?.data || error.message);
      }
    }

    // Step 6: Register for the event
    console.log('\n🎫 Step 5: Registering for event...');
    try {
      const registrationResponse = await authenticatedApi.post(`/registrations/${testEvent._id}/register`);
      const registration = registrationResponse.data.registration;
      
      console.log('✅ Registration successful!');
      console.log(`📋 Registration ID: ${registration.registrationId}`);
      console.log(`📱 QR Code Data: ${registration.qrCode}`);
      
      // Parse QR code to verify it contains the right data
      try {
        const qrData = JSON.parse(registration.qrCode);
        console.log('🔍 QR Code contains:');
        console.log(`   - Event ID: ${qrData.eventId}`);
        console.log(`   - User ID: ${qrData.userId}`);
        console.log(`   - Timestamp: ${new Date(qrData.timestamp).toISOString()}`);
      } catch (e) {
        console.log('❌ Could not parse QR code data');
      }

    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data || error.message);
      return;
    }

    // Step 7: Check registration status again (should be registered now)
    console.log('\n🔄 Step 6: Verifying registration...');
    try {
      const statusResponse = await authenticatedApi.get(`/registrations/${testEvent._id}/status`);
      console.log('✅ Registration verified:', statusResponse.data);
    } catch (error) {
      console.log('❌ Error verifying registration:', error.response?.data || error.message);
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Navigate to the event details page in the browser');
    console.log('2. Login with email: volunteer@test.com, password: password123');
    console.log('3. See your registration and QR code');

  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Response data:', error.response?.data);
    console.log('Full error:', error);
    
    if (error.response?.data?.message === 'Email already exists') {
      console.log('\n💡 User already exists. You can login directly:');
      console.log('   Email: volunteer@test.com');
      console.log('   Password: password123');
    }
  }
}

// Run the test
testRegistrationSystem();