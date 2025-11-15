import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TeachingActivitiesPage from './pages/TeachingActivitiesPage';
import ScientificTasksPage from './pages/ScientificTasksPage';
import UsersPage from './pages/admin/UsersPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import ScientificTasksManagementPage from './pages/admin/ScientificTasksManagementPage';
import DepartmentActivitiesPage from './pages/department-head/DepartmentActivitiesPage';
import ScientificReportsValidationPage from './pages/department-head/ScientificReportsValidationPage';
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
        <Navigate to="/teaching-activities" replace />
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
        <ScientificTasksPage />
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
    path: '/admin/scientific-tasks',
    element: (
      <ProtectedRoute>
        <ScientificTasksManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/department/activities',
    element: (
      <ProtectedRoute>
        <DepartmentActivitiesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/department/scientific-reports',
    element: (
      <ProtectedRoute>
        <ScientificReportsValidationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/teaching-activities" replace />,
  },
]);
