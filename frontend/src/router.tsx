import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeachingActivitiesPage from './pages/TeachingActivitiesPage';
import UsersPage from './pages/admin/UsersPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Navigate to="/dashboard" replace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <TeacherDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teaching-activities',
    element: (
      <ProtectedRoute>
        <TeachingActivitiesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/scientific-activities',
    element: (
      <ProtectedRoute>
        <div>Scientific Activities - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/research-activities',
    element: (
      <ProtectedRoute>
        <div>Research Activities - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/other-activities',
    element: (
      <ProtectedRoute>
        <div>Other Activities - Coming Soon</div>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute>
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/departments',
    element: (
      <ProtectedRoute>
        <DepartmentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
