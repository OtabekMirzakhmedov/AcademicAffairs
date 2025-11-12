import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Card } from 'antd';
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
      <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{ backgroundColor: '#f5f5f5' }}
      >
        <div className="max-w-md w-full">
          <Card
              className="shadow-lg"
              style={{ borderRadius: '12px' }}
          >
            {/* Header Section */}
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div
                    className="flex items-center justify-center"
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      backgroundColor: '#e6f4ff'
                    }}
                >
                  <img
                      src={branding.universityLogo}
                      alt={branding.universityName}
                      className="h-12"
                      onError={(e) => {
                        // Fallback to icon if logo doesn't exist
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                        <svg 
                          width="48" 
                          height="48" 
                          fill="none" 
                          stroke="#1890ff" 
                          viewBox="0 0 24 24"
                          stroke-width="2"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      `;
                        }
                      }}
                  />
                </div>
              </div>

              {/* Title */}
              <h1
                  className="text-2xl font-bold mb-2"
                  style={{ color: '#262626' }}
              >
                {branding.universityName}
              </h1>
              <h2
                  className="text-xl font-semibold mb-2"
                  style={{ color: '#262626' }}
              >
                Academic Affairs Management
              </h2>
              <p style={{ color: '#8c8c8c', fontSize: '14px' }}>
                Sign in to continue
              </p>
            </div>

            {/* Login Form */}
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                size="large"
                autoComplete="off"
                layout="vertical"
            >
              <Form.Item
                  label="Username"
                  name="login"
                  rules={[{ required: true, message: 'Please enter your username!' }]}
              >
                <Input
                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Enter your username"
                    autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                  label="Password"
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                    loading={loading}
                    size="large"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center text-sm" style={{ color: '#8c8c8c' }}>
              <p>Default credentials: admin / admin123</p>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm" style={{ color: '#8c8c8c' }}>
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