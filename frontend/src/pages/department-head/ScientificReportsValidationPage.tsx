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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['head', 'common', 'domain']);
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
    groupReportsByTask();
  }, [reports]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await scientificTasksService.getSubmittedReports();
      setReports(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const groupReportsByTask = () => {
    const taskMap = new Map<number, TaskGroup>();

    reports.forEach(report => {
      if (!report.scientificTask) return;

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

      switch (report.status) {
        case 'submitted': group.submittedCount++; break;
        case 'validated': group.validatedCount++; break;
        case 'rejected': group.rejectedCount++; break;
        case 'in_progress': group.inProgressCount++; break;
      }
    });

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
      title: t('head:scientificReports.validateReport'),
      content: t('head:scientificReports.validateConfirm'),
      okText: t('common:button.validate'),
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await scientificTasksService.validateReport(reportId);
          message.success(t('head:scientificReports.validateSuccess'));
          loadReports();
          if (selectedReport?.id === reportId) {
            setDetailModalVisible(false);
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || t('head:scientificReports.validateFailed'));
        }
      },
    });
  };

  const handleReject = async (reportId: number) => {
    Modal.confirm({
      title: t('head:scientificReports.rejectReport'),
      content: `${t('head:scientificReports.rejectConfirm')} ${t('head:scientificReports.rejectDesc')}`,
      okText: t('common:button.reject'),
      okType: 'danger',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await scientificTasksService.rejectReport(reportId);
          message.success(t('head:scientificReports.rejectSuccess'));
          loadReports();
          if (selectedReport?.id === reportId) {
            setDetailModalVisible(false);
          }
        } catch (error: any) {
          message.error(error.response?.data?.message || t('head:scientificReports.rejectFailed'));
        }
      },
    });
  };

  const handleDownload = async (reportId: number, fileName: string) => {
    try {
      const response = await api.get(`/scientific-tasks/reports/${reportId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success(t('head:scientificReports.downloadSuccess'));
    } catch (error: any) {
      message.error(error.response?.data?.message || t('head:scientificReports.downloadFailed'));
    }
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: 'blue',
      submitted: 'orange',
      validated: 'green',
      rejected: 'red',
    };
    return (
      <Tag color={colors[status] || 'default'}>
        {t(`domain:status.${status}`, { defaultValue: status })}
      </Tag>
    );
  };

  const teacherColumns: ColumnsType<TeacherScientificReport> = [
    {
      title: t('domain:role.teacher'),
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
      title: t('common:label.department'),
      dataIndex: ['teacher', 'teacherInfo', 'department', 'name'],
      key: 'department',
    },
    {
      title: t('common:label.progress'),
      dataIndex: 'completionPercentage',
      key: 'progress',
      render: (percentage: number) => (
        <Progress percent={percentage} style={{ width: 120 }} />
      ),
    },
    {
      title: t('common:label.hours'),
      dataIndex: 'equivalentHours',
      key: 'equivalentHours',
      render: (hours: number) => `${hours || 0}h`,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: t('head:scientificReports.submittedAt'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => (date ? dayjs(date).format('MMM DD, YYYY HH:mm') : '-'),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      render: (_: any, record: TeacherScientificReport) => (
        <Space>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            {t('common:button.view')}
          </Button>
          {record.status === 'submitted' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                onClick={() => handleValidate(record.id)}
              >
                {t('common:button.validate')}
              </Button>
              <Button
                danger
                icon={<CloseCircleOutlined />}
                size="small"
                onClick={() => handleReject(record.id)}
              >
                {t('common:button.reject')}
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const allReportsColumns: ColumnsType<TeacherScientificReport> = [
    {
      title: t('head:scientificReports.taskName'),
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
          <h1>{t('head:scientificReports.title')}</h1>
          <p>{t('head:scientificReports.desc')}</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <Card>
            <Statistic title={t('head:scientificReports.totalReports')} value={stats.total} />
          </Card>
          <Card>
            <Statistic
              title={t('head:scientificReports.inProgress')}
              value={stats.inProgress}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card>
            <Statistic
              title={t('head:scientificReports.awaitingValidation')}
              value={stats.submitted}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
          <Card>
            <Statistic
              title={t('domain:status.validated')}
              value={stats.validated}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
          <Card>
            <Statistic
              title={t('domain:status.rejected')}
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </div>

        <Tabs activeKey={viewMode} onChange={(key) => setViewMode(key as 'tasks' | 'all')}>
          <TabPane tab={t('head:scientificReports.byTasks')} key="tasks">
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
                                  {t('head:scientificReports.deadlineLabel')} {dayjs(taskGroup.deadline).format('MMM DD, YYYY')}
                                </span>
                              </Space>
                              <Space size="small">
                                <UserOutlined />
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                  {taskGroup.totalTeachers} {t('head:scientificReports.teachersLabel')}
                                </span>
                              </Space>
                              <Space size="small">
                                <FieldTimeOutlined />
                                <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                                  {taskGroup.totalEquivalentHours.toFixed(1)} {t('head:scientificReports.hoursTotal')}
                                </span>
                              </Space>
                            </Space>
                          </Space>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <Space size="middle">
                            <Tag color="blue">{taskGroup.inProgressCount} {t('domain:status.in_progress')}</Tag>
                            <Tag color="orange">{taskGroup.submittedCount} {t('domain:status.submitted')}</Tag>
                            <Tag color="green">{taskGroup.validatedCount} {t('domain:status.validated')}</Tag>
                            <Tag color="red">{taskGroup.rejectedCount} {t('domain:status.rejected')}</Tag>
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
                          <strong>{t('common:label.description')}:</strong> {taskGroup.taskDescription}
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
          <TabPane tab={t('head:scientificReports.allReports')} key="all">
            <Table
              columns={allReportsColumns}
              dataSource={reports}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>

        <Modal
          title={t('head:scientificReports.reportDetails')}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              {t('common:button.close')}
            </Button>,
            ...(selectedReport?.status === 'submitted' ? [
              <Button
                key="reject"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(selectedReport.id)}
              >
                {t('common:button.reject')}
              </Button>,
              <Button
                key="validate"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleValidate(selectedReport.id)}
              >
                {t('common:button.validate')}
              </Button>,
            ] : []),
          ]}
          width={800}
        >
          {selectedReport && (
            <div>
              <h3>{t('head:scientificReports.taskInfo')}</h3>
              <Descriptions column={1} bordered style={{ marginBottom: '24px' }}>
                <Descriptions.Item label={t('head:scientificReports.taskName')}>
                  {selectedReport.scientificTask?.taskName}
                </Descriptions.Item>
                <Descriptions.Item label={t('head:scientificReports.taskDescription')}>
                  {selectedReport.scientificTask?.taskDescription || t('head:scientificReports.noDescription')}
                </Descriptions.Item>
                <Descriptions.Item label={t('common:label.deadline')}>
                  {dayjs(selectedReport.scientificTask?.deadline).format('MMM DD, YYYY')}
                </Descriptions.Item>
              </Descriptions>

              <h3>{t('head:scientificReports.teacherInfo')}</h3>
              <Descriptions column={1} bordered style={{ marginBottom: '24px' }}>
                <Descriptions.Item label={t('head:scientificReports.teacherName')}>
                  {selectedReport.teacher?.userInfo?.firstName}{' '}
                  {selectedReport.teacher?.userInfo?.lastName}
                </Descriptions.Item>
                <Descriptions.Item label={t('common:label.department')}>
                  {selectedReport.teacher?.teacherInfo?.department?.name}
                </Descriptions.Item>
              </Descriptions>

              <h3>{t('head:scientificReports.reportDetails')}</h3>
              <Descriptions column={1} bordered>
                <Descriptions.Item label={t('common:label.status')}>
                  {getStatusTag(selectedReport.status)}
                </Descriptions.Item>
                <Descriptions.Item label={t('head:scientificReports.completion')}>
                  <Progress percent={selectedReport.completionPercentage} />
                </Descriptions.Item>
                <Descriptions.Item label={t('head:scientificReports.executionStatus')}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedReport.executionStatus || t('head:scientificReports.noStatus')}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label={t('head:scientificReports.equivalentHours')}>
                  <strong>{selectedReport.equivalentHours || 0}</strong> {t('head:scientificReports.hoursWorked')}
                </Descriptions.Item>
                {selectedReport.fileName && (
                  <Descriptions.Item label={t('head:scientificReports.attachment')}>
                    <Space>
                      <Tag color="blue" icon={<FileTextOutlined />}>
                        {selectedReport.fileName}
                      </Tag>
                      <Button
                        type="primary"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => selectedReport.fileName && handleDownload(selectedReport.id, selectedReport.fileName)}
                      >
                        {t('common:button.download')}
                      </Button>
                    </Space>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={t('head:scientificReports.submittedAt')}>
                  {selectedReport.submittedAt
                    ? dayjs(selectedReport.submittedAt).format('MMM DD, YYYY HH:mm')
                    : '-'}
                </Descriptions.Item>
                {selectedReport.validatedAt && (
                  <Descriptions.Item label={t('head:scientificReports.validatedAt')}>
                    {dayjs(selectedReport.validatedAt).format('MMM DD, YYYY HH:mm')}
                  </Descriptions.Item>
                )}
                {selectedReport.validator && (
                  <Descriptions.Item label={t('head:scientificReports.validatedBy')}>
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
