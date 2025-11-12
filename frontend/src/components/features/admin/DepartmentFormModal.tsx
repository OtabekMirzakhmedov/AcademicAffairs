import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { BankOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import departmentsService, {
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
} from '../../../services/departments.service';
import type { Department, User } from '../../../types';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: Department | null;
  departmentHeads: User[];
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  department,
  departmentHeads,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && department) {
      // Edit mode - populate form
      form.setFieldsValue({
        name: department.name,
        headId: department.headId,
        phone: department.phone,
        roomNumber: department.roomNumber,
      });
    } else if (open) {
      // Create mode - reset form
      form.resetFields();
    }
  }, [open, department, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (department) {
        // Update existing department
        const updateData: UpdateDepartmentRequest = {
          name: values.name,
          headId: values.headId,
          phone: values.phone,
          roomNumber: values.roomNumber,
        };
        await departmentsService.update(department.id, updateData);
        message.success('Department updated successfully!');
      } else {
        // Create new department
        const createData: CreateDepartmentRequest = {
          name: values.name,
          headId: values.headId,
          phone: values.phone,
          roomNumber: values.roomNumber,
        };
        await departmentsService.create(createData);
        message.success('Department created successfully!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || 'Failed to save department'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={department ? 'Edit Department' : 'Create New Department'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={department ? 'Update' : 'Create'}
      cancelText="Cancel"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* Department Name */}
        <Form.Item
          name="name"
          label="Department Name"
          rules={[
            { required: true, message: 'Please enter department name!' },
            { min: 3, message: 'Name must be at least 3 characters' },
          ]}
        >
          <Input
            prefix={<BankOutlined />}
            placeholder="Enter department name"
          />
        </Form.Item>

        {/* Department Head */}
        <Form.Item name="headId" label="Department Head">
          <Select
            placeholder="Select department head (optional)"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={departmentHeads.map((user) => ({
              label: `${user.userInfo?.firstName} ${user.userInfo?.lastName} (${user.login})`,
              value: user.id,
            }))}
          />
        </Form.Item>

        {/* Phone */}
        <Form.Item name="phone" label="Phone Number">
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Enter phone number (optional)"
          />
        </Form.Item>

        {/* Room Number */}
        <Form.Item name="roomNumber" label="Room Number">
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Enter room number (optional)"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentFormModal;
