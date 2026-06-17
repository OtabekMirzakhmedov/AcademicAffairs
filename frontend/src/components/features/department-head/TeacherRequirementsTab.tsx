import { Form, Select, InputNumber, message, Divider, Button } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import usersService, { type UpdateTeacherInfoRequest } from '../../../services/users.service';
import type { User } from '../../../types';

interface TeacherRequirementsTabProps {
  teacher: User;
  onSuccess: () => void;
}

const TeacherRequirementsTab = ({ teacher, onSuccess }: TeacherRequirementsTabProps) => {
  const { t } = useTranslation(['head', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      form.setFieldsValue({
        employmentType: teacher.teacherInfo?.employmentType || undefined,
        mandatoryHoursPerPeriod: teacher.teacherInfo?.mandatoryHoursPerPeriod ?? 0,
        mandatoryExtracurricularHours: teacher.teacherInfo?.mandatoryExtracurricularHours ?? 0,
        mandatoryConferenceArticles: teacher.teacherInfo?.mandatoryConferenceArticles ?? 0,
        mandatoryNationalArticles: teacher.teacherInfo?.mandatoryNationalArticles ?? 0,
        mandatoryScopusArticles: teacher.teacherInfo?.mandatoryScopusArticles ?? 0,
        mandatoryDocumentation: teacher.teacherInfo?.mandatoryDocumentation ?? 0,
      });
    } else {
      form.resetFields();
    }
  }, [teacher, form]);

  const handleSubmit = async (values: UpdateTeacherInfoRequest) => {
    if (!teacher) return;

    try {
      setLoading(true);

      const cleanedValues: UpdateTeacherInfoRequest = {};

      if (values.employmentType != null) cleanedValues.employmentType = values.employmentType;
      if (values.mandatoryHoursPerPeriod != null) cleanedValues.mandatoryHoursPerPeriod = Number(values.mandatoryHoursPerPeriod);
      if (values.mandatoryExtracurricularHours != null) cleanedValues.mandatoryExtracurricularHours = Math.floor(Number(values.mandatoryExtracurricularHours));
      if (values.mandatoryConferenceArticles != null) cleanedValues.mandatoryConferenceArticles = Math.floor(Number(values.mandatoryConferenceArticles));
      if (values.mandatoryNationalArticles != null) cleanedValues.mandatoryNationalArticles = Math.floor(Number(values.mandatoryNationalArticles));
      if (values.mandatoryScopusArticles != null) cleanedValues.mandatoryScopusArticles = Math.floor(Number(values.mandatoryScopusArticles));
      if (values.mandatoryDocumentation != null) cleanedValues.mandatoryDocumentation = Math.floor(Number(values.mandatoryDocumentation));

      await usersService.updateTeacherInfo(teacher.id, cleanedValues);
      message.success(t('head:requirements.updateSuccess'));
      onSuccess();
    } catch (error: any) {
      message.error(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        t('head:requirements.updateFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} validateTrigger="onBlur">
        <Form.Item name="employmentType" label={t('head:requirements.employmentType')}>
          <Select placeholder={t('head:requirements.employmentType')} allowClear>
            <Select.Option value="full-time">{t('domain:employment.full-time')}</Select.Option>
            <Select.Option value="part-time">{t('domain:employment.part-time')}</Select.Option>
            <Select.Option value="contract">{t('domain:employment.contract')}</Select.Option>
          </Select>
        </Form.Item>

        <Divider orientation="left">{t('head:requirements.title')}</Divider>

        <Form.Item name="mandatoryHoursPerPeriod" label={t('head:requirements.mandatoryHours')}>
          <InputNumber
            placeholder={t('head:requirements.mandatoryHoursPlaceholder')}
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter={t('common:label.hours')}
          />
        </Form.Item>

        <Form.Item
          name="mandatoryExtracurricularHours"
          label={t('head:requirements.extracurricular')}
          tooltip={t('head:requirements.extracurricularTooltip')}
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter={t('common:label.hours')}
          />
        </Form.Item>

        <Divider orientation="left">{t('head:requirements.researchPublications')}</Divider>

        <Form.Item
          name="mandatoryConferenceArticles"
          label={t('head:requirements.conferenceArticles')}
          tooltip={t('head:requirements.conferenceArticlesTooltip')}
        >
          <InputNumber placeholder="0" style={{ width: '100%' }} min={0} step={1} />
        </Form.Item>

        <Form.Item
          name="mandatoryNationalArticles"
          label={t('head:requirements.nationalArticles')}
          tooltip={t('head:requirements.nationalArticlesTooltip')}
        >
          <InputNumber placeholder="0" style={{ width: '100%' }} min={0} step={1} />
        </Form.Item>

        <Form.Item
          name="mandatoryScopusArticles"
          label={t('head:requirements.scopusArticles')}
          tooltip={t('head:requirements.scopusArticlesTooltip')}
        >
          <InputNumber placeholder="0" style={{ width: '100%' }} min={0} step={1} />
        </Form.Item>

        <Divider orientation="left">{t('head:requirements.documentationSection')}</Divider>

        <Form.Item
          name="mandatoryDocumentation"
          label={t('head:requirements.documentation')}
          tooltip={t('head:requirements.documentationTooltip')}
        >
          <InputNumber placeholder="0" style={{ width: '100%' }} min={0} step={1} />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {t('head:requirements.save')}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TeacherRequirementsTab;
