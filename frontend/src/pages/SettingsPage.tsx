import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Divider, Switch } from 'antd';
import { LockOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import authService from '../services/auth.service';

const SettingsPage = () => {
  const { t } = useTranslation(['auth', 'common', 'domain']);
  const { user } = useAuthStore();
  const { mode, toggleTheme } = useThemeStore();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);
      await authService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success(t('auth:changePassword.success'));
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || t('auth:changePassword.failed')
      );
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          {t('common:settings.profileTab')}
        </span>
      ),
      children: (
        <Card>
          <h3>{t('common:settings.userInfo')}</h3>
          <Divider />
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{t('common:settings.username')}</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>{user?.login}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{t('common:settings.fullName')}</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {user?.userInfo?.firstName} {user?.userInfo?.lastName}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{t('auth:account.email')}</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {user?.userInfo?.email1 || t('common:label.notSet')}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{t('auth:account.phone')}</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {user?.userInfo?.phone1 || t('common:label.notSet')}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{t('common:label.role')}</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {t(`domain:role.${user?.role?.name}`, { defaultValue: user?.role?.name })}
            </div>
          </div>
          {user?.role?.name === 'teacher' && user?.teacherInfo?.department && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{t('common:label.department')}</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>
                {user.teacherInfo.department.name}
              </div>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'appearance',
      label: (
        <span>
          <Moon size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          {t('common:settings.appearance')}
        </span>
      ),
      children: (
        <Card>
          <h3>{t('common:settings.appearance')}</h3>
          <Divider />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 400 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {mode === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{t('common:settings.theme')}</span>
            </div>
            <Switch
              checked={mode === 'dark'}
              onChange={toggleTheme}
              checkedChildren={t('common:settings.darkMode')}
              unCheckedChildren={t('common:settings.lightMode')}
            />
          </div>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          {t('common:settings.security')}
        </span>
      ),
      children: (
        <Card>
          <h3>{t('auth:changePassword.title')}</h3>
          <Divider />
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="oldPassword"
              label={t('auth:changePassword.currentPassword')}
              rules={[
                { required: true, message: t('auth:changePassword.currentPasswordRequired') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth:changePassword.currentPasswordPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={t('auth:changePassword.newPassword')}
              rules={[
                { required: true, message: t('auth:changePassword.newPasswordRequired') },
                { min: 6, message: t('auth:changePassword.newPasswordMinLength') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth:changePassword.newPasswordPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={t('auth:changePassword.confirmPassword')}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('auth:changePassword.confirmPasswordRequired') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('auth:changePassword.confirmPasswordMismatch'))
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('auth:changePassword.confirmPasswordPlaceholder')}
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('auth:changePassword.title')}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>
            <SettingOutlined style={{ marginRight: 8 }} />
            {t('common:nav.settings')}
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-tertiary)' }}>
            {t('common:settings.subtitle')}
          </p>
        </div>

        <Tabs items={items} defaultActiveKey="profile" />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
