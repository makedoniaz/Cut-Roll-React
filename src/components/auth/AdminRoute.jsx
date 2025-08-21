import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useStores';
import { useEffect } from 'react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, verifyToken, user } = useAuth();

  useEffect(() => {
    // Verify token on mount
    verifyToken();
  }, [verifyToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
