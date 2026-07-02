import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Button,
  Divider,
  Row,
  Col,
  App,
  Space,
  Typography,
  Checkbox,
  Card,
  Descriptions,
  Avatar,
  Tag,
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import {
  User as UserIcon,
  Calendar,
  MapPin,
  Fingerprint,
  Phone,
  GraduationCap,
  FlaskConical,
  Award,
  Star,
  BookOpen,
  Trophy,
  Users,
  Presentation,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import usersService, { type UpdateUserAccountRequest } from '../../../services/users.service';
import type { User } from '../../../types';
import dayjs from 'dayjs';
import './AccountInfoTab.scss';

const { Text, Title } = Typography;
const { TextArea } = Input;

const ROLE_COLOR: Record<string, string> = {
  admin: 'red',
  departmenthead: 'blue',
  teacher: 'green',
};

const Section = ({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="account-info-tab__section">
    <div className="account-info-tab__section-title">
      <Icon size={16} strokeWidth={1.75} />
      <span>{title}</span>
    </div>
    <Descriptions bordered size="small" column={{ xs: 1, sm: 2, md: 3 }}>
      {children}
    </Descriptions>
  </div>
);

interface AccountInfoTabProps {
  user: User;
  onSuccess: (updatedUser?: User) => void;
}

const AccountInfoTab = ({ user, onSuccess }: AccountInfoTabProps) => {
  const { t } = useTranslation(['auth', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.userInfo?.firstName,
        lastName: user.userInfo?.lastName,
        middleName: user.userInfo?.middleName,
        dateOfBirth: user.userInfo?.dateOfBirth ? dayjs(user.userInfo.dateOfBirth) : null,
        gender: user.userInfo?.gender,
        nationality: user.userInfo?.nationality,
        countryOfBirth: user.userInfo?.countryOfBirth,
        regionOfBirth: user.userInfo?.regionOfBirth,
        currentAddress: user.userInfo?.currentAddress,
        permanentAddress: user.userInfo?.permanentAddress,
        passportSerial: user.userInfo?.passportSerial,
        personalId: user.userInfo?.personalId,
        stirInn: user.userInfo?.stirInn,
        englishLevel: user.userInfo?.englishLevel,
        phone1: user.userInfo?.phone1,
        email1: user.userInfo?.email1,
        bachelorUniversity: user.teacherInfo?.bachelorUniversity,
        bachelorYear: user.teacherInfo?.bachelorYear,
        bachelorDirection: user.teacherInfo?.bachelorDirection,
        bachelorDiplomaNumber: user.teacherInfo?.bachelorDiplomaNumber,
        masterUniversity: user.teacherInfo?.masterUniversity,
        masterYear: user.teacherInfo?.masterYear,
        masterDirection: user.teacherInfo?.masterDirection,
        masterDiplomaNumber: user.teacherInfo?.masterDiplomaNumber,
        researchArea: user.teacherInfo?.researchArea,
        hasPhdDegree: user.teacherInfo?.hasPhdDegree,
        phdYear: user.teacherInfo?.phdYear,
        phdSpeciality: user.teacherInfo?.phdSpeciality,
        phdTopic: user.teacherInfo?.phdTopic,
        phdDiplomaNumber: user.teacherInfo?.phdDiplomaNumber,
        phdCountry: user.teacherInfo?.phdCountry,
        phdOrganization: user.teacherInfo?.phdOrganization,
        hasDscDegree: user.teacherInfo?.hasDscDegree,
        dscYear: user.teacherInfo?.dscYear,
        dscSpeciality: user.teacherInfo?.dscSpeciality,
        dscTopic: user.teacherInfo?.dscTopic,
        dscDiplomaNumber: user.teacherInfo?.dscDiplomaNumber,
        dscCountry: user.teacherInfo?.dscCountry,
        dscOrganization: user.teacherInfo?.dscOrganization,
        hasAcademicTitle: user.teacherInfo?.hasAcademicTitle,
        academicTitleName: user.teacherInfo?.academicTitleName,
        academicTitleSpeciality: user.teacherInfo?.academicTitleSpeciality,
        academicTitleYear: user.teacherInfo?.academicTitleYear,
        academicTitleAttestat: user.teacherInfo?.academicTitleAttestat,
        internshipsCount: user.teacherInfo?.internshipsCount,
        internshipsInfo: user.teacherInfo?.internshipsInfo,
        trainingCount: user.teacherInfo?.trainingCount,
        trainingInfo: user.teacherInfo?.trainingInfo,
        awardsField: user.teacherInfo?.awardsField,
        awardsState: user.teacherInfo?.awardsState,
        supervisedPhd: user.teacherInfo?.supervisedPhd,
        supervisedDsc: user.teacherInfo?.supervisedDsc,
        conferencesRepublic: user.teacherInfo?.conferencesRepublic,
        conferencesInternational: user.teacherInfo?.conferencesInternational,
        seminarsRepublic: user.teacherInfo?.seminarsRepublic,
        seminarsInternational: user.teacherInfo?.seminarsInternational,
        projectsFundamental: user.teacherInfo?.projectsFundamental,
        projectsPractical: user.teacherInfo?.projectsPractical,
        projectsYouth: user.teacherInfo?.projectsYouth,
        projectsBusiness: user.teacherInfo?.projectsBusiness,
        projectsInnovation: user.teacherInfo?.projectsInnovation,
        innovativeIdeasCount: user.teacherInfo?.innovativeIdeasCount,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: UpdateUserAccountRequest = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
      };
      const updatedUser = await usersService.updateAccount(user.id, payload);
      message.success(t('auth:account.updateSuccess'));
      setIsEditing(false);
      onSuccess(updatedUser);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        t('auth:account.updateFailed');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const dv = (value: string | number | null | undefined) =>
    value === null || value === undefined || value === '' ? '-' : value;
  const yn = (value: boolean | undefined) => (value ? t('common:label.yes') : t('common:label.no'));
  const fullName = [user.userInfo?.firstName, user.userInfo?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  const initials = `${user.userInfo?.firstName?.[0] ?? ''}${user.userInfo?.lastName?.[0] ?? ''}`.toUpperCase();

  if (!isEditing) {
    return (
      <Card className="account-info-tab">
        <div className="account-info-tab__header">
          <div className="account-info-tab__identity">
            <Avatar size={64} className="account-info-tab__avatar">
              {initials || <UserOutlined />}
            </Avatar>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {fullName || user.login}
              </Title>
              <Space size={8} wrap className="account-info-tab__meta">
                <Tag color={ROLE_COLOR[user.role.name] ?? 'default'}>
                  {t(`domain:role.${user.role.name}`)}
                </Tag>
                {user.teacherInfo?.department?.name && (
                  <Text type="secondary">{user.teacherInfo.department.name}</Text>
                )}
                <Text type="secondary">@{user.login}</Text>
              </Space>
            </div>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
            className="account-info-tab__edit-actions"
          >
            {t('auth:account.editProfile')}
          </Button>
        </div>

        <Section icon={UserIcon} title={t('auth:account.mainInfo')}>
          <Descriptions.Item label={t('auth:account.firstName')}>{dv(user.userInfo?.firstName)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.lastName')}>{dv(user.userInfo?.lastName)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.middleName')}>{dv(user.userInfo?.middleName)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.dateOfBirth')}>
            {user.userInfo?.dateOfBirth ? dayjs(user.userInfo.dateOfBirth).format('YYYY-MM-DD') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('auth:account.gender')}>{dv(user.userInfo?.gender)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.nationality')}>{dv(user.userInfo?.nationality)}</Descriptions.Item>
        </Section>

        <Section icon={Calendar} title={t('auth:account.birthInfo')}>
          <Descriptions.Item label={t('auth:account.countryOfBirth')}>{dv(user.userInfo?.countryOfBirth)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.regionOfBirth')}>{dv(user.userInfo?.regionOfBirth)}</Descriptions.Item>
        </Section>

        <Section icon={MapPin} title={t('auth:account.addressInfo')}>
          <Descriptions.Item label={t('auth:account.currentAddress')}>{dv(user.userInfo?.currentAddress)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.permanentAddress')}>{dv(user.userInfo?.permanentAddress)}</Descriptions.Item>
        </Section>

        <Section icon={Fingerprint} title={t('auth:account.identification')}>
          <Descriptions.Item label={t('auth:account.passportSerial')}>{dv(user.userInfo?.passportSerial)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.personalId')}>{dv(user.userInfo?.personalId)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.stirInn')}>{dv(user.userInfo?.stirInn)}</Descriptions.Item>
        </Section>

        <Section icon={Phone} title={t('auth:account.contactInfo')}>
          <Descriptions.Item label={t('auth:account.englishLevel')}>{dv(user.userInfo?.englishLevel)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.phone')}>{dv(user.userInfo?.phone1)}</Descriptions.Item>
          <Descriptions.Item label={t('auth:account.email')}>{dv(user.userInfo?.email1)}</Descriptions.Item>
        </Section>

        {user.role.name === 'teacher' && (
          <>
            <Section icon={GraduationCap} title={t('auth:account.bachelorDegree')}>
              <Descriptions.Item label={t('auth:account.bachelorUniversity')}>{dv(user.teacherInfo?.bachelorUniversity)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.bachelorYear')}>{dv(user.teacherInfo?.bachelorYear)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.bachelorDirection')}>{dv(user.teacherInfo?.bachelorDirection)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.bachelorDiplomaNumber')}>{dv(user.teacherInfo?.bachelorDiplomaNumber)}</Descriptions.Item>
            </Section>

            <Section icon={GraduationCap} title={t('auth:account.masterDegree')}>
              <Descriptions.Item label={t('auth:account.masterUniversity')}>{dv(user.teacherInfo?.masterUniversity)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.masterYear')}>{dv(user.teacherInfo?.masterYear)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.masterDirection')}>{dv(user.teacherInfo?.masterDirection)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.masterDiplomaNumber')}>{dv(user.teacherInfo?.masterDiplomaNumber)}</Descriptions.Item>
            </Section>

            <Section icon={FlaskConical} title={t('auth:account.research')}>
              <Descriptions.Item label={t('auth:account.researchArea')} span={3}>{dv(user.teacherInfo?.researchArea)}</Descriptions.Item>
            </Section>

            <Section icon={Award} title={t('auth:account.phdDegree')}>
              <Descriptions.Item label={t('auth:account.hasPhdDegree')} span={3}>{yn(user.teacherInfo?.hasPhdDegree)}</Descriptions.Item>
              {user.teacherInfo?.hasPhdDegree && (
                <>
                  <Descriptions.Item label={t('auth:account.phdYear')}>{dv(user.teacherInfo?.phdYear)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.phdSpeciality')}>{dv(user.teacherInfo?.phdSpeciality)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.phdDiplomaNumber')}>{dv(user.teacherInfo?.phdDiplomaNumber)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.phdTopic')} span={3}>{dv(user.teacherInfo?.phdTopic)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.phdCountry')}>{dv(user.teacherInfo?.phdCountry)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.phdOrganization')} span={2}>{dv(user.teacherInfo?.phdOrganization)}</Descriptions.Item>
                </>
              )}
            </Section>

            <Section icon={Award} title={t('auth:account.dscDegree')}>
              <Descriptions.Item label={t('auth:account.hasDscDegree')} span={3}>{yn(user.teacherInfo?.hasDscDegree)}</Descriptions.Item>
              {user.teacherInfo?.hasDscDegree && (
                <>
                  <Descriptions.Item label={t('auth:account.dscYear')}>{dv(user.teacherInfo?.dscYear)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.dscSpeciality')}>{dv(user.teacherInfo?.dscSpeciality)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.dscDiplomaNumber')}>{dv(user.teacherInfo?.dscDiplomaNumber)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.dscTopic')} span={3}>{dv(user.teacherInfo?.dscTopic)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.dscCountry')}>{dv(user.teacherInfo?.dscCountry)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.dscOrganization')} span={2}>{dv(user.teacherInfo?.dscOrganization)}</Descriptions.Item>
                </>
              )}
            </Section>

            <Section icon={Star} title={t('auth:account.academicTitle')}>
              <Descriptions.Item label={t('auth:account.hasAcademicTitle')} span={3}>{yn(user.teacherInfo?.hasAcademicTitle)}</Descriptions.Item>
              {user.teacherInfo?.hasAcademicTitle && (
                <>
                  <Descriptions.Item label={t('auth:account.academicTitleName')}>{dv(user.teacherInfo?.academicTitleName)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.academicTitleSpeciality')}>{dv(user.teacherInfo?.academicTitleSpeciality)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.academicTitleYear')}>{dv(user.teacherInfo?.academicTitleYear)}</Descriptions.Item>
                  <Descriptions.Item label={t('auth:account.academicTitleAttestat')} span={3}>{dv(user.teacherInfo?.academicTitleAttestat)}</Descriptions.Item>
                </>
              )}
            </Section>

            <Section icon={BookOpen} title={t('auth:account.trainingDev')}>
              <Descriptions.Item label={t('auth:account.internshipsCount')}>{dv(user.teacherInfo?.internshipsCount)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.trainingCount')}>{dv(user.teacherInfo?.trainingCount)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.internshipsInfo')}>{dv(user.teacherInfo?.internshipsInfo)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.trainingInfo')} span={2}>{dv(user.teacherInfo?.trainingInfo)}</Descriptions.Item>
            </Section>

            <Section icon={Trophy} title={t('auth:account.awardsSection')}>
              <Descriptions.Item label={t('auth:account.awardsField')}>{dv(user.teacherInfo?.awardsField)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.awardsState')} span={2}>{dv(user.teacherInfo?.awardsState)}</Descriptions.Item>
            </Section>

            <Section icon={Users} title={t('auth:account.supervision')}>
              <Descriptions.Item label={t('auth:account.supervisedPhd')}>{dv(user.teacherInfo?.supervisedPhd)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.supervisedDsc')}>{dv(user.teacherInfo?.supervisedDsc)}</Descriptions.Item>
            </Section>

            <Section icon={Presentation} title={t('auth:account.conferencesSection')}>
              <Descriptions.Item label={t('auth:account.conferencesRepublic')}>{dv(user.teacherInfo?.conferencesRepublic)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.conferencesInternational')}>{dv(user.teacherInfo?.conferencesInternational)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.seminarsRepublic')}>{dv(user.teacherInfo?.seminarsRepublic)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.seminarsInternational')}>{dv(user.teacherInfo?.seminarsInternational)}</Descriptions.Item>
            </Section>

            <Section icon={Briefcase} title={t('auth:account.projects')}>
              <Descriptions.Item label={t('auth:account.projectsFundamental')}>{dv(user.teacherInfo?.projectsFundamental)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.projectsPractical')}>{dv(user.teacherInfo?.projectsPractical)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.projectsYouth')}>{dv(user.teacherInfo?.projectsYouth)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.projectsBusiness')}>{dv(user.teacherInfo?.projectsBusiness)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.projectsInnovation')}>{dv(user.teacherInfo?.projectsInnovation)}</Descriptions.Item>
              <Descriptions.Item label={t('auth:account.innovativeIdeasCount')}>{dv(user.teacherInfo?.innovativeIdeasCount)}</Descriptions.Item>
            </Section>
          </>
        )}
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title level={4}>{t('auth:account.editTitle')}</Title>
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            {t('common:button.cancel')}
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
            {t('auth:account.saveChanges')}
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Divider orientation="left">{t('auth:account.mainInfo')}</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="firstName" label={t('auth:account.firstName')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="lastName" label={t('auth:account.lastName')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="middleName" label={t('auth:account.middleName')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dateOfBirth" label={t('auth:account.dateOfBirth')}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label={t('auth:account.gender')}>
              <Select placeholder={t('auth:account.gender')}>
                <Select.Option value="male">{t('domain:gender.male')}</Select.Option>
                <Select.Option value="female">{t('domain:gender.female')}</Select.Option>
                <Select.Option value="other">{t('domain:gender.other')}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="nationality" label={t('auth:account.nationality')}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.birthInfo')}</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="countryOfBirth" label={t('auth:account.countryOfBirth')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="regionOfBirth" label={t('auth:account.regionOfBirth')}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.addressInfo')}</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="currentAddress" label={t('auth:account.currentAddress')}>
              <TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="permanentAddress" label={t('auth:account.permanentAddress')}>
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.identification')}</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="passportSerial" label={t('auth:account.passportSerial')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="personalId" label={t('auth:account.personalId')}>
              <Input maxLength={14} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="stirInn" label={t('auth:account.stirInn')}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.contactInfo')}</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="englishLevel" label={t('auth:account.englishLevel')}>
              <Select placeholder={t('auth:account.englishLevel')}>
                <Select.Option value="A1">A1</Select.Option>
                <Select.Option value="A2">A2</Select.Option>
                <Select.Option value="B1">B1</Select.Option>
                <Select.Option value="B2">B2</Select.Option>
                <Select.Option value="C1">C1</Select.Option>
                <Select.Option value="C2">C2</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="phone1" label={t('auth:account.phone')}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="email1" label={t('auth:account.email')}>
              <Input type="email" />
            </Form.Item>
          </Col>
        </Row>

        {user.role.name === 'teacher' && (
          <>
            <Divider orientation="left">{t('auth:account.bachelorDegree')}</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bachelorUniversity" label={t('auth:account.bachelorUniversity')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bachelorYear" label={t('auth:account.bachelorYear')}>
                  <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bachelorDirection" label={t('auth:account.bachelorDirection')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bachelorDiplomaNumber" label={t('auth:account.bachelorDiplomaNumber')}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.masterDegree')}</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="masterUniversity" label={t('auth:account.masterUniversity')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="masterYear" label={t('auth:account.masterYear')}>
                  <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="masterDirection" label={t('auth:account.masterDirection')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="masterDiplomaNumber" label={t('auth:account.masterDiplomaNumber')}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.research')}</Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="researchArea" label={t('auth:account.researchArea')}>
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.phdDegree')}</Divider>
            <Form.Item name="hasPhdDegree" valuePropName="checked">
              <Checkbox>{t('auth:account.hasPhdDegree')}</Checkbox>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasPhdDegree !== cur.hasPhdDegree}>
              {({ getFieldValue }) =>
                getFieldValue('hasPhdDegree') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="phdYear" label={t('auth:account.phdYear')}>
                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="phdSpeciality" label={t('auth:account.phdSpeciality')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="phdTopic" label={t('auth:account.phdTopic')}>
                        <TextArea rows={3} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phdDiplomaNumber" label={t('auth:account.phdDiplomaNumber')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phdCountry" label={t('auth:account.phdCountry')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phdOrganization" label={t('auth:account.phdOrganization')}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">{t('auth:account.dscDegree')}</Divider>
            <Form.Item name="hasDscDegree" valuePropName="checked">
              <Checkbox>{t('auth:account.hasDscDegree')}</Checkbox>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasDscDegree !== cur.hasDscDegree}>
              {({ getFieldValue }) =>
                getFieldValue('hasDscDegree') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="dscYear" label={t('auth:account.dscYear')}>
                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="dscSpeciality" label={t('auth:account.dscSpeciality')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="dscTopic" label={t('auth:account.dscTopic')}>
                        <TextArea rows={3} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="dscDiplomaNumber" label={t('auth:account.dscDiplomaNumber')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="dscCountry" label={t('auth:account.dscCountry')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="dscOrganization" label={t('auth:account.dscOrganization')}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">{t('auth:account.academicTitle')}</Divider>
            <Form.Item name="hasAcademicTitle" valuePropName="checked">
              <Checkbox>{t('auth:account.hasAcademicTitle')}</Checkbox>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasAcademicTitle !== cur.hasAcademicTitle}>
              {({ getFieldValue }) =>
                getFieldValue('hasAcademicTitle') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="academicTitleName" label={t('auth:account.academicTitleName')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="academicTitleSpeciality" label={t('auth:account.academicTitleSpeciality')}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="academicTitleYear" label={t('auth:account.academicTitleYear')}>
                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="academicTitleAttestat" label={t('auth:account.academicTitleAttestat')}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">{t('auth:account.trainingDev')}</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="internshipsCount" label={t('auth:account.internshipsCount')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trainingCount" label={t('auth:account.trainingCount')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="internshipsInfo" label={t('auth:account.internshipsInfo')}>
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trainingInfo" label={t('auth:account.trainingInfo')}>
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.awardsSection')}</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="awardsField" label={t('auth:account.awardsField')}>
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="awardsState" label={t('auth:account.awardsState')}>
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.supervision')}</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="supervisedPhd" label={t('auth:account.supervisedPhd')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="supervisedDsc" label={t('auth:account.supervisedDsc')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.conferencesSection')}</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="conferencesRepublic" label={t('auth:account.conferencesRepublic')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="conferencesInternational" label={t('auth:account.conferencesInternational')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="seminarsRepublic" label={t('auth:account.seminarsRepublic')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="seminarsInternational" label={t('auth:account.seminarsInternational')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.projects')}</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="projectsFundamental" label={t('auth:account.projectsFundamental')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsPractical" label={t('auth:account.projectsPractical')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsYouth" label={t('auth:account.projectsYouth')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsBusiness" label={t('auth:account.projectsBusiness')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsInnovation" label={t('auth:account.projectsInnovation')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="innovativeIdeasCount" label={t('auth:account.innovativeIdeasCount')}>
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

export default AccountInfoTab;
