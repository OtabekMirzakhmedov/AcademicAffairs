import { Modal, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usersService, { type CreateTeacherRequest } from '../../../services/users.service';

interface TeacherFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  departmentId?: number;
}

const TeacherFormModal = ({ open, onCancel, onSuccess }: TeacherFormModalProps) => {
  const { t } = useTranslation(['head', 'common']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values: CreateTeacherRequest) => {
    try {
      setLoading(true);
      await usersService.createTeacher(values);
      message.success(t('head:teachers.createSuccess'));
      onSuccess();
      onCancel();
    } catch (error: any) {
      message.error(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        t('head:teachers.createFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t('head:teachers.createTitle')}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={t('common:button.create')}
      cancelText={t('common:button.cancel')}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="login"
          label={t('head:teachers.login')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Input placeholder={t('head:teachers.loginPlaceholder')} />
        </Form.Item>

        <Form.Item
          name="firstName"
          label={t('head:teachers.firstName')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Input placeholder={t('head:teachers.firstNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={t('head:teachers.lastName')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Input placeholder={t('head:teachers.lastNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="email1"
          label={t('head:teachers.primaryEmail')}
          rules={[{ type: 'email', message: t('common:label.required') }]}
        >
          <Input placeholder={t('head:teachers.primaryEmailPlaceholder')} />
        </Form.Item>

        <Form.Item name="email2" label={t('head:teachers.secondaryEmail')}
          rules={[{ type: 'email', message: t('common:label.required') }]}
        >
          <Input placeholder={t('head:teachers.secondaryEmailPlaceholder')} />
        </Form.Item>

        <Form.Item name="phone1" label={t('head:teachers.primaryPhone')}>
          <Input placeholder={t('head:teachers.primaryPhonePlaceholder')} />
        </Form.Item>

        <Form.Item name="phone2" label={t('head:teachers.secondaryPhone')}>
          <Input placeholder={t('head:teachers.secondaryPhonePlaceholder')} />
        </Form.Item>

        <div style={{ padding: '10px', background: '#f0f2f5', borderRadius: '4px', marginTop: '10px' }}>
          {t('head:teachers.defaultPasswordNote')}
        </div>
      </Form>
    </Modal>
  );
};

export default TeacherFormModal;
