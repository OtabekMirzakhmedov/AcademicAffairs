import { Form, Select, InputNumber, message, Divider, Button } from 'antd';
import { useEffect, useState } from 'react';
import usersService, { type UpdateTeacherInfoRequest } from '../../../services/users.service';
import type { User } from '../../../types';

interface TeacherRequirementsTabProps {
  teacher: User;
  onSuccess: () => void;
}

const TeacherRequirementsTab = ({ teacher, onSuccess }: TeacherRequirementsTabProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      form.setFieldsValue({
        employmentType: teacher.teacherInfo?.employmentType || undefined,
        // Use ?? instead of || to handle 0 values correctly
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

      // Clean up the values - remove undefined/null and ensure proper types
      const cleanedValues: UpdateTeacherInfoRequest = {};

      if (values.employmentType !== undefined && values.employmentType !== null) {
        cleanedValues.employmentType = values.employmentType;
      }

      if (values.mandatoryHoursPerPeriod !== undefined && values.mandatoryHoursPerPeriod !== null) {
        cleanedValues.mandatoryHoursPerPeriod = Number(values.mandatoryHoursPerPeriod);
      }

      if (values.mandatoryExtracurricularHours !== undefined && values.mandatoryExtracurricularHours !== null) {
        cleanedValues.mandatoryExtracurricularHours = Math.floor(Number(values.mandatoryExtracurricularHours));
      }

      if (values.mandatoryConferenceArticles !== undefined && values.mandatoryConferenceArticles !== null) {
        cleanedValues.mandatoryConferenceArticles = Math.floor(Number(values.mandatoryConferenceArticles));
      }

      if (values.mandatoryNationalArticles !== undefined && values.mandatoryNationalArticles !== null) {
        cleanedValues.mandatoryNationalArticles = Math.floor(Number(values.mandatoryNationalArticles));
      }

      if (values.mandatoryScopusArticles !== undefined && values.mandatoryScopusArticles !== null) {
        cleanedValues.mandatoryScopusArticles = Math.floor(Number(values.mandatoryScopusArticles));
      }

      if (values.mandatoryDocumentation !== undefined && values.mandatoryDocumentation !== null) {
        cleanedValues.mandatoryDocumentation = Math.floor(Number(values.mandatoryDocumentation));
      }

      await usersService.updateTeacherInfo(teacher.id, cleanedValues);
      message.success('Teacher requirements updated successfully');
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to update teacher requirements';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 0' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        validateTrigger="onBlur"
      >
        <Form.Item name="employmentType" label="Employment Type">
          <Select placeholder="Select employment type" allowClear>
            <Select.Option value="full-time">Full-Time</Select.Option>
            <Select.Option value="part-time">Part-Time</Select.Option>
            <Select.Option value="contract">Contract</Select.Option>
          </Select>
        </Form.Item>

        <Divider orientation="left">Teaching Requirements</Divider>

        <Form.Item
          name="mandatoryHoursPerPeriod"
          label="Mandatory Teaching Hours Per Period"
        >
          <InputNumber
            placeholder="Enter mandatory teaching hours"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter="hours"
          />
        </Form.Item>

        <Form.Item
          name="mandatoryExtracurricularHours"
          label="Mandatory Extracurricular Hours"
          tooltip="Required hours for extracurricular activities"
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter="hours"
          />
        </Form.Item>

        <Divider orientation="left">Research Publication Requirements</Divider>

        <Form.Item
          name="mandatoryConferenceArticles"
          label="Mandatory Conference Articles"
          tooltip="Required number of conference papers/articles"
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter="articles"
          />
        </Form.Item>

        <Form.Item
          name="mandatoryNationalArticles"
          label="Mandatory National Journal Articles"
          tooltip="Required number of articles in national journals"
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter="articles"
          />
        </Form.Item>

        <Form.Item
          name="mandatoryScopusArticles"
          label="Mandatory Scopus-Indexed Articles"
          tooltip="Required number of articles in Scopus-indexed journals"
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter="articles"
          />
        </Form.Item>

        <Divider orientation="left">Documentation Requirements</Divider>

        <Form.Item
          name="mandatoryDocumentation"
          label="Mandatory Documentation"
          tooltip="Required number of documentation items"
        >
          <InputNumber
            placeholder="0"
            style={{ width: '100%' }}
            min={0}
            step={1}
            addonAfter="items"
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Save Requirements
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default TeacherRequirementsTab;
