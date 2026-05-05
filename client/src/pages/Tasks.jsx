import { useState, useEffect } from 'react'
import { taskAPI, projectAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Filter, 
  Search,
  Calendar,
  User,
  CheckSquare,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  FolderOpen
} from 'lucide-react'

const Tasks = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    projectId: '',
    assignedTo: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      console.log('Fetching tasks and projects...')
      const [tasksResponse, projectsResponse] = await Promise.all([
        taskAPI.getAll(filters),
        projectAPI.getAll()
      ])
      console.log('Tasks response:', tasksResponse)
      console.log('Projects response:', projectsResponse)
      console.log('Tasks response data:', tasksResponse.data)
      console.log('Projects response data:', projectsResponse.data)
      
      // Handle different response structures
      const tasks = tasksResponse.data?.tasks || tasksResponse.data || []
      const projects = projectsResponse.data?.projects || projectsResponse.data || []
      
      console.log('Setting tasks:', tasks)
      console.log('Setting projects:', projects)
      setTasks(tasks)
      setProjects(projects)
    } catch (error) {
      console.error('Error fetching data:', error)
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.error || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData)
      const response = await taskAPI.create(taskData)
      console.log('Task creation response:', response)
      toast.success('Task created successfully')
      setShowCreateModal(false)
      fetchData()
    } catch (error) {
      console.error('Error creating task:', error)
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.error || 'Failed to create task')
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, newStatus)
      toast.success('Task status updated')
      fetchData()
    } catch (error) {
      toast.error('Failed to update task status')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await taskAPI.delete(taskId)
      toast.success('Task deleted successfully')
      fetchData()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckSquare className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'badge-completed'
      case 'IN_PROGRESS':
        return 'badge-in-progress'
      default:
        return 'badge-pending'
    }
  }

  const isOverdue = (dueDate, status) => {
    return dueDate && new Date(dueDate) < new Date() && status !== 'COMPLETED'
  }

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Debug info
  console.log('Tasks page rendering:', {
    user,
    tasks,
    projects,
    loading,
    tasksCount: tasks.length,
    projectsCount: projects.length
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Track and manage all your team tasks.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            className="input"
            value={filters.projectId}
            onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
          >
            <option value="">All Assignees</option>
            {/* This would need a list of users, for now using current user */}
            <option value={user?.id}>My Tasks</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{task.title}</h3>
                  <span className={`badge ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-1">
                      {task.status.replace('_', ' ').toLowerCase()}
                    </span>
                  </span>
                  {isOverdue(task.dueDate, task.status) && (
                    <span className="badge bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                </div>
                
                {task.description && (
                  <p className="text-gray-600 mb-3">{task.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FolderOpen className="h-4 w-4 mr-1" />
                    {task.project.name}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {task.assignee.name}
                  </div>
                  {task.dueDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {/* Status Update Dropdown */}
                <select
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                  value={task.status}
                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                  disabled={user?.role !== 'ADMIN' && task.assignedTo !== user?.id}
                >
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>

                {user?.role === 'ADMIN' && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 hover:bg-red-50 rounded text-red-600"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {user?.role === 'ADMIN' 
              ? 'Create your first task to get started.' 
              : 'No tasks available or match your filters.'}
          </p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Task
            </button>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          projects={projects}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  )
}

// Create Task Modal Component
const CreateTaskModal = ({ projects, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    projectId: '',
    assignedTo: ''
  })
  const [projectMembers, setProjectMembers] = useState([])

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (formData.projectId) {
        try {
          console.log('Fetching project members for:', formData.projectId)
          const response = await projectAPI.getMembers(formData.projectId)
          console.log('Project members response:', response)
          const members = response.data?.members || response.data || []
          console.log('Setting project members:', members)
          setProjectMembers(members)
        } catch (error) {
          console.error('Error fetching project members:', error)
          console.error('Error response:', error.response)
          toast.error('Failed to fetch project members')
          setProjectMembers([])
        }
      } else {
        setProjectMembers([])
      }
    }

    fetchProjectMembers()
  }, [formData.projectId])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Task Title</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            
            <div>
              <label className="label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Project</label>
              <select
                className="input"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value, assignedTo: '' })}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Assign To</label>
              <select
                className="input"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                required
                disabled={!formData.projectId}
              >
                <option value="">Select a user</option>
                {projectMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Tasks
