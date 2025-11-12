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
import MainLayout from '../../components/layout/MainLayout';
import UserFormModal from '../../components/features/admin/UserFormModal';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import api from '../../config/api';
import type { User, Role, Department } from '../../types';
import './UsersPage.scss';

const UsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  // Modal state
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
          user.userInfo?.firstName
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          user.userInfo?.lastName
            ?.toLowerCase()
            .includes(searchText.toLowerCase())
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
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/users/roles');
      setRoles(response.data.data);
    } catch (error) {
      message.error('Failed to fetch roles');
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentsService.getAll();
      setDepartments(data);
    } catch (error) {
      message.error('Failed to fetch departments');
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'red';
      case 'departmenthead':
        return 'blue';
      case 'teacher':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'Administrator';
      case 'departmenthead':
        return 'Department Head';
      case 'teacher':
        return 'Teacher';
      default:
        return roleName;
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Username',
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
      title: 'Full Name',
      key: 'fullName',
      render: (_, record) => {
        const { firstName, lastName } = record.userInfo || {};
        return firstName && lastName
          ? `${firstName} ${lastName}`
          : <span className="text-secondary">Not set</span>;
      },
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) =>
        record.userInfo?.email1 || (
          <span className="text-secondary">Not set</span>
        ),
    },
    {
      title: 'Role',
      dataIndex: ['role', 'name'],
      key: 'role',
      render: (roleName) => (
        <Tag color={getRoleColor(roleName)}>{getRoleLabel(roleName)}</Tag>
      ),
      filters: [
        { text: 'Administrator', value: 'admin' },
        { text: 'Department Head', value: 'departmenthead' },
        { text: 'Teacher', value: 'teacher' },
      ],
      onFilter: (value, record) => record.role.name === value,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Active
          </Tag>
        ) : (
          <Tag icon={<StopOutlined />} color="error">
            Inactive
          </Tag>
        ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit User">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? 'Deactivate' : 'Activate'}>
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
      title: `${currentStatus ? 'Deactivate' : 'Activate'} User`,
      content: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`,
      onOk: async () => {
        try {
          await usersService.toggleStatus(id);
          message.success(
            `User ${currentStatus ? 'deactivated' : 'activated'} successfully`
          );
          fetchUsers();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to update user status'
          );
        }
      },
    });
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleModalSuccess = () => {
    fetchUsers();
  };

  return (
    <MainLayout>
      <div className="users-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users Management</h1>
            <p className="page-subtitle">
              Manage system users, roles, and permissions
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            className="add-btn"
          >
            Add User
          </Button>
        </div>

        <Card className="users-card">
          <div className="filters-section">
            <Input
              placeholder="Search by username, name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Select
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              className="role-filter"
              allowClear
              options={[
                { label: 'Administrator', value: 'admin' },
                { label: 'Department Head', value: 'departmenthead' },
                { label: 'Teacher', value: 'teacher' },
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
              showTotal: (total) => `Total ${total} users`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        <UserFormModal
          open={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          user={editingUser}
          roles={roles}
          departments={departments}
        />
      </div>
    </MainLayout>
  );
};

export default UsersPage;
