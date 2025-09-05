import { Navigate } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

const PrivateRoute = ({ children }) => {
  const { isAuthed, loading, user } = useSession()

  console.log('🔍 PrivateRoute Debug:', { isAuthed, loading, user: user?.email })

  // Show loading while checking authentication
  if (loading) {
    console.log('🔍 PrivateRoute: Loading...')
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400 mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!isAuthed) {
    console.log('🔍 PrivateRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // If authenticated, allow access
  console.log('🔍 PrivateRoute: Authenticated, allowing access')
  return children
}

export default PrivateRoute
