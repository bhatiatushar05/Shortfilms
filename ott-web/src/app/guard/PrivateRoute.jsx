import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../../hooks/useSession'

const PrivateRoute = ({ children }) => {
  const { isAuthed, loading } = useSession()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
