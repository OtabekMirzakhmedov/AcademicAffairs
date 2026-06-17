import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import usersService, { type CreateUserRequest, type UpdateUserRequest } from '../../../services/users.service';
import type { User, Role, Department } from '../../../types';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null;
  roles: Role[];
  departments: Department[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  user,
  roles,
  departments,
}) => {
  const { t } = useTranslation(['admin', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open && user) {
      // Edit mode - populate form
      form.setFieldsValue({
        login: user.login,
        roleId: user.roleId,
        firstName: user.userInfo?.firstName,
        lastName: user.userInfo?.lastName,
        email1: user.userInfo?.email1,
        email2: user.userInfo?.email2,
        phone1: user.userInfo?.phone1,
        phone2: user.userInfo?.phone2,
        departmentId: user.teacherInfo?.departmentId,
      });
      const role = roles.find((r) => r.id === user.roleId);
      setSelectedRole(role?.name);
    } else if (open) {
      // Create mode - reset form
      form.resetFields();
      setSelectedRole(undefined);
    }
  }, [open, user, form, roles]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (user) {
        // Update existing user
        const updateData: UpdateUserRequest = {
          login: values.login,
          roleId: values.roleId,
          firstName: values.firstName,
          lastName: values.lastName,
          email1: values.email1,
          email2: values.email2,
          phone1: values.phone1,
          phone2: values.phone2,
          departmentId: values.departmentId,
        };
        await usersService.update(user.id, updateData);
        message.success(t('admin:users.updateSuccess'));
      } else {
        // Create new user
        const createData: CreateUserRequest = {
          login: values.login,
          password: values.password,
          roleId: values.roleId,
          firstName: values.firstName,
          lastName: values.lastName,
          email1: values.email1,
          email2: values.email2,
          phone1: values.phone1,
          phone2: values.phone2,
          departmentId: values.departmentId,
        };
        await usersService.create(createData);
        message.success(t('admin:users.createSuccess'));
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || t('admin:users.saveFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    setSelectedRole(role?.name);

    // Clear department if not teacher
    if (role?.name !== 'teacher') {
      form.setFieldValue('departmentId', undefined);
    }
  };

  return (
    <Modal
      title={user ? t('admin:users.editTitle') : t('admin:users.createTitle')}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={user ? t('common:button.update') : t('common:button.create')}
      cancelText={t('common:button.cancel')}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="login"
          label={t('admin:users.login')}
          rules={[
            { required: true, message: t('common:label.required') },
            { min: 3, message: t('admin:users.loginMinLength') },
          ]}
        >
          <Input prefix={<UserOutlined />} placeholder={t('admin:users.loginPlaceholder')} autoComplete="off" />
        </Form.Item>

        {!user && (
          <Form.Item
            name="password"
            label={t('admin:users.password')}
            rules={[
              { required: true, message: t('common:label.required') },
              { min: 6, message: t('admin:users.passwordMinLength') },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder={t('admin:users.passwordPlaceholder')} autoComplete="new-password" />
          </Form.Item>
        )}

        <Form.Item
          name="roleId"
          label={t('admin:users.role')}
          rules={[{ required: true, message: t('admin:users.roleRequired') }]}
        >
          <Select
            placeholder={t('admin:users.rolePlaceholder')}
            onChange={handleRoleChange}
            options={roles.map((role) => ({
              label: t(`domain:role.${role.name}`, { defaultValue: role.name }),
              value: role.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="firstName"
          label={t('admin:users.firstName')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Input placeholder={t('admin:users.firstNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="lastName"
          label={t('admin:users.lastName')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Input placeholder={t('admin:users.lastNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="email1"
          label={t('admin:users.primaryEmail')}
          rules={[{ type: 'email', message: t('admin:users.emailInvalid') }]}
        >
          <Input prefix={<MailOutlined />} placeholder={t('admin:users.primaryEmailPlaceholder')} type="email" />
        </Form.Item>

        <Form.Item
          name="email2"
          label={t('admin:users.secondaryEmail')}
          rules={[{ type: 'email', message: t('admin:users.emailInvalid') }]}
        >
          <Input prefix={<MailOutlined />} placeholder={t('admin:users.secondaryEmailPlaceholder')} type="email" />
        </Form.Item>

        <Form.Item name="phone1" label={t('admin:users.primaryPhone')}>
          <Input prefix={<PhoneOutlined />} placeholder={t('admin:users.primaryPhonePlaceholder')} />
        </Form.Item>

        <Form.Item name="phone2" label={t('admin:users.secondaryPhone')}>
          <Input prefix={<PhoneOutlined />} placeholder={t('admin:users.secondaryPhonePlaceholder')} />
        </Form.Item>

        {selectedRole === 'teacher' && (
          <Form.Item
            name="departmentId"
            label={t('common:label.department')}
            rules={[{ required: true, message: t('admin:users.departmentRequired') }]}
          >
            <Select
              placeholder={t('admin:users.departmentPlaceholder')}
              options={departments.map((dept) => ({
                label: dept.name,
                value: dept.id,
              }))}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default UserFormModal;
