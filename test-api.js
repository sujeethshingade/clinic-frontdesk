#!/usr/bin/env node

/**
 * Simple test script to verify API endpoints
 * Run with: node test-api.js
 */

const baseUrl = 'http://localhost:3000/api'

// Test admin credentials
const testAdmin = {
  email: 'admin@clinic.com',
  password: 'admin123'
}

let authToken = ''

async function makeRequest(method, endpoint, data = null, token = null) {
  const url = `${baseUrl}${endpoint}`
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, options)
    const result = await response.json()
    
    console.log(`${method} ${endpoint}:`, response.status)
    if (!response.ok) {
      console.log('Error:', result)
    } else {
      console.log('Success:', Object.keys(result))
    }
    
    return { success: response.ok, data: result, status: response.status }
  } catch (error) {
    console.log(`${method} ${endpoint}: ERROR -`, error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('🏥 Clinic Front Desk API Test Suite')
  console.log('=====================================\n')

  // Test 1: Register admin user
  console.log('1. Testing user registration...')
  const registerResult = await makeRequest('POST', '/auth/register', {
    email: testAdmin.email,
    password: testAdmin.password,
    role: 'admin'
  })
  
  if (registerResult.success || registerResult.status === 400) {
    console.log('✅ Registration test passed (user may already exist)\n')
  } else {
    console.log('❌ Registration test failed\n')
    return
  }

  // Test 2: Login
  console.log('2. Testing user login...')
  const loginResult = await makeRequest('POST', '/auth/login', testAdmin)
  
  if (loginResult.success) {
    authToken = loginResult.data.token
    console.log('✅ Login test passed')
    console.log('Auth token received\n')
  } else {
    console.log('❌ Login test failed\n')
    return
  }

  // Test 3: Get doctors (should be empty initially)
  console.log('3. Testing get doctors...')
  const doctorsResult = await makeRequest('GET', '/doctors', null, authToken)
  
  if (doctorsResult.success) {
    console.log('✅ Get doctors test passed')
    console.log(`Found ${doctorsResult.data.doctors?.length || 0} doctors\n`)
  } else {
    console.log('❌ Get doctors test failed\n')
  }

  // Test 4: Create a doctor
  console.log('4. Testing create doctor...')
  const doctorData = {
    email: 'doctor@clinic.com',
    firstName: 'John',
    lastName: 'Smith',
    specialization: 'General Medicine',
    licenseNumber: 'LIC001',
    phone: '1234567890',
    qualifications: ['MBBS', 'MD'],
    experience: 5,
    consultationFee: 500,
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' }
    }
  }
  
  const createDoctorResult = await makeRequest('POST', '/doctors', doctorData, authToken)
  
  if (createDoctorResult.success) {
    console.log('✅ Create doctor test passed')
    console.log('Doctor created successfully\n')
  } else {
    console.log('❌ Create doctor test failed\n')
  }

  // Test 5: Get patients (should be empty initially)
  console.log('5. Testing get patients...')
  const patientsResult = await makeRequest('GET', '/patients', null, authToken)
  
  if (patientsResult.success) {
    console.log('✅ Get patients test passed')
    console.log(`Found ${patientsResult.data.patients?.length || 0} patients\n`)
  } else {
    console.log('❌ Get patients test failed\n')
  }

  // Test 6: Get dashboard stats
  console.log('6. Testing dashboard stats...')
  const statsResult = await makeRequest('GET', '/dashboard/stats', null, authToken)
  
  if (statsResult.success) {
    console.log('✅ Dashboard stats test passed')
    console.log('Stats retrieved successfully\n')
  } else {
    console.log('❌ Dashboard stats test failed\n')
  }

  // Test 7: Get queue
  console.log('7. Testing queue management...')
  const queueResult = await makeRequest('GET', '/queue', null, authToken)
  
  if (queueResult.success) {
    console.log('✅ Queue test passed')
    console.log(`Found ${queueResult.data.queue?.length || 0} queue entries\n`)
  } else {
    console.log('❌ Queue test failed\n')
  }

  console.log('🎉 API test suite completed!')
  console.log('\nNext steps:')
  console.log('1. Set up your MongoDB Atlas connection in .env.local')
  console.log('2. Run: npm run dev')
  console.log('3. Test the frontend at http://localhost:3000')
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error)
}

module.exports = { makeRequest, runTests }
