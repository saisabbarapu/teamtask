import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('API Request:', config.method?.toUpperCase(), config.url, { token: token ? 'Present' : 'Missing' })
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.status)
    return response
  },
  (error) => {
    console.error('API Response Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
}

// Project APIs
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  addMember: (projectId, userId) => api.post(`/projects/${projectId}/members`, { userId }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
  delete: (id) => api.delete(`/projects/${id}`),
  getMembers: (projectId) => api.get(`/projects/${projectId}/members`)
}

// Task APIs
export const taskAPI = {
  getAll: (filters = {}) => api.get('/tasks', { params: filters }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, status) => api.put(`/tasks/${id}`, { status }),
  delete: (id) => api.delete(`/tasks/${id}`),
  getDashboardStats: () => api.get('/tasks/dashboard/stats')
}

// User APIs
export const userAPI = {
  getAll: () => api.get('/users')
}

// Member APIs
export const memberAPI = {
  getProjects: () => api.get('/member/projects'),
  getTasks: () => api.get('/member/tasks'),
  updateTaskStatus: (id, status) => api.put(`/member/tasks/${id}`, { status }),
  getDashboardStats: () => api.get('/member/dashboard')
}

export default api
