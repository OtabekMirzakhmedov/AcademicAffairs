import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, message, Select, Tag, Collapse, Row, Col } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, TeamOutlined, ApartmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['head', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<number | undefined>(undefined);

  const filteredTeachers = selectedDepartment
    ? teachers.filter((teacher) => teacher.teacherInfo?.departmentId === selectedDepartment)
    : teachers;

  useEffect(() => {
    if (open) {
      setSelectedDepartment(undefined);
      form.resetFields();
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
        const updateData: UpdateCourseRequest = {
          name: values.name,
          lectureHours: values.lectureHours,
          practiceHours: values.practiceHours,
        };
        await coursesService.update(course.id, updateData);

        const currentProgramIds = course.programCourses?.map((pc) => pc.programId) || [];
        const newProgramIds = values.programIds || [];
        const programsToAdd = newProgramIds.filter((id: number) => !currentProgramIds.includes(id));
        const programsToRemove = currentProgramIds.filter((id: number) => !newProgramIds.includes(id));

        await Promise.all([
          ...programsToAdd.map((programId: number) =>
            programsService.addCourse(programId, { courseId: course.id, isRequired: true })
          ),
          ...programsToRemove.map((programId: number) =>
            programsService.removeCourse(programId, course.id)
          ),
        ]);

        message.success(t('head:course.updateSuccess'));
      } else {
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

        if (values.programIds && values.programIds.length > 0) {
          await Promise.all(
            values.programIds.map((programId: number) =>
              programsService.addCourse(programId, { courseId: newCourse.id, isRequired: true })
            )
          );
        }

        message.success(t('head:course.createSuccess'));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.error?.message || t('head:course.saveFailed'));
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
          {course ? t('head:course.editTitle') : t('head:course.createTitle')}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={course ? t('common:button.update') : t('common:button.create')}
      cancelText={t('common:button.cancel')}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t('head:course.name')}
          rules={[
            { required: true, message: t('common:label.required') },
            { min: 3, message: t('common:label.required') },
          ]}
        >
          <Input
            prefix={<BookOutlined />}
            placeholder={t('head:course.namePlaceholder')}
            size="large"
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="lectureHours"
              label={t('head:course.lectureHours')}
              tooltip={t('head:course.lectureHoursTooltip')}
              initialValue={0}
            >
              <InputNumber min={0} max={500} style={{ width: '100%' }} size="large" prefix={<ClockCircleOutlined />} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="practiceHours"
              label={t('head:course.practiceHours')}
              tooltip={t('head:course.practiceHoursTooltip')}
              initialValue={0}
            >
              <InputNumber min={0} max={500} style={{ width: '100%' }} size="large" prefix={<ClockCircleOutlined />} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="programIds"
          label={t('head:course.programs')}
          tooltip={t('head:course.programsTooltip')}
        >
          <Select
            mode="multiple"
            placeholder={t('head:course.programs')}
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
                label: t('head:assignment.assignTitle'),
                children: (
                  <>
                    <Form.Item label={t('common:label.department')}>
                      <Select
                        placeholder={t('common:label.department')}
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
                      label={t('head:assignment.teacher')}
                    >
                      <Select
                        placeholder={t('head:assignment.teacher')}
                        size="large"
                        allowClear
                        showSearch
                        loading={teachersLoading}
                        filterOption={(input, option) =>
                          option?.label.toLowerCase().includes(input.toLowerCase()) ?? false
                        }
                        options={filteredTeachers.map((teacher) => ({
                          label: `${teacher.userInfo?.firstName} ${teacher.userInfo?.lastName} (${teacher.login}) - ${teacher.teacherInfo?.department?.name || '-'}`,
                          value: teacher.id,
                        }))}
                        suffixIcon={<UserOutlined />}
                      />
                    </Form.Item>

                    <Form.Item
                      name="academicPeriodId"
                      label={t('head:assignment.academicPeriod')}
                      dependencies={['teacherId']}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (getFieldValue('teacherId') && !value) {
                              return Promise.reject(new Error(t('common:label.required')));
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <Select
                        placeholder={t('head:assignment.academicPeriod')}
                        size="large"
                        allowClear
                        suffixIcon={<CalendarOutlined />}
                      >
                        {academicPeriods.map((period) => (
                          <Select.Option key={period.id} value={period.id}>
                            <span>
                              {period.academicYear} - {t('teacher:dashboard.semester')} {period.semester}
                              {period.isActive && (
                                <Tag color="green" style={{ marginLeft: 8 }}>
                                  {t('domain:status.active')}
                                </Tag>
                              )}
                            </span>
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="groups"
                      label={t('head:assignment.groupsOptional')}
                      tooltip={t('head:assignment.groupsTooltip')}
                    >
                      <Select
                        mode="tags"
                        placeholder={t('head:assignment.groupsPlaceholder')}
                        size="large"
                        options={groupOptions.map((group) => ({ label: group, value: group }))}
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
