import { useState, useEffect } from 'react';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../../components/layout/MainLayout';
import CourseFormModal from '../../components/features/department-head/CourseFormModal';
import TeacherAssignmentModal from '../../components/features/department-head/TeacherAssignmentModal';
import coursesService from '../../services/courses.service';
import courseTeachersService from '../../services/course-teachers.service';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import type { Course, User, CourseTeacher, AcademicPeriod, Department } from '../../types';
import { useAuthStore } from '../../store/authStore';
import './DepartmentActivitiesPage.scss';

const DepartmentActivitiesPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('courses');
  const [loading, setLoading] = useState(false);

  // Department state
  const [department, setDepartment] = useState<Department | null>(null);

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [courseSearchText, setCourseSearchText] = useState('');
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Teachers state
  const [teachers, setTeachers] = useState<User[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<User[]>([]);
  const [teacherSearchText, setTeacherSearchText] = useState('');

  // Assignments state
  const [assignments, setAssignments] = useState<CourseTeacher[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<CourseTeacher[]>([]);
  const [assignmentSearchText, setAssignmentSearchText] = useState('');
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CourseTeacher | null>(null);

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
    let filtered = teachers;
    if (teacherSearchText) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.userInfo?.firstName.toLowerCase().includes(teacherSearchText.toLowerCase()) ||
          teacher.userInfo?.lastName.toLowerCase().includes(teacherSearchText.toLowerCase()) ||
          teacher.login.toLowerCase().includes(teacherSearchText.toLowerCase())
      );
    }
    setFilteredTeachers(filtered);
  }, [teacherSearchText, teachers]);

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

  const fetchDepartment = async () => {
    try {
      const allDepartments = await departmentsService.getAll();
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
      const departmentTeachers = allUsers.filter(
        (u) => u.role.name === 'teacher' && u.teacherInfo?.departmentId === department?.id
      );
      setTeachers(departmentTeachers);
      setFilteredTeachers(departmentTeachers);
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
              disabled={(record._count?.assignedTeachers || 0) > 0}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

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
      title: 'Employment Type',
      key: 'employmentType',
      render: (_, record) => {
        const type = record.teacherInfo?.employmentType;
        if (!type) return <Tag>Not Set</Tag>;
        const colors: Record<string, string> = {
          'full-time': 'green',
          'part-time': 'orange',
          'contract': 'blue',
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      },
    },
    {
      title: 'Mandatory Hours',
      key: 'mandatoryHours',
      render: (_, record) => record.teacherInfo?.mandatoryHoursPerPeriod || 'Not Set',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Active' : 'Inactive'}
        </Tag>
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
      key: 'teachers',
      label: (
        <span>
          <UserOutlined />
          Teachers ({teachers.length})
        </span>
      ),
      children: (
        <div className="tab-content">
          <div className="filters-section">
            <Input
              placeholder="Search teachers..."
              prefix={<SearchOutlined />}
              value={teacherSearchText}
              onChange={(e) => setTeacherSearchText(e.target.value)}
              className="search-input"
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
          academicPeriods={academicPeriods}
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
      </div>
    </MainLayout>
  );
};

export default DepartmentActivitiesPage;
