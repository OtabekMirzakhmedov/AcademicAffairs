import { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Divider } from 'antd';
import { LockOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import authService from '../services/auth.service';

const SettingsPage = () => {
  const { user } = useAuthStore();
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
      message.success('Password changed successfully!');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || 'Failed to change password'
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
          Profile Information
        </span>
      ),
      children: (
        <Card>
          <h3>User Information</h3>
          <Divider />
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Username</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>{user?.login}</div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Full Name</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {user?.userInfo?.firstName} {user?.userInfo?.lastName}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Email</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {user?.userInfo?.email1 || 'Not set'}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Phone</div>
            <div style={{ fontSize: '16px', fontWeight: 500 }}>
              {user?.userInfo?.phone1 || 'Not set'}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Role</div>
            <div style={{ fontSize: '16px', fontWeight: 500, textTransform: 'capitalize' }}>
              {user?.role?.name === 'departmenthead' ? 'Department Head' : user?.role?.name}
            </div>
          </div>
          {user?.role?.name === 'teacher' && user?.teacherInfo?.department && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Department</div>
              <div style={{ fontSize: '16px', fontWeight: 500 }}>
                {user.teacherInfo.department.name}
              </div>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          Security
        </span>
      ),
      children: (
        <Card>
          <h3>Change Password</h3>
          <Divider />
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="oldPassword"
              label="Current Password"
              rules={[
                { required: true, message: 'Please enter your current password' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter current password"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords do not match')
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
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
            Settings
          </h1>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs items={items} defaultActiveKey="profile" />
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
