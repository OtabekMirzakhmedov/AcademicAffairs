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
import MainLayout from '../components/layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import academicPeriodsService from '../services/academic-periods.service';
import teachingActivitiesService from '../services/teaching-activities.service';
import publicationsService from '../services/publications.service';
import type { AcademicPeriod, TeacherStats, PublicationStatistics } from '../types';

const DashboardPage = () => {
  const { user } = useAuthStore();
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
      setError(error.response?.data?.message || 'Failed to load dashboard data');
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
                Welcome, {user?.userInfo?.firstName} {user?.userInfo?.lastName}
              </h1>
              <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Teacher Dashboard - Overview of your academic activities and requirements
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

        {/* Teacher Requirements Summary */}
        <Card
          title={
            <span>
              <TrophyOutlined style={{ marginRight: 8 }} />
              My Requirements Summary
            </span>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Mandatory Teaching Hours (Per Period)"
                value={user?.teacherInfo?.mandatoryHoursPerPeriod || 0}
                suffix="hours"
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Mandatory Extracurricular Hours"
                value={user?.teacherInfo?.mandatoryExtracurricularHours || 0}
                suffix="hours"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
          </Row>
          <Divider />
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Statistic
                title="Conference Articles Required"
                value={user?.teacherInfo?.mandatoryConferenceArticles || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="National Articles Required"
                value={user?.teacherInfo?.mandatoryNationalArticles || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Scopus Articles Required"
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
                title="Documentation Items Required"
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
                  Teaching Hours Progress
                </span>
              }
            >
              <Statistic
                title="Validated Hours"
                value={teachingStats.validatedHours}
                suffix={`/ ${teachingStats.mandatoryHours} hours`}
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
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Submitted</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                      {teachingStats.submittedHours}h
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>Remaining</div>
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
                  Publications Progress
                </span>
              }
            >
              <Statistic
                title="Validated Articles"
                value={totalValidatedArticles}
                suffix={`/ ${totalMandatoryArticles} articles`}
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
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Conference</div>
                    <Tag color="green">
                      {publicationStats.validatedConferenceArticles}/{publicationStats.mandatoryConferenceArticles}
                    </Tag>
                  </Col>
                  <Col span={8}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>National</div>
                    <Tag color="blue">
                      {publicationStats.validatedNationalArticles}/{publicationStats.mandatoryNationalArticles}
                    </Tag>
                  </Col>
                  <Col span={8}>
                    <div style={{ fontSize: '11px', color: '#8c8c8c' }}>Scopus</div>
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
                title="Employment Type"
                value={user?.teacherInfo?.employmentType?.replace('-', ' ').toUpperCase() || 'Not Set'}
                valueStyle={{ fontSize: '18px', color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Department"
                value={user?.teacherInfo?.department?.name || 'N/A'}
                valueStyle={{ fontSize: '18px', color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Submitted Hours"
                value={teachingStats.submittedHours}
                suffix="hours"
                valueStyle={{ fontSize: '18px', color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Submitted Articles"
                value={
                  publicationStats.submittedConferenceArticles +
                  publicationStats.submittedNationalArticles +
                  publicationStats.submittedScopusArticles
                }
                suffix="articles"
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
