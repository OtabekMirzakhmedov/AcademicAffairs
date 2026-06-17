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
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import { useAuthStore } from '../../store/authStore';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import academicPeriodsService from '../../services/academic-periods.service';
import type { User, Department, AcademicPeriod } from '../../types';

const AdminDashboardPage = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation(['admin', 'common', 'teacher', 'domain']);
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
      setError(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip={t('common:loading')} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Alert message={t('common:message.errorLoading')} description={error} type="error" showIcon />
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
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row align="middle">
            <Col flex="auto">
              <h1 style={{ margin: 0, color: 'white', fontSize: '28px' }}>
                <UserOutlined style={{ marginRight: 12 }} />
                {t('admin:dashboard.title')}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                {t('admin:dashboard.desc', {
                  name: `${user?.userInfo?.firstName ?? ''} ${user?.userInfo?.lastName ?? ''}`.trim(),
                })}
              </p>
            </Col>
          </Row>
        </Card>

        {activePeriod && (
          <Card
            title={
              <span>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {t('teacher:dashboard.currentPeriod')}
              </span>
            }
            style={{ marginBottom: 24 }}
          >
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 8 }}>
                    {t('teacher:dashboard.academicYear')}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {activePeriod.academicYear}
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 8 }}>
                    {t('teacher:dashboard.semester')}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
                    {t(`domain:semester.${activePeriod.semester}`)} ({t('teacher:dashboard.semester')} {activePeriod.semester})
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: 8 }}>
                    {t('teacher:dashboard.teachingWeek')}
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
                    {t('teacher:dashboard.week', { number: activePeriod.teachingWeek })}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('admin:nav.users')}
                value={users.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {activeUsers.length} {t('domain:status.active')}
                </Tag>
                <Tag color="default" icon={<ClockCircleOutlined />}>
                  {inactiveUsers.length} {t('domain:status.inactive')}
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('admin:nav.departments')}
                value={departments.length}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                {departments.filter((d) => d.headId).length} {t('admin:dashboard.withAssignedHeads')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('domain:role.teacher')}
                value={teachers.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                {teachers.filter((t) => t.isActive).length} {t('admin:dashboard.activeTeachers')}
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('domain:role.departmenthead')}
                value={departmentHeads.length}
                prefix={<BankOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
              <div style={{ marginTop: 12, fontSize: '12px', color: '#8c8c8c' }}>
                {t('admin:dashboard.managingDepts', { count: departments.filter((d) => d.headId).length })}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              {t('admin:dashboard.usersByRole')}
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Card type="inner">
                <Statistic
                  title={t('domain:role.admin')}
                  value={admins.length}
                  valueStyle={{ color: '#f5222d' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="error">{admins.filter((a) => a.isActive).length} {t('domain:status.active')}</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card type="inner">
                <Statistic
                  title={t('domain:role.departmenthead')}
                  value={departmentHeads.length}
                  valueStyle={{ color: '#fa8c16' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="orange">{departmentHeads.filter((d) => d.isActive).length} {t('domain:status.active')}</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card type="inner">
                <Statistic
                  title={t('domain:role.teacher')}
                  value={teachers.length}
                  valueStyle={{ color: '#722ed1' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Tag color="purple">{teachers.filter((t) => t.isActive).length} {t('domain:status.active')}</Tag>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card
          title={
            <span>
              <BankOutlined style={{ marginRight: 8 }} />
              {t('admin:dashboard.departmentsOverview')}
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
                      Head: {dept.head
                        ? `${dept.head.userInfo?.firstName} ${dept.head.userInfo?.lastName}`
                        : t('admin:departments.notAssigned')}
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">{dept._count?.teachers || 0} {t('admin:dashboard.teachers')}</Tag>
                      <Tag color="green">{dept._count?.courses || 0} {t('admin:dashboard.courses')}</Tag>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {departments.length > 6 && (
            <div style={{ textAlign: 'center', marginTop: 16, color: '#8c8c8c' }}>
              {t('admin:dashboard.moreDepts', { count: departments.length - 6 })}
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
