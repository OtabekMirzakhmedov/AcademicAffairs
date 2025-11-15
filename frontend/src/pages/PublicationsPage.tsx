import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Spin,
  Alert,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Space,
  Tooltip,
} from 'antd';
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../components/layout/MainLayout';
import publicationsService, {
  type CreatePublicationRequest,
  type UpdatePublicationRequest,
} from '../services/publications.service';
import type { TeacherPublication, PublicationStatistics } from '../types';
import dayjs from 'dayjs';

const { TextArea } = Input;

const PublicationsPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PublicationStatistics>({
    mandatoryConferenceArticles: 0,
    mandatoryNationalArticles: 0,
    mandatoryScopusArticles: 0,
    submittedConferenceArticles: 0,
    submittedNationalArticles: 0,
    submittedScopusArticles: 0,
    validatedConferenceArticles: 0,
    validatedNationalArticles: 0,
    validatedScopusArticles: 0,
  });
  const [publications, setPublications] = useState<TeacherPublication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPublication, setEditingPublication] = useState<TeacherPublication | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [publicationsData, statistics] = await Promise.all([
        publicationsService.getAll(),
        publicationsService.getStatistics(),
      ]);

      setPublications(publicationsData);
      setStats(statistics);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPublication(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (publication: TeacherPublication) => {
    setEditingPublication(publication);
    form.setFieldsValue({
      title: publication.title,
      publicationType: publication.publicationType,
      authors: publication.authors,
      venue: publication.venue,
      publicationDate: publication.publicationDate ? dayjs(publication.publicationDate) : null,
      doi: publication.doi,
      isbn: publication.isbn,
      issn: publication.issn,
      url: publication.url,
      abstract: publication.abstract,
      keywords: publication.keywords,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      const data = {
        ...values,
        publicationDate: values.publicationDate
          ? values.publicationDate.toISOString()
          : undefined,
      };

      if (editingPublication) {
        await publicationsService.update(editingPublication.id, data as UpdatePublicationRequest);
        message.success('Publication updated successfully');
      } else {
        await publicationsService.create(data as CreatePublicationRequest);
        message.success('Publication created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save publication');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPublication = (publication: TeacherPublication) => {
    Modal.confirm({
      title: 'Submit Publication',
      content: 'Are you sure you want to submit this publication for review?',
      okText: 'Submit',
      onOk: async () => {
        try {
          await publicationsService.submit(publication.id);
          message.success('Publication submitted successfully');
          await fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to submit publication');
        }
      },
    });
  };

  const handleDelete = (publication: TeacherPublication) => {
    Modal.confirm({
      title: 'Delete Publication',
      content: 'Are you sure you want to delete this publication?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await publicationsService.delete(publication.id);
          message.success('Publication deleted successfully');
          await fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to delete publication');
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'processing';
      case 'validated':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPublicationTypeLabel = (type: string) => {
    switch (type) {
      case 'conference':
        return 'Conference';
      case 'national':
        return 'National Journal';
      case 'scopus':
        return 'Scopus';
      default:
        return type;
    }
  };

  const columns: ColumnsType<TeacherPublication> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title, record) => (
        <Tooltip title={record.abstract}>
          <div style={{ cursor: 'pointer' }}>
            <div style={{ fontWeight: 500 }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.authors}</div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'publicationType',
      key: 'publicationType',
      width: 150,
      filters: [
        { text: 'Conference', value: 'conference' },
        { text: 'National Journal', value: 'national' },
        { text: 'Scopus', value: 'scopus' },
      ],
      onFilter: (value, record) => record.publicationType === value,
      render: (type) => (
        <Tag color={type === 'scopus' ? 'purple' : type === 'national' ? 'blue' : 'green'}>
          {getPublicationTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: 'Venue',
      dataIndex: 'venue',
      key: 'venue',
      width: 200,
    },
    {
      title: 'Date',
      dataIndex: 'publicationDate',
      key: 'publicationDate',
      width: 120,
      sorter: (a, b) => {
        if (!a.publicationDate) return 1;
        if (!b.publicationDate) return -1;
        return new Date(a.publicationDate).getTime() - new Date(b.publicationDate).getTime();
      },
      render: (date) => (date ? dayjs(date).format('MMM YYYY') : '-'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Submitted', value: 'submitted' },
        { text: 'Validated', value: 'validated' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {(record.status === 'draft' || record.status === 'rejected') && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="Submit for Review">
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handleSubmitPublication(record)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="default"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record)}
                />
              </Tooltip>
            </>
          )}
          {record.status === 'submitted' && (
            <Tag icon={<ClockCircleOutlined />} color="processing">
              Under Review
            </Tag>
          )}
          {record.status === 'validated' && (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Approved
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Loading publications..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Alert message="Error Loading Data" description={error} type="error" showIcon />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>
            <ExperimentOutlined style={{ marginRight: 8 }} />
            Scientific Publications
          </h1>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
            Manage your research publications and articles
          </p>
        </div>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Conference Articles"
                value={stats.validatedConferenceArticles}
                suffix={`/ ${stats.mandatoryConferenceArticles}`}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color:
                    stats.validatedConferenceArticles >= stats.mandatoryConferenceArticles
                      ? '#3f8600'
                      : '#1890ff',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                Submitted: {stats.submittedConferenceArticles}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="National Journal Articles"
                value={stats.validatedNationalArticles}
                suffix={`/ ${stats.mandatoryNationalArticles}`}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color:
                    stats.validatedNationalArticles >= stats.mandatoryNationalArticles
                      ? '#3f8600'
                      : '#1890ff',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                Submitted: {stats.submittedNationalArticles}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Scopus Articles"
                value={stats.validatedScopusArticles}
                suffix={`/ ${stats.mandatoryScopusArticles}`}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color:
                    stats.validatedScopusArticles >= stats.mandatoryScopusArticles
                      ? '#3f8600'
                      : '#1890ff',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                Submitted: {stats.submittedScopusArticles}
              </div>
            </Card>
          </Col>
        </Row>

        {/* Publications Table */}
        <Card
          title="My Publications"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Publication
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={publications}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} publications`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={editingPublication ? 'Edit Publication' : 'Add Publication'}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          onOk={handleSubmitForm}
          confirmLoading={submitting}
          width={800}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter the publication title' }]}
            >
              <Input placeholder="Enter publication title" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="publicationType"
                  label="Publication Type"
                  rules={[{ required: true, message: 'Please select publication type' }]}
                >
                  <Select placeholder="Select type">
                    <Select.Option value="conference">Conference</Select.Option>
                    <Select.Option value="national">National Journal</Select.Option>
                    <Select.Option value="scopus">Scopus</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="publicationDate" label="Publication Date">
                  <DatePicker style={{ width: '100%' }} picker="month" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="authors"
              label="Authors"
              rules={[{ required: true, message: 'Please enter the authors' }]}
            >
              <Input placeholder="e.g., John Doe, Jane Smith" />
            </Form.Item>

            <Form.Item name="venue" label="Conference/Journal Name">
              <Input placeholder="Enter conference or journal name" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="doi" label="DOI">
                  <Input placeholder="10.1234/example" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="isbn" label="ISBN">
                  <Input placeholder="978-3-16-148410-0" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="issn" label="ISSN">
                  <Input placeholder="1234-5678" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="url" label="URL">
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item name="abstract" label="Abstract">
              <TextArea rows={4} placeholder="Enter publication abstract" />
            </Form.Item>

            <Form.Item name="keywords" label="Keywords">
              <Input placeholder="e.g., machine learning, neural networks, AI" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default PublicationsPage;
