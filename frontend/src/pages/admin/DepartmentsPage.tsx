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
import DepartmentFormModal from '../../components/features/admin/DepartmentFormModal';
import departmentsService from '../../services/departments.service';
import usersService from '../../services/users.service';
import type { Department, User } from '../../types';
import './DepartmentsPage.scss';

const DepartmentsPage = () => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>(
    []
  );
  const [searchText, setSearchText] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [departmentHeads, setDepartmentHeads] = useState<User[]>([]);

  useEffect(() => {
    fetchDepartments();
    fetchDepartmentHeads();
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

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentsService.getAll();
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (error) {
      message.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentHeads = async () => {
    try {
      const data = await usersService.getAll();
      const heads = data.filter((user) => user.role.name === 'departmenthead');
      setDepartmentHeads(heads);
    } catch (error) {
      message.error('Failed to fetch department heads');
    }
  };

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
    const department = departments.find((dept) => dept.id === id);
    if (department) {
      setEditingDepartment(department);
      setModalOpen(true);
    }
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
          await departmentsService.delete(id);
          message.success('Department deleted successfully');
          fetchDepartments();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to delete department'
          );
        }
      },
    });
  };

  const handleAddNew = () => {
    setEditingDepartment(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingDepartment(null);
  };

  const handleModalSuccess = () => {
    fetchDepartments();
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

        <DepartmentFormModal
          open={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          department={editingDepartment}
          departmentHeads={departmentHeads}
        />
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
