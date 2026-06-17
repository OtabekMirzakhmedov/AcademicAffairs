import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Tag,
  Divider,
  Progress,
} from 'antd';
import {
  BookOutlined,
  ExperimentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import academicPeriodsService from '../services/academic-periods.service';
import teachingActivitiesService from '../services/teaching-activities.service';
import publicationsService from '../services/publications.service';
import type { AcademicPeriod, TeacherStats, PublicationStatistics } from '../types';

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
    const percentage = (current / target) * 100;
    if (percentage >= 100) return '#52c41a';
    if (percentage >= 75) return '#1890ff';
    if (percentage >= 50) return '#faad14';
    return '#f5222d';
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

  const totalMandatoryArticles =
    publicationStats.mandatoryConferenceArticles +
    publicationStats.mandatoryNationalArticles +
    publicationStats.mandatoryScopusArticles;

  const totalValidatedArticles =
    publicationStats.validatedConferenceArticles +
    publicationStats.validatedNationalArticles +
    publicationStats.validatedScopusArticles;

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Row align="middle">
            <Col flex="auto">
              <h1 style={{ margin: 0, color: 'white', fontSize: '28px' }}>
                <UserOutlined style={{ marginRight: 12 }} />
                {t('teacher:dashboard.welcome', {
                  name: `${user?.userInfo?.firstName ?? ''} ${user?.userInfo?.lastName ?? ''}`.trim(),
                })}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                {t('teacher:dashboard.desc')}
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

        {/* Teacher Requirements Summary */}
        <Card
          title={
            <span>
              <TrophyOutlined style={{ marginRight: 8 }} />
              {t('teacher:dashboard.requirementsSummary')}
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title={t('teacher:dashboard.mandatoryHours')}
                value={user?.teacherInfo?.mandatoryHoursPerPeriod || 0}
                suffix={t('common:label.hours')}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title={t('teacher:dashboard.mandatoryExtracurricular')}
                value={user?.teacherInfo?.mandatoryExtracurricularHours || 0}
                suffix={t('common:label.hours')}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Statistic
                title={t('teacher:dashboard.conferenceArticles')}
                value={user?.teacherInfo?.mandatoryConferenceArticles || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={t('teacher:dashboard.nationalArticles')}
                value={user?.teacherInfo?.mandatoryNationalArticles || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={t('teacher:dashboard.scopusArticles')}
                value={user?.teacherInfo?.mandatoryScopusArticles || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={16}>
            <Col xs={24}>
              <Statistic
                title={t('teacher:dashboard.documentationRequired')}
                value={user?.teacherInfo?.mandatoryDocumentation || 0}
                prefix={<ExperimentOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Teaching Activities Progress */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <BookOutlined style={{ marginRight: 8 }} />
                  {t('teacher:dashboard.teachingProgress')}
                </span>
              }
            >
              <Statistic
                title={t('teacher:dashboard.validatedHours')}
                value={teachingStats.validatedHours}
                suffix={`/ ${teachingStats.mandatoryHours} ${t('common:label.hours')}`}
                valueStyle={{
                  color: getProgressColor(teachingStats.validatedHours, teachingStats.mandatoryHours),
                }}
              />
              <Progress
                percent={calculateProgress(teachingStats.validatedHours, teachingStats.mandatoryHours)}
                strokeColor={getProgressColor(teachingStats.validatedHours, teachingStats.mandatoryHours)}
                status={
                  teachingStats.validatedHours >= teachingStats.mandatoryHours
                    ? 'success'
                    : 'active'
                }
              />
              <div style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{t('teacher:dashboard.submitted')}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                      {teachingStats.submittedHours}h
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{t('teacher:dashboard.remaining')}</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f5222d' }}>
                      {Math.max(0, teachingStats.mandatoryHours - teachingStats.validatedHours)}h
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <ExperimentOutlined style={{ marginRight: 8 }} />
                  {t('teacher:dashboard.publicationsProgress')}
                </span>
              }
            >
              <Statistic
                title={t('teacher:dashboard.validatedArticles')}
                value={totalValidatedArticles}
                suffix={`/ ${totalMandatoryArticles} ${t('teacher:account.articles')}`}
                valueStyle={{
                  color: getProgressColor(totalValidatedArticles, totalMandatoryArticles),
                }}
              />
              <Progress
                percent={calculateProgress(totalValidatedArticles, totalMandatoryArticles)}
                strokeColor={getProgressColor(totalValidatedArticles, totalMandatoryArticles)}
                status={
                  totalValidatedArticles >= totalMandatoryArticles
                    ? 'success'
                    : 'active'
                }
              />
              <div style={{ marginTop: 16 }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{t('domain:publicationType.conference')}</div>
                    <Tag color="green">
                      {publicationStats.validatedConferenceArticles}/{publicationStats.mandatoryConferenceArticles}
                    </Tag>
                  </Col>
                  <Col span={8}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{t('domain:publicationType.national')}</div>
                    <Tag color="blue">
                      {publicationStats.validatedNationalArticles}/{publicationStats.mandatoryNationalArticles}
                    </Tag>
                  </Col>
                  <Col span={8}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>{t('domain:publicationType.scopus')}</div>
                    <Tag color="purple">
                      {publicationStats.validatedScopusArticles}/{publicationStats.mandatoryScopusArticles}
                    </Tag>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Stats */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('teacher:account.employmentType')}
                value={user?.teacherInfo?.employmentType
                  ? t(`domain:employment.${user.teacherInfo.employmentType}`)
                  : t('common:label.notSet')}
                valueStyle={{ fontSize: '18px', color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('teacher:account.department')}
                value={user?.teacherInfo?.department?.name || 'N/A'}
                valueStyle={{ fontSize: '18px', color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('teacher:account.totalSubmittedHours')}
                value={teachingStats.submittedHours}
                suffix={t('common:label.hours')}
                valueStyle={{ fontSize: '18px', color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={t('teacher:account.totalSubmittedArticles')}
                value={
                  publicationStats.submittedConferenceArticles +
                  publicationStats.submittedNationalArticles +
                  publicationStats.submittedScopusArticles
                }
                suffix={t('teacher:account.articles')}
                valueStyle={{ fontSize: '18px', color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
