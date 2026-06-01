import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../auth';

export function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/home" replace />;
  }

  return children;
}
