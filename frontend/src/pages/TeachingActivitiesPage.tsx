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
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tooltip,
  Space,
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import academicPeriodsService from '../services/academic-periods.service';
import courseTeachersService from '../services/course-teachers.service';
import teachingActivitiesService from '../services/teaching-activities.service';
import type { AcademicPeriod, CourseTeacher } from '../types';
import './TeachingActivitiesPage.scss';

interface AssignedCourse {
  key: number;
  courseTeacherId: number;
  courseId: number;
  courseName: string;
  groups: string[];
  department: string;
  lectureHours: number;
  practiceHours: number;
  labHours: number;
  totalHours: number;
  status: 'draft' | 'submitted' | 'validated' | 'rejected';
  activityId?: number;
}

const TeachingActivitiesPage = () => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['teacher', 'common', 'domain']);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AssignedCourse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const period = await academicPeriodsService.getActive();
      setActivePeriod(period);

      const statistics = await teachingActivitiesService.getStatistics(period.id);
      setStats({
        mandatoryHours: statistics.mandatoryHours,
        submittedHours: statistics.submittedHours,
        validatedHours: statistics.validatedHours,
        otherHours: statistics.submittedHours - statistics.mandatoryHours,
      });

      const courseAssignments = await courseTeachersService.getMyAssignments();
      const formattedAssignments: AssignedCourse[] = courseAssignments.map((assignment: CourseTeacher) => {
        const activity = assignment.teachingActivities?.[0];
        return {
          key: assignment.id,
          courseTeacherId: assignment.id,
          courseId: assignment.courseId,
          courseName: assignment.course?.name || 'Unknown Course',
          groups: assignment.groups || [],
          department: assignment.course?.department?.name || 'N/A',
          lectureHours: activity?.lectureHours || 0,
          practiceHours: activity?.practiceHours || 0,
          labHours: activity?.labHours || 0,
          totalHours: activity?.totalHours || 0,
          status: (activity?.status as AssignedCourse['status']) || 'draft',
          activityId: activity?.id,
        };
      });
      setAssignments(formattedAssignments);
    } catch (err: any) {
      setError(err.message || t('common:message.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'processing';
      case 'validated': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const handleAddHours = (course: AssignedCourse) => {
    setEditingCourse(course);
    form.setFieldsValue({
      lectureHours: course.lectureHours,
      practiceHours: course.practiceHours,
      labHours: course.labHours,
      groups: course.groups,
    });
    setIsModalOpen(true);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    form.resetFields();
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const activityData = {
        courseTeacherId: Number(editingCourse!.courseTeacherId),
        courseId: Number(editingCourse!.courseId),
        academicPeriodId: Number(activePeriod!.id),
        groups: values.groups || editingCourse!.groups || [],
        lectureHours: Number(values.lectureHours) || 0,
        practiceHours: Number(values.practiceHours) || 0,
        labHours: Number(values.labHours) || 0,
        seminarHours: 0,
        advisingHours: 0,
      };

      if (editingCourse!.activityId) {
        await teachingActivitiesService.update(editingCourse!.activityId, activityData);
        message.success(t('teacher:teachingActivities.updateSuccess'));
      } else {
        await teachingActivitiesService.create(activityData);
        message.success(t('teacher:teachingActivities.addSuccess'));
      }

      setIsModalOpen(false);
      setEditingCourse(null);
      form.resetFields();
      await fetchData();
    } catch (error: any) {
      message.error(error.message || t('teacher:teachingActivities.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (course: AssignedCourse) => {
    if (!course.activityId) return;

    Modal.confirm({
      title: t('teacher:teachingActivities.submitTitle'),
      content: t('teacher:teachingActivities.submitConfirm', { courseName: course.courseName }),
      okText: t('common:button.submit'),
      cancelText: t('common:button.cancel'),
      onOk: async () => {
        try {
          await teachingActivitiesService.submit(course.activityId!);
          message.success(t('teacher:teachingActivities.submitSuccess'));
          await fetchData();
        } catch (error: any) {
          message.error(error.message || t('teacher:teachingActivities.submitFailed'));
        }
      },
    });
  };

  const columns: ColumnsType<AssignedCourse> = [
    {
      title: t('teacher:teachingActivities.courseName'),
      dataIndex: 'courseName',
      key: 'courseName',
      sorter: (a, b) => a.courseName.localeCompare(b.courseName),
    },
    {
      title: t('teacher:teachingActivities.groups'),
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
            <Tag>{t('common:label.noGroups')}</Tag>
          )}
        </>
      ),
    },
    {
      title: t('common:label.department'),
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: t('teacher:teachingActivities.lecture'),
      dataIndex: 'lectureHours',
      key: 'lectureHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: t('teacher:teachingActivities.practice'),
      dataIndex: 'practiceHours',
      key: 'practiceHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: t('teacher:teachingActivities.lab'),
      dataIndex: 'labHours',
      key: 'labHours',
      width: 90,
      align: 'center',
      render: (hours) => `${hours}h`,
    },
    {
      title: t('common:label.total'),
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.totalHours - b.totalHours,
      render: (hours) => <strong>{hours}h</strong>,
    },
    {
      title: t('common:label.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`domain:status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {(record.status === 'draft' || record.status === 'submitted' || record.status === 'rejected') && (
            <Tooltip title={record.activityId ? t('teacher:teachingActivities.updateHours') : t('teacher:teachingActivities.addHours')}>
              <Button
                type={record.activityId ? 'default' : 'primary'}
                size="small"
                icon={record.activityId ? <EditOutlined /> : <PlusOutlined />}
                onClick={() => handleAddHours(record)}
              >
                {record.activityId ? t('common:button.update') : t('common:button.add')}
              </Button>
            </Tooltip>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && record.activityId && (
            <Tooltip title={record.status === 'rejected' ? t('teacher:teachingActivities.resubmitTooltip') : t('teacher:teachingActivities.submitTooltip')}>
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={() => handleSubmit(record)}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                {record.status === 'rejected' ? t('common:button.resubmit') : t('common:button.submit')}
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="teaching-activities-page" style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" tip={t('teacher:teachingActivities.loading')} />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="teaching-activities-page">
          <Alert
            message={t('common:message.errorLoading')}
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
          <h1 className="page-title">{t('teacher:teachingActivities.title')}</h1>
          <p className="page-subtitle">{t('teacher:teachingActivities.desc')}</p>
        </div>

        {activePeriod && (
          <Card className="period-card" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div className="period-info">
                  <span className="period-label">{t('teacher:dashboard.academicYear')}:</span>
                  <span className="period-value">{activePeriod.academicYear}</span>
                </div>
              </Col>
              <Col span={8}>
                <div className="period-info">
                  <span className="period-label">{t('teacher:dashboard.semester')}:</span>
                  <span className="period-value">
                    {t(`domain:semester.${activePeriod.semester}`)} ({t('teacher:dashboard.semester')} {activePeriod.semester})
                  </span>
                </div>
              </Col>
              <Col span={8}>
                <div className="period-info">
                  <span className="period-label">{t('teacher:dashboard.teachingWeek')}:</span>
                  <span className="period-value">{t('teacher:dashboard.week', { number: activePeriod.teachingWeek })}</span>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('teacher:teachingActivities.mandatoryHours')}
                value={stats.mandatoryHours}
                suffix={t('teacher:teachingActivities.hoursShort')}
                prefix={<BookOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('teacher:teachingActivities.validatedHours')}
                value={stats.validatedHours}
                suffix={t('teacher:teachingActivities.hoursShort')}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('teacher:teachingActivities.otherHours')}
                value={stats.otherHours}
                suffix={t('teacher:teachingActivities.hoursShort')}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('teacher:teachingActivities.totalSubmitted')}
                value={stats.submittedHours}
                suffix={t('teacher:teachingActivities.hoursShort')}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          title={t('teacher:teachingActivities.assignedCourses')}
          className="courses-card"
        >
          <Table
            columns={columns}
            dataSource={assignments}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => t('teacher:teachingActivities.totalCourses', { total }),
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        <Modal
          title={editingCourse?.activityId ? t('teacher:teachingActivities.updateHours') : t('teacher:teachingActivities.addHours')}
          open={isModalOpen}
          onOk={handleModalSubmit}
          onCancel={handleModalCancel}
          confirmLoading={submitting}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            style={{ marginTop: 24 }}
          >
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <strong>Course:</strong> {editingCourse?.courseName}
            </div>

            <Form.Item
              name="groups"
              label={t('teacher:teachingActivities.groups')}
            >
              <Select
                mode="tags"
                placeholder={t('teacher:teachingActivities.groupsPlaceholder')}
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="lectureHours"
                  label={t('teacher:teachingActivities.lectureHours')}
                  rules={[{ required: true, message: t('common:label.required') }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="practiceHours"
                  label={t('teacher:teachingActivities.practiceHours')}
                  rules={[{ required: true, message: t('common:label.required') }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="labHours"
                  label={t('teacher:teachingActivities.labHours')}
                  rules={[{ required: true, message: t('common:label.required') }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default TeachingActivitiesPage;
