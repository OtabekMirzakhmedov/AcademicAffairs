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
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import TeacherFormModal from '../../components/features/department-head/TeacherFormModal';
import TeacherEditModal from '../../components/features/department-head/TeacherEditModal';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import type { User, Department } from '../../types';
import { useAuthStore } from '../../store/authStore';

const TeachersManagementPage = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation(['head', 'common', 'domain']);
  const [loading, setLoading] = useState(false);

  const [department, setDepartment] = useState<Department | null>(null);

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
      const allDepartments = await departmentsService.getAll();
      const myDepartment = allDepartments.find((dept) => dept.headId === user.id);
      if (myDepartment) {
        setDepartment(myDepartment);
      } else {
        message.warning(t('head:activities.noDepartmentMsg'));
      }
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const allUsers = await usersService.getAll();
      const departmentTeachers = allUsers.filter(
        (u) => u.role.name === 'teacher' && u.teacherInfo?.departmentId === department?.id
      );
      setTeachers(departmentTeachers);
      setFilteredTeachers(departmentTeachers);
    } catch {
      message.error(t('common:message.failedToLoad'));
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

  const handleDeleteTeacher = (id: number) => {
    Modal.confirm({
      title: t('head:teachers.deleteTitle'),
      content: t('head:teachers.deleteConfirm'),
      okText: t('common:button.delete'),
      okType: 'danger',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await usersService.delete(id);
          message.success(t('head:teachers.deleteSuccess'));
          fetchTeachers();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('head:teachers.deleteFailed'));
        }
      },
    });
  };

  const teachersColumns: ColumnsType<User> = [
    {
      title: t('head:teachers.teacherName'),
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
      title: t('head:teachers.username'),
      dataIndex: 'login',
      key: 'login',
    },
    {
      title: t('head:teachers.primaryEmail'),
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
      title: t('head:dashboard.phone'),
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
      title: t('head:requirements.employmentType'),
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
            {t(`domain:employment.${type}`, { defaultValue: type })}
          </Tag>
        ) : (
          <Tag>{t('common:label.notSet')}</Tag>
        );
      },
    },
    {
      title: t('head:teachers.teachingHours'),
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
      title: t('head:teachers.extracurricular'),
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
      title: t('head:teachers.articlesRequired'),
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
      title: t('head:teachers.documentation'),
      key: 'documentation',
      render: (_, record) => (
        <span>{record.teacherInfo?.mandatoryDocumentation || '-'}</span>
      ),
    },
    {
      title: t('common:label.status'),
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'success' : 'error'}>
          {record.isActive ? t('domain:status.active') : t('domain:status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => { setEditingTeacher(record); setTeacherEditModalOpen(true); }}
          >
            {t('common:button.edit')}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTeacher(record.id)}
          >
            {t('common:button.delete')}
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
                {t('head:teachers.title')}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 'normal', color: '#8c8c8c' }}>
                {t('head:teachers.desc', { departmentName: department?.name || '' })}
              </p>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setTeacherModalOpen(true)}
              size="large"
            >
              {t('head:teachers.addTeacher')}
            </Button>
          }
        >
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder={t('head:teachers.search')}
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
              showTotal: (total) => t('head:teachers.totalTeachers', { total }),
            }}
            scroll={{ x: 1400 }}
          />
        </Card>

        <TeacherFormModal
          open={teacherModalOpen}
          onCancel={() => setTeacherModalOpen(false)}
          onSuccess={() => {
            setTeacherModalOpen(false);
            fetchTeachers();
          }}
          departmentId={department?.id}
        />

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
            fetchTeachers();
          }}
        />
      </div>
    </MainLayout>
  );
};

export default TeachersManagementPage;
