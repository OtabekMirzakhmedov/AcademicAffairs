import { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Select, Tag, Collapse } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, TeamOutlined, ApartmentOutlined } from '@ant-design/icons';
import coursesService, {
  type CreateCourseRequest,
  type UpdateCourseRequest,
} from '../../../services/courses.service';
import type { Course, User, AcademicPeriod, Department } from '../../../types';

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: Course | null;
  departmentId: number;
  teachers: User[];
  teachersLoading: boolean;
  academicPeriods: AcademicPeriod[];
  departments: Department[];
}

const CourseFormModal = ({
  open,
  onClose,
  onSuccess,
  course,
  departmentId,
  teachers,
  teachersLoading,
  academicPeriods,
  departments,
}: CourseFormModalProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);

  // Filter teachers by selected department
  const filteredTeachers = selectedDepartment
    ? teachers.filter((t) => t.teacherInfo?.departmentId === selectedDepartment)
    : teachers;

  useEffect(() => {
    if (open) {
      if (course) {
        // Edit mode - populate course name
        form.setFieldsValue({
          name: course.name,
        });
      } else {
        // Create mode - reset all fields
        form.resetFields();
      }
      // Reset department filter
      setSelectedDepartment(undefined);
    }
  }, [open, course, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (course) {
        // Update existing course
        const updateData: UpdateCourseRequest = {
          name: values.name,
        };
        await coursesService.update(course.id, updateData);
        message.success('Course updated successfully');
      } else {
        // Create new course with optional teacher assignment
        const createData: CreateCourseRequest = {
          name: values.name,
          departmentId,
          teacherId: values.teacherId,
          academicPeriodId: values.academicPeriodId,
          groups: values.groups && values.groups.length > 0 ? values.groups : undefined,
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
    } finally {
      setLoading(false);
    }
  };

  const groupOptions = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];

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
      confirmLoading={loading}
      width={600}
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

        {!course && (
          <Collapse
            items={[
              {
                key: 'assignment',
                label: 'Assign Teacher (Optional)',
              children: (
                <>
                  <Form.Item
                    label="Filter by Department"
                    tooltip="Filter teachers by department"
                  >
                    <Select
                      placeholder="All Departments"
                      size="large"
                      allowClear
                      value={selectedDepartment}
                      onChange={setSelectedDepartment}
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
                    name="teacherId"
                    label="Teacher"
                    tooltip="Optionally assign a teacher when creating the course"
                  >
                    <Select
                      placeholder="Select teacher (optional)"
                      size="large"
                      allowClear
                      showSearch
                      loading={teachersLoading}
                      filterOption={(input, option) =>
                        option?.label.toLowerCase().includes(input.toLowerCase()) ?? false
                      }
                      options={filteredTeachers.map((teacher) => ({
                        label: `${teacher.userInfo?.firstName} ${teacher.userInfo?.lastName} (${teacher.login}) - ${teacher.teacherInfo?.department?.name || 'No Dept'}`,
                        value: teacher.id,
                      }))}
                      suffixIcon={<UserOutlined />}
                    />
                  </Form.Item>

                    <Form.Item
                      name="academicPeriodId"
                      label="Academic Period"
                      tooltip="Required if assigning a teacher"
                      dependencies={['teacherId']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('teacherId') && !value) {
                              return Promise.reject(
                                new Error('Academic period is required when assigning a teacher')
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Select
                        placeholder="Select academic period (optional)"
                        size="large"
                        allowClear
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
                  </>
                ),
              },
            ]}
          />
        )}
      </Form>
    </Modal>
  );
};

export default CourseFormModal;
