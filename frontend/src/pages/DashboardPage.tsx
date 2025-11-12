import { useNavigate } from 'react-router-dom';
import { Button, Card, Descriptions, Tag } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import branding from '../config/branding.json';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'red';
      case 'departmenthead':
        return 'blue';
      case 'teacher':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Administrator';
      case 'departmenthead':
        return 'Department Head';
      case 'teacher':
        return 'Teacher';
      default:
        return roleName;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {branding.universityShortName} - Academic Affairs
              </h1>
            </div>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
          <p className="mt-1 text-gray-600">
            Here's an overview of your account
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <Card
            title={
              <span>
                <UserOutlined className="mr-2" />
                User Profile
              </span>
            }
            className="shadow-md"
          >
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Username">
                {user?.login}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color={getRoleColor(user?.role?.name || '')}>
                  {getRoleLabel(user?.role?.name || '')}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="First Name">
                {user?.userInfo?.firstName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                {user?.userInfo?.lastName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {user?.userInfo?.email1 || 'N/A'}
              </Descriptions.Item>
              {user?.teacherInfo && (
                <>
                  <Descriptions.Item label="Department">
                    {user.teacherInfo.department?.name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Employment Type">
                    {user.teacherInfo.employmentType || 'Not Set'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mandatory Hours">
                    {user.teacherInfo.mandatoryHoursPerPeriod
                      ? `${user.teacherInfo.mandatoryHoursPerPeriod} hours`
                      : 'Not Set'}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </Card>

          {/* Quick Stats Card */}
          <Card title="System Status" className="shadow-md">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Authentication</p>
                  <p className="text-lg font-semibold text-green-700">Active</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserOutlined className="text-2xl text-blue-600" />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Next Steps:</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Complete your profile information</li>
                  <li>View assigned courses (Teachers)</li>
                  <li>Manage teaching activities</li>
                  <li>Generate reports</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Coming Soon Banner */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Coming Soon
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                📚 Teaching Activities
              </h4>
              <p className="text-sm text-gray-600">
                Track and manage your teaching hours, courses, and activities.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                👥 Department Management
              </h4>
              <p className="text-sm text-gray-600">
                Manage departments, assign teachers, and validate activities.
              </p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">
                ⚙️ Admin Panel
              </h4>
              <p className="text-sm text-gray-600">
                Full system administration and user management capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
