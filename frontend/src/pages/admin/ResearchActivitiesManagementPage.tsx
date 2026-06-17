import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Tag,
  message,
  Card,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import researchActivitiesService from '../../services/research-activities.service';
import type { ResearchActivityTemplate } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

type TemplateWithCount = ResearchActivityTemplate & {
  _count: { teacherActivities: number };
};

const CATEGORIES = ['scientific_main', 'scientific_exchange', 'educational_additional', 'additional', 'educational'];

const ResearchActivitiesManagementPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common', 'domain', 'teacher']);
  const [templates, setTemplates] = useState<TemplateWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithCount | null>(null);
  const [form] = Form.useForm();

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await researchActivitiesService.getAllTemplatesAdmin();
      setTemplates(data);
    } catch {
      message.error(t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    form.setFieldsValue({ category: 'scientific_main', isActive: true });
    setModalOpen(true);
  };

  const openEdit = (template: TemplateWithCount) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      name: template.name,
      description: template.description,
      maxAmount: template.maxAmount,
      penalty: template.penalty,
      category: template.category,
      isActive: template.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingTemplate) {
        await researchActivitiesService.updateTemplate(editingTemplate.id, values);
        message.success(t('admin:researchActivities.updateSuccess'));
      } else {
        await researchActivitiesService.createTemplate(values);
        message.success(t('admin:researchActivities.createSuccess'));
      }
      setModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || t('admin:researchActivities.saveFailed'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await researchActivitiesService.deleteTemplate(id);
      message.success(t('admin:researchActivities.deleteSuccess'));
      loadTemplates();
    } catch (err: any) {
      message.error(err?.response?.data?.message || t('admin:researchActivities.deleteFailed'));
    }
  };

  const columns: ColumnsType<TemplateWithCount> = [
    {
      title: t('common:label.name'),
      dataIndex: 'name',
      key: 'name',
      width: 280,
    },
    {
      title: t('common:label.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || <span style={{ color: '#999' }}>—</span>,
    },
    {
      title: t('common:label.category'),
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (cat: string) => (
        <Tag color="blue">{t(`domain:researchCategory.${cat}`, { defaultValue: cat })}</Tag>
      ),
    },
    {
      title: t('teacher:researchActivities.max'),
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      width: 70,
      align: 'center',
      render: (val: number) => val ?? '—',
    },
    {
      title: t('teacher:researchActivities.penalty'),
      dataIndex: 'penalty',
      key: 'penalty',
      width: 100,
      align: 'center',
      render: (val: number) => val != null ? <Tag color="volcano">{val}%</Tag> : '—',
    },
    {
      title: t('admin:researchActivities.inUse'),
      dataIndex: ['_count', 'teacherActivities'],
      key: 'inUse',
      width: 80,
      align: 'center',
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      align: 'center',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? t('domain:status.active') : t('domain:status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common:label.created'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 130,
      render: (_: any, record: TemplateWithCount) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            {t('common:button.edit')}
          </Button>
          <Popconfirm
            title={t('admin:researchActivities.deleteConfirm')}
            description={t('admin:researchActivities.deleteConfirmDesc')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common:button.delete')}
            okType="danger"
            cancelText={t('common:button.cancel')}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              {t('common:button.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card
        title={t('admin:researchActivities.title')}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('admin:researchActivities.addTemplate')}
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingTemplate ? t('admin:researchActivities.editTitle') : t('admin:researchActivities.createTitle')}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingTemplate ? t('common:button.save') : t('common:button.create')}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label={t('common:label.name')}
            name="name"
            rules={[{ required: true, message: t('common:label.required') }]}
          >
            <Input placeholder={t('admin:researchActivities.namePlaceholder')} />
          </Form.Item>

          <Form.Item label={t('common:label.description')} name="description">
            <TextArea rows={4} placeholder={t('admin:researchActivities.descriptionPlaceholder')} />
          </Form.Item>

          <Form.Item label="Category" name="category">
            <Select>
              {CATEGORIES.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {t(`domain:researchCategory.${cat}`, { defaultValue: cat })}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item label="Max Amount" name="maxAmount" style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder={t('admin:researchActivities.maxAmountPlaceholder')} />
            </Form.Item>
            <Form.Item label={t('teacher:researchActivities.penalty')} name="penalty" style={{ flex: 1 }}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder={t('admin:researchActivities.penaltyPlaceholder')} addonAfter="%" />
            </Form.Item>
          </Space>

          <Form.Item label={t('common:label.status')} name="isActive" valuePropName="checked">
            <Switch
              checkedChildren={t('domain:status.active')}
              unCheckedChildren={t('domain:status.inactive')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default ResearchActivitiesManagementPage;
