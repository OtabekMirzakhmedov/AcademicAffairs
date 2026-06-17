import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { BookOutlined, CodeOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import programsService, {
  type CreateProgramRequest,
  type UpdateProgramRequest,
} from '../../../services/programs.service';
import type { Program, Department } from '../../../types';

const { TextArea } = Input;

interface ProgramFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  program: Program | null;
  departmentId: number;
  departments: Department[];
}

const DEGREE_LEVELS = ['BACHELOR', 'MASTER', 'DOCTORATE', 'UNDERGRADUATE', 'GRADUATE'];

const ProgramFormModal = ({
  open,
  onClose,
  onSuccess,
  program,
  departmentId,
  departments,
}: ProgramFormModalProps) => {
  const { t } = useTranslation(['head', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (program) {
        form.setFieldsValue({
          name: program.name,
          code: program.code,
          degreeLevel: program.degreeLevel,
          departmentId: program.departmentId,
          durationYears: program.durationYears,
          totalCreditsRequired: program.totalCreditsRequired,
          description: program.description,
          isActive: program.isActive,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ departmentId, isActive: true });
      }
    }
  }, [open, program, form, departmentId]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      if (program) {
        const updateData: UpdateProgramRequest = {
          name: values.name,
          code: values.code,
          degreeLevel: values.degreeLevel,
          departmentId: values.departmentId,
          durationYears: values.durationYears,
          totalCreditsRequired: values.totalCreditsRequired,
          description: values.description,
          isActive: values.isActive,
        };
        await programsService.update(program.id, updateData);
        message.success(t('head:program.updateSuccess'));
      } else {
        const createData: CreateProgramRequest = {
          name: values.name,
          code: values.code,
          degreeLevel: values.degreeLevel,
          departmentId: values.departmentId,
          durationYears: values.durationYears,
          totalCreditsRequired: values.totalCreditsRequired,
          description: values.description,
          isActive: values.isActive !== undefined ? values.isActive : true,
        };
        await programsService.create(createData);
        message.success(t('head:program.createSuccess'));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.response?.data?.error?.message || (program ? t('head:program.updateFailed') : t('head:program.createFailed')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <span>
          <BookOutlined style={{ marginRight: 8 }} />
          {program ? t('head:program.editTitle') : t('head:program.createTitle')}
        </span>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText={program ? t('common:button.update') : t('common:button.create')}
      cancelText={t('common:button.cancel')}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label={t('head:program.name')}
          rules={[
            { required: true, message: t('common:label.required') },
            { min: 3, message: t('common:label.required') },
          ]}
        >
          <Input prefix={<BookOutlined />} placeholder={t('head:program.namePlaceholder')} size="large" />
        </Form.Item>

        <Form.Item
          name="code"
          label={t('head:program.code')}
          rules={[
            { required: true, message: t('common:label.required') },
            { pattern: /^[A-Z0-9-]+$/, message: t('head:program.codePattern') },
          ]}
        >
          <Input
            prefix={<CodeOutlined />}
            placeholder={t('head:program.codePlaceholder')}
            size="large"
            style={{ textTransform: 'uppercase' }}
          />
        </Form.Item>

        <Form.Item
          name="degreeLevel"
          label={t('head:program.degreeLevel')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select placeholder={t('head:program.degreeLevel')} size="large">
            {DEGREE_LEVELS.map((level) => (
              <Select.Option key={level} value={level}>
                {t(`domain:degreeLevel.${level}`, { defaultValue: level })}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="departmentId"
          label={t('common:label.department')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select placeholder={t('common:label.department')} size="large" suffixIcon={<ApartmentOutlined />}>
            {departments.map((dept) => (
              <Select.Option key={dept.id} value={dept.id}>
                {dept.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="durationYears"
          label={t('head:program.duration')}
          rules={[
            { required: true, message: t('common:label.required') },
            { type: 'number', min: 1, max: 10, message: t('head:program.durationValidation') },
          ]}
        >
          <InputNumber min={1} max={10} placeholder="4" size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="totalCreditsRequired"
          label={t('head:program.totalCredits')}
          rules={[
            { required: true, message: t('common:label.required') },
            { type: 'number', min: 0, message: t('head:program.creditsValidation') },
          ]}
        >
          <InputNumber min={0} step={0.5} placeholder="120" size="large" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label={t('head:program.descriptionOptional')}>
          <TextArea rows={3} placeholder={t('head:program.descriptionPlaceholder')} maxLength={500} />
        </Form.Item>

        <Form.Item
          name="isActive"
          label={t('head:program.statusLabel')}
          rules={[{ required: true, message: t('common:label.required') }]}
        >
          <Select size="large">
            <Select.Option value={true}>{t('domain:status.active')}</Select.Option>
            <Select.Option value={false}>{t('domain:status.inactive')}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProgramFormModal;
