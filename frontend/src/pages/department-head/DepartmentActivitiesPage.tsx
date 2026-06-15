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
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);

  // Department state
  const [department, setDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseSearchText, setCourseSearchText] = useState('');
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Teachers state (for course assignments)
  const [teachers, setTeachers] = useState<User[]>([]);

  // Assignments state
  const [assignments, setAssignments] = useState<CourseTeacher[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<CourseTeacher[]>([]);
  const [assignmentSearchText, setAssignmentSearchText] = useState('');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CourseTeacher | null>(null);

  // Submissions state
  const [submissions, setSubmissions] = useState<TeachingActivity[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<TeachingActivity[]>([]);
  const [submissionSearchText, setSubmissionSearchText] = useState('');

  // Programs state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [programSearchText, setProgramSearchText] = useState('');
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  // Academic periods (for now, we'll need to fetch this later)
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
          assignment.teacher?.userInfo?.firstName
            .toLowerCase()
            .includes(assignmentSearchText.toLowerCase()) ||
          assignment.teacher?.userInfo?.lastName
            .toLowerCase()
            .includes(assignmentSearchText.toLowerCase())
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
          submission.teacher?.userInfo?.firstName
            .toLowerCase()
            .includes(submissionSearchText.toLowerCase()) ||
          submission.teacher?.userInfo?.lastName
            .toLowerCase()
            .includes(submissionSearchText.toLowerCase())
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
        message.warning('You are not assigned as head of any department');
      }
    } catch (error) {
      message.error('Failed to fetch department information');
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesService.getAll();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error) {
      message.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const allUsers = await usersService.getAll();
      // Get ALL teachers for course assignments
      const allTeachers = allUsers.filter((u) => u.role.name === 'teacher');
      setTeachers(allTeachers);
    } catch (error) {
      message.error('Failed to fetch teachers');
    }
  };

  const fetchAssignments = async () => {
    try {
      const data = await courseTeachersService.getAll();
      setAssignments(data);
      setFilteredAssignments(data);
    } catch (error) {
      message.error('Failed to fetch assignments');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const data = await teachingActivitiesService.getAllSubmitted();
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error) {
      message.error('Failed to fetch submissions');
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await programsService.getAll();
      // Filter programs to show only those from current department
      const departmentPrograms = data.filter((p) => p.departmentId === department?.id);
      setPrograms(departmentPrograms);
      setFilteredPrograms(departmentPrograms);
    } catch (error) {
      message.error('Failed to fetch programs');
    }
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseModalOpen(true);
  };

  const handleDeleteCourse = (id: number) => {
    Modal.confirm({
      title: 'Delete Course',
      content: 'Are you sure you want to delete this course? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await coursesService.delete(id);
          message.success('Course deleted successfully');
          fetchCourses();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to delete course'
          );
        }
      },
    });
  };

  const handleCourseModalSuccess = () => {
    fetchCourses();
  };

  const handleAddAssignment = () => {
    setEditingAssignment(null);
    setAssignmentModalOpen(true);
  };

  const handleEditAssignment = (assignment: CourseTeacher) => {
    setEditingAssignment(assignment);
    setAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = (id: number) => {
    Modal.confirm({
      title: 'Remove Assignment',
      content: 'Are you sure you want to remove this teacher assignment?',
      okText: 'Remove',
      okType: 'danger',
      onOk: async () => {
        try {
          await courseTeachersService.delete(id);
          message.success('Assignment removed successfully');
          fetchAssignments();
          fetchCourses(); // Refresh courses to update assignment counts
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to remove assignment'
          );
        }
      },
    });
  };

  const handleAssignmentModalSuccess = () => {
    fetchAssignments();
    fetchCourses(); // Refresh courses to update assignment counts
  };

  const handleValidateSubmission = (submission: TeachingActivity) => {
    Modal.confirm({
      title: 'Validate Teaching Hours',
      content: `Are you sure you want to validate the teaching hours submitted by ${submission.teacher?.userInfo?.firstName} ${submission.teacher?.userInfo?.lastName} for "${submission.course?.name}"?`,
      okText: 'Validate',
      okType: 'primary',
      onOk: async () => {
        try {
          await teachingActivitiesService.validate(submission.id);
          message.success('Teaching hours validated successfully');
          fetchSubmissions();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to validate submission'
          );
        }
      },
    });
  };

  const handleRejectSubmission = (submission: TeachingActivity) => {
    Modal.confirm({
      title: 'Reject Teaching Hours',
      content: `Are you sure you want to reject the teaching hours submitted by ${submission.teacher?.userInfo?.firstName} ${submission.teacher?.userInfo?.lastName} for "${submission.course?.name}"? The teacher will be able to update and resubmit.`,
      okText: 'Reject',
      okType: 'danger',
      onOk: async () => {
        try {
          await teachingActivitiesService.reject(submission.id);
          message.success('Teaching hours rejected');
          fetchSubmissions();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to reject submission'
          );
        }
      },
    });
  };

  const handleAddProgram = () => {
    setEditingProgram(null);
    setProgramModalOpen(true);
  };

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setProgramModalOpen(true);
  };

  const handleDeleteProgram = (id: number) => {
    Modal.confirm({
      title: 'Delete Program',
      content: 'Are you sure you want to delete this program? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await programsService.delete(id);
          message.success('Program deleted successfully');
          fetchPrograms();
        } catch (error: any) {
          message.error(
            error?.response?.data?.error?.message || 'Failed to delete program'
          );
        }
      },
    });
  };

  const handleProgramModalSuccess = () => {
    fetchPrograms();
  };

  const handleDownloadProgramTemplate = async (program: Program) => {
    try {
      await programsService.downloadTemplate(program.id, program.code);
      message.success('Program template downloaded successfully');
    } catch (error: any) {
      message.error(
        error?.response?.data?.message || 'Failed to download program template'
      );
    }
  };

  const coursesColumns: ColumnsType<Course> = [
    {
      title: 'Course Name',
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
      title: 'Assigned Teachers',
      key: 'assignedTeachers',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Tag color="blue">{record._count?.assignedTeachers || 0}</Tag>
      ),
      sorter: (a, b) => (a._count?.assignedTeachers || 0) - (b._count?.assignedTeachers || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Course">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditCourse(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Course">
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
      title: 'Course',
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
      title: 'Teacher',
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
      title: 'Academic Period',
      key: 'period',
      render: (_, record) => (
        <span>
          {record.academicPeriod?.academicYear} - Semester {record.academicPeriod?.semester}
          {record.academicPeriod?.isActive && (
            <Tag color="green" style={{ marginLeft: 8 }}>
              Active
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Groups',
      key: 'groups',
      render: (_, record) => {
        if (!record.groups || record.groups.length === 0) {
          return <Tag>No Groups</Tag>;
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
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Groups">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditAssignment(record)}
            />
          </Tooltip>
          <Tooltip title="Remove Assignment">
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
      title: 'Teacher',
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
      title: 'Course',
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
      title: 'Groups',
      key: 'groups',
      render: (_, record) => {
        if (!record.groups || record.groups.length === 0) {
          return <Tag>No Groups</Tag>;
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
      title: 'Lecture',
      dataIndex: 'lectureHours',
      key: 'lectureHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours || 0}h`,
    },
    {
      title: 'Practice',
      dataIndex: 'practiceHours',
      key: 'practiceHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours || 0}h`,
    },
    {
      title: 'Lab',
      dataIndex: 'labHours',
      key: 'labHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours || 0}h`,
    },
    {
      title: 'Total',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 90,
      align: 'center',
      sorter: (a, b) => (a.totalHours || 0) - (b.totalHours || 0),
      render: (hours) => <strong>{hours || 0}h</strong>,
    },
    {
      title: 'Status',
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
            {status?.charAt(0).toUpperCase() + status?.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'submitted' && (
            <>
              <Tooltip title="Validate submission">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleValidateSubmission(record)}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Validate
                </Button>
              </Tooltip>
              <Tooltip title="Reject submission">
                <Button
                  danger
                  type="primary"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleRejectSubmission(record)}
                >
                  Reject
                </Button>
              </Tooltip>
            </>
          )}
          {record.status === 'validated' && (
            <Tag color="success" icon={<CheckCircleOutlined />}>
              Validated
            </Tag>
          )}
          {record.status === 'rejected' && (
            <Tag color="error" icon={<CloseCircleOutlined />}>
              Rejected
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  const programsColumns: ColumnsType<Program> = [
    {
      title: 'Program Name',
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
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Degree Level',
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
        return <Tag color={colors[level] || 'default'}>{level}</Tag>;
      },
    },
    {
      title: 'Duration',
      dataIndex: 'durationYears',
      key: 'durationYears',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.durationYears - b.durationYears,
      render: (years) => `${years} ${years === 1 ? 'year' : 'years'}`,
    },
    {
      title: 'Credits Required',
      dataIndex: 'totalCreditsRequired',
      key: 'totalCreditsRequired',
      width: 140,
      align: 'center',
      sorter: (a, b) => Number(a.totalCreditsRequired) - Number(b.totalCreditsRequired),
      render: (credits) => <strong>{credits}</strong>,
    },
    {
      title: 'Courses',
      key: 'coursesCount',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color="green">{record._count?.programCourses || 0}</Tag>
      ),
      sorter: (a, b) => (a._count?.programCourses || 0) - (b._count?.programCourses || 0),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/department/programs/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Download Template">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadProgramTemplate(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Program">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditProgram(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Program">
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
          Courses ({courses.length})
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder="Search courses..."
              prefix={<SearchOutlined />}
              value={courseSearchText}
              onChange={(e) => setCourseSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCourse}
              size="large"
            >
              Add Course
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
              showTotal: (total) => `Total ${total} courses`,
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
          Course Assignments ({assignments.length})
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder="Search assignments..."
              prefix={<SearchOutlined />}
              value={assignmentSearchText}
              onChange={(e) => setAssignmentSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddAssignment}
              size="large"
            >
              Assign Teacher
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
              showTotal: (total) => `Total ${total} assignments`,
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
          Hour Submissions ({submissions.length})
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder="Search submissions..."
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
              showTotal: (total) => `Total ${total} submissions`,
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
          Programs ({programs.length})
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder="Search programs..."
              prefix={<SearchOutlined />}
              value={programSearchText}
              onChange={(e) => setProgramSearchText(e.target.value)}
              className="search-input"
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddProgram}
              size="large"
            >
              Add Program
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
              showTotal: (total) => `Total ${total} programs`,
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
          <p>You are not assigned as head of any department. Please contact an administrator.</p>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="department-activities-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Department Management</h1>
            <p className="page-subtitle">
              Manage courses, teachers, and course assignments for your department
            </p>
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
          onSuccess={handleCourseModalSuccess}
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
          onSuccess={handleAssignmentModalSuccess}
          assignment={editingAssignment}
          courses={courses}
          teachers={teachers}
          academicPeriods={academicPeriods}
        />

        <ProgramFormModal
          open={programModalOpen}
          onClose={() => setProgramModalOpen(false)}
          onSuccess={handleProgramModalSuccess}
          program={editingProgram}
          departmentId={department.id}
          departments={departments}
        />
      </div>
    </MainLayout>
  );
};

export default DepartmentActivitiesPage;
