import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tooltip,
  Input,
  message,
  Modal,
  Tag,
} from 'antd';
import {
  BookOutlined,
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  LinkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import CourseFormModal from '../../components/features/department-head/CourseFormModal';
import TeacherAssignmentModal from '../../components/features/department-head/TeacherAssignmentModal';
import ProgramFormModal from '../../components/features/department-head/ProgramFormModal';
import coursesService from '../../services/courses.service';
import courseTeachersService from '../../services/course-teachers.service';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import teachingActivitiesService from '../../services/teaching-activities.service';
import programsService from '../../services/programs.service';
import type { Course, User, CourseTeacher, AcademicPeriod, Department, TeachingActivity, Program } from '../../types';
import { useAuthStore } from '../../store/authStore';
import './DepartmentActivitiesPage.scss';

const DepartmentActivitiesPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation(['head', 'common', 'domain']);
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);

  const [department, setDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseSearchText, setCourseSearchText] = useState('');
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [teachers, setTeachers] = useState<User[]>([]);

  const [assignments, setAssignments] = useState<CourseTeacher[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<CourseTeacher[]>([]);
  const [assignmentSearchText, setAssignmentSearchText] = useState('');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CourseTeacher | null>(null);

  const [submissions, setSubmissions] = useState<TeachingActivity[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<TeachingActivity[]>([]);
  const [submissionSearchText, setSubmissionSearchText] = useState('');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [programSearchText, setProgramSearchText] = useState('');
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const [academicPeriods] = useState<AcademicPeriod[]>([
    {
      id: 1,
      academicYear: '2024-2025',
      semester: 1,
      teachingWeek: 10,
      isActive: true,
      startDate: '2024-09-01',
      endDate: '2025-01-15',
      createdAt: '',
      updatedAt: '',
    },
  ]);

  useEffect(() => {
    fetchDepartment();
  }, [user?.id]);

  useEffect(() => {
    if (department) {
      fetchCourses();
      fetchTeachers();
      fetchAssignments();
      fetchSubmissions();
      fetchPrograms();
    }
  }, [department]);

  useEffect(() => {
    let filtered = courses;
    if (courseSearchText) {
      filtered = filtered.filter((course) =>
        course.name.toLowerCase().includes(courseSearchText.toLowerCase())
      );
    }
    setFilteredCourses(filtered);
  }, [courseSearchText, courses]);

  useEffect(() => {
    let filtered = assignments;
    if (assignmentSearchText) {
      filtered = filtered.filter(
        (assignment) =>
          assignment.course?.name.toLowerCase().includes(assignmentSearchText.toLowerCase()) ||
          assignment.teacher?.userInfo?.firstName.toLowerCase().includes(assignmentSearchText.toLowerCase()) ||
          assignment.teacher?.userInfo?.lastName.toLowerCase().includes(assignmentSearchText.toLowerCase())
      );
    }
    setFilteredAssignments(filtered);
  }, [assignmentSearchText, assignments]);

  useEffect(() => {
    let filtered = submissions;
    if (submissionSearchText) {
      filtered = filtered.filter(
        (submission) =>
          submission.course?.name.toLowerCase().includes(submissionSearchText.toLowerCase()) ||
          submission.teacher?.userInfo?.firstName.toLowerCase().includes(submissionSearchText.toLowerCase()) ||
          submission.teacher?.userInfo?.lastName.toLowerCase().includes(submissionSearchText.toLowerCase())
      );
    }
    setFilteredSubmissions(filtered);
  }, [submissionSearchText, submissions]);

  useEffect(() => {
    let filtered = programs;
    if (programSearchText) {
      filtered = filtered.filter(
        (program) =>
          program.name.toLowerCase().includes(programSearchText.toLowerCase()) ||
          program.code.toLowerCase().includes(programSearchText.toLowerCase()) ||
          program.degreeLevel.toLowerCase().includes(programSearchText.toLowerCase())
      );
    }
    setFilteredPrograms(filtered);
  }, [programSearchText, programs]);

  const fetchDepartment = async () => {
    try {
      const allDepartments = await departmentsService.getAll();
      setDepartments(allDepartments);
      const myDepartment = allDepartments.find((dept) => dept.headId === user?.id);
      if (myDepartment) {
        setDepartment(myDepartment);
      } else {
        message.warning(t('head:activities.noDepartmentMsg'));
      }
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getAll();
      setCourses(data);
      setFilteredCourses(data);
    } catch {
      message.error(t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const allUsers = await usersService.getAll();
      setTeachers(allUsers.filter((u) => u.role.name === 'teacher'));
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await courseTeachersService.getAll();
      setAssignments(data);
      setFilteredAssignments(data);
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await teachingActivitiesService.getAllSubmitted();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await programsService.getAll();
      const departmentPrograms = data.filter((p) => p.departmentId === department?.id);
      setPrograms(departmentPrograms);
      setFilteredPrograms(departmentPrograms);
    } catch {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const handleDeleteCourse = (id: number) => {
    Modal.confirm({
      title: t('head:course.deleteTitle'),
      content: t('head:course.deleteConfirm'),
      okText: t('common:button.delete'),
      okType: 'danger',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await coursesService.delete(id);
          message.success(t('head:course.deleteSuccess'));
          fetchCourses();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('head:course.deleteFailed'));
        }
      },
    });
  };

  const handleDeleteAssignment = (id: number) => {
    Modal.confirm({
      title: t('head:assignment.remove'),
      content: t('head:assignment.removeConfirm'),
      okText: t('common:button.remove'),
      okType: 'danger',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await courseTeachersService.delete(id);
          message.success(t('head:assignment.removeSuccess'));
          fetchAssignments();
          fetchCourses();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('head:assignment.removeFailed'));
        }
      },
    });
  };

  const handleValidateSubmission = (submission: TeachingActivity) => {
    const name = `${submission.teacher?.userInfo?.firstName} ${submission.teacher?.userInfo?.lastName}`;
    Modal.confirm({
      title: t('head:activities.validateTitle'),
      content: t('head:activities.validateConfirm', { name, courseName: submission.course?.name }),
      okText: t('common:button.validate'),
      okType: 'primary',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await teachingActivitiesService.validate(submission.id);
          message.success(t('head:activities.validateSuccess'));
          fetchSubmissions();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('head:activities.validateFailed'));
        }
      },
    });
  };

  const handleRejectSubmission = (submission: TeachingActivity) => {
    const name = `${submission.teacher?.userInfo?.firstName} ${submission.teacher?.userInfo?.lastName}`;
    Modal.confirm({
      title: t('head:activities.rejectTitle'),
      content: `${t('head:activities.rejectConfirm', { name, courseName: submission.course?.name })} ${t('head:activities.rejectDesc')}`,
      okText: t('common:button.reject'),
      okType: 'danger',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await teachingActivitiesService.reject(submission.id);
          message.success(t('head:activities.rejectSuccess'));
          fetchSubmissions();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('head:activities.rejectFailed'));
        }
      },
    });
  };

  const handleDeleteProgram = (id: number) => {
    Modal.confirm({
      title: t('head:program.deleteTitle'),
      content: t('head:program.deleteConfirm'),
      okText: t('common:button.delete'),
      okType: 'danger',
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await programsService.delete(id);
          message.success(t('head:program.deleteSuccess'));
          fetchPrograms();
        } catch (error: any) {
          message.error(error?.response?.data?.error?.message || t('head:program.deleteFailed'));
        }
      },
    });
  };

  const handleDownloadProgramTemplate = async (program: Program) => {
    try {
      await programsService.downloadTemplate(program.id, program.code);
      message.success(t('head:program.downloadSuccess'));
    } catch (error: any) {
      message.error(error?.response?.data?.message || t('head:program.downloadFailed'));
    }
  };

  const coursesColumns: ColumnsType<Course> = [
    {
      title: t('head:activities.courseName'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <span className="course-name">
          <BookOutlined /> {name}
        </span>
      ),
    },
    {
      title: t('head:activities.assignedTeachers'),
      key: 'assignedTeachers',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record._count?.assignedTeachers || 0}</Tag>
      ),
      sorter: (a, b) => (a._count?.assignedTeachers || 0) - (b._count?.assignedTeachers || 0),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('head:course.editTitle')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => { setEditingCourse(record); setCourseModalOpen(true); }}
            />
          </Tooltip>
          <Tooltip title={t('head:course.deleteTitle')}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteCourse(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const assignmentsColumns: ColumnsType<CourseTeacher> = [
    {
      title: t('common:label.course'),
      key: 'course',
      render: (_, record) => (
        <span>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.course?.name}
        </span>
      ),
      sorter: (a, b) => (a.course?.name || '').localeCompare(b.course?.name || ''),
    },
    {
      title: t('domain:role.teacher'),
      key: 'teacher',
      render: (_, record) => (
        <span>
          <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {`${record.teacher?.userInfo?.firstName} ${record.teacher?.userInfo?.lastName}`}
        </span>
      ),
      sorter: (a, b) =>
        `${a.teacher?.userInfo?.firstName} ${a.teacher?.userInfo?.lastName}`.localeCompare(
          `${b.teacher?.userInfo?.firstName} ${b.teacher?.userInfo?.lastName}`
        ),
    },
    {
      title: t('common:label.academicPeriod'),
      key: 'period',
      render: (_, record) => (
        <span>
          {record.academicPeriod?.academicYear} - {t('teacher:dashboard.semester')} {record.academicPeriod?.semester}
          {record.academicPeriod?.isActive && (
            <Tag color="green" style={{ marginLeft: 8 }}>
              {t('domain:status.active')}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: t('common:label.groups'),
      key: 'groups',
      render: (_, record) => {
        if (!record.groups || record.groups.length === 0) {
          return <Tag>{t('common:label.noGroups')}</Tag>;
        }
        return (
          <Space size="small">
            {record.groups.map((group: string, index: number) => (
              <Tag key={index} color="blue">
                <TeamOutlined /> {group}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('head:assignment.editGroups')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => { setEditingAssignment(record); setAssignmentModalOpen(true); }}
            />
          </Tooltip>
          <Tooltip title={t('head:assignment.remove')}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteAssignment(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const submissionsColumns: ColumnsType<TeachingActivity> = [
    {
      title: t('domain:role.teacher'),
      key: 'teacher',
      render: (_, record) => (
        <span>
          <UserOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {`${record.teacher?.userInfo?.firstName} ${record.teacher?.userInfo?.lastName}`}
        </span>
      ),
      sorter: (a, b) =>
        `${a.teacher?.userInfo?.firstName} ${a.teacher?.userInfo?.lastName}`.localeCompare(
          `${b.teacher?.userInfo?.firstName} ${b.teacher?.userInfo?.lastName}`
        ),
    },
    {
      title: t('common:label.course'),
      key: 'course',
      render: (_, record) => (
        <span>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.course?.name}
        </span>
      ),
      sorter: (a, b) => (a.course?.name || '').localeCompare(b.course?.name || ''),
    },
    {
      title: t('common:label.groups'),
      key: 'groups',
      render: (_, record) => {
        if (!record.groups || record.groups.length === 0) {
          return <Tag>{t('common:label.noGroups')}</Tag>;
        }
        return (
          <Space size="small">
            {record.groups.map((group: string, index: number) => (
              <Tag key={index} color="blue">
                <TeamOutlined /> {group}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t('domain:hourType.lecture'),
      dataIndex: 'lectureHours',
      key: 'lectureHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours || 0}h`,
    },
    {
      title: t('domain:hourType.practice'),
      dataIndex: 'practiceHours',
      key: 'practiceHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours || 0}h`,
    },
    {
      title: t('domain:hourType.lab'),
      dataIndex: 'labHours',
      key: 'labHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours || 0}h`,
    },
    {
      title: t('common:label.total'),
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 90,
      align: 'center',
      sorter: (a, b) => (a.totalHours || 0) - (b.totalHours || 0),
      render: (hours) => <strong>{hours || 0}h</strong>,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => {
        const colors: Record<string, string> = {
          submitted: 'processing',
          validated: 'success',
          rejected: 'error',
        };
        return (
          <Tag color={colors[status] || 'default'}>
            {t(`domain:status.${status}`, { defaultValue: status })}
          </Tag>
        );
      },
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'submitted' && (
            <>
              <Tooltip title={t('head:activities.validateTooltip')}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleValidateSubmission(record)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  {t('common:button.validate')}
                </Button>
              </Tooltip>
              <Tooltip title={t('head:activities.rejectTooltip')}>
                <Button
                  danger
                  type="primary"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleRejectSubmission(record)}
                >
                  {t('common:button.reject')}
                </Button>
              </Tooltip>
            </>
          )}
          {record.status === 'validated' && (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              {t('domain:status.validated')}
            </Tag>
          )}
          {record.status === 'rejected' && (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              {t('domain:status.rejected')}
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  const programsColumns: ColumnsType<Program> = [
    {
      title: t('head:program.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <span className="program-name">
          <BookOutlined /> {name}
        </span>
      ),
    },
    {
      title: t('head:program.code'),
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: t('head:program.degreeLevel'),
      dataIndex: 'degreeLevel',
      key: 'degreeLevel',
      width: 150,
      sorter: (a, b) => a.degreeLevel.localeCompare(b.degreeLevel),
      render: (level) => {
        const colors: Record<string, string> = {
          BACHELOR: 'cyan',
          MASTER: 'purple',
          DOCTORATE: 'gold',
          UNDERGRADUATE: 'blue',
          GRADUATE: 'magenta',
        };
        return (
          <Tag color={colors[level] || 'default'}>
            {t(`domain:degreeLevel.${level}`, { defaultValue: level })}
          </Tag>
        );
      },
    },
    {
      title: t('head:program.duration'),
      dataIndex: 'durationYears',
      key: 'durationYears',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.durationYears - b.durationYears,
      render: (years) => `${years} ${t('common:label.hours', { defaultValue: 'yr' })}`,
    },
    {
      title: t('head:program.creditsRequired'),
      dataIndex: 'totalCreditsRequired',
      key: 'totalCreditsRequired',
      width: 140,
      align: 'center',
      sorter: (a, b) => Number(a.totalCreditsRequired) - Number(b.totalCreditsRequired),
      render: (credits) => <strong>{credits}</strong>,
    },
    {
      title: t('head:program.coursesCount'),
      key: 'coursesCount',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="green">{record._count?.programCourses || 0}</Tag>
      ),
      sorter: (a, b) => (a._count?.programCourses || 0) - (b._count?.programCourses || 0),
    },
    {
      title: t('common:label.status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? t('domain:status.active') : t('domain:status.inactive')}
        </Tag>
      ),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={t('head:program.viewDetails')}>
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/department/programs/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title={t('head:program.downloadTemplate')}>
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadProgramTemplate(record)}
            />
          </Tooltip>
          <Tooltip title={t('head:program.editTitle')}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => { setEditingProgram(record); setProgramModalOpen(true); }}
            />
          </Tooltip>
          <Tooltip title={t('head:program.deleteTitle')}>
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteProgram(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'courses',
      label: (
        <span>
          <BookOutlined />
          {t('head:activities.courses', { count: courses.length })}
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder={t('head:activities.searchCourses')}
              prefix={<SearchOutlined />}
              value={courseSearchText}
              onChange={(e) => setCourseSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingCourse(null); setCourseModalOpen(true); }}
              size="large"
            >
              {t('head:activities.addCourse')}
            </Button>
          </div>
          <Table
            columns={coursesColumns}
            dataSource={filteredCourses}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('head:activities.totalCourses', { total }),
            }}
          />
        </div>
      ),
    },
    {
      key: 'assignments',
      label: (
        <span>
          <LinkOutlined />
          {t('head:activities.courseAssignments', { count: assignments.length })}
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder={t('head:activities.searchAssignments')}
              prefix={<SearchOutlined />}
              value={assignmentSearchText}
              onChange={(e) => setAssignmentSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingAssignment(null); setAssignmentModalOpen(true); }}
              size="large"
            >
              {t('head:activities.assignTeacher')}
            </Button>
          </div>
          <Table
            columns={assignmentsColumns}
            dataSource={filteredAssignments}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('head:activities.totalAssignments', { total }),
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
    {
      key: 'submissions',
      label: (
        <span>
          <FileTextOutlined />
          {t('head:activities.hourSubmissions', { count: submissions.length })}
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder={t('head:activities.searchSubmissions')}
              prefix={<SearchOutlined />}
              value={submissionSearchText}
              onChange={(e) => setSubmissionSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
          </div>
          <Table
            columns={submissionsColumns}
            dataSource={filteredSubmissions}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('head:activities.totalSubmissions', { total }),
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
    {
      key: 'programs',
      label: (
        <span>
          <BookOutlined />
          {t('head:activities.programs', { count: programs.length })}
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder={t('head:activities.searchPrograms')}
              prefix={<SearchOutlined />}
              value={programSearchText}
              onChange={(e) => setProgramSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => { setEditingProgram(null); setProgramModalOpen(true); }}
              size="large"
            >
              {t('head:activities.addProgram')}
            </Button>
          </div>
          <Table
            columns={programsColumns}
            dataSource={filteredPrograms}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('head:activities.totalPrograms', { total }),
            }}
            scroll={{ x: 1200 }}
          />
        </div>
      ),
    },
  ];

  if (!department) {
    return (
      <MainLayout>
        <Card>
          <p>{t('head:activities.noDepartmentMsg')}</p>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="department-activities-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('head:activities.title')}</h1>
            <p className="page-subtitle">{t('head:activities.desc')}</p>
          </div>
        </div>

        <Card className="activities-card">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />
        </Card>

        <CourseFormModal
          open={courseModalOpen}
          onClose={() => setCourseModalOpen(false)}
          onSuccess={fetchCourses}
          course={editingCourse}
          departmentId={department.id}
          teachers={teachers}
          teachersLoading={loading}
          academicPeriods={academicPeriods}
          departments={departments}
          programs={programs}
        />

        <TeacherAssignmentModal
          open={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          onSuccess={() => { fetchAssignments(); fetchCourses(); }}
          assignment={editingAssignment}
          courses={courses}
          teachers={teachers}
          academicPeriods={academicPeriods}
        />

        <ProgramFormModal
          open={programModalOpen}
          onClose={() => setProgramModalOpen(false)}
          onSuccess={fetchPrograms}
          program={editingProgram}
          departmentId={department.id}
          departments={departments}
        />
      </div>
    </MainLayout>
  );
};

export default DepartmentActivitiesPage;
