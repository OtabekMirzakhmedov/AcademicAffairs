import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import ChangePasswordModal from '../components/features/auth/ChangePasswordModal';
import branding from '../config/branding.json';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !user.mustChangePassword) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const onFinish = async (values: {
    login: string;
    password: string;
    remember?: boolean;
  }) => {
    try {
      setLoading(true);
      await login(values.login, values.password, values.remember);

      // Check if user needs to change password
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.mustChangePassword) {
        message.warning('You must change your password before continuing');
        setShowChangePassword(true);
      } else {
        message.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowChangePassword(false);
    message.success('Password changed successfully! Redirecting to dashboard...');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <img
              src={branding.universityLogo}
              alt={branding.universityName}
              className="h-20 mx-auto"
              onError={(e) => {
                // Fallback if logo doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {branding.universityName}
          </h1>
          <p className="text-gray-600">Academic Affairs Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            Sign In
          </h2>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            autoComplete="off"
          >
            <Form.Item
              name="login"
              rules={[{ required: true, message: 'Please enter your username!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="Username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex items-center justify-between">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loading}
                size="large"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Default credentials: admin / admin123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>&copy; 2024 {branding.universityShortName}. All rights reserved.</p>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={showChangePassword}
        onSuccess={handlePasswordChanged}
        onCancel={() => {
          // Don't allow closing if password must be changed
          if (user?.mustChangePassword) {
            message.warning('You must change your password before continuing');
          } else {
            setShowChangePassword(false);
          }
        }}
        required={user?.mustChangePassword}
      />
    </div>
  );
};

export default LoginPage;
