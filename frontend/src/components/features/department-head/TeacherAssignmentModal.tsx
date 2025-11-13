import { useEffect, useState } from 'react';
import { Modal, Form, Select, message, Tag } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import courseTeachersService, {
  type CreateCourseTeacherRequest,
  type UpdateCourseTeacherRequest,
} from '../../../services/course-teachers.service';
import type { Course, User, AcademicPeriod, CourseTeacher } from '../../../types';

interface TeacherAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assignment: CourseTeacher | null;
  courses: Course[];
  teachers: User[];
  academicPeriods: AcademicPeriod[];
}

const TeacherAssignmentModal = ({
  open,
  onClose,
  onSuccess,
  assignment,
  courses,
  teachers,
  academicPeriods,
}: TeacherAssignmentModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (assignment) {
        // Edit mode - only groups can be edited
        form.setFieldsValue({
          courseId: assignment.courseId,
          teacherId: assignment.teacherId,
          academicPeriodId: assignment.academicPeriodId,
          groups: assignment.groups || [],
        });
      } else {
        // Create mode
        form.resetFields();
      }
    }
  }, [open, assignment, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (assignment) {
        // Update existing assignment (only groups)
        const updateData: UpdateCourseTeacherRequest = {
          groups: values.groups && values.groups.length > 0 ? values.groups : undefined,
        };
        await courseTeachersService.update(assignment.id, updateData);
        message.success('Assignment updated successfully');
      } else {
        // Create new assignment
        const createData: CreateCourseTeacherRequest = {
          courseId: values.courseId,
          teacherId: values.teacherId,
          academicPeriodId: values.academicPeriodId,
          groups: values.groups && values.groups.length > 0 ? values.groups : undefined,
        };
        await courseTeachersService.create(createData);
        message.success('Teacher assigned successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message ||
          `Failed to ${assignment ? 'update' : 'create'} assignment`
      );
    } finally {
      setLoading(false);
    }
  };

  const groupOptions = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];

  return (
    <Modal
      title={
        <span>
          <UserOutlined style={{ marginRight: 8 }} />
          {assignment ? 'Edit Teacher Assignment' : 'Assign Teacher to Course'}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={assignment ? 'Update' : 'Assign'}
      cancelText="Cancel"
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="courseId"
          label="Course"
          rules={[{ required: true, message: 'Please select a course' }]}
        >
          <Select
            placeholder="Select course"
            size="large"
            disabled={!!assignment}
            showSearch
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase()) ?? false
            }
            options={courses.map((course) => ({
              label: course.name,
              value: course.id,
            }))}
            suffixIcon={<BookOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="teacherId"
          label="Teacher"
          rules={[{ required: true, message: 'Please select a teacher' }]}
        >
          <Select
            placeholder="Select teacher"
            size="large"
            disabled={!!assignment}
            showSearch
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase()) ?? false
            }
            options={teachers.map((teacher) => ({
              label: `${teacher.userInfo?.firstName} ${teacher.userInfo?.lastName} (${teacher.login})`,
              value: teacher.id,
            }))}
            suffixIcon={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="academicPeriodId"
          label="Academic Period"
          rules={[{ required: true, message: 'Please select an academic period' }]}
        >
          <Select
            placeholder="Select academic period"
            size="large"
            disabled={!!assignment}
            suffixIcon={<CalendarOutlined />}
          >
            {academicPeriods.map((period) => (
              <Select.Option key={period.id} value={period.id}>
                <span>
                  {period.academicYear} - Semester {period.semester}
                  {period.isActive && (
                    <Tag color="green" style={{ marginLeft: 8 }}>
                      Active
                    </Tag>
                  )}
                </span>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="groups"
          label="Groups (Optional)"
          tooltip="Select the student groups for this course"
        >
          <Select
            mode="tags"
            placeholder="Select or enter groups (e.g., Group A, Group B)"
            size="large"
            options={groupOptions.map((group) => ({
              label: group,
              value: group,
            }))}
            suffixIcon={<TeamOutlined />}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeacherAssignmentModal;
