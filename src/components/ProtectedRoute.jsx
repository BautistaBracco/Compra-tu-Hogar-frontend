import { Navigate } from 'react-router-dom';
import { hasRole, isAuthenticated } from '../auth';

export function ProtectedRoute({ children, allowedRoles }) {
  if (!isAuthenticated()) {
    return <Navigate to="/landing" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}




