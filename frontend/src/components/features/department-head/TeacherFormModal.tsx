import { Modal, Form, Input, message } from 'antd';
import { useEffect } from 'react';
import usersService, { type CreateTeacherRequest } from '../../../services/users.service';

interface TeacherFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TeacherFormModal = ({ visible, onClose, onSuccess }: TeacherFormModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async (values: CreateTeacherRequest) => {
    try {
      await usersService.createTeacher(values);
      message.success('Teacher created successfully! Default password: password123');
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create teacher');
    }
  };

  return (
    <Modal
      title="Create Teacher"
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
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
          <strong>Note:</strong> The teacher will be created with default password <code>password123</code> and will be required to change it on first login.
        </div>
      </Form>
    </Modal>
  );
};

export default TeacherFormModal;
