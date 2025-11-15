import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  message,
  Tag,
  Space,
  Descriptions,
  Progress,
  Card,
  Statistic,
  Collapse,
  Tabs,
  Row,
  Col,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  DownloadOutlined,
  UserOutlined,
  CalendarOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import scientificTasksService from '../../services/scientific-tasks.service';
import type { TeacherScientificReport } from '../../types';
import dayjs from 'dayjs';
import api from '../../config/api';

const { Panel } = Collapse;
const { TabPane } = Tabs;

interface TaskGroup {
  taskId: number;
  taskName: string;
  taskDescription: string;
  deadline: string;
  reports: TeacherScientificReport[];
  totalTeachers: number;
  submittedCount: number;
  validatedCount: number;
  rejectedCount: number;
  inProgressCount: number;
  completionRate: number;
  totalEquivalentHours: number;
}

const ScientificReportsValidationPage: React.FC = () => {
  const [reports, setReports] = useState<TeacherScientificReport[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TeacherScientificReport | null>(null);
  const [viewMode, setViewMode] = useState<'tasks' | 'all'>('tasks');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    // Group reports by task whenever reports change
    groupReportsByTask();
  }, [reports]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await scientificTasksService.getSubmittedReports();
      setReports(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const groupReportsByTask = () => {
    const taskMap = new Map<number, TaskGroup>();

    reports.forEach(report => {
      const taskId = report.scientificTask.id;

      if (!taskMap.has(taskId)) {
        taskMap.set(taskId, {
          taskId,
          taskName: report.scientificTask.taskName,
          taskDescription: report.scientificTask.taskDescription || '',
          deadline: report.scientificTask.deadline,
          reports: [],
          totalTeachers: 0,
          submittedCount: 0,
          validatedCount: 0,
          rejectedCount: 0,
          inProgressCount: 0,
          completionRate: 0,
          totalEquivalentHours: 0,
        });
      }

      const group = taskMap.get(taskId)!;
      group.reports.push(report);
      group.totalTeachers++;
      group.totalEquivalentHours += Number(report.equivalentHours || 0);

      // Count statuses
      switch (report.status) {
        case 'submitted':
          group.submittedCount++;
          break;
        case 'validated':
          group.validatedCount++;
          break;
        case 'rejected':
          group.rejectedCount++;
          break;
        case 'in_progress':
          group.inProgressCount++;
          break;
      }
    });

    // Calculate completion rate for each task
    taskMap.forEach(group => {
      group.completionRate = group.totalTeachers > 0
        ? Math.round((group.validatedCount / group.totalTeachers) * 100)
        : 0;
    });

    setTaskGroups(Array.from(taskMap.values()));
  };

  const handleViewDetails = (report: TeacherScientificReport) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleValidate = async (reportId: number) => {
    Modal.confirm({
      title: 'Validate Report',
      content: 'Are you sure you want to validate this report?',
      onOk: async () => {
        try {
          await scientificTasksService.validateReport(reportId);
          message.success('Report validated successfully');
          loadReports();
          if (selectedReport?.id === reportId) {
            setDetailModalVisible(false);
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to validate report');
        }
      },
    });
  };

  const handleReject = async (reportId: number) => {
    Modal.confirm({
      title: 'Reject Report',
      content: 'Are you sure you want to reject this report? The teacher will need to revise and resubmit.',
      okText: 'Reject',
      okType: 'danger',
      onOk: async () => {
        try {
          await scientificTasksService.rejectReport(reportId);
          message.success('Report rejected');
          loadReports();
          if (selectedReport?.id === reportId) {
            setDetailModalVisible(false);
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to reject report');
        }
      },
    });
  };

  const handleDownload = async (reportId: number, fileName: string) => {
    try {
      const response = await api.get(`/scientific-tasks/reports/${reportId}/download`, {
        responseType: 'blob',
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('File downloaded successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to download file');
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

  // Columns for teacher reports within each task
  const teacherColumns: ColumnsType<TeacherScientificReport> = [
    {
      title: 'Teacher',
      dataIndex: ['teacher', 'userInfo'],
      key: 'teacher',
      render: (userInfo: any) => (
        <Space>
          <UserOutlined />
          {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : '-'}
        </Space>
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
      title: 'Hours',
      dataIndex: 'equivalentHours',
      key: 'equivalentHours',
      render: (hours: number) => `${hours || 0}h`,
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
      render: (date: string) => (date ? dayjs(date).format('MMM DD, YYYY HH:mm') : '-'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TeacherScientificReport) => (
        <Space>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          {record.status === 'submitted' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleValidate(record.id)}
              >
                Validate
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Columns for flat view (all reports)
  const allReportsColumns: ColumnsType<TeacherScientificReport> = [
    {
      title: 'Task Name',
      dataIndex: ['scientificTask', 'taskName'],
      key: 'taskName',
      render: (text: string) => (
        <Space>
          <FileTextOutlined />
          {text}
        </Space>
      ),
    },
    ...teacherColumns,
  ];

  // Calculate statistics
  const stats = {
    total: reports.length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    submitted: reports.filter(r => r.status === 'submitted').length,
    validated: reports.filter(r => r.status === 'validated').length,
    rejected: reports.filter(r => r.status === 'rejected').length,
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1>Scientific Activities Management</h1>
          <p>Review and validate scientific task reports submitted by teachers</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Card>
            <Statistic title="Total Reports" value={stats.total} />
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
              title="Awaiting Validation"
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

        <Tabs activeKey={viewMode} onChange={(key) => setViewMode(key as 'tasks' | 'all')}>
          <TabPane tab="By Tasks" key="tasks">
            {loading ? (
              <Card loading={loading} />
            ) : (
              <Collapse accordion>
                {taskGroups.map((taskGroup) => (
                  <Panel
                    key={taskGroup.taskId}
                    header={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Space>
                              <FileTextOutlined style={{ fontSize: '16px' }} />
                              <strong style={{ fontSize: '16px' }}>{taskGroup.taskName}</strong>
                            </Space>
                            <Space size="large">
                              <Space size="small">
                                <CalendarOutlined />
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                  Deadline: {dayjs(taskGroup.deadline).format('MMM DD, YYYY')}
                                </span>
                              </Space>
                              <Space size="small">
                                <UserOutlined />
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                  {taskGroup.totalTeachers} Teachers
                                </span>
                              </Space>
                              <Space size="small">
                                <FieldTimeOutlined />
                                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                                  {taskGroup.totalEquivalentHours.toFixed(1)} hours total
                                </span>
                              </Space>
                            </Space>
                          </Space>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <Space size="middle">
                            <Tag color="blue">{taskGroup.inProgressCount} In Progress</Tag>
                            <Tag color="orange">{taskGroup.submittedCount} Submitted</Tag>
                            <Tag color="green">{taskGroup.validatedCount} Validated</Tag>
                            <Tag color="red">{taskGroup.rejectedCount} Rejected</Tag>
                          </Space>
                          <div style={{ width: '120px' }}>
                            <Progress
                              percent={taskGroup.completionRate}
                              status={taskGroup.completionRate === 100 ? 'success' : 'active'}
                            />
                          </div>
                        </div>
                      </div>
                    }
                  >
                    <div style={{ padding: '16px 0' }}>
                      {taskGroup.taskDescription && (
                        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          <strong>Description:</strong> {taskGroup.taskDescription}
                        </div>
                      )}
                      <Table
                        columns={teacherColumns}
                        dataSource={taskGroup.reports}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </div>
                  </Panel>
                ))}
              </Collapse>
            )}
          </TabPane>
          <TabPane tab="All Reports" key="all">
            <Table
              columns={allReportsColumns}
              dataSource={reports}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>

      {/* Detail Modal */}
      <Modal
        title="Report Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          ...(selectedReport?.status === 'submitted' ? [
            <Button
              key="reject"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleReject(selectedReport.id)}
            >
              Reject
            </Button>,
            <Button
              key="validate"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleValidate(selectedReport.id)}
            >
              Validate
            </Button>,
          ] : []),
        ]}
        width={800}
      >
        {selectedReport && (
          <div>
            <h3>Task Information</h3>
            <Descriptions column={1} bordered style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Task Name">
                {selectedReport.scientificTask?.taskName}
              </Descriptions.Item>
              <Descriptions.Item label="Task Description">
                {selectedReport.scientificTask?.taskDescription || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                {dayjs(selectedReport.scientificTask?.deadline).format('MMM DD, YYYY')}
              </Descriptions.Item>
            </Descriptions>

            <h3>Teacher Information</h3>
            <Descriptions column={1} bordered style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="Name">
                {selectedReport.teacher?.userInfo?.firstName}{' '}
                {selectedReport.teacher?.userInfo?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label="Department">
                {selectedReport.teacher?.teacherInfo?.department?.name}
              </Descriptions.Item>
            </Descriptions>

            <h3>Report Details</h3>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedReport.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Completion">
                <Progress percent={selectedReport.completionPercentage} />
              </Descriptions.Item>
              <Descriptions.Item label="Execution Status">
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedReport.executionStatus || 'No status provided'}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Equivalent Hours">
                <strong>{selectedReport.equivalentHours || 0}</strong> hours worked on this task
              </Descriptions.Item>
              {selectedReport.fileName && (
                <Descriptions.Item label="Attachment">
                  <Space>
                    <Tag color="blue" icon={<FileTextOutlined />}>
                      {selectedReport.fileName}
                    </Tag>
                    <Button
                      type="primary"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(selectedReport.id, selectedReport.fileName)}
                    >
                      Download
                    </Button>
                  </Space>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Submitted At">
                {selectedReport.submittedAt
                  ? dayjs(selectedReport.submittedAt).format('MMM DD, YYYY HH:mm')
                  : '-'}
              </Descriptions.Item>
              {selectedReport.validatedAt && (
                <Descriptions.Item label="Validated At">
                  {dayjs(selectedReport.validatedAt).format('MMM DD, YYYY HH:mm')}
                </Descriptions.Item>
              )}
              {selectedReport.validator && (
                <Descriptions.Item label="Validated By">
                  {selectedReport.validator.userInfo?.firstName}{' '}
                  {selectedReport.validator.userInfo?.lastName}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
      </div>
    </MainLayout>
  );
};

export default ScientificReportsValidationPage;
