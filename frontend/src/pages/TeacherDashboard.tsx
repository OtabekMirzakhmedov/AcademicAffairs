import { useState, useEffect } from 'react';
import { Card, Row, Col, Progress, Button, Statistic, Tag, Empty } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import MainLayout from '../components/layout/MainLayout';
import './TeacherDashboard.scss';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    mandatoryHours: user?.teacherInfo?.mandatoryHoursPerPeriod || 500,
    submittedHours: 0,
    validatedHours: 0,
  });

  // Calculate progress percentages
  const submittedProgress = (stats.submittedHours / stats.mandatoryHours) * 100;
  const validatedProgress = (stats.validatedHours / stats.mandatoryHours) * 100;

  const getProgressStatus = (progress: number) => {
    if (progress >= 100) return 'success';
    if (progress >= 75) return 'normal';
    if (progress >= 50) return 'active';
    return 'exception';
  };

  return (
    <MainLayout>
      <div className="teacher-dashboard">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1 className="welcome-title">
              Welcome back, {user?.userInfo?.firstName || user?.login}!
            </h1>
            <p className="welcome-subtitle">
              Here's an overview of your teaching workload for this semester
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="add-activity-btn"
            onClick={() => navigate('/teaching-activities/new')}
          >
            Add Teaching Activity
          </Button>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="stats-row">
          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card mandatory-card" bordered={false}>
              <div className="card-icon">
                <TrophyOutlined />
              </div>
              <Statistic
                title="Mandatory Hours"
                value={stats.mandatoryHours}
                suffix="hrs"
                valueStyle={{ color: '#667eea', fontWeight: 'bold' }}
              />
              <div className="card-footer">
                <Tag color="purple">Target for this semester</Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card submitted-card" bordered={false}>
              <div className="card-icon">
                <ClockCircleOutlined />
              </div>
              <Statistic
                title="Submitted Hours"
                value={stats.submittedHours}
                suffix={`/ ${stats.mandatoryHours} hrs`}
                valueStyle={{ color: '#4facfe', fontWeight: 'bold' }}
              />
              <div className="card-footer">
                <Progress
                  percent={Number(submittedProgress.toFixed(1))}
                  status={getProgressStatus(submittedProgress)}
                  strokeColor={{
                    '0%': '#4facfe',
                    '100%': '#00f2fe',
                  }}
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={8}>
            <Card className="stat-card validated-card" bordered={false}>
              <div className="card-icon">
                <CheckCircleOutlined />
              </div>
              <Statistic
                title="Validated Hours"
                value={stats.validatedHours}
                suffix={`/ ${stats.mandatoryHours} hrs`}
                valueStyle={{ color: '#0ba360', fontWeight: 'bold' }}
              />
              <div className="card-footer">
                <Progress
                  percent={Number(validatedProgress.toFixed(1))}
                  status={getProgressStatus(validatedProgress)}
                  strokeColor={{
                    '0%': '#0ba360',
                    '100%': '#3cba92',
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Activities Overview */}
        <Row gutter={[24, 24]} className="content-row">
          <Col xs={24} lg={16}>
            <Card
              title={
                <span>
                  <BookOutlined /> Recent Teaching Activities
                </span>
              }
              extra={<Button type="link">View All</Button>}
              className="activities-card"
            >
              <Empty
                description="No teaching activities yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/teaching-activities/new')}
                >
                  Add Your First Activity
                </Button>
              </Empty>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="Quick Stats"
              className="quick-stats-card"
            >
              <div className="stat-item">
                <span className="stat-label">Total Courses</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Draft Activities</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending Validation</span>
                <span className="stat-value">0</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Completion Rate</span>
                <span className="stat-value">
                  {validatedProgress.toFixed(1)}%
                </span>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Department Info */}
        {user?.teacherInfo && (
          <Row gutter={[24, 24]}>
            <Col span={24}>
              <Card className="department-card">
                <Row gutter={16} align="middle">
                  <Col xs={24} sm={12}>
                    <div className="info-item">
                      <span className="info-label">Department:</span>
                      <span className="info-value">
                        {user.teacherInfo.department?.name || 'Not Assigned'}
                      </span>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div className="info-item">
                      <span className="info-label">Employment Type:</span>
                      <span className="info-value">
                        <Tag color="blue">
                          {user.teacherInfo.employmentType || 'Not Set'}
                        </Tag>
                      </span>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </MainLayout>
  );
};

export default TeacherDashboard;
