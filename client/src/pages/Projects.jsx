import { useState, useEffect } from 'react'
import { projectAPI, taskAPI, userAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { 
  Plus, 
  Users, 
  FolderOpen, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  CheckSquare
} from 'lucide-react'

const Projects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      console.log('Fetching projects...')
      const response = await projectAPI.getAll()
      console.log('Projects response:', response)
      console.log('Response data:', response.data)
      console.log('Response data projects:', response.data?.projects)
      
      // Handle different response structures
      const projects = response.data?.projects || response.data || []
      console.log('Setting projects:', projects)
      setProjects(projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.error || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (projectData) => {
    try {
      console.log('Creating project with data:', projectData)
      const response = await projectAPI.create(projectData)
      console.log('Project creation response:', response)
      toast.success('Project created successfully')
      setShowCreateModal(false)
      fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      console.error('Error response:', error.response)
      toast.error(error.response?.data?.error || 'Failed to create project')
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      await projectAPI.delete(projectId)
      toast.success('Project deleted successfully')
      fetchProjects()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete project')
    }
  }

  const handleAddMember = async (projectId, userId) => {
    try {
      await projectAPI.addMember(projectId, userId)
      toast.success('Member added successfully')
      fetchProjects()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (projectId, userId) => {
    try {
      await projectAPI.removeMember(projectId, userId)
      toast.success('Member removed successfully')
      fetchProjects()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove member')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // Debug info
  console.log('Projects page rendering:', {
    user,
    projects,
    loading,
    projectsCount: projects.length
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your team projects and collaborate effectively.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    by {project.creator.name}
                  </p>
                </div>
              </div>
              {user?.role === 'ADMIN' && project.createdBy === user.id && (
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {project.description || 'No description provided'}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(project.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <CheckSquare className="h-4 w-4 mr-1" />
                {project._count?.tasks || 0} tasks
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                {project.members?.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="h-8 w-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center"
                    title={member.user.name}
                  >
                    <span className="text-xs font-medium text-primary-600">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ))}
                {project.members?.length > 3 && (
                  <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{project.members.length - 3}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {user?.role === 'ADMIN' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedProject(project)
                        setShowMembersModal(true)
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Manage members"
                    >
                      <Users className="h-4 w-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1 hover:bg-red-50 rounded"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">
            {user?.role === 'ADMIN' 
              ? 'Create your first project to get started.' 
              : 'Wait for an admin to create projects for you.'}
          </p>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Members Modal */}
      {showMembersModal && selectedProject && (
        <MembersModal
          project={selectedProject}
          onClose={() => setShowMembersModal(false)}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
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

// Members Modal Component
const MembersModal = ({ project, onClose, onAddMember, onRemoveMember }) => {
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
        toast.error('Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const memberIds = project.members?.map(m => m.userId) || []

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Members</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Current Members</h3>
            <div className="space-y-2">
              {project.members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <button
                    onClick={() => onRemoveMember(project.id, member.userId)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Add Members</h3>
            <div className="space-y-2">
              {users.filter(user => !memberIds.includes(user.id)).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => onAddMember(project.id, user.id)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

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

export default Projects
