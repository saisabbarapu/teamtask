import { useState, useEffect } from 'react'
import { memberAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import { FolderOpen, Calendar, Users, CheckSquare } from 'lucide-react'

const MemberProjects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        console.log('Fetching member projects...')
        const response = await memberAPI.getProjects()
        console.log('Member projects response:', response)
        const projects = response.data?.projects || response.data || []
        console.log('Setting projects:', projects)
        setProjects(projects)
      } catch (error) {
        console.error('Error fetching projects:', error)
        console.error('Error response:', error.response)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
        <p className="text-gray-600">Projects you are assigned to as a team member.</p>
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
              
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {project.members?.length || 0} members
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
          <p className="text-gray-500">
            You haven't been assigned to any projects yet. Wait for an admin to add you to a project.
          </p>
        </div>
      )}
    </div>
  )
}

export default MemberProjects
