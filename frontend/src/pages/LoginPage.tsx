import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { User as UserIcon, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import branding from '../config/branding.json';
import './LoginPage.scss';

const universityLogo = '/university-logo.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
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

  const onFinish = async (values: { login: string; password: string; remember?: boolean }) => {
    try {
      setLoading(true);
      await login(values.login, values.password, values.remember);
      const currentUser = useAuthStore.getState().user;
      message.success(t('login.success'));
      navigate(getRedirectPath(currentUser));
    } catch (error: any) {
      message.error(error?.response?.data?.error?.message || t('login.failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-page__brand">
        <div className="login-page__brand-content">
          <div className="login-page__logo">
            {logoError ? (
              <GraduationCap size={36} strokeWidth={1.75} />
            ) : (
              <img
                src={universityLogo}
                alt={branding.universityName}
                onError={() => setLogoError(true)}
              />
            )}
          </div>
          <h1 className="login-page__brand-title">{branding.universityName}</h1>
          <p className="login-page__brand-subtitle">{t('login.appTitle')}</p>
          <p className="login-page__brand-tag">{t('login.subtitle')}</p>
        </div>
        <div className="login-page__brand-footer">
          &copy; {new Date().getFullYear()} {branding.universityShortName}.{' '}
          {t('login.copyright')}
        </div>
      </aside>

      <section className="login-page__form-wrap">
        <div className="login-page__form-card">
          <div className="login-page__form-header">
            <h2 className="login-page__form-title">{t('login.signIn')}</h2>
            <p className="login-page__form-subtitle">{t('login.defaultCredentials')}</p>
          </div>

          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
            autoComplete="off"
            layout="vertical"
            requiredMark={false}
            className="login-page__form"
          >
            <Form.Item
              label={t('login.username')}
              name="login"
              rules={[{ required: true, message: t('login.usernameRequired') }]}
            >
              <Input
                prefix={<UserIcon size={16} strokeWidth={1.75} className="login-page__input-icon" />}
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
                prefix={<Lock size={16} strokeWidth={1.75} className="login-page__input-icon" />}
                placeholder={t('login.passwordPlaceholder')}
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked" className="login-page__remember">
              <Checkbox>{t('login.rememberMe')}</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                size="large"
                className="login-page__submit"
                icon={!loading ? <ArrowRight size={16} strokeWidth={2} /> : undefined}
                iconPosition="end"
              >
                {loading ? t('login.signingIn') : t('login.signIn')}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
