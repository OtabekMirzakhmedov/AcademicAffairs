import { useState, useEffect } from 'react';
import { Row, Col, Spin, Alert, Card } from 'antd';
import {
  Users,
  Building2,
  GraduationCap,
  UserCog,
  Calendar,
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
  Cell,
} from 'recharts';
import MainLayout from '../../components/layout/MainLayout';
import { PageHeader, StatCard, StatusBadge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import usersService from '../../services/users.service';
import departmentsService from '../../services/departments.service';
import academicPeriodsService from '../../services/academic-periods.service';
import type { User, Department, AcademicPeriod } from '../../types';

const ROLE_COLORS: Record<string, string> = {
  admin: '#ef4444',
  departmenthead: '#f59e0b',
  teacher: '#4f46e5',
};

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
        <Alert message={t('common:message.errorLoading')} description={error} type="error" showIcon />
      </MainLayout>
    );
  }

  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);
  const teachers = users.filter((u) => u.role.name === 'teacher');
  const departmentHeads = users.filter((u) => u.role.name === 'departmenthead');
  const admins = users.filter((u) => u.role.name === 'admin');

  const roleChartData = [
    { role: t('domain:role.teacher'), value: teachers.length, key: 'teacher' },
    { role: t('domain:role.departmenthead'), value: departmentHeads.length, key: 'departmenthead' },
    { role: t('domain:role.admin'), value: admins.length, key: 'admin' },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={t('admin:dashboard.title')}
        subtitle={t('admin:dashboard.desc', {
          name: `${user?.userInfo?.firstName ?? ''} ${user?.userInfo?.lastName ?? ''}`.trim(),
        })}
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
            label={t('admin:nav.users')}
            value={users.length}
            icon={Users}
            tone="primary"
            footer={
              <>
                <StatusBadge status="active" label={`${activeUsers.length} ${t('domain:status.active')}`} />
                <StatusBadge status="inactive" label={`${inactiveUsers.length} ${t('domain:status.inactive')}`} />
              </>
            }
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('admin:nav.departments')}
            value={departments.length}
            icon={Building2}
            tone="success"
            hint={`${departments.filter((d) => d.headId).length} ${t('admin:dashboard.withAssignedHeads')}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('domain:role.teacher')}
            value={teachers.length}
            icon={GraduationCap}
            tone="primary"
            hint={`${teachers.filter((t) => t.isActive).length} ${t('admin:dashboard.activeTeachers')}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('domain:role.departmenthead')}
            value={departmentHeads.length}
            icon={UserCog}
            tone="warning"
            hint={t('admin:dashboard.managingDepts', {
              count: departments.filter((d) => d.headId).length,
            })}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title={t('admin:dashboard.usersByRole')} style={{ height: '100%' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={roleChartData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 24, bottom: 0 }}
              >
                <CartesianGrid stroke="#f5f5f4" horizontal={false} />
                <XAxis type="number" stroke="#a8a29e" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="role"
                  stroke="#57534e"
                  fontSize={13}
                  width={120}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#fafaf9' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e7e5e4',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {roleChartData.map((entry) => (
                    <Cell key={entry.key} fill={ROLE_COLORS[entry.key]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title={t('admin:dashboard.departmentsOverview')} style={{ height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {departments.slice(0, 5).map((dept) => (
                <div
                  key={dept.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#fafaf9',
                    border: '1px solid #f5f5f4',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1c1917' }}>{dept.name}</div>
                    <div style={{ fontSize: 12, color: '#78716c', marginTop: 2 }}>
                      {dept.head
                        ? `${dept.head.userInfo?.firstName} ${dept.head.userInfo?.lastName}`
                        : t('admin:departments.notAssigned')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <StatusBadge status="neutral" label={`${dept._count?.teachers || 0} ${t('admin:dashboard.teachers')}`} />
                    <StatusBadge status="validated" label={`${dept._count?.courses || 0} ${t('admin:dashboard.courses')}`} />
                  </div>
                </div>
              ))}
              {departments.length > 5 && (
                <div style={{ textAlign: 'center', fontSize: 12, color: '#78716c', marginTop: 4 }}>
                  {t('admin:dashboard.moreDepts', { count: departments.length - 5 })}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </MainLayout>
  );
};

export default AdminDashboardPage;
