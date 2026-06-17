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
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import DepartmentFormModal from '../../components/features/admin/DepartmentFormModal';
import departmentsService from '../../services/departments.service';
import usersService from '../../services/users.service';
import type { Department, User } from '../../types';
import './DepartmentsPage.scss';

const DepartmentsPage = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchText, setSearchText] = useState('');

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
    } catch {
      message.error(t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentHeads = async () => {
    try {
      const data = await usersService.getAll();
      setDepartmentHeads(data.filter((user) => user.role.name === 'departmenthead'));
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const columns: ColumnsType<Department> = [
    {
      title: t('admin:departments.name'),
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
      title: t('admin:departments.head'),
      key: 'head',
      render: (_, record) => {
        if (record.head?.userInfo) {
          const { firstName, lastName } = record.head.userInfo;
          return (
            <span>
              <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              {`${firstName} ${lastName}`}
            </span>
          );
        }
        return <Tag color="default">{t('admin:departments.notAssigned')}</Tag>;
      },
    },
    {
      title: t('admin:departments.contact'),
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
              {t('admin:departments.roomPrefix')} {record.roomNumber}
            </span>
          )}
          {!record.phone && !record.roomNumber && (
            <span className="text-secondary">{t('common:label.noData')}</span>
          )}
        </Space>
      ),
    },
    {
      title: t('admin:dashboard.teachers'),
      key: 'teachers',
      width: 100,
      align: 'center',
      render: (_, record) => <Tag color="blue">{record._count?.teachers || 0}</Tag>,
      sorter: (a, b) => (a._count?.teachers || 0) - (b._count?.teachers || 0),
    },
    {
      title: t('admin:dashboard.courses'),
      key: 'courses',
      width: 100,
      align: 'center',
      render: (_, record) => <Tag color="green">{record._count?.courses || 0}</Tag>,
      sorter: (a, b) => (a._count?.courses || 0) - (b._count?.courses || 0),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('admin:departments.editTitle')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
            />
          </Tooltip>
          <Tooltip title={t('admin:departments.deleteTitle')}>
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
      title: t('admin:departments.deleteTitle'),
      content: t('admin:departments.deleteConfirm'),
      okText: t('common:button.delete'),
      okType: 'danger',
      onOk: async () => {
        try {
          await departmentsService.delete(id);
          message.success(t('admin:departments.deleteSuccess'));
          fetchDepartments();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('admin:departments.deleteFailed'));
        }
      },
    });
  };

  return (
    <MainLayout>
      <div className="departments-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('admin:departments.title')}</h1>
            <p className="page-subtitle">{t('admin:departments.desc')}</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => { setEditingDepartment(null); setModalOpen(true); }}
            className="add-btn"
          >
            {t('admin:departments.addDepartment')}
          </Button>
        </div>

        <Card className="departments-card">
          <div className="filters-section">
            <Input
              placeholder={t('admin:departments.search')}
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
              showTotal: (total) => t('admin:departments.totalDepartments', { total }),
            }}
            scroll={{ x: 1000 }}
          />
        </Card>

        <DepartmentFormModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditingDepartment(null); }}
          onSuccess={fetchDepartments}
          department={editingDepartment}
          departmentHeads={departmentHeads}
        />
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
