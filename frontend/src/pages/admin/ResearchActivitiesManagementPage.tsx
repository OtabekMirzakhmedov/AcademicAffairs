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
import MainLayout from '../../components/layout/MainLayout';
import researchActivitiesService from '../../services/research-activities.service';
import type { ResearchActivityTemplate } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

type TemplateWithCount = ResearchActivityTemplate & {
  _count: { teacherActivities: number };
};

const categoryLabels: Record<string, string> = {
  scientific_main: 'Scientific & Research (Main)',
  scientific_exchange: 'Research (Exchange)',
  educational_additional: 'Educational (Additional)',
  additional: 'Additional Work',
  educational: 'Educational Work',
};

const ResearchActivitiesManagementPage: React.FC = () => {
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
      message.error('Failed to load templates');
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
        message.success('Template updated');
      } else {
        await researchActivitiesService.createTemplate(values);
        message.success('Template created');
      }
      setModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      if (err?.errorFields) return; // validation error
      message.error(err?.response?.data?.message || 'Failed to save template');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await researchActivitiesService.deleteTemplate(id);
      message.success('Template deleted');
      loadTemplates();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to delete template');
    }
  };

  const columns: ColumnsType<TemplateWithCount> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 280,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => desc || <span style={{ color: '#999' }}>—</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 200,
      render: (cat: string) => (
        <Tag color="blue">{categoryLabels[cat] ?? cat}</Tag>
      ),
    },
    {
      title: 'Max',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      width: 70,
      align: 'center',
      render: (val: number) => val ?? '—',
    },
    {
      title: 'Penalty (%)',
      dataIndex: 'penalty',
      key: 'penalty',
      width: 100,
      align: 'center',
      render: (val: number) =>
        val != null ? <Tag color="volcano">{val}%</Tag> : '—',
    },
    {
      title: 'In use',
      dataIndex: ['_count', 'teacherActivities'],
      key: 'inUse',
      width: 80,
      align: 'center',
      render: (count: number) => <Tag>{count}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 90,
      align: 'center',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      render: (_: any, record: TemplateWithCount) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this template?"
            description="Teachers who added this activity will lose it."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <Card
        title="Research Activity Templates"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Add Template
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
        title={editingTemplate ? 'Edit Template' : 'Add Template'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={editingTemplate ? 'Save' : 'Create'}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="e.g. Participation in international conferences" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea
              rows={4}
              placeholder="Describe this activity requirement..."
            />
          </Form.Item>

          <Form.Item label="Category" name="category">
            <Select>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space style={{ width: '100%' }} size="large">
            <Form.Item label="Max Amount" name="maxAmount" style={{ flex: 1 }}>
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="e.g. 3"
              />
            </Form.Item>

            <Form.Item label="Penalty (%)" name="penalty" style={{ flex: 1 }}>
              <InputNumber
                min={0}
                max={100}
                style={{ width: '100%' }}
                placeholder="e.g. 10"
                addonAfter="%"
              />
            </Form.Item>
          </Space>

          <Form.Item label="Active" name="isActive" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default ResearchActivitiesManagementPage;
