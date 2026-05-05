// Test API endpoints directly
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@teamtask.com',
      password: 'admin123'
    });
    console.log('✅ Login successful:', loginResponse.data);
    const token = loginResponse.data.token;

    // Test 3: Get projects
    console.log('\n3. Testing projects endpoint...');
    const projectsResponse = await axios.get(`${API_BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Projects response:', projectsResponse.data);

    // Test 4: Get tasks
    console.log('\n4. Testing tasks endpoint...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Tasks response:', tasksResponse.data);

    // Test 5: Get dashboard stats
    console.log('\n5. Testing dashboard stats endpoint...');
    const statsResponse = await axios.get(`${API_BASE_URL}/tasks/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Dashboard stats response:', statsResponse.data);

    console.log('\n🎉 All API tests passed!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testAPI();
