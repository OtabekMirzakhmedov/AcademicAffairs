import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import branding from '../config/branding.json';
import universityLogo from '../../public/university-logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('auth');

  const getRedirectPath = (user: any) => {
    if (!user) return '/login';
    switch (user.role.name) {
      case 'admin':
        return '/admin/dashboard';
      case 'departmenthead':
        return '/department/dashboard';
      case 'teacher':
        return '/dashboard';
      default:
        return '/login';
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectPath(user));
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

      const currentUser = useAuthStore.getState().user;
      message.success(t('login.success'));
      navigate(getRedirectPath(currentUser));
    } catch (error: any) {
      message.error(
          error?.response?.data?.error?.message || t('login.failed')
      );
    } finally {
      setLoading(false);
    }
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
                      src={universityLogo}
                      alt={branding.universityName}
                      style={{
                        height: '64px',
                        width: '64px',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
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
                {t('login.appTitle')}
              </h2>
              <p style={{ color: '#8c8c8c', fontSize: '14px' }}>
                {t('login.subtitle')}
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
                  label={t('login.username')}
                  name="login"
                  rules={[{ required: true, message: t('login.usernameRequired') }]}
              >
                <Input
                    prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder={t('login.usernamePlaceholder')}
                    autoComplete="username"
                />
              </Form.Item>

              <Form.Item
                  label={t('login.password')}
                  name="password"
                  rules={[{ required: true, message: t('login.passwordRequired') }]}
              >
                <Input.Password
                    prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                    placeholder={t('login.passwordPlaceholder')}
                    autoComplete="current-password"
                />
              </Form.Item>

              <Form.Item name="remember" valuePropName="checked">
                <Checkbox>{t('login.rememberMe')}</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full"
                    loading={loading}
                    size="large"
                >
                  {loading ? t('login.signingIn') : t('login.signIn')}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center text-sm" style={{ color: '#8c8c8c' }}>
              <p>{t('login.defaultCredentials')}</p>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6 text-sm" style={{ color: '#8c8c8c' }}>
            <p>&copy; 2024 {branding.universityShortName}. {t('login.copyright')}</p>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;
