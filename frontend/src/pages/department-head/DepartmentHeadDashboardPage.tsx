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

const DepartmentHeadDashboardPage = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation(['head', 'common', 'teacher', 'domain']);
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

      const allDepartments = await departmentsService.getAll();
      const myDepartment = allDepartments.find((dept) => dept.headId === user?.id);

      if (myDepartment) {
        setDepartment(myDepartment);
        const allUsers = await usersService.getAll();
        const departmentTeachers = allUsers.filter(
          (u) => u.role.name === 'teacher' && u.teacherInfo?.departmentId === myDepartment.id
        );
        setTeachers(departmentTeachers);
      }
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

  if (!department) {
    return (
      <MainLayout>
        <div style={{ padding: '24px' }}>
          <Alert
            message={t('head:activities.noDepartment')}
            description={t('head:activities.noDepartmentMsg')}
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
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row align="middle">
            <Col flex="auto">
              <h1 style={{ margin: 0, color: 'white', fontSize: '28px' }}>
                <BankOutlined style={{ marginRight: 12 }} />
                {t('head:dashboard.title')}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                {user?.userInfo?.firstName} {user?.userInfo?.lastName} — {department.name}
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
                title={t('head:dashboard.totalTeachers')}
                value={teachers.length}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  {activeTeachers.length} {t('head:dashboard.active')}
                </Tag>
                <Tag color="default" icon={<ClockCircleOutlined />}>
                  {inactiveTeachers.length} {t('head:dashboard.inactive')}
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('head:dashboard.fullTime')}
                value={fullTimeTeachers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('head:dashboard.partTime')}
                value={partTimeTeachers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('head:dashboard.contract')}
                value={contractTeachers.length}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

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
                  {t('head:dashboard.departmentHead')}
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
                    {t('head:dashboard.phone')}
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
                    {t('head:dashboard.roomNumber')}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                    {department.roomNumber}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Card>

        <Card
          title={
            <span>
              <TeamOutlined style={{ marginRight: 8 }} />
              {t('head:dashboard.departmentTeachers')}
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
                          {teacher.userInfo?.email1 && <div>{teacher.userInfo.email1}</div>}
                          {teacher.teacherInfo?.employmentType && (
                            <div style={{ marginTop: 4 }}>
                              <Tag color={
                                teacher.teacherInfo.employmentType === 'full-time' ? 'green' :
                                teacher.teacherInfo.employmentType === 'part-time' ? 'blue' : 'orange'
                              }>
                                {t(`domain:employment.${teacher.teacherInfo.employmentType}`)}
                              </Tag>
                            </div>
                          )}
                        </div>
                      </div>
                      <Tag color="success">{t('head:dashboard.active')}</Tag>
                    </div>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                  {t('head:dashboard.noActiveTeachers')}
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
