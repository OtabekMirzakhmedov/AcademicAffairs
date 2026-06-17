import { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['auth', 'common']);

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

      if (user) {
        setUser({ ...user, mustChangePassword: false });
      }

      form.resetFields();
      message.success(t('auth:changePassword.success'));
      onSuccess();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || t('auth:changePassword.failed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('auth:changePassword.title')}
      open={open}
      onCancel={required ? undefined : onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      closable={!required}
      maskClosable={!required}
      okText={t('auth:changePassword.title')}
      cancelText={t('common:button.cancel')}
    >
      {required && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            {t('auth:changePassword.mustChange')}
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
          label={t('auth:changePassword.currentPassword')}
          rules={[
            { required: true, message: t('auth:changePassword.currentPasswordRequired') },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth:changePassword.currentPasswordPlaceholder')}
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={t('auth:changePassword.newPassword')}
          rules={[
            { required: true, message: t('auth:changePassword.newPasswordRequired') },
            { min: 6, message: t('auth:changePassword.newPasswordMinLength') },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t('auth:changePassword.newPasswordPlaceholder')}
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={t('auth:changePassword.confirmPassword')}
          dependencies={['newPassword']}
          hasFeedback
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
            autoComplete="new-password"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
