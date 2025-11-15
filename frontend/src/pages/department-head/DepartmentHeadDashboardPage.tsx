import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Tag,
  Progress,
} from 'antd';
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import MainLayout from '../../components/layout/MainLayout';
import { useAuthStore } from '../../store/authStore';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import academicPeriodsService from '../../services/academic-periods.service';
import type { User, Department, AcademicPeriod } from '../../types';

const DepartmentHeadDashboardPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AcademicPeriod | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [teachers, setTeachers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const period = await academicPeriodsService.getActive();
      setActivePeriod(period);

      // Get department where current user is head
      const allDepartments = await departmentsService.getAll();
      const myDepartment = allDepartments.find((dept) => dept.headId === user?.id);

      if (myDepartment) {
        setDepartment(myDepartment);

        // Get all users and filter for teachers in this department
        const allUsers = await usersService.getAll();
        const departmentTeachers = allUsers.filter(
          (u) => u.role.name === 'teacher' && u.teacherInfo?.departmentId === myDepartment.id
        );
        setTeachers(departmentTeachers);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Loading dashboard..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Alert message="Error Loading Data" description={error} type="error" showIcon />
        </div>
      </MainLayout>
    );
  }

  if (!department) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message="No Department Assigned"
            description="You are not assigned as head of any department."
            type="warning"
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  const activeTeachers = teachers.filter((t) => t.isActive);
  const inactiveTeachers = teachers.filter((t) => !t.isActive);
  const fullTimeTeachers = teachers.filter((t) => t.teacherInfo?.employmentType === 'full-time');
  const partTimeTeachers = teachers.filter((t) => t.teacherInfo?.employmentType === 'part-time');
  const contractTeachers = teachers.filter((t) => t.teacherInfo?.employmentType === 'contract');

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row align="middle">
            <Col flex="auto">
              <h1 style={{ margin: 0, color: 'white', fontSize: '28px' }}>
                <BankOutlined style={{ marginRight: 12 }} />
                Department Head Dashboard
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Welcome, {user?.userInfo?.firstName} {user?.userInfo?.lastName} - {department.name}
              </p>
            </Col>
          </Row>
        </Card>

        {/* Academic Period Info */}
        {activePeriod && (
          <Card
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                Current Academic Period
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 8 }}>
                    Academic Year
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {activePeriod.academicYear}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 8 }}>
                    Semester
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {activePeriod.semester === 1 ? 'Fall' : 'Spring'} (Semester {activePeriod.semester})
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 8 }}>
                    Teaching Week
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                    Week {activePeriod.teachingWeek}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Department Overview */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Teachers"
                value={teachers.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {activeTeachers.length} Active
                </Tag>
                <Tag color="default" icon={<ClockCircleOutlined />}>
                  {inactiveTeachers.length} Inactive
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Full-Time Teachers"
                value={fullTimeTeachers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Part-Time Teachers"
                value={partTimeTeachers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Contract Teachers"
                value={contractTeachers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Department Information */}
        <Card
          title={
            <span>
              <BankOutlined style={{ marginRight: 8 }} />
              {department.name}
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
                  Department Head
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {user?.userInfo?.firstName} {user?.userInfo?.lastName}
                </div>
              </div>
            </Col>
            {department.phone && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
                    Phone
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {department.phone}
                  </div>
                </div>
              </Col>
            )}
            {department.roomNumber && (
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: 4 }}>
                    Room Number
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {department.roomNumber}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        {/* Teachers List */}
        <Card
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              Department Teachers
            </span>
          }
        >
          <Row gutter={16}>
            {activeTeachers.length > 0 ? (
              activeTeachers.map((teacher) => (
                <Col xs={24} sm={12} lg={8} key={teacher.id} style={{ marginBottom: 16 }}>
                  <Card type="inner" size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h4 style={{ margin: 0, marginBottom: 8 }}>
                          {teacher.userInfo?.firstName} {teacher.userInfo?.lastName}
                        </h4>
                        <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                          {teacher.userInfo?.email1 && (
                            <div>{teacher.userInfo.email1}</div>
                          )}
                          {teacher.teacherInfo?.employmentType && (
                            <div style={{ marginTop: 4 }}>
                              <Tag color={
                                teacher.teacherInfo.employmentType === 'full-time' ? 'green' :
                                teacher.teacherInfo.employmentType === 'part-time' ? 'blue' : 'orange'
                              }>
                                {teacher.teacherInfo.employmentType.replace('-', ' ').toUpperCase()}
                              </Tag>
                            </div>
                          )}
                        </div>
                      </div>
                      <Tag color="success">Active</Tag>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                  No active teachers in this department
                </div>
              </Col>
            )}
          </Row>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DepartmentHeadDashboardPage;
