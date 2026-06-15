import { useState } from 'react';
import { Modal, Form, Select, Switch, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import programsService from '../../../services/programs.service';
import type { Course } from '../../../types';

interface AddCourseToSemesterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  programId: number;
  semester: number;
  availableCourses: Course[];
}

const AddCourseToSemesterModal = ({
  open,
  onClose,
  onSuccess,
  programId,
  semester,
  availableCourses,
}: AddCourseToSemesterModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getSemesterLabel = (sem: number) => {
    const year = Math.ceil(sem / 2);
    const semInYear = sem % 2 === 1 ? 1 : 2;
    return `Year ${year} - Semester ${semInYear}`;
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await programsService.addCourse(programId, {
        courseId: values.courseId,
        isRequired: values.isRequired !== false,
        recommendedSemester: semester,
      });
      message.success('Course added to program');
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Failed to add course to program'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          Add Course to {getSemesterLabel(semester)}
        </span>
      }
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Add Course"
      cancelText="Cancel"
      confirmLoading={loading}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isRequired: true }}
      >
        <Form.Item
          name="courseId"
          label="Select Course"
          rules={[{ required: true, message: 'Please select a course' }]}
        >
          <Select
            placeholder="Search and select a course"
            size="large"
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
            }
            options={availableCourses.map((course) => ({
              label: `${course.name} (Lec: ${course.lectureHours || 0}h, Prac: ${course.practiceHours || 0}h)`,
              value: course.id,
            }))}
            notFoundContent={
              availableCourses.length === 0
                ? 'No available courses. All courses are already in this program.'
                : 'No matching courses found.'
            }
          />
        </Form.Item>

        <Form.Item
          name="isRequired"
          label="Course Type"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Required"
            unCheckedChildren="Elective"
            defaultChecked
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCourseToSemesterModal;
