import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'

const DebugInfo = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const [apiTest, setApiTest] = useState(null)

  console.log('DebugInfo: Component rendering, user:', user, 'isAuthenticated:', isAuthenticated)

  useEffect(() => {
    console.log('DebugInfo: Auth state:', { user, isAuthenticated, loading })
    
    if (isAuthenticated && user) {
      console.log('DebugInfo: User is authenticated, testing API...')
      // Simple API test
      fetch('http://localhost:5000/api/health')
        .then(response => response.json())
        .then(data => {
          console.log('DebugInfo: API health check successful:', data)
          setApiTest('API working')
        })
        .catch(error => {
          console.error('DebugInfo: API health check failed:', error)
          setApiTest('API failed: ' + error.message)
        })
    }
  }, [user, isAuthenticated, loading])

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 z-[9999] max-w-sm">
      <h3 className="font-bold text-sm mb-2 text-blue-600">Debug Info</h3>
      <div className="text-xs space-y-1">
        <p><strong>Auth Status:</strong> {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? user.name : 'None'}</p>
        <p><strong>Role:</strong> {user ? user.role : 'None'}</p>
        <p><strong>API Test:</strong> {apiTest || 'Testing...'}</p>
      </div>
    </div>
  )
}

export default DebugInfo
