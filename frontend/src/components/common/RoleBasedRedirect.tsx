import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const RoleBasedRedirect = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role.name) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'departmenthead':
      return <Navigate to="/department/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default RoleBasedRedirect;
