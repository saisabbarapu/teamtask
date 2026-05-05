// Simple API test script
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test login
async function testLogin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@teamtask.com',
      password: 'admin123'
    });
    console.log('Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    return null;
  }
}

// Test projects
async function testProjects(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Projects response:', response.data);
  } catch (error) {
    console.error('Projects fetch failed:', error.response?.data || error.message);
  }
}

// Test tasks
async function testTasks(token) {
  try {
    const response = await axios.get(`${API_BASE_URL}/tasks`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Tasks response:', response.data);
  } catch (error) {
    console.error('Tasks fetch failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('Starting API tests...');
  
  const token = await testLogin();
  if (token) {
    await testProjects(token);
    await testTasks(token);
  } else {
    console.log('Cannot proceed with tests without token');
  }
}

runTests();
