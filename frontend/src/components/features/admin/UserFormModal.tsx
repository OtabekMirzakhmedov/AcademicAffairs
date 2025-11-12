import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
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
        message.success('User updated successfully!');
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
        message.success('User created successfully!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || 'Failed to save user'
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
      title={user ? 'Edit User' : 'Create New User'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={user ? 'Update' : 'Create'}
      cancelText="Cancel"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Login */}
        <Form.Item
          name="login"
          label="Username"
          rules={[
            { required: true, message: 'Please enter username!' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Enter username"
            autoComplete="off"
          />
        </Form.Item>

        {/* Password (only for create) */}
        {!user && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password!' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
              autoComplete="new-password"
            />
          </Form.Item>
        )}

        {/* Role */}
        <Form.Item
          name="roleId"
          label="Role"
          rules={[{ required: true, message: 'Please select role!' }]}
        >
          <Select
            placeholder="Select role"
            onChange={handleRoleChange}
            options={roles.map((role) => ({
              label: role.name === 'admin' ? 'Administrator' :
                     role.name === 'departmenthead' ? 'Department Head' :
                     role.name === 'teacher' ? 'Teacher' : role.name,
              value: role.id,
            }))}
          />
        </Form.Item>

        {/* First Name */}
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please enter first name!' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please enter last name!' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        {/* Email 1 */}
        <Form.Item
          name="email1"
          label="Primary Email"
          rules={[{ type: 'email', message: 'Please enter valid email!' }]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter primary email"
            type="email"
          />
        </Form.Item>

        {/* Email 2 */}
        <Form.Item
          name="email2"
          label="Secondary Email"
          rules={[{ type: 'email', message: 'Please enter valid email!' }]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Enter secondary email (optional)"
            type="email"
          />
        </Form.Item>

        {/* Phone 1 */}
        <Form.Item name="phone1" label="Primary Phone">
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Enter primary phone"
          />
        </Form.Item>

        {/* Phone 2 */}
        <Form.Item name="phone2" label="Secondary Phone">
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Enter secondary phone (optional)"
          />
        </Form.Item>

        {/* Department (only for teachers) */}
        {selectedRole === 'teacher' && (
          <Form.Item
            name="departmentId"
            label="Department"
            rules={[
              { required: true, message: 'Please select department for teacher!' },
            ]}
          >
            <Select
              placeholder="Select department"
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
