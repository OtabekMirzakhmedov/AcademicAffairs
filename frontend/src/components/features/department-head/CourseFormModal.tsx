import { useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import coursesService, {
  type CreateCourseRequest,
  type UpdateCourseRequest,
} from '../../../services/courses.service';
import type { Course } from '../../../types';

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: Course | null;
  departmentId: number;
}

const CourseFormModal = ({
  open,
  onClose,
  onSuccess,
  course,
  departmentId,
}: CourseFormModalProps) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (course) {
        // Edit mode
        form.setFieldsValue({
          name: course.name,
        });
      } else {
        // Create mode
        form.resetFields();
      }
    }
  }, [open, course, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (course) {
        // Update existing course
        const updateData: UpdateCourseRequest = {
          name: values.name,
        };
        await coursesService.update(course.id, updateData);
        message.success('Course updated successfully');
      } else {
        // Create new course
        const createData: CreateCourseRequest = {
          name: values.name,
          departmentId,
        };
        await coursesService.create(createData);
        message.success('Course created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message ||
          `Failed to ${course ? 'update' : 'create'} course`
      );
    }
  };

  return (
    <Modal
      title={
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          {course ? 'Edit Course' : 'Create New Course'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={course ? 'Update' : 'Create'}
      cancelText="Cancel"
      width={500}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Course Name"
          rules={[
            { required: true, message: 'Please enter course name' },
            { min: 3, message: 'Course name must be at least 3 characters' },
          ]}
        >
          <Input
            prefix={<BookOutlined />}
            placeholder="e.g., Advanced Mathematics, Computer Science 101"
            size="large"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CourseFormModal;
