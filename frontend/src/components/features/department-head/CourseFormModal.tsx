import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message, Select, Tag, Collapse, Row, Col } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, TeamOutlined, ApartmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import coursesService, {
  type CreateCourseRequest,
  type UpdateCourseRequest,
} from '../../../services/courses.service';
import programsService from '../../../services/programs.service';
import type { Course, User, AcademicPeriod, Department, Program } from '../../../types';

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
  programs: Program[];
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
  programs,
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
      // Reset department filter
      setSelectedDepartment(undefined);

      // Always reset first to clear any previous state
      form.resetFields();

      // Then populate with current values if editing
      if (course) {
        const currentProgramIds = course.programCourses?.map((pc) => pc.programId) || [];
        form.setFieldsValue({
          name: course.name,
          lectureHours: course.lectureHours || 0,
          practiceHours: course.practiceHours || 0,
          programIds: currentProgramIds,
        });
      }
    }
  }, [open, course, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (course) {
        // Update existing course
        const updateData: UpdateCourseRequest = {
          name: values.name,
          lectureHours: values.lectureHours,
          practiceHours: values.practiceHours,
        };
        await coursesService.update(course.id, updateData);

        // Handle program associations
        const currentProgramIds = course.programCourses?.map((pc) => pc.programId) || [];
        const newProgramIds = values.programIds || [];

        // Find programs to add and remove
        const programsToAdd = newProgramIds.filter((id: number) => !currentProgramIds.includes(id));
        const programsToRemove = currentProgramIds.filter((id: number) => !newProgramIds.includes(id));

        // Add new program associations
        const addPromises = programsToAdd.map((programId: number) =>
          programsService.addCourse(programId, {
            courseId: course.id,
            isRequired: true,
          })
        );

        // Remove old program associations
        const removePromises = programsToRemove.map((programId: number) =>
          programsService.removeCourse(programId, course.id)
        );

        await Promise.all([...addPromises, ...removePromises]);

        message.success('Course updated successfully');
      } else {
        // Create new course with optional teacher assignment
        const createData: CreateCourseRequest = {
          name: values.name,
          departmentId,
          lectureHours: values.lectureHours,
          practiceHours: values.practiceHours,
          teacherId: values.teacherId,
          academicPeriodId: values.academicPeriodId,
          groups: values.groups && values.groups.length > 0 ? values.groups : undefined,
        };
        const newCourse = await coursesService.create(createData);

        // Add course to selected programs
        if (values.programIds && values.programIds.length > 0) {
          const programPromises = values.programIds.map((programId: number) =>
            programsService.addCourse(programId, {
              courseId: newCourse.id,
              isRequired: true,
            })
          );
          await Promise.all(programPromises);
        }

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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="lectureHours"
              label="Lecture Hours"
              tooltip="Contact hours for lectures"
              initialValue={0}
            >
              <InputNumber
                min={0}
                max={500}
                style={{ width: '100%' }}
                size="large"
                prefix={<ClockCircleOutlined />}
                placeholder="e.g., 30"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="practiceHours"
              label="Practice Hours"
              tooltip="Hours for seminars, labs, PBL/CBL"
              initialValue={0}
            >
              <InputNumber
                min={0}
                max={500}
                style={{ width: '100%' }}
                size="large"
                prefix={<ClockCircleOutlined />}
                placeholder="e.g., 15"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="programIds"
          label="Programs (Optional)"
          tooltip="Select which programs this course belongs to"
        >
          <Select
            mode="multiple"
            placeholder="Select programs (optional)"
            size="large"
            allowClear
            showSearch
            filterOption={(input, option) =>
              option?.label.toLowerCase().includes(input.toLowerCase()) ?? false
            }
            options={programs
              .filter((p) => p.departmentId === departmentId && p.isActive)
              .map((program) => ({
                label: `${program.name} (${program.code})`,
                value: program.id,
              }))}
            suffixIcon={<BookOutlined />}
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
