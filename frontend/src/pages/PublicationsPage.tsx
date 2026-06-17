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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['teacher', 'common', 'domain']);
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
      setError(error.response?.data?.message || t('common:message.failedToLoad'));
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
        message.success(t('teacher:publications.updateSuccess'));
      } else {
        await publicationsService.create(data as CreatePublicationRequest);
        message.success(t('teacher:publications.createSuccess'));
      }

      setIsModalOpen(false);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('teacher:publications.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPublication = (publication: TeacherPublication) => {
    Modal.confirm({
      title: t('teacher:publications.title'),
      content: t('teacher:publications.submitConfirm'),
      okText: t('common:button.submit'),
      onOk: async () => {
        try {
          await publicationsService.submit(publication.id);
          message.success(t('teacher:publications.submitSuccess'));
          await fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || t('teacher:publications.submitFailed'));
        }
      },
    });
  };

  const handleDelete = (publication: TeacherPublication) => {
    Modal.confirm({
      title: t('common:button.delete'),
      content: t('teacher:publications.submitConfirm'),
      okText: t('common:button.delete'),
      okType: 'danger',
      onOk: async () => {
        try {
          await publicationsService.delete(publication.id);
          message.success(t('teacher:publications.deleteSuccess'));
          await fetchData();
        } catch (error: any) {
          message.error(error.response?.data?.message || t('teacher:publications.deleteFailed'));
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'processing';
      case 'validated': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const columns: ColumnsType<TeacherPublication> = [
    {
      title: t('teacher:publications.titleField'),
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
      title: t('teacher:publications.publicationType'),
      dataIndex: 'publicationType',
      key: 'publicationType',
      width: 150,
      filters: [
        { text: t('domain:publicationType.conference'), value: 'conference' },
        { text: t('domain:publicationType.national'), value: 'national' },
        { text: t('domain:publicationType.scopus'), value: 'scopus' },
      ],
      onFilter: (value, record) => record.publicationType === value,
      render: (type) => (
        <Tag color={type === 'scopus' ? 'purple' : type === 'national' ? 'blue' : 'green'}>
          {t(`domain:publicationType.${type}`)}
        </Tag>
      ),
    },
    {
      title: t('teacher:publications.venue'),
      dataIndex: 'venue',
      key: 'venue',
      width: 200,
    },
    {
      title: t('teacher:publications.publicationDate'),
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
      title: t('common:label.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: t('domain:status.draft'), value: 'draft' },
        { text: t('domain:status.submitted'), value: 'submitted' },
        { text: t('domain:status.validated'), value: 'validated' },
        { text: t('domain:status.rejected'), value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`domain:status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {(record.status === 'draft' || record.status === 'rejected') && (
            <>
              <Tooltip title={t('common:button.edit')}>
                <Button
                  type="default"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title={t('teacher:publications.submitConfirm')}>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  onClick={() => handleSubmitPublication(record)}
                />
              </Tooltip>
              <Tooltip title={t('common:button.delete')}>
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
              {t('domain:status.submitted')}
            </Tag>
          )}
          {record.status === 'validated' && (
            <Tag icon={<CheckCircleOutlined />} color="success">
              {t('domain:status.validated')}
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
          <Spin size="large" tip={t('common:loading')} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Alert message={t('common:message.errorLoading')} description={error} type="error" showIcon />
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
            {t('teacher:publications.title')}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
            {t('teacher:publications.desc')}
          </p>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={t('domain:publicationType.conference')}
                value={stats.validatedConferenceArticles}
                suffix={`/ ${stats.mandatoryConferenceArticles}`}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color: stats.validatedConferenceArticles >= stats.mandatoryConferenceArticles ? '#3f8600' : '#1890ff',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                {t('domain:status.submitted')}: {stats.submittedConferenceArticles}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={t('domain:publicationType.national')}
                value={stats.validatedNationalArticles}
                suffix={`/ ${stats.mandatoryNationalArticles}`}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color: stats.validatedNationalArticles >= stats.mandatoryNationalArticles ? '#3f8600' : '#1890ff',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                {t('domain:status.submitted')}: {stats.submittedNationalArticles}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title={t('domain:publicationType.scopus')}
                value={stats.validatedScopusArticles}
                suffix={`/ ${stats.mandatoryScopusArticles}`}
                prefix={<FileTextOutlined />}
                valueStyle={{
                  color: stats.validatedScopusArticles >= stats.mandatoryScopusArticles ? '#3f8600' : '#1890ff',
                }}
              />
              <div style={{ marginTop: 8, fontSize: '12px', color: '#8c8c8c' }}>
                {t('domain:status.submitted')}: {stats.submittedScopusArticles}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={t('teacher:publications.myPublications')}
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              {t('teacher:publications.addPublication')}
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

        <Modal
          title={editingPublication ? t('teacher:publications.editPublication') : t('teacher:publications.addPublication')}
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
              label={t('teacher:publications.titleField')}
              rules={[{ required: true, message: t('common:label.required') }]}
            >
              <Input placeholder={t('teacher:publications.titleField')} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="publicationType"
                  label={t('teacher:publications.publicationType')}
                  rules={[{ required: true, message: t('common:label.required') }]}
                >
                  <Select placeholder={t('teacher:publications.publicationType')}>
                    <Select.Option value="conference">{t('domain:publicationType.conference')}</Select.Option>
                    <Select.Option value="national">{t('domain:publicationType.national')}</Select.Option>
                    <Select.Option value="scopus">{t('domain:publicationType.scopus')}</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="publicationDate" label={t('teacher:publications.publicationDate')}>
                  <DatePicker style={{ width: '100%' }} picker="month" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="authors"
              label={t('teacher:publications.authors')}
              rules={[{ required: true, message: t('common:label.required') }]}
            >
              <Input placeholder="e.g., John Doe, Jane Smith" />
            </Form.Item>

            <Form.Item name="venue" label={t('teacher:publications.venue')}>
              <Input />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="doi" label={t('teacher:publications.doi')}>
                  <Input placeholder="10.1234/example" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="isbn" label={t('teacher:publications.isbn')}>
                  <Input placeholder="978-3-16-148410-0" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="issn" label={t('teacher:publications.issn')}>
                  <Input placeholder="1234-5678" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="url" label={t('teacher:publications.url')}>
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item name="abstract" label={t('teacher:publications.abstract')}>
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item name="keywords" label={t('teacher:publications.keywords')}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default PublicationsPage;
