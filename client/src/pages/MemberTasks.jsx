import { useState, useEffect } from 'react'
import { memberAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { CheckSquare, Clock, AlertCircle, Calendar, User } from 'lucide-react'

const MemberTasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching member tasks...')
        const response = await memberAPI.getTasks()
        console.log('Member tasks response:', response)
        const tasks = response.data?.tasks || response.data || []
        console.log('Setting tasks:', tasks)
        setTasks(tasks)
      } catch (error) {
        console.error('Error fetching tasks:', error)
        console.error('Error response:', error.response)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      console.log('Updating task status:', taskId, 'to:', newStatus)
      const response = await memberAPI.updateTaskStatus(taskId, newStatus)
      console.log('Task status update response:', response)
      
      // Refresh tasks
      const tasksResponse = await memberAPI.getTasks()
      const updatedTasks = tasksResponse.data?.tasks || tasksResponse.data || []
      setTasks(updatedTasks)
    } catch (error) {
      console.error('Error updating task status:', error)
      console.error('Error response:', error.response)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filters.status || task.status === filters.status
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckSquare className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'COMPLETED') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">Tasks assigned to you. Update your progress here.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-48"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className={`card ${isOverdue(task.dueDate, task.status) ? 'border-red-200 bg-red-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <span className={`badge ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">{task.status.replace('_', ' ').toLowerCase()}</span>
                  </span>
                  {isOverdue(task.dueDate, task.status) && (
                    <span className="badge bg-red-100 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="ml-1">Overdue</span>
                    </span>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {task.assignee.name}
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <select
                  className="text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {tasks.length === 0 
              ? "You haven't been assigned any tasks yet." 
              : "No tasks match your current filters."
            }
          </p>
        </div>
      )}

      {/* Task Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-lg font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckSquare className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-lg font-semibold text-gray-900">
                {tasks.filter(t => t.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberTasks
