import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import api from '../../../config/api';
import { useAuthStore } from '../../../store/authStore';

interface ChangePasswordModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  required?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  open,
  onSuccess,
  onCancel,
  required = false,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { setUser, user } = useAuthStore();

  const handleSubmit = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      setLoading(true);

      await api.post('/auth/change-password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      // Update user state to reflect password change
      if (user) {
        setUser({ ...user, mustChangePassword: false });
      }

      form.resetFields();
      message.success('Password changed successfully!');
      onSuccess();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || 'Failed to change password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
      open={open}
      onCancel={required ? undefined : onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      closable={!required}
      maskClosable={!required}
      okText="Change Password"
      cancelText="Cancel"
    >
      {required && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            You must change your password before continuing.
          </p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="oldPassword"
          label="Current Password"
          rules={[
            { required: true, message: 'Please enter your current password!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: 'Please enter your new password!' },
            { min: 6, message: 'Password must be at least 6 characters long!' },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match!')
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
