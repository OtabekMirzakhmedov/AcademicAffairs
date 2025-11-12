import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tooltip,
  Input,
  Modal,
  message,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BankOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import './DepartmentsPage.scss';

interface Department {
  id: number;
  name: string;
  head?: {
    id: number;
    login: string;
    userInfo?: {
      firstName: string;
      lastName: string;
    };
  };
  phone?: string;
  roomNumber?: string;
  _count?: {
    teachers: number;
    courses: number;
  };
  createdAt: string;
}

const DepartmentsPage = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    []
  );
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // TODO: Fetch departments from API
    setDepartments([]);
    setFilteredDepartments([]);
  }, []);

  useEffect(() => {
    let filtered = departments;

    if (searchText) {
      filtered = filtered.filter((dept) =>
        dept.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
  }, [searchText, departments]);

  const columns: ColumnsType<Department> = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <span className="department-name">
          <BankOutlined /> {name}
        </span>
      ),
    },
    {
      title: 'Department Head',
      key: 'head',
      render: (_, record) => {
        if (record.head && record.head.userInfo) {
          const { firstName, lastName } = record.head.userInfo;
          return (
            <span>
              <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              {`${firstName} ${lastName}`}
            </span>
          );
        }
        return <Tag color="default">Not Assigned</Tag>;
      },
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.phone && (
            <span>
              <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              {record.phone}
            </span>
          )}
          {record.roomNumber && (
            <span>
              <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Room {record.roomNumber}
            </span>
          )}
          {!record.phone && !record.roomNumber && (
            <span className="text-secondary">No contact info</span>
          )}
        </Space>
      ),
    },
    {
      title: 'Teachers',
      key: 'teachers',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record._count?.teachers || 0}</Tag>
      ),
      sorter: (a, b) => (a._count?.teachers || 0) - (b._count?.teachers || 0),
    },
    {
      title: 'Courses',
      key: 'courses',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="green">{record._count?.courses || 0}</Tag>
      ),
      sorter: (a, b) => (a._count?.courses || 0) - (b._count?.courses || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Department">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete Department">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleEdit = (id: number) => {
    console.log('Edit department:', id);
    // TODO: Implement edit modal
    message.info('Edit department functionality coming soon');
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Delete Department',
      content:
        'Are you sure you want to delete this department? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: API call to delete department
          message.success('Department deleted successfully');
        } catch (error) {
          message.error('Failed to delete department');
        }
      },
    });
  };

  const handleAddNew = () => {
    console.log('Add new department');
    // TODO: Implement add modal
    message.info('Add department functionality coming soon');
  };

  return (
    <MainLayout>
      <div className="departments-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Departments Management</h1>
            <p className="page-subtitle">
              Manage departments, heads, and organizational structure
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            className="add-btn"
          >
            Add Department
          </Button>
        </div>

        <Card className="departments-card">
          <div className="filters-section">
            <Input
              placeholder="Search by department name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredDepartments}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} departments`,
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
