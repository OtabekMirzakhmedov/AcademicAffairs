import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  message,
  Tag,
  Space,
  Descriptions,
  Card,
  Row,
  Col,
  Statistic,
  Input,
  Select,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  UserOutlined,
  SearchOutlined,
  FileTextOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import publicationsService from '../../services/publications.service';
import type { TeacherPublication } from '../../types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text } = Typography;

const TYPE_COLORS: Record<string, string> = {
  conference: 'blue',
  national: 'green',
  scopus: 'purple',
};

const PublicationsValidationPage: React.FC = () => {
  const { t } = useTranslation(['head', 'common', 'domain']);

  const [publications, setPublications] = useState<TeacherPublication[]>([]);
  const [filtered, setFiltered] = useState<TeacherPublication[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPub, setSelectedPub] = useState<TeacherPublication | null>(null);

  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectingPub, setRejectingPub] = useState<TeacherPublication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    let result = publications;
    if (typeFilter) {
      result = result.filter((p) => p.publicationType === typeFilter);
    }
    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          `${p.teacher?.userInfo?.firstName} ${p.teacher?.userInfo?.lastName}`.toLowerCase().includes(q) ||
          (p.venue || '').toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [publications, searchText, typeFilter]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const data = await publicationsService.getAllSubmitted();
      setPublications(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = (pub: TeacherPublication) => {
    const teacherName = `${pub.teacher?.userInfo?.firstName} ${pub.teacher?.userInfo?.lastName}`;
    Modal.confirm({
      title: t('head:publications.validateTitle'),
      content: t('head:publications.validateConfirm', { name: teacherName, title: pub.title }),
      okText: t('common:button.validate'),
      okType: 'primary',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await publicationsService.validate(pub.id);
          message.success(t('head:publications.validateSuccess'));
          loadPublications();
        } catch (error: any) {
          message.error(error.response?.data?.message || t('head:publications.validateFailed'));
        }
      },
    });
  };

  const openRejectModal = (pub: TeacherPublication) => {
    setRejectingPub(pub);
    setRejectReason('');
    setRejectVisible(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectingPub) return;
    try {
      setActionLoading(true);
      await publicationsService.reject(rejectingPub.id, rejectReason || undefined);
      message.success(t('head:publications.rejectSuccess'));
      setRejectVisible(false);
      loadPublications();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('head:publications.rejectFailed'));
    } finally {
      setActionLoading(false);
    }
  };

  const conferencePubs = publications.filter((p) => p.publicationType === 'conference');
  const nationalPubs = publications.filter((p) => p.publicationType === 'national');
  const scopusPubs = publications.filter((p) => p.publicationType === 'scopus');

  const columns: ColumnsType<TeacherPublication> = [
    {
      title: t('domain:role.teacher'),
      key: 'teacher',
      render: (_, record) => (
        <span>
          <UserOutlined style={{ marginRight: 6, color: '#52c41a' }} />
          {`${record.teacher?.userInfo?.firstName} ${record.teacher?.userInfo?.lastName}`}
        </span>
      ),
      sorter: (a, b) =>
        `${a.teacher?.userInfo?.firstName} ${a.teacher?.userInfo?.lastName}`.localeCompare(
          `${b.teacher?.userInfo?.firstName} ${b.teacher?.userInfo?.lastName}`,
        ),
    },
    {
      title: t('head:publications.title'),
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title) => <Text ellipsis={{ tooltip: title }} style={{ maxWidth: 260 }}>{title}</Text>,
    },
    {
      title: t('common:label.type'),
      dataIndex: 'publicationType',
      key: 'publicationType',
      width: 120,
      render: (type) => (
        <Tag color={TYPE_COLORS[type] || 'default'}>
          {t(`domain:publicationType.${type}`, { defaultValue: type })}
        </Tag>
      ),
    },
    {
      title: t('head:publications.venue'),
      dataIndex: 'venue',
      key: 'venue',
      render: (venue) => venue || <Text type="secondary">—</Text>,
    },
    {
      title: t('head:publications.submittedAt'),
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 120,
      sorter: (a, b) => (a.submittedAt || '').localeCompare(b.submittedAt || ''),
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '—'),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => { setSelectedPub(record); setDetailVisible(true); }}
          />
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => handleValidate(record)}
          >
            {t('common:button.validate')}
          </Button>
          <Button
            danger
            type="primary"
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => openRejectModal(record)}
          >
            {t('common:button.reject')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '0 0 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{t('head:publications.pageTitle')}</h1>
          <p style={{ margin: '4px 0 0', color: '#666' }}>{t('head:publications.pageDesc')}</p>
        </div>

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('head:publications.totalPending')}
                value={publications.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('domain:publicationType.conference')}
                value={conferencePubs.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('domain:publicationType.national')}
                value={nationalPubs.length}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title={t('domain:publicationType.scopus')}
                value={scopusPubs.length}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Space style={{ marginBottom: 16 }}>
            <Input
              placeholder={t('head:publications.search')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 320 }}
            />
            <Select
              allowClear
              placeholder={t('head:publications.filterByType')}
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 180 }}
              options={[
                { value: 'conference', label: t('domain:publicationType.conference') },
                { value: 'national', label: t('domain:publicationType.national') },
                { value: 'scopus', label: t('domain:publicationType.scopus') },
              ]}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={filtered}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('head:publications.totalItems', { total }),
            }}
            scroll={{ x: 1100 }}
          />
        </Card>

        {/* Detail modal */}
        <Modal
          title={t('head:publications.detailTitle')}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              {t('common:button.close')}
            </Button>,
            selectedPub?.status === 'submitted' && (
              <Button
                key="validate"
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => { setDetailVisible(false); handleValidate(selectedPub!); }}
              >
                {t('common:button.validate')}
              </Button>
            ),
            selectedPub?.status === 'submitted' && (
              <Button
                key="reject"
                danger
                type="primary"
                icon={<CloseCircleOutlined />}
                onClick={() => { setDetailVisible(false); openRejectModal(selectedPub!); }}
              >
                {t('common:button.reject')}
              </Button>
            ),
          ].filter(Boolean)}
          width={700}
        >
          {selectedPub && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t('domain:role.teacher')}>
                {`${selectedPub.teacher?.userInfo?.firstName} ${selectedPub.teacher?.userInfo?.lastName}`}
              </Descriptions.Item>
              <Descriptions.Item label={t('head:publications.title')}>
                {selectedPub.title}
              </Descriptions.Item>
              <Descriptions.Item label={t('common:label.type')}>
                <Tag color={TYPE_COLORS[selectedPub.publicationType] || 'default'}>
                  {t(`domain:publicationType.${selectedPub.publicationType}`, { defaultValue: selectedPub.publicationType })}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('head:publications.authors')}>
                {selectedPub.authors}
              </Descriptions.Item>
              {selectedPub.venue && (
                <Descriptions.Item label={t('head:publications.venue')}>
                  {selectedPub.venue}
                </Descriptions.Item>
              )}
              {selectedPub.publicationDate && (
                <Descriptions.Item label={t('head:publications.publicationDate')}>
                  {dayjs(selectedPub.publicationDate).format('YYYY-MM-DD')}
                </Descriptions.Item>
              )}
              {selectedPub.doi && (
                <Descriptions.Item label="DOI">
                  <a href={`https://doi.org/${selectedPub.doi}`} target="_blank" rel="noreferrer">
                    <LinkOutlined style={{ marginRight: 4 }} />
                    {selectedPub.doi}
                  </a>
                </Descriptions.Item>
              )}
              {selectedPub.url && (
                <Descriptions.Item label={t('head:publications.url')}>
                  <a href={selectedPub.url} target="_blank" rel="noreferrer">
                    <LinkOutlined style={{ marginRight: 4 }} />
                    {selectedPub.url}
                  </a>
                </Descriptions.Item>
              )}
              {selectedPub.isbn && (
                <Descriptions.Item label="ISBN">{selectedPub.isbn}</Descriptions.Item>
              )}
              {selectedPub.issn && (
                <Descriptions.Item label="ISSN">{selectedPub.issn}</Descriptions.Item>
              )}
              {selectedPub.keywords && (
                <Descriptions.Item label={t('head:publications.keywords')}>
                  {selectedPub.keywords}
                </Descriptions.Item>
              )}
              {selectedPub.abstract && (
                <Descriptions.Item label={t('head:publications.abstract')}>
                  <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedPub.abstract}</Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t('head:publications.submittedAt')}>
                {selectedPub.submittedAt ? dayjs(selectedPub.submittedAt).format('YYYY-MM-DD HH:mm') : '—'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Reject modal */}
        <Modal
          title={t('head:publications.rejectTitle')}
          open={rejectVisible}
          onCancel={() => setRejectVisible(false)}
          onOk={handleRejectConfirm}
          okText={t('common:button.reject')}
          okButtonProps={{ danger: true, loading: actionLoading }}
          cancelText={t('common:button.cancel')}
        >
          {rejectingPub && (
            <>
              <p>
                {t('head:publications.rejectConfirm', {
                  name: `${rejectingPub.teacher?.userInfo?.firstName} ${rejectingPub.teacher?.userInfo?.lastName}`,
                  title: rejectingPub.title,
                })}
              </p>
              <TextArea
                rows={3}
                placeholder={t('head:publications.rejectReasonPlaceholder')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                maxLength={500}
                showCount
              />
            </>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default PublicationsValidationPage;
