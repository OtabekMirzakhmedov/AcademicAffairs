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
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import scientificTasksService from '../../services/scientific-tasks.service';
import type { TeacherScientificReport } from '../../types';
import dayjs from 'dayjs';

const ScientificReportsValidationPage: React.FC = () => {
  const [reports, setReports] = useState<TeacherScientificReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TeacherScientificReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

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

  const columns: ColumnsType<TeacherScientificReport> = [
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

  // Calculate statistics
  const stats = {
    total: reports.length,
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

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <Statistic title="Total Reports" value={stats.total} />
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

      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Detail Modal */}
      <Modal
        title="Report Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedReport?.status === 'submitted' && (
            <>
              <Button
                key="reject"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(selectedReport.id)}
              >
                Reject
              </Button>
              <Button
                key="validate"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleValidate(selectedReport.id)}
              >
                Validate
              </Button>
            </>
          ),
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
              {selectedReport.fileName && (
                <Descriptions.Item label="Attachment">
                  <Tag color="blue" icon={<FileTextOutlined />}>
                    {selectedReport.fileName}
                  </Tag>
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
