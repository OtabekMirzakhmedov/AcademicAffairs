import { Modal, Form, Select, InputNumber, message } from 'antd';
import { useEffect, useState } from 'react';
import usersService, { type UpdateTeacherInfoRequest } from '../../../services/users.service';
import type { User } from '../../../types';

interface TeacherEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teacher: User | null;
}

const TeacherEditModal = ({ visible, onClose, onSuccess, teacher }: TeacherEditModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && teacher) {
      form.setFieldsValue({
        employmentType: teacher.teacherInfo?.employmentType || undefined,
        mandatoryHoursPerPeriod: teacher.teacherInfo?.mandatoryHoursPerPeriod || undefined,
      });
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, teacher, form]);

  const handleSubmit = async (values: UpdateTeacherInfoRequest) => {
    if (!teacher) return;

    try {
      setLoading(true);
      await usersService.updateTeacherInfo(teacher.id, values);
      message.success('Teacher info updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to update teacher info';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Edit Teacher Info: ${teacher?.userInfo?.firstName} ${teacher?.userInfo?.lastName}`}
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="employmentType"
          label="Employment Type"
        >
          <Select placeholder="Select employment type" allowClear>
            <Select.Option value="full-time">Full-Time</Select.Option>
            <Select.Option value="part-time">Part-Time</Select.Option>
            <Select.Option value="contract">Contract</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="mandatoryHoursPerPeriod"
          label="Mandatory Hours Per Period"
          rules={[
            {
              type: 'number',
              min: 0,
              message: 'Mandatory hours must be a positive number',
            },
          ]}
        >
          <InputNumber
            placeholder="Enter mandatory hours"
            style={{ width: '100%' }}
            min={0}
            step={1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeacherEditModal;
