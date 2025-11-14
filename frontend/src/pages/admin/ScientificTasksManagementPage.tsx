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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import scientificTasksService from '../../services/scientific-tasks.service';
import type { ScientificTask, TeacherScientificReport } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ScientificTasksManagementPage: React.FC = () => {
  const [tasks, setTasks] = useState<ScientificTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScientificTask | null>(null);
  const [taskProgress, setTaskProgress] = useState<ScientificTask | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await scientificTasksService.getAllTasks();
      setTasks(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load tasks');
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
      message.success('Scientific task created successfully');
      setCreateModalVisible(false);
      form.resetFields();
      loadTasks();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleViewProgress = async (task: ScientificTask) => {
    try {
      setLoading(true);
      const progress = await scientificTasksService.getTaskProgress(task.id);
      setTaskProgress(progress);
      setProgressModalVisible(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      in_progress: { color: 'blue', text: 'In Progress' },
      submitted: { color: 'orange', text: 'Submitted' },
      validated: { color: 'green', text: 'Validated' },
      rejected: { color: 'red', text: 'Rejected' },
    };
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<ScientificTask> = [
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (deadline: string) => dayjs(deadline).format('MMM DD, YYYY'),
    },
    {
      title: 'Created By',
      dataIndex: ['creator', 'userInfo'],
      key: 'creator',
      render: (userInfo: any) => (
        userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : '-'
      ),
    },
    {
      title: 'Department',
      dataIndex: ['department', 'name'],
      key: 'department',
      render: (name: string) => name || <Tag color="purple">All Departments</Tag>,
    },
    {
      title: 'Total Reports',
      dataIndex: ['_count', 'reports'],
      key: 'reportsCount',
      render: (count: number) => count || 0,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ScientificTask) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewProgress(record)}
          >
            View Progress
          </Button>
        </Space>
      ),
    },
  ];

  const reportColumns: ColumnsType<TeacherScientificReport> = [
    {
      title: 'Teacher',
      dataIndex: ['teacher', 'userInfo'],
      key: 'teacher',
      render: (userInfo: any) => (
        userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : '-'
      ),
    },
    {
      title: 'Department',
      dataIndex: ['teacher', 'teacherInfo', 'department', 'name'],
      key: 'department',
    },
    {
      title: 'Progress',
      dataIndex: 'completionPercentage',
      key: 'progress',
      render: (percentage: number) => (
        <Progress percent={percentage} style={{ width: 120 }} />
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (date ? dayjs(date).format('MMM DD, YYYY') : '-'),
    },
  ];

  // Calculate statistics for the progress modal
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

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Scientific Activities Management</h1>
            <p>Create and manage scientific research tasks</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setCreateModalVisible(true)}
          >
            Create New Task
          </Button>
        </div>

      <Table
        columns={columns}
        dataSource={tasks}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Create Task Modal */}
      <Modal
        title="Create Scientific Task"
        open={createModalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Task Name"
            name="taskName"
            rules={[{ required: true, message: 'Please enter task name' }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>

          <Form.Item
            label="Task Description"
            name="taskDescription"
          >
            <TextArea
              rows={6}
              placeholder="Describe the scientific task..."
            />
          </Form.Item>

          <Form.Item
            label="Deadline"
            name="deadline"
            rules={[{ required: true, message: 'Please select deadline' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Progress Modal */}
      <Modal
        title="Task Progress"
        open={progressModalVisible}
        onCancel={() => setProgressModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setProgressModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={1000}
      >
        {taskProgress && (
          <>
            <Descriptions column={2} bordered style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Task Name" span={2}>
                {taskProgress.taskName}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {taskProgress.taskDescription || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                {dayjs(taskProgress.deadline).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {taskProgress.creator?.userInfo?.firstName}{' '}
                {taskProgress.creator?.userInfo?.lastName}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <Card>
                <Statistic title="Total Teachers" value={stats.total} />
              </Card>
              <Card>
                <Statistic
                  title="In Progress"
                  value={stats.inProgress}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Submitted"
                  value={stats.submitted}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Validated"
                  value={stats.validated}
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="Rejected"
                  value={stats.rejected}
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </div>

            <h3>Teacher Reports</h3>
            <Table
              columns={reportColumns}
              dataSource={taskProgress.reports}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Modal>
      </div>
    </MainLayout>
  );
};

export default ScientificTasksManagementPage;
