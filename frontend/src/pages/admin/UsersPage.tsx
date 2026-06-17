import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Tooltip,
  Input,
  Select,
  Modal,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import UserFormModal from '../../components/features/admin/UserFormModal';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import api from '../../config/api';
import type { User, Role, Department } from '../../types';
import './UsersPage.scss';

const UsersPage = () => {
  const { t } = useTranslation(['admin', 'common', 'domain']);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchDepartments();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchText) {
      filtered = filtered.filter(
        (user) =>
          user.login.toLowerCase().includes(searchText.toLowerCase()) ||
          user.userInfo?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.userInfo?.lastName?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((user) => user.role.name === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchText, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch {
      message.error(t('admin:users.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      setRoles(response.data.data);
    } catch {
      message.error(t('admin:users.rolesFetchFailed'));
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentsService.getAll();
      setDepartments(data);
    } catch {
      message.error(t('admin:users.departmentsFetchFailed'));
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'red';
      case 'departmenthead': return 'blue';
      case 'teacher': return 'green';
      default: return 'default';
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: t('admin:users.login'),
      dataIndex: 'login',
      key: 'login',
      sorter: (a, b) => a.login.localeCompare(b.login),
      render: (login) => (
        <span className="username">
          <UserOutlined /> {login}
        </span>
      ),
    },
    {
      title: t('admin:users.fullName'),
      key: 'fullName',
      render: (_, record) => {
        const { firstName, lastName } = record.userInfo || {};
        return firstName && lastName
          ? `${firstName} ${lastName}`
          : <span className="text-secondary">{t('common:label.notSet')}</span>;
      },
    },
    {
      title: t('admin:users.email'),
      key: 'email',
      render: (_, record) =>
        record.userInfo?.email1 || <span className="text-secondary">{t('common:label.notSet')}</span>,
    },
    {
      title: t('admin:users.role'),
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (roleName) => (
        <Tag color={getRoleColor(roleName)}>{t(`domain:role.${roleName}`)}</Tag>
      ),
      filters: [
        { text: t('domain:role.admin'), value: 'admin' },
        { text: t('domain:role.departmenthead'), value: 'departmenthead' },
        { text: t('domain:role.teacher'), value: 'teacher' },
      ],
      onFilter: (value, record) => record.role.name === value,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            {t('domain:status.active')}
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error">
            {t('domain:status.inactive')}
          </Tag>
        ),
      filters: [
        { text: t('domain:status.active'), value: true },
        { text: t('domain:status.inactive'), value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('admin:users.editTitle')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? t('admin:users.deactivate') : t('admin:users.activate')}>
            <Button
              type="text"
              size="small"
              danger={record.isActive}
              icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record.id, record.isActive)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    Modal.confirm({
      title: t('admin:users.toggleStatusTitle', {
        action: currentStatus ? t('admin:users.deactivate') : t('admin:users.activate'),
      }),
      content: currentStatus ? t('admin:users.deactivateConfirm') : t('admin:users.activateConfirm'),
      onOk: async () => {
        try {
          await usersService.toggleStatus(id);
          message.success(
            currentStatus ? t('admin:users.deactivateSuccess') : t('admin:users.activateSuccess')
          );
          fetchUsers();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('admin:users.statusUpdateFailed'));
        }
      },
    });
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="users-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('admin:users.title')}</h1>
            <p className="page-subtitle">{t('admin:users.desc')}</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            className="add-btn"
          >
            {t('admin:users.addUser')}
          </Button>
        </div>

        <Card className="users-card">
          <div className="filters-section">
            <Input
              placeholder={t('admin:users.search')}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Select
              placeholder={t('admin:users.roleFilter')}
              value={roleFilter}
              onChange={setRoleFilter}
              className="role-filter"
              allowClear
              options={[
                { label: t('domain:role.admin'), value: 'admin' },
                { label: t('domain:role.departmenthead'), value: 'departmenthead' },
                { label: t('domain:role.teacher'), value: 'teacher' },
              ]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('admin:users.totalUsers', { total }),
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        <UserFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingUser(null); }}
          onSuccess={fetchUsers}
          user={editingUser}
          roles={roles}
          departments={departments}
        />
      </div>
    </MainLayout>
  );
};

export default UsersPage;
