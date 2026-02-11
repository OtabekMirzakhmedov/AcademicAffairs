import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Slider,
  DatePicker,
  Upload,
  Tag,
  Progress,
  Tooltip,
  message,
  Popconfirm,
  Checkbox,
  Typography,
  Space,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import type {
  ResearchActivityTemplate,
  TeacherResearchActivity,
} from '../../../types';
import researchActivitiesService from '../../../services/research-activities.service';

const { Text } = Typography;

const statusColors: Record<string, string> = {
  in_progress: 'blue',
  submitted: 'orange',
  validated: 'green',
  rejected: 'red',
};

const statusLabels: Record<string, string> = {
  in_progress: 'In Progress',
  submitted: 'Submitted',
  validated: 'Validated',
  rejected: 'Rejected',
};

const ScientificResearchTab: React.FC = () => {
  const [activities, setActivities] = useState<TeacherResearchActivity[]>([]);
  const [templates, setTemplates] = useState<ResearchActivityTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  // Add activity modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);
  const [addLoading, setAddLoading] = useState(false);

  // Edit activity modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TeacherResearchActivity | null>(null);
  const [editForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [acts, tmpls] = await Promise.all([
        researchActivitiesService.getMyActivities(),
        researchActivitiesService.getTemplates('scientific_main'),
      ]);
      setActivities(acts);
      setTemplates(tmpls);
    } catch {
      message.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Templates not yet added by this teacher
  const availableTemplates = templates.filter(
    (t) => !activities.some((a) => a.templateId === t.id),
  );

  // Count how many times this teacher has added this template (always 0 since unique)
  const getActivityCount = (templateId: number) => {
    return activities.filter((a) => a.templateId === templateId).length;
  };

  // ==================== HANDLERS ====================

  const toggleTemplate = (id: number) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleAddActivities = async () => {
    if (selectedTemplateIds.length === 0) {
      message.warning('Please select at least one activity');
      return;
    }
    setAddLoading(true);
    try {
      await Promise.all(
        selectedTemplateIds.map((templateId) =>
          researchActivitiesService.create({ templateId }),
        ),
      );
      message.success(
        `${selectedTemplateIds.length} activit${selectedTemplateIds.length > 1 ? 'ies' : 'y'} added`,
      );
      setAddModalOpen(false);
      setSelectedTemplateIds([]);
      loadData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to add activities');
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenEdit = (activity: TeacherResearchActivity) => {
    setEditingActivity(activity);
    editForm.setFieldsValue({
      completionPercentage: activity.completionPercentage,
      deadline: activity.deadline ? dayjs(activity.deadline) : null,
    });
    setFileList(
      activity.fileName
        ? [{ uid: '-1', name: activity.fileName, status: 'done' }]
        : [],
    );
    setEditModalOpen(true);
  };

  const handleFileUpload = async (file: File): Promise<boolean> => {
    setUploading(true);
    try {
      const result = await researchActivitiesService.uploadFile(file);
      setFileList([{ uid: '-1', name: result.fileName, status: 'done' }]);
      editForm.setFieldsValue({
        _filePath: result.filePath,
        _fileName: result.fileName,
      });
      message.success('File uploaded');
    } catch {
      message.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleEditSave = async () => {
    if (!editingActivity) return;
    setEditLoading(true);
    try {
      const values = editForm.getFieldsValue();
      await researchActivitiesService.update(editingActivity.id, {
        completionPercentage: values.completionPercentage,
        deadline: values.deadline ? values.deadline.toISOString() : undefined,
        filePath: values._filePath || editingActivity.filePath,
        fileName: values._fileName || editingActivity.fileName,
      });
      message.success('Activity updated');
      setEditModalOpen(false);
      loadData();
    } catch {
      message.error('Failed to update activity');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await researchActivitiesService.remove(id);
      message.success('Activity removed');
      loadData();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to delete activity');
    }
  };

  const handleDownload = (activity: TeacherResearchActivity) => {
    const url = researchActivitiesService.getDownloadUrl(activity.id);
    window.open(url, '_blank');
  };

  // ==================== TABLE COLUMNS ====================

  const columns: ColumnsType<TeacherResearchActivity> = [
    {
      title: 'Type of requirement',
      dataIndex: ['template', 'name'],
      key: 'name',
      width: 280,
      render: (name: string) => <Text>{name}</Text>,
    },
    {
      title: 'Description',
      dataIndex: ['template', 'description'],
      key: 'description',
      width: 200,
      render: (desc: string) =>
        desc ? (
          <Tooltip title={desc}>
            <Text ellipsis style={{ maxWidth: 180, display: 'block' }}>
              {desc}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Attached files',
      key: 'files',
      width: 160,
      render: (_: any, record: TeacherResearchActivity) =>
        record.fileName ? (
          <Space>
            <PaperClipOutlined style={{ color: '#1890ff' }} />
            <Button
              type="link"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
              style={{ padding: 0 }}
            >
              {record.fileName.length > 16
                ? record.fileName.substring(0, 16) + '…'
                : record.fileName}
            </Button>
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Penalty (%)',
      dataIndex: ['template', 'penalty'],
      key: 'penalty',
      width: 110,
      align: 'center',
      render: (penalty: number) =>
        penalty != null ? (
          <Tag color="volcano">{penalty}%</Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 180,
      render: (_: any, record: TeacherResearchActivity) => (
        <Progress
          percent={record.completionPercentage}
          strokeColor="#13c2c2"
          size="small"
          style={{ marginBottom: 0 }}
        />
      ),
    },
    {
      title: 'ARD validated status',
      dataIndex: 'status',
      key: 'ardStatus',
      width: 150,
      align: 'center',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (deadline: string) =>
        deadline ? (
          <Text
            style={{
              color: dayjs(deadline).isBefore(dayjs()) ? '#ff4d4f' : undefined,
            }}
          >
            {dayjs(deadline).format('YYYY-MM-DD')}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: (
        <Space>
          Action
          <Button
            type="primary"
            size="small"
            shape="circle"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
            style={{ background: '#faad14', borderColor: '#faad14' }}
          />
        </Space>
      ),
      key: 'action',
      width: 100,
      align: 'center',
      render: (_: any, record: TeacherResearchActivity) => (
        <Space>
          <Button
            shape="circle"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEdit(record)}
            style={{ background: '#faad14', borderColor: '#faad14', color: '#fff' }}
            disabled={record.status === 'validated'}
          />
          {record.status !== 'validated' && (
            <Popconfirm
              title="Remove this activity?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                shape="circle"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // ==================== ADD MODAL COLUMNS ====================

  const addModalColumns: ColumnsType<ResearchActivityTemplate> = [
    {
      title: 'Type of requirement',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => <Text>{name}</Text>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) =>
        desc ? <Text style={{ fontSize: 13 }}>{desc}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: 'Penalty',
      dataIndex: 'penalty',
      key: 'penalty',
      width: 80,
      align: 'center',
      render: (penalty: number) => (
        <Text type="secondary">{penalty != null ? `${penalty}%` : '- %'}</Text>
      ),
    },
    {
      title: 'Max',
      dataIndex: 'maxAmount',
      key: 'maxAmount',
      width: 60,
      align: 'center',
      render: (max: number, record: ResearchActivityTemplate) => (
        <Text>{getActivityCount(record.id)}/{max ?? 1}</Text>
      ),
    },
    {
      title: '',
      key: 'select',
      width: 40,
      align: 'center',
      render: (_: any, record: ResearchActivityTemplate) => (
        <Checkbox
          checked={selectedTemplateIds.includes(record.id)}
          onChange={() => toggleTemplate(record.id)}
        />
      ),
    },
  ];

  // ==================== RENDER ====================

  return (
    <>
      <Table
        columns={columns}
        dataSource={activities}
        rowKey="id"
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: 'No activities added yet. Click + to add one.' }}
      />

      {/* Add Activity Modal */}
      <Modal
        title="Scientific activities"
        open={addModalOpen}
        onCancel={() => {
          setAddModalOpen(false);
          setSelectedTemplateIds([]);
        }}
        onOk={handleAddActivities}
        okText="Add"
        confirmLoading={addLoading}
        width={780}
        okButtonProps={{ disabled: selectedTemplateIds.length === 0 }}
      >
        {availableTemplates.length === 0 ? (
          <Text type="secondary">All available activities have been added.</Text>
        ) : (
          <Table
            columns={addModalColumns}
            dataSource={availableTemplates}
            rowKey="id"
            pagination={false}
            size="middle"
            showHeader={false}
            onRow={(record) => ({
              onClick: () => toggleTemplate(record.id),
              style: { cursor: 'pointer' },
            })}
          />
        )}
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        title={`Edit: ${editingActivity?.template?.name ?? ''}`}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSave}
        okText="Save"
        confirmLoading={editLoading}
        width={500}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Completion (%)" name="completionPercentage">
            <Slider
              min={0}
              max={100}
              step={5}
              marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Deadline" name="deadline">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Attached File">
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                handleFileUpload(file);
                return false;
              }}
              onRemove={() => {
                setFileList([]);
                editForm.setFieldsValue({ _filePath: null, _fileName: null });
              }}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {fileList.length > 0 ? 'Replace file' : 'Upload file'}
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item name="_filePath" hidden />
          <Form.Item name="_fileName" hidden />
        </Form>
      </Modal>
    </>
  );
};

export default ScientificResearchTab;
