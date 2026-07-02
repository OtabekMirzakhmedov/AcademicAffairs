import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert } from 'antd';
import {
  Users,
  User as UserIcon,
  Building2,
  Calendar,
  Phone,
  MapPin,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader, StatCard, StatusBadge } from '../../components/ui';
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
        <Alert message={t('common:message.errorLoading')} description={error} type="error" showIcon />
      </MainLayout>
    );
  }

  if (!department) {
    return (
      <MainLayout>
        <Alert
          message={t('head:activities.noDepartment')}
          description={t('head:activities.noDepartmentMsg')}
          type="warning"
          showIcon
        />
      </MainLayout>
    );
  }

  const activeTeachers = teachers.filter((tt) => tt.isActive);
  const inactiveTeachers = teachers.filter((tt) => !tt.isActive);
  const fullTimeTeachers = teachers.filter((tt) => tt.teacherInfo?.employmentType === 'full-time');
  const partTimeTeachers = teachers.filter((tt) => tt.teacherInfo?.employmentType === 'part-time');
  const contractTeachers = teachers.filter((tt) => tt.teacherInfo?.employmentType === 'contract');

  const employmentChartData = [
    {
      label: t('head:dashboard.fullTime'),
      [t('head:dashboard.active')]: fullTimeTeachers.filter((tt) => tt.isActive).length,
      [t('head:dashboard.inactive')]: fullTimeTeachers.filter((tt) => !tt.isActive).length,
    },
    {
      label: t('head:dashboard.partTime'),
      [t('head:dashboard.active')]: partTimeTeachers.filter((tt) => tt.isActive).length,
      [t('head:dashboard.inactive')]: partTimeTeachers.filter((tt) => !tt.isActive).length,
    },
    {
      label: t('head:dashboard.contract'),
      [t('head:dashboard.active')]: contractTeachers.filter((tt) => tt.isActive).length,
      [t('head:dashboard.inactive')]: contractTeachers.filter((tt) => !tt.isActive).length,
    },
  ];
  const activeKey = t('head:dashboard.active');
  const inactiveKey = t('head:dashboard.inactive');

  return (
    <MainLayout>
      <PageHeader
        title={t('head:dashboard.title')}
        subtitle={`${user?.userInfo?.firstName ?? ''} ${user?.userInfo?.lastName ?? ''} · ${department.name}`}
        actions={
          activePeriod && (
            <div className="period-chip">
              <Calendar size={14} strokeWidth={2} />
              <span>
                {activePeriod.academicYear} ·{' '}
                {t(`domain:semester.${activePeriod.semester}`)} ·{' '}
                {t('teacher:dashboard.week', { number: activePeriod.teachingWeek })}
              </span>
            </div>
          )
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('head:dashboard.totalTeachers')}
            value={teachers.length}
            icon={Users}
            tone="primary"
            footer={
              <>
                <StatusBadge status="active" label={`${activeTeachers.length} ${t('head:dashboard.active')}`} />
                <StatusBadge status="inactive" label={`${inactiveTeachers.length} ${t('head:dashboard.inactive')}`} />
              </>
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('head:dashboard.fullTime')}
            value={fullTimeTeachers.length}
            icon={UserIcon}
            tone="success"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('head:dashboard.partTime')}
            value={partTimeTeachers.length}
            icon={UserIcon}
            tone="primary"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('head:dashboard.contract')}
            value={contractTeachers.length}
            icon={UserIcon}
            tone="warning"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Users size={16} strokeWidth={2} />
                {t('head:dashboard.totalTeachers')}
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={employmentChartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#f5f5f4" vertical={false} />
                <XAxis dataKey="label" stroke="#57534e" fontSize={13} tickLine={false} axisLine={false} />
                <YAxis stroke="#a8a29e" fontSize={12} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#fafaf9' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e7e5e4',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Bar dataKey={activeKey} stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={36} />
                <Bar dataKey={inactiveKey} stackId="a" fill="#d6d3d1" radius={[6, 6, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Building2 size={16} strokeWidth={2} />
                {department.name}
              </span>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: '#78716c', marginBottom: 2 }}>
                  {t('head:dashboard.departmentHead')}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1c1917' }}>
                  {user?.userInfo?.firstName} {user?.userInfo?.lastName}
                </div>
              </div>
              {department.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} strokeWidth={1.75} color="#78716c" />
                  <span style={{ fontSize: 14, color: '#1c1917' }}>{department.phone}</span>
                </div>
              )}
              {department.roomNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} strokeWidth={1.75} color="#78716c" />
                  <span style={{ fontSize: 14, color: '#1c1917' }}>
                    {t('head:dashboard.roomNumber')}: {department.roomNumber}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} strokeWidth={2} />
            {t('head:dashboard.departmentTeachers')}
          </span>
        }
      >
        {activeTeachers.length > 0 ? (
          <Row gutter={[12, 12]}>
            {activeTeachers.map((teacher) => (
              <Col xs={24} sm={12} lg={8} key={teacher.id}>
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: '#fafaf9',
                    border: '1px solid #f5f5f4',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 8,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1c1917' }}>
                      {teacher.userInfo?.firstName} {teacher.userInfo?.lastName}
                    </div>
                    {teacher.userInfo?.email1 && (
                      <div
                        style={{
                          fontSize: 12,
                          color: '#78716c',
                          marginTop: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {teacher.userInfo.email1}
                      </div>
                    )}
                    {teacher.teacherInfo?.employmentType && (
                      <div style={{ marginTop: 8 }}>
                        <StatusBadge
                          status="neutral"
                          label={t(`domain:employment.${teacher.teacherInfo.employmentType}`)}
                        />
                      </div>
                    )}
                  </div>
                  <StatusBadge status="active" label={t('head:dashboard.active')} />
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#78716c' }}>
            {t('head:dashboard.noActiveTeachers')}
          </div>
        )}
      </Card>
    </MainLayout>
  );
};

export default DepartmentHeadDashboardPage;
