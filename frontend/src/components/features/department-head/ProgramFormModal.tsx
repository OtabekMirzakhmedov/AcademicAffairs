import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { BookOutlined, CodeOutlined, ApartmentOutlined } from '@ant-design/icons';
import programsService, {
  type CreateProgramRequest,
  type UpdateProgramRequest,
} from '../../../services/programs.service';
import type { Program, Department } from '../../../types';

const { TextArea } = Input;

interface ProgramFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  program: Program | null;
  departmentId: number;
  departments: Department[];
}

const DEGREE_LEVELS = [
  { value: 'BACHELOR', label: 'Bachelor' },
  { value: 'MASTER', label: 'Master' },
  { value: 'DOCTORATE', label: 'Doctorate' },
  { value: 'UNDERGRADUATE', label: 'Undergraduate' },
  { value: 'GRADUATE', label: 'Graduate' },
];

const ProgramFormModal = ({
  open,
  onClose,
  onSuccess,
  program,
  departmentId,
  departments,
}: ProgramFormModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (program) {
        // Edit mode - populate form
        form.setFieldsValue({
          name: program.name,
          code: program.code,
          degreeLevel: program.degreeLevel,
          departmentId: program.departmentId,
          durationYears: program.durationYears,
          totalCreditsRequired: program.totalCreditsRequired,
          description: program.description,
          isActive: program.isActive,
        });
      } else {
        // Create mode - reset with department default
        form.resetFields();
        form.setFieldsValue({
          departmentId: departmentId,
          isActive: true,
        });
      }
    }
  }, [open, program, form, departmentId]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (program) {
        // Update existing program
        const updateData: UpdateProgramRequest = {
          name: values.name,
          code: values.code,
          degreeLevel: values.degreeLevel,
          departmentId: values.departmentId,
          durationYears: values.durationYears,
          totalCreditsRequired: values.totalCreditsRequired,
          description: values.description,
          isActive: values.isActive,
        };
        await programsService.update(program.id, updateData);
        message.success('Program updated successfully');
      } else {
        // Create new program
        const createData: CreateProgramRequest = {
          name: values.name,
          code: values.code,
          degreeLevel: values.degreeLevel,
          departmentId: values.departmentId,
          durationYears: values.durationYears,
          totalCreditsRequired: values.totalCreditsRequired,
          description: values.description,
          isActive: values.isActive !== undefined ? values.isActive : true,
        };
        await programsService.create(createData);
        message.success('Program created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message ||
          `Failed to ${program ? 'update' : 'create'} program`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          {program ? 'Edit Program' : 'Create New Program'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={program ? 'Update' : 'Create'}
      cancelText="Cancel"
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Program Name"
          rules={[
            { required: true, message: 'Please enter program name' },
            { min: 3, message: 'Program name must be at least 3 characters' },
          ]}
        >
          <Input
            prefix={<BookOutlined />}
            placeholder="e.g., Mechanical Engineering, Computer Science"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="code"
          label="Program Code"
          rules={[
            { required: true, message: 'Please enter program code' },
            { pattern: /^[A-Z0-9-]+$/, message: 'Code must contain only uppercase letters, numbers, and hyphens' },
          ]}
        >
          <Input
            prefix={<CodeOutlined />}
            placeholder="e.g., ME-MECH, CS-BACH"
            size="large"
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        <Form.Item
          name="degreeLevel"
          label="Degree Level"
          rules={[{ required: true, message: 'Please select degree level' }]}
        >
          <Select
            placeholder="Select degree level"
            size="large"
            options={DEGREE_LEVELS}
          />
        </Form.Item>

        <Form.Item
          name="departmentId"
          label="Department"
          rules={[{ required: true, message: 'Please select department' }]}
        >
          <Select
            placeholder="Select department"
            size="large"
            suffixIcon={<ApartmentOutlined />}
          >
            {departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="durationYears"
          label="Duration (Years)"
          rules={[
            { required: true, message: 'Please enter duration' },
            { type: 'number', min: 1, max: 10, message: 'Duration must be between 1 and 10 years' },
          ]}
        >
          <InputNumber
            min={1}
            max={10}
            placeholder="4"
            size="large"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="totalCreditsRequired"
          label="Total Credits Required"
          rules={[
            { required: true, message: 'Please enter total credits' },
            { type: 'number', min: 0, message: 'Credits must be positive' },
          ]}
        >
          <InputNumber
            min={0}
            step={0.5}
            placeholder="120"
            size="large"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description (Optional)"
        >
          <TextArea
            rows={3}
            placeholder="Brief description of the program..."
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select size="large">
            <Select.Option value={true}>Active</Select.Option>
            <Select.Option value={false}>Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProgramFormModal;
