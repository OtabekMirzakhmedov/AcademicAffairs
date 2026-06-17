import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Tag,
  Collapse,
  Table,
  message,
  Modal,
  Spin,
  Empty,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  BookOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import MainLayout from '../../components/layout/MainLayout';
import ProgramFormModal from '../../components/features/department-head/ProgramFormModal';
import AddCourseToSemesterModal from '../../components/features/department-head/AddCourseToSemesterModal';
import programsService from '../../services/programs.service';
import coursesService from '../../services/courses.service';
import departmentsService from '../../services/departments.service';
import type { Program, ProgramCourse, Course, Department } from '../../types';
import './ProgramDetailPage.scss';

interface SemesterCourse extends ProgramCourse {
  course: Course;
}

const ProgramDetailPage = () => {
  const { t } = useTranslation(['head', 'common', 'domain']);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addCourseModalOpen, setAddCourseModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  useEffect(() => {
    if (id) {
      fetchProgram();
      fetchCourses();
      fetchDepartments();
    }
  }, [id]);

  const fetchProgram = async () => {
    try {
      setLoading(true);
      const data = await programsService.getOne(Number(id));
      setProgram(data);
    } catch (error) {
      message.error(t('head:program.fetchFailed'));
      navigate('/department/activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await coursesService.getAll();
      setCourses(data);
    } catch (error) {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await departmentsService.getAll();
      setDepartments(data);
    } catch (error) {
      message.error(t('common:message.failedToLoad'));
    }
  };

  const handleAddCourse = (semester: number) => {
    setSelectedSemester(semester);
    setAddCourseModalOpen(true);
  };

  const handleRemoveCourse = (courseId: number) => {
    if (!program) return;
    Modal.confirm({
      title: t('head:program.removeCourseTitle'),
      content: t('head:program.removeCourseConfirm'),
      okText: t('common:button.remove'),
      okType: 'danger',
      onOk: async () => {
        try {
          await programsService.removeCourse(program.id, courseId);
          message.success(t('head:program.removeCourseSuccess'));
          fetchProgram();
        } catch (error) {
          message.error(t('head:program.removeCourseFailed'));
        }
      },
    });
  };

  // Group courses by semester
  const coursesBySemester = useMemo(() => {
    if (!program?.programCourses) return new Map<number, SemesterCourse[]>();

    const grouped = new Map<number, SemesterCourse[]>();
    for (const pc of program.programCourses) {
      const semester = pc.recommendedSemester || 1;
      if (!grouped.has(semester)) {
        grouped.set(semester, []);
      }
      if (pc.course) {
        grouped.get(semester)!.push(pc as SemesterCourse);
      }
    }
    return grouped;
  }, [program]);

  // Generate semester panels based on program duration
  const totalSemesters = (program?.durationYears || 4) * 2;

  const courseColumns: ColumnsType<SemesterCourse> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: t('head:activities.courseName'),
      key: 'name',
      render: (_, record) => (
        <span>
          <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {record.course.name}
        </span>
      ),
    },
    {
      title: t('head:course.lectureHours'),
      key: 'lectureHours',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {record.course.lectureHours || 0}
        </span>
      ),
    },
    {
      title: t('head:course.practiceHours'),
      key: 'practiceHours',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <span>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {record.course.practiceHours || 0}
        </span>
      ),
    },
    {
      title: t('common:label.type'),
      key: 'isRequired',
      width: 100,
      render: (_, record) => (
        <Tag color={record.isRequired ? 'blue' : 'orange'}>
          {record.isRequired ? t('domain:courseType.required') : t('domain:courseType.elective')}
        </Tag>
      ),
    },
    {
      title: t('common:label.actions'),
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Tooltip title={t('head:program.removeTooltip')}>
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveCourse(record.courseId)}
          />
        </Tooltip>
      ),
    },
  ];

  const getSemesterLabel = (semester: number) => {
    const year = Math.ceil(semester / 2);
    const semInYear = semester % 2 === 1 ? 1 : 2;
    return t('head:program.semesterLabel', { year, sem: semInYear });
  };

  const collapseItems = Array.from({ length: totalSemesters }, (_, i) => {
    const semester = i + 1;
    const semesterCourses = coursesBySemester.get(semester) || [];

    return {
      key: String(semester),
      label: (
        <div className="semester-header">
          <span>{getSemesterLabel(semester)}</span>
          <Tag color="green">{t('head:program.coursesInSemester', { count: semesterCourses.length })}</Tag>
        </div>
      ),
      children: (
        <div className="semester-content">
          {semesterCourses.length > 0 ? (
            <Table
              columns={courseColumns}
              dataSource={semesterCourses}
              rowKey="id"
              pagination={false}
              size="small"
            />
          ) : (
            <Empty
              description={t('head:program.noCoursesInSemester')}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => handleAddCourse(semester)}
            style={{ marginTop: 16 }}
          >
            {t('head:program.addCourseTitle', { semesterLabel: getSemesterLabel(semester) })}
          </Button>
        </div>
      ),
    };
  });

  const degreeColors: Record<string, string> = {
    BACHELOR: 'cyan',
    MASTER: 'purple',
    DOCTORATE: 'gold',
    UNDERGRADUATE: 'blue',
    GRADUATE: 'magenta',
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  if (!program) {
    return (
      <MainLayout>
        <Card>
          <Empty description={t('head:program.notFound')} />
          <Button onClick={() => navigate('/department/activities')}>
            {t('head:program.backToDepartment')}
          </Button>
        </Card>
      </MainLayout>
    );
  }

  // Filter out courses already in the program for the add modal
  const programCourseIds = program.programCourses?.map((pc) => pc.courseId) || [];
  const availableCourses = courses.filter(
    (c) => c.departmentId === program.departmentId && !programCourseIds.includes(c.id)
  );

  return (
    <MainLayout>
      <div className="program-detail-page">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/department/activities')}
          className="back-button"
        >
          {t('head:program.backToDepartment')}
        </Button>

        <Card className="program-header-card">
          <div className="program-header">
            <div className="program-info">
              <div className="program-title">
                <Tag color={degreeColors[program.degreeLevel] || 'default'}>
                  {program.degreeLevel}
                </Tag>
                <h1>{program.name}</h1>
                <Tag color="blue">{program.code}</Tag>
                <Tag color={program.isActive ? 'success' : 'default'}>
                  {program.isActive ? t('domain:status.active') : t('domain:status.inactive')}
                </Tag>
              </div>
              <div className="program-meta">
                <span>{program.durationYears} years</span>
                <span className="separator">|</span>
                <span>{program.totalCreditsRequired} credits required</span>
                <span className="separator">|</span>
                <span>{program.programCourses?.length || 0} courses</span>
              </div>
              {program.description && (
                <p className="program-description">{program.description}</p>
              )}
            </div>
            <div className="program-actions">
              <Space>
                <Button icon={<EditOutlined />} onClick={() => setEditModalOpen(true)}>
                  {t('head:program.editTitle')}
                </Button>
              </Space>
            </div>
          </div>
        </Card>

        <Card className="semesters-card" title={t('head:program.curriculum')}>
          <Collapse items={collapseItems} defaultActiveKey={['1']} />
        </Card>

        <ProgramFormModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            fetchProgram();
          }}
          program={program}
          departmentId={program.departmentId}
          departments={departments}
        />

        <AddCourseToSemesterModal
          open={addCourseModalOpen}
          onClose={() => setAddCourseModalOpen(false)}
          onSuccess={() => {
            setAddCourseModalOpen(false);
            fetchProgram();
          }}
          programId={program.id}
          semester={selectedSemester}
          availableCourses={availableCourses}
        />
      </div>
    </MainLayout>
  );
};

export default ProgramDetailPage;
