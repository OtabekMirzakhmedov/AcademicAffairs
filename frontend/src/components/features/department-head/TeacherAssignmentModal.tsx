import { useEffect, useState } from 'react';
import { Modal, Form, Select, message, Tag } from 'antd';
import { UserOutlined, BookOutlined, CalendarOutlined, TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['head', 'common', 'domain', 'teacher']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (assignment) {
        form.setFieldsValue({
          courseId: assignment.courseId,
          teacherId: assignment.teacherId,
          academicPeriodId: assignment.academicPeriodId,
          groups: assignment.groups || [],
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, assignment, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (assignment) {
        const updateData: UpdateCourseTeacherRequest = {
          groups: values.groups && values.groups.length > 0 ? values.groups : undefined,
        };
        await courseTeachersService.update(assignment.id, updateData);
        message.success(t('head:assignment.updateSuccess'));
      } else {
        const createData: CreateCourseTeacherRequest = {
          courseId: values.courseId,
          teacherId: values.teacherId,
          academicPeriodId: values.academicPeriodId,
          groups: values.groups && values.groups.length > 0 ? values.groups : undefined,
        };
        await courseTeachersService.create(createData);
        message.success(t('head:assignment.createSuccess'));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.error?.message || t('head:assignment.createFailed'));
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
          {assignment ? t('head:assignment.editTitle') : t('head:assignment.assignTitle')}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={assignment ? t('common:button.update') : t('common:button.add')}
      cancelText={t('common:button.cancel')}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="courseId"
          label={t('head:assignment.course')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select
            placeholder={t('head:assignment.course')}
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
          label={t('head:assignment.teacher')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select
            placeholder={t('head:assignment.teacher')}
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
          label={t('head:assignment.academicPeriod')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select
            placeholder={t('head:assignment.academicPeriod')}
            size="large"
            disabled={!!assignment}
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
      </Form>
    </Modal>
  );
};

export default TeacherAssignmentModal;
