import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskAPI, projectAPI, userAPI, memberAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  FolderOpen,
  Users,
  Trash2,
  UserPlus
} from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recentProjects, setRecentProjects] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Fetching dashboard data for role:', user?.role)
        
        if (user?.role === 'MEMBER') {
          // Use member-specific APIs
          console.log('Using member APIs...')
          
          // Fetch member stats
          const statsResponse = await memberAPI.getDashboardStats()
          console.log('Member stats response:', statsResponse)
          const stats = statsResponse.data?.stats || statsResponse.data || {}
          console.log('Setting member stats:', stats)
          setStats(stats)

          // Fetch member projects
          const projectsResponse = await memberAPI.getProjects()
          console.log('Member projects response:', projectsResponse)
          const projects = projectsResponse.data?.projects || projectsResponse.data || []
          console.log('Setting member projects:', projects)
          setRecentProjects(projects.slice(0, 3))

          // Fetch member tasks
          const tasksResponse = await memberAPI.getTasks()
          console.log('Member tasks response:', tasksResponse)
          const tasks = tasksResponse.data?.tasks || tasksResponse.data || []
          console.log('Setting member tasks:', tasks)
          setRecentTasks(tasks.slice(0, 5))
        } else {
          // Use admin APIs
          console.log('Using admin APIs...')
          
          // Fetch stats
          const statsResponse = await taskAPI.getDashboardStats()
          console.log('Stats response:', statsResponse)
          const stats = statsResponse.data?.stats || statsResponse.data || {}
          console.log('Setting stats:', stats)
          setStats(stats)

          // Fetch recent projects
          const projectsResponse = await projectAPI.getAll()
          console.log('Projects response:', projectsResponse)
          const projects = projectsResponse.data?.projects || projectsResponse.data || []
          console.log('Setting recent projects:', projects)
          setRecentProjects(projects.slice(0, 3))

          // Fetch recent tasks
          const tasksResponse = await taskAPI.getAll()
          console.log('Tasks response:', tasksResponse)
          const tasks = tasksResponse.data?.tasks || tasksResponse.data || []
          console.log('Setting recent tasks:', tasks)
          setRecentTasks(tasks.slice(0, 5))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        console.error('Error response:', error.response)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.role])

  const handleCreateProject = async (projectData) => {
    try {
      console.log('Creating project from dashboard:', projectData)
      const response = await projectAPI.create(projectData)
      console.log('Project creation response:', response)
      // Refresh dashboard data
      fetchDashboardData()
      setShowProjectModal(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      console.log('Creating task from dashboard:', taskData)
      const response = await taskAPI.create(taskData)
      console.log('Task creation response:', response)
      // Refresh dashboard data
      fetchDashboardData()
      setShowTaskModal(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      console.log('Updating task status:', taskId, 'to:', newStatus, 'for role:', user?.role)
      
      let response;
      if (user?.role === 'MEMBER') {
        response = await memberAPI.updateTaskStatus(taskId, newStatus)
      } else {
        response = await taskAPI.update(taskId, newStatus)
      }
      
      console.log('Task status update response:', response)
      // Refresh dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating task status:', error)
      console.error('Error response:', error.response)
    }
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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'ADMIN' 
            ? 'Manage your team projects and tasks efficiently.'
            : 'View your assigned tasks and project updates.'
          }
        </p>
      </div>

      {/* Stats Cards - Different for Admin vs Member */}
      {user?.role === 'ADMIN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tasks"
            value={stats?.totalTasks || 0}
            icon={CheckSquare}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats?.completedTasks || 0}
            icon={CheckSquare}
            color="green"
          />
          <StatCard
            title="In Progress"
            value={stats?.inProgressTasks || 0}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            title="Pending"
            value={stats?.pendingTasks || 0}
            icon={AlertCircle}
            color="red"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="My Tasks"
            value={stats?.myTasks || recentTasks.length}
            icon={CheckSquare}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={recentTasks.filter(t => t.status === 'COMPLETED').length}
            icon={CheckSquare}
            color="green"
          />
          <StatCard
            title="In Progress"
            value={recentTasks.filter(t => t.status === 'IN_PROGRESS').length}
            icon={Clock}
            color="yellow"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects - Different for Admin vs Member */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'ADMIN' ? 'Recent Projects' : 'My Projects'}
            </h2>
            <FolderOpen className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentProjects.length > 0 ? (
              recentProjects.map((project) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <span className="text-xs text-gray-500">
                      {project._count?.tasks || 0} tasks
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {project.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project._count?.members || 0} members</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {user?.role === 'ADMIN' ? 'No projects found' : 'No projects assigned to you'}
              </p>
            )}
          </div>
        </div>

        {/* Recent Tasks - Different for Admin vs Member */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.role === 'ADMIN' ? 'Recent Tasks' : 'My Tasks'}
            </h2>
            <CheckSquare className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      {task.project.name} {user?.role === 'ADMIN' ? `• ${task.assignee.name}` : ''}
                    </p>
                  </div>
                  {user?.role === 'ADMIN' ? (
                    <span className={`badge ${
                      task.status === 'COMPLETED' ? 'badge-completed' :
                      task.status === 'IN_PROGRESS' ? 'badge-in-progress' :
                      'badge-pending'
                    }`}>
                      {task.status.replace('_', ' ').toLowerCase()}
                    </span>
                  ) : (
                    <select
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                {user?.role === 'ADMIN' ? 'No tasks found' : 'No tasks assigned to you'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Only for Admin */}
      {user?.role === 'ADMIN' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="btn btn-primary"
              onClick={() => setShowProjectModal(true)}
            >
              Create New Project
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowTaskModal(true)}
            >
              Add Task
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowMembersModal(true)}
            >
              Manage Members
            </button>
          </div>
        </div>
      )}

      {/* Member Quick Actions */}
      {user?.role === 'MEMBER' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/tasks')}
            >
              View All Tasks
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/projects')}
            >
              View Projects
            </button>
          </div>
        </div>
      )}

      {/* Create Project Modal - Only for Admin */}
      {showProjectModal && user?.role === 'ADMIN' && (
        <CreateProjectModal
          onClose={() => setShowProjectModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Create Task Modal - Only for Admin */}
      {showTaskModal && user?.role === 'ADMIN' && (
        <CreateTaskModal
          projects={recentProjects}
          onClose={() => setShowTaskModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Members Modal - Only for Admin */}
      {showMembersModal && user?.role === 'ADMIN' && (
        <MembersModal
          projects={recentProjects}
          onClose={() => setShowMembersModal(false)}
        />
      )}
    </div>
  )
}

// Create Project Modal Component
const CreateProjectModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Project Name</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              Create Project
            </button>
          </div>
        </form>
      </div>
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
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                <option value="">Select Project</option>
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
              >
                <option value="">Select Member</option>
                {projectMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
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

// Members Modal Component
const MembersModal = ({ projects, onClose }) => {
  const [selectedProject, setSelectedProject] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users for member management...')
        const response = await userAPI.getAll()
        console.log('Users response:', response)
        const users = response.data?.users || response.data || []
        console.log('Setting users:', users)
        setUsers(users)
      } catch (error) {
        console.error('Error fetching users:', error)
        console.error('Error response:', error.response)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleAddMember = async (projectId, userId) => {
    try {
      console.log('Adding member:', userId, 'to project:', projectId)
      await projectAPI.addMember(projectId, userId)
      console.log('Member added successfully')
      // Refresh dashboard data
      window.location.reload()
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  const handleRemoveMember = async (projectId, userId) => {
    try {
      console.log('Removing member:', userId, 'from project:', projectId)
      await projectAPI.removeMember(projectId, userId)
      console.log('Member removed successfully')
      // Refresh dashboard data
      window.location.reload()
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Members</h2>
        
        {!selectedProject ? (
          // Project selection
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Select Project</h3>
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-500">
                        {project.members?.length || 0} members
                      </p>
                    </div>
                    <FolderOpen className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Member management for selected project
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className="mb-4 text-sm text-blue-600 hover:text-blue-700"
            >
              ← Back to projects
            </button>
            
            <h3 className="font-medium text-gray-900 mb-3">
              {selectedProject.name} - Members
            </h3>
            
            <div className="space-y-4">
              {/* Current Members */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Current Members</h4>
                <div className="space-y-2">
                  {selectedProject.members?.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(selectedProject.id, member.userId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Available Users to Add */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Add Members</h4>
                <div className="space-y-2">
                  {users.filter(user => 
                    !selectedProject.members?.some(member => member.userId === user.id)
                  ).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleAddMember(selectedProject.id, user.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
