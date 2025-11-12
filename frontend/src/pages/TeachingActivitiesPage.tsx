import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Tooltip,
  Empty,
  Input,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../components/layout/MainLayout';
import './TeachingActivitiesPage.scss';

interface Activity {
  id: number;
  courseName: string;
  groups: string[];
  lectureHours: number;
  practiceHours: number;
  labHours: number;
  seminarHours: number;
  advisingHours: number;
  totalHours: number;
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
  submittedAt?: string;
  validatedAt?: string;
}

const TeachingActivitiesPage = () => {
  const [loading] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    // TODO: Fetch activities from API
    // For now, using empty array
    setActivities([]);
    setFilteredActivities([]);
  }, []);

  useEffect(() => {
    let filtered = activities;

    if (searchText) {
      filtered = filtered.filter((activity) =>
        activity.courseName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((activity) => activity.status === statusFilter);
    }

    setFilteredActivities(filtered);
  }, [searchText, statusFilter, activities]);

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

  const columns: ColumnsType<Activity> = [
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: string[]) => (
        <>
          {groups.map((group) => (
            <Tag key={group} color="blue">
              {group}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Lecture',
      dataIndex: 'lectureHours',
      key: 'lectureHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: 'Practice',
      dataIndex: 'practiceHours',
      key: 'practiceHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: 'Lab',
      dataIndex: 'labHours',
      key: 'labHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: 'Total',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.totalHours - b.totalHours,
      render: (hours) => <strong>{hours}h</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Submitted', value: 'submitted' },
        { text: 'Validated', value: 'validated' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record.id)}
            />
          </Tooltip>
          {record.status === 'draft' && (
            <>
              <Tooltip title="Edit">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record.id)}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (id: number) => {
    console.log('View activity:', id);
    // TODO: Implement view modal
  };

  const handleEdit = (id: number) => {
    console.log('Edit activity:', id);
    // TODO: Implement edit modal
  };

  const handleDelete = (id: number) => {
    console.log('Delete activity:', id);
    // TODO: Implement delete confirmation
  };

  const handleAddNew = () => {
    console.log('Add new activity');
    // TODO: Implement add modal
  };

  return (
    <MainLayout>
      <div className="teaching-activities-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Teaching Activities</h1>
            <p className="page-subtitle">
              Manage and track your teaching workload
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            className="add-btn"
          >
            Add Activity
          </Button>
        </div>

        <Card className="activities-card">
          <div className="filters-section">
            <Input
              placeholder="Search by course name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="status-filter"
              allowClear
              options={[
                { label: 'Draft', value: 'draft' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'Validated', value: 'validated' },
                { label: 'Rejected', value: 'rejected' },
              ]}
            />
          </div>

          <Table
            columns={columns}
            dataSource={filteredActivities}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} activities`,
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: (
                <Empty
                  description="No teaching activities yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddNew}
                  >
                    Add Your First Activity
                  </Button>
                </Empty>
              ),
            }}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default TeachingActivitiesPage;
