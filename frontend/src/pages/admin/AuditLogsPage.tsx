import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Select,
  DatePicker,
  Modal,
  Descriptions,
  Typography,
  message,
  Tooltip,
} from 'antd';
import {
  EyeOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import MainLayout from '../../components/layout/MainLayout';
import auditService from '../../services/audit.service';
import usersService from '../../services/users.service';
import type { AuditLog, AuditQuery, User } from '../../types';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

const ACTION_COLORS: Record<string, string> = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  submit: 'orange',
  validate: 'success',
  reject: 'error',
  activate: 'cyan',
  deactivate: 'volcano',
  assign: 'geekblue',
  unassign: 'gold',
  login: 'purple',
  login_failed: 'red',
  password_change: 'magenta',
};

const ENTITY_COLORS: Record<string, string> = {
  TeachingActivity: 'blue',
  TeacherPublication: 'purple',
  TeacherScientificReport: 'orange',
  TeacherResearchActivity: 'cyan',
  User: 'green',
  Department: 'geekblue',
  CourseTeacher: 'gold',
};

const KNOWN_ACTIONS = [
  'create', 'update', 'delete',
  'submit', 'validate', 'reject',
  'activate', 'deactivate',
  'assign', 'unassign',
  'login', 'login_failed', 'password_change',
];

const KNOWN_ENTITY_TYPES = [
  'TeachingActivity',
  'TeacherPublication',
  'TeacherScientificReport',
  'TeacherResearchActivity',
  'User',
  'Department',
  'CourseTeacher',
];

const JsonBlock: React.FC<{ value: Record<string, any> }> = ({ value }) => (
  <pre
    style={{
      background: '#f5f5f5',
      border: '1px solid #d9d9d9',
      borderRadius: 4,
      padding: '8px 12px',
      fontSize: 12,
      maxHeight: 200,
      overflowY: 'auto',
      margin: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    }}
  >
    {JSON.stringify(value, null, 2)}
  </pre>
);

const AuditLogsPage: React.FC = () => {
  const { t } = useTranslation(['admin', 'common']);

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [actionFilter, setActionFilter] = useState<string | undefined>();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>();
  const [actorFilter, setActorFilter] = useState<number | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [selected, setSelected] = useState<AuditLog | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    usersService.getAll().then(setUsers).catch(() => {});
  }, []);

  const load = useCallback(async (p = page, ps = pageSize) => {
    const query: AuditQuery = {
      page: p,
      limit: ps,
      action: actionFilter,
      entityType: entityTypeFilter,
      actorId: actorFilter,
      from: dateRange ? dateRange[0].startOf('day').toISOString() : undefined,
      to: dateRange ? dateRange[1].endOf('day').toISOString() : undefined,
    };
    try {
      setLoading(true);
      const data = await auditService.findAll(query);
      setLogs(data.items);
      setTotal(data.total);
    } catch {
      message.error(t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, actionFilter, entityTypeFilter, actorFilter, dateRange, t]);

  useEffect(() => {
    load(page, pageSize);
  }, [page, pageSize, actionFilter, entityTypeFilter, actorFilter, dateRange]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPage(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 20);
  };

  const clearFilters = () => {
    setActionFilter(undefined);
    setEntityTypeFilter(undefined);
    setActorFilter(undefined);
    setDateRange(null);
    setPage(1);
  };

  const hasFilters = actionFilter || entityTypeFilter || actorFilter || dateRange;

  const columns: ColumnsType<AuditLog> = [
    {
      title: t('admin:auditLogs.when'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 155,
      render: (date) => (
        <Text style={{ fontSize: 12 }}>
          {dayjs(date).format('YYYY-MM-DD HH:mm:ss')}
        </Text>
      ),
    },
    {
      title: t('admin:auditLogs.actor'),
      key: 'actor',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ fontSize: 13 }}>{record.actorLogin}</Text>
          <Tag color={record.actorRole === 'admin' ? 'red' : record.actorRole === 'departmenthead' ? 'blue' : 'green'} style={{ fontSize: 11 }}>
            {record.actorRole}
          </Tag>
        </Space>
      ),
    },
    {
      title: t('admin:auditLogs.action'),
      dataIndex: 'action',
      key: 'action',
      width: 130,
      render: (action) => (
        <Tag color={ACTION_COLORS[action] || 'default'}>
          {action}
        </Tag>
      ),
    },
    {
      title: t('admin:auditLogs.entity'),
      key: 'entity',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tag color={ENTITY_COLORS[record.entityType] || 'default'} style={{ fontSize: 11 }}>
            {record.entityType}
          </Tag>
          <Text type="secondary" style={{ fontSize: 12 }}>#{record.entityId}</Text>
        </Space>
      ),
    },
    {
      title: t('admin:auditLogs.reason'),
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) =>
        reason ? (
          <Tooltip title={reason}>
            <Text ellipsis style={{ maxWidth: 160 }}>{reason}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => { setSelected(record); setDetailVisible(true); }}
        />
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ paddingBottom: 24 }}>
        <div style={{ marginBottom: 20 }}>
          <Title level={3} style={{ margin: 0 }}>{t('admin:auditLogs.title')}</Title>
          <Text type="secondary">{t('admin:auditLogs.desc')}</Text>
        </div>

        <Card style={{ marginBottom: 16 }}>
          <Space wrap>
            <Select
              allowClear
              placeholder={t('admin:auditLogs.filterAction')}
              value={actionFilter}
              onChange={(v) => { setActionFilter(v); setPage(1); }}
              style={{ width: 170 }}
              options={KNOWN_ACTIONS.map((a) => ({ value: a, label: a }))}
            />
            <Select
              allowClear
              placeholder={t('admin:auditLogs.filterEntity')}
              value={entityTypeFilter}
              onChange={(v) => { setEntityTypeFilter(v); setPage(1); }}
              style={{ width: 210 }}
              options={KNOWN_ENTITY_TYPES.map((e) => ({ value: e, label: e }))}
            />
            <Select
              allowClear
              showSearch
              placeholder={t('admin:auditLogs.filterActor')}
              value={actorFilter}
              onChange={(v) => { setActorFilter(v); setPage(1); }}
              style={{ width: 200 }}
              filterOption={(input, opt) =>
                (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={users.map((u) => ({
                value: u.id,
                label: u.userInfo
                  ? `${u.userInfo.firstName} ${u.userInfo.lastName} (${u.login})`
                  : u.login,
              }))}
            />
            <RangePicker
              value={dateRange}
              onChange={(v) => { setDateRange(v as any); setPage(1); }}
            />
            {hasFilters && (
              <Button icon={<ClearOutlined />} onClick={clearFilters}>
                {t('admin:auditLogs.clearFilters')}
              </Button>
            )}
          </Space>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={logs}
            loading={loading}
            rowKey="id"
            size="small"
            onChange={handleTableChange}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: ['20', '50', '100'],
              showTotal: (n) => t('admin:auditLogs.totalItems', { total: n }),
            }}
            scroll={{ x: 900 }}
          />
        </Card>

        <Modal
          title={t('admin:auditLogs.detailTitle')}
          open={detailVisible}
          onCancel={() => setDetailVisible(false)}
          footer={
            <Button onClick={() => setDetailVisible(false)}>
              {t('common:button.close')}
            </Button>
          }
          width={680}
        >
          {selected && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Descriptions bordered size="small" column={2}>
                <Descriptions.Item label={t('admin:auditLogs.when')} span={2}>
                  {dayjs(selected.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label={t('admin:auditLogs.actor')}>
                  {selected.actorLogin}
                </Descriptions.Item>
                <Descriptions.Item label={t('common:label.role')}>
                  <Tag color={ACTION_COLORS[selected.actorRole] || 'default'}>
                    {selected.actorRole}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('admin:auditLogs.action')}>
                  <Tag color={ACTION_COLORS[selected.action] || 'default'}>
                    {selected.action}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label={t('admin:auditLogs.entity')}>
                  <Tag color={ENTITY_COLORS[selected.entityType] || 'default'}>
                    {selected.entityType}
                  </Tag>
                  {' '}#{selected.entityId}
                </Descriptions.Item>
                {selected.reason && (
                  <Descriptions.Item label={t('admin:auditLogs.reason')} span={2}>
                    {selected.reason}
                  </Descriptions.Item>
                )}
                {selected.ipAddress && (
                  <Descriptions.Item label="IP" span={2}>
                    <Text code>{selected.ipAddress}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              {selected.before && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>
                    {t('admin:auditLogs.before')}
                  </Text>
                  <JsonBlock value={selected.before} />
                </div>
              )}

              {selected.after && (
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 6 }}>
                    {t('admin:auditLogs.after')}
                  </Text>
                  <JsonBlock value={selected.after} />
                </div>
              )}
            </Space>
          )}
        </Modal>
      </div>
    </MainLayout>
  );
};

export default AuditLogsPage;
