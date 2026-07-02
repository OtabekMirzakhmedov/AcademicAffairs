import { useState, useEffect } from 'react';
import { Card, Row, Col, Spin, Alert, Progress } from 'antd';
import {
  BookOpen,
  FlaskConical,
  FileText,
  Trophy,
  Building2,
  Calendar,
  Briefcase,
  CheckCircle2,
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
import MainLayout from '../components/layout/MainLayout';
import { PageHeader, StatCard } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import academicPeriodsService from '../services/academic-periods.service';
import teachingActivitiesService from '../services/teaching-activities.service';
import publicationsService from '../services/publications.service';
import type { AcademicPeriod, TeacherStats, PublicationStatistics } from '../types';

const PUB_COLORS = {
  conference: '#10b981',
  national: '#4f46e5',
  scopus: '#7c3aed',
};

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation(['teacher', 'common', 'domain']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AcademicPeriod | null>(null);
  const [teachingStats, setTeachingStats] = useState<TeacherStats>({
    mandatoryHours: 0,
    submittedHours: 0,
    validatedHours: 0,
  });
  const [publicationStats, setPublicationStats] = useState<PublicationStatistics>({
    mandatoryConferenceArticles: 0,
    mandatoryNationalArticles: 0,
    mandatoryScopusArticles: 0,
    submittedConferenceArticles: 0,
    submittedNationalArticles: 0,
    submittedScopusArticles: 0,
    validatedConferenceArticles: 0,
    validatedNationalArticles: 0,
    validatedScopusArticles: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const period = await academicPeriodsService.getActive();
      setActivePeriod(period);

      const [teachingData, publicationData] = await Promise.all([
        teachingActivitiesService.getStatistics(period.id),
        publicationsService.getStatistics(),
      ]);

      setTeachingStats(teachingData);
      setPublicationStats(publicationData);
    } catch (error: any) {
      setError(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const getProgressColor = (current: number, target: number) => {
    if (target === 0) return '#a8a29e';
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '#10b981';
    if (percentage >= 75) return '#4f46e5';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
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

  const totalMandatoryArticles =
    publicationStats.mandatoryConferenceArticles +
    publicationStats.mandatoryNationalArticles +
    publicationStats.mandatoryScopusArticles;

  const totalValidatedArticles =
    publicationStats.validatedConferenceArticles +
    publicationStats.validatedNationalArticles +
    publicationStats.validatedScopusArticles;

  const totalSubmittedArticles =
    publicationStats.submittedConferenceArticles +
    publicationStats.submittedNationalArticles +
    publicationStats.submittedScopusArticles;

  const publicationsChartData = [
    {
      type: t('domain:publicationType.conference'),
      key: 'conference',
      validated: publicationStats.validatedConferenceArticles,
      mandatory: publicationStats.mandatoryConferenceArticles,
    },
    {
      type: t('domain:publicationType.national'),
      key: 'national',
      validated: publicationStats.validatedNationalArticles,
      mandatory: publicationStats.mandatoryNationalArticles,
    },
    {
      type: t('domain:publicationType.scopus'),
      key: 'scopus',
      validated: publicationStats.validatedScopusArticles,
      mandatory: publicationStats.mandatoryScopusArticles,
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={t('teacher:dashboard.welcome', {
          name: `${user?.userInfo?.firstName ?? ''} ${user?.userInfo?.lastName ?? ''}`.trim(),
        })}
        subtitle={t('teacher:dashboard.desc')}
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
            label={t('teacher:dashboard.mandatoryHours')}
            value={user?.teacherInfo?.mandatoryHoursPerPeriod || 0}
            icon={BookOpen}
            tone="primary"
            hint={t('common:label.hours')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('teacher:account.totalSubmittedHours')}
            value={teachingStats.submittedHours}
            icon={CheckCircle2}
            tone="success"
            hint={t('common:label.hours')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('teacher:account.totalSubmittedArticles')}
            value={totalSubmittedArticles}
            icon={FileText}
            tone="warning"
            hint={t('teacher:account.articles')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            label={t('teacher:dashboard.documentationRequired')}
            value={user?.teacherInfo?.mandatoryDocumentation || 0}
            icon={Trophy}
            tone="neutral"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} strokeWidth={2} />
                {t('teacher:dashboard.teachingProgress')}
              </span>
            }
          >
            <div style={{ fontSize: 13, color: '#57534e', marginBottom: 4 }}>
              {t('teacher:dashboard.validatedHours')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: '#1c1917' }}>
              {teachingStats.validatedHours}
              <span style={{ fontSize: 16, fontWeight: 500, color: '#78716c', marginLeft: 6 }}>
                / {teachingStats.mandatoryHours} {t('common:label.hours')}
              </span>
            </div>
            <Progress
              percent={calculateProgress(teachingStats.validatedHours, teachingStats.mandatoryHours)}
              strokeColor={getProgressColor(teachingStats.validatedHours, teachingStats.mandatoryHours)}
              showInfo={false}
              style={{ marginTop: 12 }}
            />
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={12}>
                <div style={{ fontSize: 12, color: '#78716c' }}>{t('teacher:dashboard.submitted')}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#4f46e5' }}>
                  {teachingStats.submittedHours}h
                </div>
              </Col>
              <Col span={12}>
                <div style={{ fontSize: 12, color: '#78716c' }}>{t('teacher:dashboard.remaining')}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#ef4444' }}>
                  {Math.max(0, teachingStats.mandatoryHours - teachingStats.validatedHours)}h
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FlaskConical size={16} strokeWidth={2} />
                {t('teacher:dashboard.publicationsProgress')}
              </span>
            }
          >
            <div style={{ fontSize: 13, color: '#57534e', marginBottom: 4 }}>
              {t('teacher:dashboard.validatedArticles')}
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', color: '#1c1917' }}>
              {totalValidatedArticles}
              <span style={{ fontSize: 16, fontWeight: 500, color: '#78716c', marginLeft: 6 }}>
                / {totalMandatoryArticles} {t('teacher:account.articles')}
              </span>
            </div>

            <div style={{ marginTop: 12 }}>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart
                  data={publicationsChartData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid stroke="#f5f5f4" vertical={false} />
                  <XAxis dataKey="type" stroke="#78716c" fontSize={12} tickLine={false} axisLine={false} />
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
                  <Bar dataKey="validated" radius={[6, 6, 0, 0]} barSize={28}>
                    {publicationsChartData.map((entry) => (
                      <Cell key={entry.key} fill={PUB_COLORS[entry.key as keyof typeof PUB_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            label={t('teacher:account.employmentType')}
            value={
              user?.teacherInfo?.employmentType
                ? t(`domain:employment.${user.teacherInfo.employmentType}`)
                : t('common:label.notSet')
            }
            icon={Briefcase}
            tone="primary"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            label={t('teacher:account.department')}
            value={user?.teacherInfo?.department?.name || 'N/A'}
            icon={Building2}
            tone="success"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <StatCard
            label={t('teacher:dashboard.mandatoryExtracurricular')}
            value={user?.teacherInfo?.mandatoryExtracurricularHours || 0}
            icon={Trophy}
            tone="warning"
            hint={t('common:label.hours')}
          />
        </Col>
      </Row>
    </MainLayout>
  );
};

export default DashboardPage;
