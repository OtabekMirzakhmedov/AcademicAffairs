import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
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
  DownloadOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import scientificTasksService from '../services/scientific-tasks.service';
import type { TeacherScientificReport } from '../types';
import dayjs from 'dayjs';
import api from '../config/api';

const { TextArea } = Input;

const ScientificTasksPage: React.FC = () => {
  const { t } = useTranslation(['teacher', 'common', 'domain']);
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
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report: TeacherScientificReport) => {
    setSelectedReport(report);
    form.setFieldsValue({
      executionStatus: report.executionStatus || '',
      completionPercentage: report.completionPercentage || 0,
      equivalentHours: report.equivalentHours || 0,
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
      message.success(t('teacher:scientificTasks.updateSuccess') || 'Report updated successfully');
      setEditModalVisible(false);
      loadReports();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    }
  };

  const handleSubmit = async (reportId: number) => {
    try {
      await scientificTasksService.submitReport(reportId);
      message.success(t('teacher:scientificTasks.submitSuccess') || 'Report submitted successfully');
      loadReports();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedReport) return;

    try {
      setUploading(true);
      const { filePath, fileName } = await scientificTasksService.uploadFile(file);

      await scientificTasksService.updateReport(selectedReport.id, { filePath, fileName });

      message.success(t('teacher:scientificTasks.uploadSuccess') || 'File uploaded successfully');
      loadReports();

      const updatedReport = await scientificTasksService.getReport(selectedReport.id);
      setSelectedReport(updatedReport);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setUploading(false);
    }
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

      message.success(t('teacher:scientificTasks.downloadSuccess') || 'File downloaded successfully');
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    }
  };

  const getStatusTag = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: 'blue',
      submitted: 'orange',
      validated: 'green',
      rejected: 'red',
    };
    return <Tag color={colors[status] || 'default'}>{t(`domain:status.${status}`)}</Tag>;
  };

  const isOverdue = (deadline: string) => dayjs(deadline).isBefore(dayjs());

  const columns: ColumnsType<TeacherScientificReport> = [
    {
      title: t('teacher:scientificTasks.taskName'),
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
      title: t('teacher:scientificTasks.deadline'),
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
      title: t('common:label.progress'),
      dataIndex: 'completionPercentage',
      key: 'progress',
      render: (percentage: number) => (
        <Progress percent={percentage} style={{ width: 120 }} />
      ),
    },
    {
      title: t('teacher:scientificTasks.hours'),
      dataIndex: 'equivalentHours',
      key: 'equivalentHours',
      render: (hours: number) => (
        <Space>
          <FieldTimeOutlined />
          {hours || 0}h
        </Space>
      ),
    },
    {
      title: t('common:label.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: t('teacher:scientificTasks.submittedAt'),
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
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            {t('common:button.edit')}
          </Button>
          {record.status === 'in_progress' && (
            <Button
              type="default"
              icon={<SendOutlined />}
              size="small"
              onClick={() => handleSubmit(record.id)}
            >
              {t('common:button.submit')}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1>{t('teacher:scientificTasks.myTasks')}</h1>
          <p>{t('teacher:scientificTasks.desc')}</p>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />

        <Modal
          title={t('teacher:scientificTasks.editReport')}
          open={editModalVisible}
          onOk={handleUpdate}
          onCancel={() => setEditModalVisible(false)}
          width={700}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label={t('teacher:scientificTasks.executionStatus')}
              name="executionStatus"
            >
              <TextArea
                rows={6}
                placeholder={t('teacher:scientificTasks.executionStatusPlaceholder')}
              />
            </Form.Item>

            <Form.Item
              label={t('teacher:scientificTasks.completionPercentage')}
              name="completionPercentage"
              rules={[{ required: true, message: t('teacher:scientificTasks.completionRequired') }]}
            >
              <Slider marks={{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }} />
            </Form.Item>

            <Form.Item
              label={t('teacher:scientificTasks.equivalentHours')}
              name="equivalentHours"
              tooltip={t('teacher:scientificTasks.equivalentHoursTooltip')}
            >
              <InputNumber
                min={0}
                max={1000}
                step={0.5}
                precision={2}
                style={{ width: '200px' }}
                placeholder="0.00"
                addonAfter={t('common:label.hours')}
              />
            </Form.Item>

            <Form.Item label={t('teacher:scientificTasks.attachment')}>
              <Upload
                beforeUpload={(file) => {
                  handleFileUpload(file);
                  return false;
                }}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />} loading={uploading}>
                  {t('teacher:scientificTasks.uploadFile')}
                </Button>
              </Upload>
              {selectedReport?.fileName && (
                <div style={{ marginTop: '8px' }}>
                  {t('teacher:scientificTasks.currentFile')} <Tag color="blue">{selectedReport.fileName}</Tag>
                </div>
              )}
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={t('teacher:scientificTasks.taskDetails')}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              {t('common:button.close')}
            </Button>,
          ]}
          width={700}
        >
          {selectedReport && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t('teacher:scientificTasks.taskName')}>
                {selectedReport.scientificTask?.taskName}
              </Descriptions.Item>
              <Descriptions.Item label={t('common:label.description')}>
                {selectedReport.scientificTask?.taskDescription || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('common:label.deadline')}>
                {dayjs(selectedReport.scientificTask?.deadline).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label={t('common:label.createdBy')}>
                {selectedReport.scientificTask?.creator?.userInfo?.firstName}{' '}
                {selectedReport.scientificTask?.creator?.userInfo?.lastName}
              </Descriptions.Item>
              <Descriptions.Item label={t('common:label.status')}>
                {getStatusTag(selectedReport.status)}
              </Descriptions.Item>
              <Descriptions.Item label={t('common:label.progress')}>
                <Progress percent={selectedReport.completionPercentage} />
              </Descriptions.Item>
              <Descriptions.Item label={t('teacher:scientificTasks.executionStatus')}>
                {selectedReport.executionStatus || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('teacher:scientificTasks.equivalentHours')}>
                <Space>
                  <FieldTimeOutlined />
                  {selectedReport.equivalentHours || 0} {t('common:label.hours')}
                </Space>
              </Descriptions.Item>
              {selectedReport.fileName && (
                <Descriptions.Item label={t('teacher:scientificTasks.attachment')}>
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
                      {t('teacher:scientificTasks.download')}
                    </Button>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedReport.validator && (
                <Descriptions.Item label={t('teacher:scientificTasks.validatedBy')}>
                  {selectedReport.validator.userInfo?.firstName}{' '}
                  {selectedReport.validator.userInfo?.lastName}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default ScientificTasksPage;
