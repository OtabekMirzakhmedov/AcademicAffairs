import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DepartmentHeadDashboardPage from './pages/department-head/DepartmentHeadDashboardPage';
import TeachingActivitiesPage from './pages/TeachingActivitiesPage';
import PublicationsPage from './pages/PublicationsPage';
import ScientificTasksPage from './pages/ScientificTasksPage';
import UsersPage from './pages/admin/UsersPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import ScientificTasksManagementPage from './pages/admin/ScientificTasksManagementPage';
import DepartmentActivitiesPage from './pages/department-head/DepartmentActivitiesPage';
import ScientificReportsValidationPage from './pages/department-head/ScientificReportsValidationPage';
import TeachersManagementPage from './pages/department-head/TeachersManagementPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRedirect from './components/common/RoleBasedRedirect';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleBasedRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/department/dashboard',
    element: (
      <ProtectedRoute>
        <DepartmentHeadDashboardPage />
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
        <PublicationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/scientific-tasks',
    element: (
      <ProtectedRoute>
        <ScientificTasksPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <SettingsPage />
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
    path: '/department/teachers',
    element: (
      <ProtectedRoute>
        <TeachersManagementPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: (
      <ProtectedRoute>
        <RoleBasedRedirect />
      </ProtectedRoute>
    ),
  },
]);
