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
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import './UsersPage.scss';

interface User {
  id: number;
  login: string;
  role: {
    id: number;
    name: string;
  };
  isActive: boolean;
  userInfo?: {
    firstName: string;
    lastName: string;
    email1?: string;
  };
  createdAt: string;
}

const UsersPage = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    // TODO: Fetch users from API
    setUsers([]);
    setFilteredUsers([]);
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
              onClick={() => handleEdit(record.id)}
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

  const handleEdit = (id: number) => {
    console.log('Edit user:', id);
    // TODO: Implement edit modal
    message.info('Edit user functionality coming soon');
  };

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    Modal.confirm({
      title: `${currentStatus ? 'Deactivate' : 'Activate'} User`,
      content: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`,
      onOk: async () => {
        try {
          // TODO: API call to toggle status
          message.success(
            `User ${currentStatus ? 'deactivated' : 'activated'} successfully`
          );
        } catch (error) {
          message.error('Failed to update user status');
        }
      },
    });
  };

  const handleAddNew = () => {
    console.log('Add new user');
    // TODO: Implement add modal
    message.info('Add user functionality coming soon');
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
      </div>
    </MainLayout>
  );
};

export default UsersPage;
