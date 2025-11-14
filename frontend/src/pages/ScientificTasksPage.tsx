import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Progress,
  Slider,
  Upload,
  Space,
  Descriptions,
} from 'antd';
import {
  EditOutlined,
  SendOutlined,
  UploadOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import scientificTasksService from '../services/scientific-tasks.service';
import type { TeacherScientificReport } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ScientificTasksPage: React.FC = () => {
  const [reports, setReports] = useState<TeacherScientificReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TeacherScientificReport | null>(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await scientificTasksService.getMyReports();
      setReports(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to load scientific tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report: TeacherScientificReport) => {
    setSelectedReport(report);
    form.setFieldsValue({
      executionStatus: report.executionStatus || '',
      completionPercentage: report.completionPercentage || 0,
    });
    setEditModalVisible(true);
  };

  const handleViewDetails = (report: TeacherScientificReport) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedReport) return;

      await scientificTasksService.updateReport(selectedReport.id, values);
      message.success('Report updated successfully');
      setEditModalVisible(false);
      loadReports();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to update report');
    }
  };

  const handleSubmit = async (reportId: number) => {
    try {
      await scientificTasksService.submitReport(reportId);
      message.success('Report submitted successfully');
      loadReports();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit report');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedReport) return;

    try {
      setUploading(true);
      const { filePath, fileName } = await scientificTasksService.uploadFile(file);

      await scientificTasksService.updateReport(selectedReport.id, {
        filePath,
        fileName,
      });

      message.success('File uploaded successfully');
      loadReports();

      // Update the form to refresh the file info
      const updatedReport = await scientificTasksService.getReport(selectedReport.id);
      setSelectedReport(updatedReport);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
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

  const isOverdue = (deadline: string) => {
    return dayjs(deadline).isBefore(dayjs());
  };

  const columns: ColumnsType<TeacherScientificReport> = [
    {
      title: 'Task Name',
      dataIndex: ['scientificTask', 'taskName'],
      key: 'taskName',
      render: (text: string, record: TeacherScientificReport) => (
        <Space>
          <FileTextOutlined />
          <Button type="link" onClick={() => handleViewDetails(record)}>
            {text}
          </Button>
        </Space>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: ['scientificTask', 'deadline'],
      key: 'deadline',
      render: (deadline: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: isOverdue(deadline) ? 'red' : 'inherit' }} />
          <span style={{ color: isOverdue(deadline) ? 'red' : 'inherit' }}>
            {dayjs(deadline).format('MMM DD, YYYY')}
          </span>
        </Space>
      ),
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
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.status === 'in_progress' && (
            <Button
              type="default"
              icon={<SendOutlined />}
              size="small"
              onClick={() => handleSubmit(record.id)}
            >
              Submit
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>My Scientific Tasks</h1>
        <p>View and manage your assigned scientific research tasks</p>
      </div>

      <Table
        columns={columns}
        dataSource={reports}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Edit Report Modal */}
      <Modal
        title="Edit Report"
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => setEditModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Execution Status"
            name="executionStatus"
            rules={[{ required: false }]}
          >
            <TextArea
              rows={6}
              placeholder="Describe what you have done for this task..."
            />
          </Form.Item>

          <Form.Item
            label="Completion Percentage"
            name="completionPercentage"
            rules={[{ required: true, message: 'Please set completion percentage' }]}
          >
            <Slider marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }} />
          </Form.Item>

          <Form.Item label="Attachment">
            <Upload
              beforeUpload={(file) => {
                handleFileUpload(file);
                return false; // Prevent default upload
              }}
              maxCount={1}
              loading={uploading}
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload File
              </Button>
            </Upload>
            {selectedReport?.fileName && (
              <div style={{ marginTop: '8px' }}>
                Current file: <Tag color="blue">{selectedReport.fileName}</Tag>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Task Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedReport && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Task Name">
              {selectedReport.scientificTask?.taskName}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {selectedReport.scientificTask?.taskDescription || 'No description'}
            </Descriptions.Item>
            <Descriptions.Item label="Deadline">
              {dayjs(selectedReport.scientificTask?.deadline).format('MMM DD, YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {selectedReport.scientificTask?.creator?.userInfo?.firstName}{' '}
              {selectedReport.scientificTask?.creator?.userInfo?.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedReport.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Completion">
              <Progress percent={selectedReport.completionPercentage} />
            </Descriptions.Item>
            <Descriptions.Item label="Execution Status">
              {selectedReport.executionStatus || 'No status provided'}
            </Descriptions.Item>
            {selectedReport.fileName && (
              <Descriptions.Item label="Attachment">
                <Tag color="blue">{selectedReport.fileName}</Tag>
              </Descriptions.Item>
            )}
            {selectedReport.validator && (
              <Descriptions.Item label="Validated By">
                {selectedReport.validator.userInfo?.firstName}{' '}
                {selectedReport.validator.userInfo?.lastName}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ScientificTasksPage;
