import { useState } from 'react';
import { Modal, Form, Select, Switch, message } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['head', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const getSemesterLabel = (sem: number) => {
    const year = Math.ceil(sem / 2);
    const semInYear = sem % 2 === 1 ? 1 : 2;
    return t('head:program.semesterLabel', { year, sem: semInYear });
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await programsService.addCourse(programId, {
        courseId: values.courseId,
        isRequired: values.isRequired !== false,
        recommendedSemester: semester,
      });
      message.success(t('head:program.addCourseSuccess'));
      form.resetFields();
      onSuccess();
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || t('head:program.addCourseFailed')
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
          {t('head:program.addCourseTitle', { semesterLabel: getSemesterLabel(semester) })}
        </span>
      }
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText={t('head:activities.addCourse')}
      cancelText={t('common:button.cancel')}
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
          label={t('common:label.course')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select
            placeholder={t('head:program.courseSearchPlaceholder')}
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
                ? t('head:program.allCoursesAdded')
                : t('head:program.noCourseMatches')
            }
          />
        </Form.Item>

        <Form.Item name="isRequired" label={t('head:program.courseType')} valuePropName="checked">
          <Switch
            checkedChildren={t('domain:courseType.required')}
            unCheckedChildren={t('domain:courseType.elective')}
            defaultChecked
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCourseToSemesterModal;
