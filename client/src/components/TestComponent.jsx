import { useState, useEffect } from 'react'

const TestComponent = () => {
  const [testResults, setTestResults] = useState({})

  console.log('TestComponent: Component rendering')

  useEffect(() => {
    const runTests = async () => {
      const results = {}
      console.log('TestComponent: Running tests...')

      // Test 1: Check if localStorage is working
      try {
        localStorage.setItem('test', 'test')
        localStorage.removeItem('test')
        results.localStorage = 'Working'
      } catch (error) {
        results.localStorage = 'Failed: ' + error.message
      }

      // Test 2: Check if fetch is working
      try {
        const response = await fetch('http://localhost:5000/api/health')
        const data = await response.json()
        results.fetch = 'Working: ' + data.message
      } catch (error) {
        results.fetch = 'Failed: ' + error.message
      }

      // Test 3: Check if axios is working
      try {
        const axios = await import('axios')
        const response = await axios.default.get('http://localhost:5000/api/health')
        results.axios = 'Working: ' + response.data.message
      } catch (error) {
        results.axios = 'Failed: ' + error.message
      }

      // Test 4: Check if lucide-react icons are working
      try {
        const { CheckSquare } = await import('lucide-react')
        results.icons = 'Working: CheckSquare imported'
      } catch (error) {
        results.icons = 'Failed: ' + error.message
      }

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-green-500 z-[9999] max-w-sm">
      <h3 className="font-bold text-sm mb-2 text-green-600">Frontend Tests</h3>
      <div className="text-xs space-y-1">
        {Object.entries(testResults).map(([key, value]) => (
          <p key={key}><strong>{key}:</strong> {value}</p>
        ))}
      </div>
    </div>
  )
}

export default TestComponent
