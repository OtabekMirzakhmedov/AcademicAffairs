import { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { BankOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import departmentsService, {
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
} from '../../../services/departments.service';
import type { Department, User } from '../../../types';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: Department | null;
  departmentHeads: User[];
}

const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  department,
  departmentHeads,
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && department) {
      // Edit mode - populate form
      form.setFieldsValue({
        name: department.name,
        headId: department.headId,
        phone: department.phone,
        roomNumber: department.roomNumber,
      });
    } else if (open) {
      // Create mode - reset form
      form.resetFields();
    }
  }, [open, department, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      if (department) {
        // Update existing department
        const updateData: UpdateDepartmentRequest = {
          name: values.name,
          headId: values.headId,
          phone: values.phone,
          roomNumber: values.roomNumber,
        };
        await departmentsService.update(department.id, updateData);
        message.success(t('admin:departments.updateSuccess'));
      } else {
        // Create new department
        const createData: CreateDepartmentRequest = {
          name: values.name,
          headId: values.headId,
          phone: values.phone,
          roomNumber: values.roomNumber,
        };
        await departmentsService.create(createData);
        message.success(t('admin:departments.createSuccess'));
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(
        error?.response?.data?.error?.message || t('admin:departments.saveFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={department ? t('admin:departments.editTitle') : t('admin:departments.createTitle')}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={department ? t('common:button.update') : t('common:button.create')}
      cancelText={t('common:button.cancel')}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label={t('admin:departments.name')}
          rules={[
            { required: true, message: t('admin:departments.nameRequired') },
            { min: 3, message: t('admin:departments.nameMinLength') },
          ]}
        >
          <Input prefix={<BankOutlined />} placeholder={t('admin:departments.namePlaceholder')} />
        </Form.Item>

        <Form.Item name="headId" label={t('admin:departments.head')}>
          <Select
            placeholder={t('admin:departments.headPlaceholder')}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={departmentHeads.map((user) => ({
              label: `${user.userInfo?.firstName} ${user.userInfo?.lastName} (${user.login})`,
              value: user.id,
            }))}
          />
        </Form.Item>

        <Form.Item name="phone" label={t('admin:departments.phone')}>
          <Input prefix={<PhoneOutlined />} placeholder={t('admin:departments.phonePlaceholder')} />
        </Form.Item>

        <Form.Item name="roomNumber" label={t('admin:departments.room')}>
          <Input prefix={<EnvironmentOutlined />} placeholder={t('admin:departments.roomPlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentFormModal;
