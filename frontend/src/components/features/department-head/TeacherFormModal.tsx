import { Modal, Form, Input, message } from 'antd';
import { useEffect, useState } from 'react';
import usersService, { type CreateTeacherRequest } from '../../../services/users.service';

interface TeacherFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  departmentId?: number;
}

const TeacherFormModal = ({ open, onCancel, onSuccess }: TeacherFormModalProps) => {
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
      message.success('Teacher created successfully! Default password: password123');
      onSuccess();
      onCancel();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to create teacher';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Teacher"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="login"
          label="Login"
          rules={[{ required: true, message: 'Please enter login' }]}
        >
          <Input placeholder="Enter login username" />
        </Form.Item>

        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          name="email1"
          label="Primary Email"
          rules={[{ type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input placeholder="Enter primary email (optional)" />
        </Form.Item>

        <Form.Item
          name="email2"
          label="Secondary Email"
          rules={[{ type: 'email', message: 'Please enter a valid email' }]}
        >
          <Input placeholder="Enter secondary email (optional)" />
        </Form.Item>

        <Form.Item
          name="phone1"
          label="Primary Phone"
        >
          <Input placeholder="Enter primary phone (optional)" />
        </Form.Item>

        <Form.Item
          name="phone2"
          label="Secondary Phone"
        >
          <Input placeholder="Enter secondary phone (optional)" />
        </Form.Item>

        <div style={{ padding: '10px', background: '#f0f2f5', borderRadius: '4px', marginTop: '10px' }}>
          <strong>Note:</strong> The teacher will be created with default password <code>password123</code>. They can change it anytime from Settings.
        </div>
      </Form>
    </Modal>
  );
};

export default TeacherFormModal;
