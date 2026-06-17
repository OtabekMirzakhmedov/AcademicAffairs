import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  DatePicker,
  Space,
  Card,
  Statistic,
  Descriptions,
  Progress,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import scientificTasksService from '../../services/scientific-tasks.service';
import type { ScientificTask, TeacherScientificReport } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ScientificTasksManagementPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common', 'domain']);
  const [tasks, setTasks] = useState<ScientificTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScientificTask | null>(null);
  const [taskProgress, setTaskProgress] = useState<ScientificTask | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await scientificTasksService.getAllTasks();
      setTasks(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await scientificTasksService.createTask({
        ...values,
        deadline: values.deadline.toISOString(),
      });
      message.success(t('admin:scientificTasks.createSuccess'));
      setCreateModalVisible(false);
      form.resetFields();
      loadTasks();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.response?.data?.message || t('admin:scientificTasks.createFailed'));
    }
  };

  const handleEdit = (task: ScientificTask) => {
    setSelectedTask(task);
    editForm.setFieldsValue({
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      deadline: dayjs(task.deadline),
      isActive: task.isActive,
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      if (!selectedTask) return;

      await scientificTasksService.updateTask(selectedTask.id, {
        ...values,
        deadline: values.deadline.toISOString(),
      });
      message.success(t('admin:scientificTasks.updateSuccess'));
      setEditModalVisible(false);
      editForm.resetFields();
      setSelectedTask(null);
      loadTasks();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error.response?.data?.message || t('admin:scientificTasks.updateFailed'));
    }
  };

  const handleDelete = (task: ScientificTask) => {
    Modal.confirm({
      title: t('admin:scientificTasks.deleteTitle'),
      content: `${t('admin:scientificTasks.deleteConfirm', { taskName: task.taskName })} ${t('admin:scientificTasks.deleteConfirmDesc')}`,
      okText: t('common:button.delete'),
      okType: 'danger',
      onOk: async () => {
        try {
          await scientificTasksService.deleteTask(task.id);
          message.success(t('admin:scientificTasks.deleteSuccess'));
          loadTasks();
        } catch (error: any) {
          message.error(error.response?.data?.message || t('admin:scientificTasks.deleteFailed'));
        }
      },
    });
  };

  const handleViewProgress = async (task: ScientificTask) => {
    try {
      setLoading(true);
      const progress = await scientificTasksService.getTaskProgress(task.id);
      setTaskProgress(progress);
      setProgressModalVisible(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('admin:scientificTasks.progressLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<ScientificTask> = [
    {
      title: t('admin:scientificTasks.taskName'),
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: t('common:label.deadline'),
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => dayjs(deadline).format('MMM DD, YYYY'),
    },
    {
      title: t('common:label.createdBy'),
      dataIndex: ['creator', 'userInfo'],
      key: 'creator',
      render: (userInfo: any) => userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : '-',
    },
    {
      title: t('common:label.department'),
      dataIndex: ['department', 'name'],
      key: 'department',
      render: (name: string) => name || <Tag color="purple">{t('admin:scientificTasks.allDepartments')}</Tag>,
    },
    {
      title: t('admin:scientificTasks.totalReports'),
      dataIndex: ['_count', 'reports'],
      key: 'reportsCount',
      render: (count: number) => count || 0,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? t('domain:status.active') : t('domain:status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      render: (_: any, record: ScientificTask) => (
        <Space>
          <Button type="default" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            {t('common:button.edit')}
          </Button>
          <Button type="primary" icon={<EyeOutlined />} size="small" onClick={() => handleViewProgress(record)}>
            {t('admin:scientificTasks.taskProgress')}
          </Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record)}>
            {t('common:button.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  const reportColumns: ColumnsType<TeacherScientificReport> = [
    {
      title: t('domain:role.teacher'),
      dataIndex: ['teacher', 'userInfo'],
      key: 'teacher',
      render: (userInfo: any) => userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : '-',
    },
    {
      title: t('common:label.department'),
      dataIndex: ['teacher', 'teacherInfo', 'department', 'name'],
      key: 'department',
    },
    {
      title: t('common:label.progress'),
      dataIndex: 'completionPercentage',
      key: 'progress',
      render: (percentage: number) => <Progress percent={percentage} style={{ width: 120 }} />,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={{ in_progress: 'blue', submitted: 'orange', validated: 'green', rejected: 'red' }[status] || 'default'}>
          {t(`domain:status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('teacher:scientificTasks.submittedAt'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (date ? dayjs(date).format('MMM DD, YYYY') : '-'),
    },
  ];

  const getProgressStats = () => {
    if (!taskProgress?.reports) return { total: 0, inProgress: 0, submitted: 0, validated: 0, rejected: 0 };
    const reports = taskProgress.reports;
    return {
      total: reports.length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      submitted: reports.filter(r => r.status === 'submitted').length,
      validated: reports.filter(r => r.status === 'validated').length,
      rejected: reports.filter(r => r.status === 'rejected').length,
    };
  };

  const stats = getProgressStats();

  const taskFormFields = (frm: typeof form) => (
    <Form form={frm} layout="vertical">
      <Form.Item
        label={t('admin:scientificTasks.taskName')}
        name="taskName"
        rules={[{ required: true, message: t('admin:scientificTasks.taskNameRequired') }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={t('admin:scientificTasks.taskDescription')} name="taskDescription">
        <TextArea rows={6} placeholder={t('admin:scientificTasks.taskDescriptionPlaceholder')} />
      </Form.Item>
      <Form.Item
        label={t('common:label.deadline')}
        name="deadline"
        rules={[{ required: true, message: t('admin:scientificTasks.deadlineRequired') }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
    </Form>
  );

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>{t('admin:scientificTasks.title')}</h1>
            <p>{t('admin:scientificTasks.desc')}</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setCreateModalVisible(true)}>
            {t('admin:scientificTasks.createTask')}
          </Button>
        </div>

        <Table columns={columns} dataSource={tasks} loading={loading} rowKey="id" pagination={{ pageSize: 10 }} />

        <Modal
          title={t('admin:scientificTasks.createTitle')}
          open={createModalVisible}
          onOk={handleCreate}
          onCancel={() => { setCreateModalVisible(false); form.resetFields(); }}
          width={700}
        >
          {taskFormFields(form)}
        </Modal>

        <Modal
          title={t('admin:scientificTasks.editTitle')}
          open={editModalVisible}
          onOk={handleUpdate}
          onCancel={() => { setEditModalVisible(false); editForm.resetFields(); setSelectedTask(null); }}
          width={700}
        >
          <Form form={editForm} layout="vertical">
            <Form.Item
              label={t('admin:scientificTasks.taskName')}
              name="taskName"
              rules={[{ required: true, message: t('admin:scientificTasks.taskNameRequired') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label={t('admin:scientificTasks.taskDescription')} name="taskDescription">
              <TextArea rows={6} placeholder={t('admin:scientificTasks.taskDescriptionPlaceholder')} />
            </Form.Item>
            <Form.Item
              label={t('common:label.deadline')}
              name="deadline"
              rules={[{ required: true, message: t('admin:scientificTasks.deadlineRequired') }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label={t('common:label.status')} name="isActive" valuePropName="checked">
              <Switch
                checkedChildren={t('domain:status.active')}
                unCheckedChildren={t('domain:status.inactive')}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={t('admin:scientificTasks.taskProgress')}
          open={progressModalVisible}
          onCancel={() => setProgressModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setProgressModalVisible(false)}>
              {t('common:button.close')}
            </Button>,
          ]}
          width={1000}
        >
          {taskProgress && (
            <>
              <Descriptions column={2} bordered style={{ marginBottom: '24px' }}>
                <Descriptions.Item label={t('admin:scientificTasks.taskName')} span={2}>
                  {taskProgress.taskName}
                </Descriptions.Item>
                <Descriptions.Item label={t('admin:scientificTasks.taskDescription')} span={2}>
                  {taskProgress.taskDescription || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('common:label.deadline')}>
                  {dayjs(taskProgress.deadline).format('MMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label={t('common:label.createdBy')}>
                  {taskProgress.creator?.userInfo?.firstName} {taskProgress.creator?.userInfo?.lastName}
                </Descriptions.Item>
              </Descriptions>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <Card><Statistic title={t('admin:scientificTasks.teacherReports')} value={stats.total} /></Card>
                <Card><Statistic title={t('domain:status.in_progress')} value={stats.inProgress} valueStyle={{ color: '#1890ff' }} /></Card>
                <Card><Statistic title={t('domain:status.submitted')} value={stats.submitted} valueStyle={{ color: '#faad14' }} /></Card>
                <Card><Statistic title={t('domain:status.validated')} value={stats.validated} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card>
                <Card><Statistic title={t('domain:status.rejected')} value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card>
              </div>

              <h3>{t('admin:scientificTasks.teacherReports')}</h3>
              <Table columns={reportColumns} dataSource={taskProgress.reports} rowKey="id" pagination={{ pageSize: 10 }} />
            </>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ScientificTasksManagementPage;
