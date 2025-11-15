import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Tag,
} from 'antd';
import {
  UserOutlined,
  BankOutlined,
  TeamOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import MainLayout from '../../components/layout/MainLayout';
import { useAuthStore } from '../../store/authStore';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import academicPeriodsService from '../../services/academic-periods.service';
import type { User, Department, AcademicPeriod } from '../../types';

const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AcademicPeriod | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [period, usersData, departmentsData] = await Promise.all([
        academicPeriodsService.getActive(),
        usersService.getAll(),
        departmentsService.getAll(),
      ]);

      setActivePeriod(period);
      setUsers(usersData);
      setDepartments(departmentsData);
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

  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);
  const teachers = users.filter((u) => u.role.name === 'teacher');
  const departmentHeads = users.filter((u) => u.role.name === 'departmenthead');
  const admins = users.filter((u) => u.role.name === 'admin');

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row align="middle">
            <Col flex="auto">
              <h1 style={{ margin: 0, color: 'white', fontSize: '28px' }}>
                <UserOutlined style={{ marginRight: 12 }} />
                Admin Dashboard
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Welcome, {user?.userInfo?.firstName} {user?.userInfo?.lastName} - System Overview
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

        {/* System Overview */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Users"
                value={users.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {activeUsers.length} Active
                </Tag>
                <Tag color="default" icon={<ClockCircleOutlined />}>
                  {inactiveUsers.length} Inactive
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Departments"
                value={departments.length}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                {departments.filter((d) => d.headId).length} with assigned heads
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Teachers"
                value={teachers.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                {teachers.filter((t) => t.isActive).length} active teachers
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Department Heads"
                value={departmentHeads.length}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                Managing {departments.filter((d) => d.headId).length} departments
              </div>
            </Card>
          </Col>
        </Row>

        {/* Users Breakdown */}
        <Card
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              Users by Role
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card type="inner">
                <Statistic
                  title="Administrators"
                  value={admins.length}
                  valueStyle={{ color: '#f5222d' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="error">{admins.filter((a) => a.isActive).length} Active</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card type="inner">
                <Statistic
                  title="Department Heads"
                  value={departmentHeads.length}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="orange">{departmentHeads.filter((d) => d.isActive).length} Active</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card type="inner">
                <Statistic
                  title="Teachers"
                  value={teachers.length}
                  valueStyle={{ color: '#722ed1' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="purple">{teachers.filter((t) => t.isActive).length} Active</Tag>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Departments Overview */}
        <Card
          title={
            <span>
              <BankOutlined style={{ marginRight: 8 }} />
              Departments Overview
            </span>
          }
        >
          <Row gutter={16}>
            {departments.slice(0, 6).map((dept) => (
              <Col xs={24} sm={12} lg={8} key={dept.id} style={{ marginBottom: 16 }}>
                <Card type="inner" size="small">
                  <h4 style={{ margin: 0, marginBottom: 8 }}>{dept.name}</h4>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    <div>
                      Head: {dept.head ? `${dept.head.userInfo?.firstName} ${dept.head.userInfo?.lastName}` : 'Not Assigned'}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">{dept._count?.teachers || 0} Teachers</Tag>
                      <Tag color="green">{dept._count?.courses || 0} Courses</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {departments.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 16, color: '#8c8c8c' }}>
              And {departments.length - 6} more departments...
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
