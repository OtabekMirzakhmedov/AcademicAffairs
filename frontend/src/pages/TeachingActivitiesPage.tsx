import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Statistic,
  Row,
  Col,
  Tag,
  Spin,
  Alert,
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '../components/layout/MainLayout';
import academicPeriodsService from '../services/academic-periods.service';
import courseTeachersService from '../services/course-teachers.service';
import teachingActivitiesService from '../services/teaching-activities.service';
import type { AcademicPeriod, CourseTeacher } from '../types';
import './TeachingActivitiesPage.scss';

interface AssignedCourse {
  key: number;
  courseName: string;
  groups: string[];
  department: string;
  totalHours: number;
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
}

const TeachingActivitiesPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<AcademicPeriod | null>(null);
  const [stats, setStats] = useState({
    mandatoryHours: 0,
    submittedHours: 0,
    validatedHours: 0,
    otherHours: 0,
  });
  const [assignments, setAssignments] = useState<AssignedCourse[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch active academic period
      const period = await academicPeriodsService.getActive();
      setActivePeriod(period);

      // Fetch teaching statistics
      const statistics = await teachingActivitiesService.getStatistics(period.id);
      setStats({
        mandatoryHours: statistics.mandatoryHours,
        submittedHours: statistics.submittedHours,
        validatedHours: statistics.validatedHours,
        otherHours: statistics.submittedHours - statistics.mandatoryHours,
      });

      // Fetch course assignments
      const courseAssignments = await courseTeachersService.getMyAssignments();
      const formattedAssignments: AssignedCourse[] = courseAssignments.map((assignment: CourseTeacher) => ({
        key: assignment.id,
        courseName: assignment.course?.name || 'Unknown Course',
        groups: assignment.groups || [],
        department: assignment.course?.department?.name || 'N/A',
        totalHours: assignment.teachingActivities?.[0]?.totalHours || 0,
        status: (assignment.teachingActivities?.[0]?.status as AssignedCourse['status']) || 'draft',
      }));
      setAssignments(formattedAssignments);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load teaching activities data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'submitted':
        return 'processing';
      case 'validated':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<AssignedCourse> = [
    {
      title: 'Course Name',
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: string[]) => (
        <>
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              <Tag key={group} color="blue">
                {group}
              </Tag>
            ))
          ) : (
            <Tag>No groups</Tag>
          )}
        </>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.totalHours - b.totalHours,
      render: (hours) => <strong>{hours}h</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="teaching-activities-page" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip="Loading teaching activities..." />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="teaching-activities-page">
          <Alert
            message="Error Loading Data"
            description={error}
            type="error"
            showIcon
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="teaching-activities-page">
        <div className="page-header">
          <h1 className="page-title">Teaching Activities</h1>
          <p className="page-subtitle">Track your teaching workload and assignments</p>
        </div>

        {/* Academic Period Info */}
        {activePeriod && (
          <Card className="period-card" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div className="period-info">
                  <span className="period-label">Academic Year:</span>
                  <span className="period-value">{activePeriod.academicYear}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className="period-info">
                  <span className="period-label">Semester:</span>
                  <span className="period-value">
                    {activePeriod.semester === 1 ? 'Fall' : 'Spring'} (Semester {activePeriod.semester})
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className="period-info">
                  <span className="period-label">Teaching Week:</span>
                  <span className="period-value">Week {activePeriod.teachingWeek}</span>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Hours Statistics */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Mandatory Hours"
                value={stats.mandatoryHours}
                suffix="hrs"
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Validated Hours"
                value={stats.validatedHours}
                suffix="hrs"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Other Hours"
                value={stats.otherHours}
                suffix="hrs"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Submitted"
                value={stats.submittedHours}
                suffix="hrs"
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Assigned Courses Table */}
        <Card
          title="Assigned Courses"
          className="courses-card"
        >
          <Table
            columns={columns}
            dataSource={assignments}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} courses`,
            }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default TeachingActivitiesPage;
