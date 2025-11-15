import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  message,
  Modal,
  Tag,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import TeacherFormModal from '../../components/features/department-head/TeacherFormModal';
import TeacherEditModal from '../../components/features/department-head/TeacherEditModal';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import type { User, Department } from '../../types';
import { useAuthStore } from '../../store/authStore';

const TeachersManagementPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Department state
  const [department, setDepartment] = useState<Department | null>(null);

  // Teachers state
  const [teachers, setTeachers] = useState<User[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [teacherEditModalOpen, setTeacherEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

  useEffect(() => {
    fetchDepartment();
  }, [user]);

  useEffect(() => {
    if (department) {
      fetchTeachers();
    }
  }, [department]);

  useEffect(() => {
    filterTeachers();
  }, [searchText, teachers]);

  const fetchDepartment = async () => {
    try {
      if (!user?.id) return;
      // Department heads need to find their department by headId
      const allDepartments = await departmentsService.getAll();
      const myDepartment = allDepartments.find((dept) => dept.headId === user.id);

      if (myDepartment) {
        setDepartment(myDepartment);
      } else {
        message.warning('You are not assigned as head of any department');
      }
    } catch (error) {
      message.error('Failed to fetch department');
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const allUsers = await usersService.getAll();
      // Show only department teachers
      const departmentTeachers = allUsers.filter(
        (u) => u.role.name === 'teacher' && u.teacherInfo?.departmentId === department?.id
      );
      setTeachers(departmentTeachers);
      setFilteredTeachers(departmentTeachers);
    } catch (error) {
      message.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    const filtered = teachers.filter((teacher) => {
      const name = `${teacher.userInfo?.firstName} ${teacher.userInfo?.lastName}`.toLowerCase();
      const login = teacher.login.toLowerCase();
      const email = (teacher.userInfo?.email1 || '').toLowerCase();
      const search = searchText.toLowerCase();
      return name.includes(search) || login.includes(search) || email.includes(search);
    });
    setFilteredTeachers(filtered);
  };

  const handleAddTeacher = () => {
    setTeacherModalOpen(true);
  };

  const handleTeacherModalSuccess = () => {
    fetchTeachers();
  };

  const handleEditTeacher = (teacher: User) => {
    setEditingTeacher(teacher);
    setTeacherEditModalOpen(true);
  };

  const handleTeacherEditModalSuccess = () => {
    fetchTeachers();
  };

  const handleDeleteTeacher = (id: number) => {
    Modal.confirm({
      title: 'Delete Teacher',
      content: 'Are you sure you want to delete this teacher? This will deactivate their account.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await usersService.delete(id);
          message.success('Teacher deleted successfully');
          fetchTeachers();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to delete teacher'
          );
        }
      },
    });
  };

  const teachersColumns: ColumnsType<User> = [
    {
      title: 'Teacher Name',
      key: 'name',
      render: (_, record) => (
        <span>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {`${record.userInfo?.firstName} ${record.userInfo?.lastName}`}
        </span>
      ),
      sorter: (a, b) =>
        `${a.userInfo?.firstName} ${a.userInfo?.lastName}`.localeCompare(
          `${b.userInfo?.firstName} ${b.userInfo?.lastName}`
        ),
    },
    {
      title: 'Username',
      dataIndex: 'login',
      key: 'login',
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => (
        <span>
          {record.userInfo?.email1 && (
            <>
              <MailOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
              {record.userInfo.email1}
            </>
          )}
        </span>
      ),
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (_, record) => (
        <span>
          {record.userInfo?.phone1 && (
            <>
              <PhoneOutlined style={{ marginRight: 4, color: '#8c8c8c' }} />
              {record.userInfo.phone1}
            </>
          )}
        </span>
      ),
    },
    {
      title: 'Employment Type',
      key: 'employmentType',
      render: (_, record) => {
        const type = record.teacherInfo?.employmentType;
        const colors: Record<string, string> = {
          'full-time': 'green',
          'part-time': 'blue',
          'contract': 'orange',
        };
        return type ? (
          <Tag color={colors[type] || 'default'}>
            {type.replace('-', ' ').toUpperCase()}
          </Tag>
        ) : (
          <Tag>Not Set</Tag>
        );
      },
    },
    {
      title: 'Teaching Hours',
      key: 'mandatoryHours',
      render: (_, record) => (
        <span>
          {record.teacherInfo?.mandatoryHoursPerPeriod
            ? `${record.teacherInfo.mandatoryHoursPerPeriod}h`
            : '-'}
        </span>
      ),
    },
    {
      title: 'Extracurricular',
      key: 'extracurricular',
      render: (_, record) => (
        <span>
          {record.teacherInfo?.mandatoryExtracurricularHours
            ? `${record.teacherInfo.mandatoryExtracurricularHours}h`
            : '-'}
        </span>
      ),
    },
    {
      title: 'Articles Required',
      key: 'articles',
      render: (_, record) => {
        const conference = record.teacherInfo?.mandatoryConferenceArticles || 0;
        const national = record.teacherInfo?.mandatoryNationalArticles || 0;
        const scopus = record.teacherInfo?.mandatoryScopusArticles || 0;
        const total = conference + national + scopus;
        return total > 0 ? (
          <span title={`Conference: ${conference}, National: ${national}, Scopus: ${scopus}`}>
            {total} ({conference}C / {national}N / {scopus}S)
          </span>
        ) : '-';
      },
    },
    {
      title: 'Documentation',
      key: 'documentation',
      render: (_, record) => (
        <span>
          {record.teacherInfo?.mandatoryDocumentation || '-'}
        </span>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTeacher(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTeacher(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <div>
              <h2 style={{ margin: 0 }}>
                <UserOutlined style={{ marginRight: 8 }} />
                Teachers Management
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 'normal', color: '#8c8c8c' }}>
                Manage teachers in {department?.name || 'your department'}
              </p>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTeacher}
              size="large"
            >
              Add Teacher
            </Button>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search teachers by name, username, or email..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
              allowClear
            />
          </div>

          <Table
            columns={teachersColumns}
            dataSource={filteredTeachers}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} teachers`,
            }}
            scroll={{ x: 1400 }}
          />
        </Card>

        {/* Teacher Add Modal */}
        <TeacherFormModal
          open={teacherModalOpen}
          onCancel={() => setTeacherModalOpen(false)}
          onSuccess={() => {
            setTeacherModalOpen(false);
            handleTeacherModalSuccess();
          }}
          departmentId={department?.id}
        />

        {/* Teacher Edit Modal */}
        <TeacherEditModal
          open={teacherEditModalOpen}
          teacher={editingTeacher}
          onCancel={() => {
            setTeacherEditModalOpen(false);
            setEditingTeacher(null);
          }}
          onSuccess={() => {
            setTeacherEditModalOpen(false);
            setEditingTeacher(null);
            handleTeacherEditModalSuccess();
          }}
        />
      </div>
    </MainLayout>
  );
};

export default TeachersManagementPage;
