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
  message,
  Space,
  Typography,
  Checkbox,
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import usersService, { type UpdateUserAccountRequest } from '../../../services/users.service';
import type { User } from '../../../types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface TeacherAccountTabProps {
  teacher: User;
  onSuccess: () => void;
}

const TeacherAccountTab = ({ teacher, onSuccess }: TeacherAccountTabProps) => {
  const { t } = useTranslation(['auth', 'common', 'domain']);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (teacher) {
      form.setFieldsValue({
        firstName: teacher.userInfo?.firstName,
        lastName: teacher.userInfo?.lastName,
        middleName: teacher.userInfo?.middleName,
        dateOfBirth: teacher.userInfo?.dateOfBirth ? dayjs(teacher.userInfo.dateOfBirth) : null,
        gender: teacher.userInfo?.gender,
        nationality: teacher.userInfo?.nationality,
        countryOfBirth: teacher.userInfo?.countryOfBirth,
        regionOfBirth: teacher.userInfo?.regionOfBirth,
        currentAddress: teacher.userInfo?.currentAddress,
        permanentAddress: teacher.userInfo?.permanentAddress,
        passportSerial: teacher.userInfo?.passportSerial,
        personalId: teacher.userInfo?.personalId,
        stirInn: teacher.userInfo?.stirInn,
        englishLevel: teacher.userInfo?.englishLevel,
        phone1: teacher.userInfo?.phone1,
        email1: teacher.userInfo?.email1,
        bachelorUniversity: teacher.teacherInfo?.bachelorUniversity,
        bachelorYear: teacher.teacherInfo?.bachelorYear,
        bachelorDirection: teacher.teacherInfo?.bachelorDirection,
        bachelorDiplomaNumber: teacher.teacherInfo?.bachelorDiplomaNumber,
        masterUniversity: teacher.teacherInfo?.masterUniversity,
        masterYear: teacher.teacherInfo?.masterYear,
        masterDirection: teacher.teacherInfo?.masterDirection,
        masterDiplomaNumber: teacher.teacherInfo?.masterDiplomaNumber,
        researchArea: teacher.teacherInfo?.researchArea,
        hasPhdDegree: teacher.teacherInfo?.hasPhdDegree,
        phdYear: teacher.teacherInfo?.phdYear,
        phdSpeciality: teacher.teacherInfo?.phdSpeciality,
        phdTopic: teacher.teacherInfo?.phdTopic,
        phdDiplomaNumber: teacher.teacherInfo?.phdDiplomaNumber,
        phdCountry: teacher.teacherInfo?.phdCountry,
        phdOrganization: teacher.teacherInfo?.phdOrganization,
        hasDscDegree: teacher.teacherInfo?.hasDscDegree,
        dscYear: teacher.teacherInfo?.dscYear,
        dscSpeciality: teacher.teacherInfo?.dscSpeciality,
        dscTopic: teacher.teacherInfo?.dscTopic,
        dscDiplomaNumber: teacher.teacherInfo?.dscDiplomaNumber,
        dscCountry: teacher.teacherInfo?.dscCountry,
        dscOrganization: teacher.teacherInfo?.dscOrganization,
        hasAcademicTitle: teacher.teacherInfo?.hasAcademicTitle,
        academicTitleName: teacher.teacherInfo?.academicTitleName,
        academicTitleSpeciality: teacher.teacherInfo?.academicTitleSpeciality,
        academicTitleYear: teacher.teacherInfo?.academicTitleYear,
        academicTitleAttestat: teacher.teacherInfo?.academicTitleAttestat,
        internshipsCount: teacher.teacherInfo?.internshipsCount,
        internshipsInfo: teacher.teacherInfo?.internshipsInfo,
        trainingCount: teacher.teacherInfo?.trainingCount,
        trainingInfo: teacher.teacherInfo?.trainingInfo,
        awardsField: teacher.teacherInfo?.awardsField,
        awardsState: teacher.teacherInfo?.awardsState,
        supervisedPhd: teacher.teacherInfo?.supervisedPhd,
        supervisedDsc: teacher.teacherInfo?.supervisedDsc,
        conferencesRepublic: teacher.teacherInfo?.conferencesRepublic,
        conferencesInternational: teacher.teacherInfo?.conferencesInternational,
        seminarsRepublic: teacher.teacherInfo?.seminarsRepublic,
        seminarsInternational: teacher.teacherInfo?.seminarsInternational,
        projectsFundamental: teacher.teacherInfo?.projectsFundamental,
        projectsPractical: teacher.teacherInfo?.projectsPractical,
        projectsYouth: teacher.teacherInfo?.projectsYouth,
        projectsBusiness: teacher.teacherInfo?.projectsBusiness,
        projectsInnovation: teacher.teacherInfo?.projectsInnovation,
        innovativeIdeasCount: teacher.teacherInfo?.innovativeIdeasCount,
      });
    }
  }, [teacher, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const payload: UpdateUserAccountRequest = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
      };
      await usersService.updateAccount(teacher.id, payload);
      message.success(t('auth:account.updateSuccess'));
      setIsEditing(false);
      onSuccess();
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

  const ViewField = ({ label, value }: { label: string; value: any }) => (
    <div style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
        {label}
      </Text>
      <Text strong>{value || '-'}</Text>
    </div>
  );

  if (!isEditing) {
    return (
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={4}>{t('auth:account.title')}</Title>
          <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
            {t('auth:account.editProfile')}
          </Button>
        </div>

        <Divider orientation="left">{t('auth:account.mainInfo')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.firstName')} value={teacher.userInfo?.firstName} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.lastName')} value={teacher.userInfo?.lastName} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.middleName')} value={teacher.userInfo?.middleName} />
          </Col>
          <Col span={8}>
            <ViewField
              label={t('auth:account.dateOfBirth')}
              value={teacher.userInfo?.dateOfBirth ? dayjs(teacher.userInfo.dateOfBirth).format('YYYY-MM-DD') : '-'}
            />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.gender')} value={teacher.userInfo?.gender} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.nationality')} value={teacher.userInfo?.nationality} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.birthInfo')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.countryOfBirth')} value={teacher.userInfo?.countryOfBirth} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.regionOfBirth')} value={teacher.userInfo?.regionOfBirth} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.addressInfo')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.currentAddress')} value={teacher.userInfo?.currentAddress} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.permanentAddress')} value={teacher.userInfo?.permanentAddress} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.identification')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.passportSerial')} value={teacher.userInfo?.passportSerial} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.personalId')} value={teacher.userInfo?.personalId} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.stirInn')} value={teacher.userInfo?.stirInn} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.contactInfo')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.englishLevel')} value={teacher.userInfo?.englishLevel} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.phone')} value={teacher.userInfo?.phone1} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.email')} value={teacher.userInfo?.email1} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.bachelorDegree')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.bachelorUniversity')} value={teacher.teacherInfo?.bachelorUniversity} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.bachelorYear')} value={teacher.teacherInfo?.bachelorYear} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.bachelorDirection')} value={teacher.teacherInfo?.bachelorDirection} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.bachelorDiplomaNumber')} value={teacher.teacherInfo?.bachelorDiplomaNumber} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.masterDegree')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.masterUniversity')} value={teacher.teacherInfo?.masterUniversity} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.masterYear')} value={teacher.teacherInfo?.masterYear} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.masterDirection')} value={teacher.teacherInfo?.masterDirection} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.masterDiplomaNumber')} value={teacher.teacherInfo?.masterDiplomaNumber} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.research')}</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField label={t('auth:account.researchArea')} value={teacher.teacherInfo?.researchArea} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.phdDegree')}</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField
              label={t('auth:account.hasPhdDegree')}
              value={teacher.teacherInfo?.hasPhdDegree ? t('common:label.yes') : t('common:label.no')}
            />
          </Col>
          {teacher.teacherInfo?.hasPhdDegree && (
            <>
              <Col span={12}>
                <ViewField label={t('auth:account.phdYear')} value={teacher.teacherInfo?.phdYear} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.phdSpeciality')} value={teacher.teacherInfo?.phdSpeciality} />
              </Col>
              <Col span={24}>
                <ViewField label={t('auth:account.phdTopic')} value={teacher.teacherInfo?.phdTopic} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.phdDiplomaNumber')} value={teacher.teacherInfo?.phdDiplomaNumber} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.phdCountry')} value={teacher.teacherInfo?.phdCountry} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.phdOrganization')} value={teacher.teacherInfo?.phdOrganization} />
              </Col>
            </>
          )}
        </Row>

        <Divider orientation="left">{t('auth:account.dscDegree')}</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField
              label={t('auth:account.hasDscDegree')}
              value={teacher.teacherInfo?.hasDscDegree ? t('common:label.yes') : t('common:label.no')}
            />
          </Col>
          {teacher.teacherInfo?.hasDscDegree && (
            <>
              <Col span={12}>
                <ViewField label={t('auth:account.dscYear')} value={teacher.teacherInfo?.dscYear} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.dscSpeciality')} value={teacher.teacherInfo?.dscSpeciality} />
              </Col>
              <Col span={24}>
                <ViewField label={t('auth:account.dscTopic')} value={teacher.teacherInfo?.dscTopic} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.dscDiplomaNumber')} value={teacher.teacherInfo?.dscDiplomaNumber} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.dscCountry')} value={teacher.teacherInfo?.dscCountry} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.dscOrganization')} value={teacher.teacherInfo?.dscOrganization} />
              </Col>
            </>
          )}
        </Row>

        <Divider orientation="left">{t('auth:account.academicTitle')}</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField
              label={t('auth:account.hasAcademicTitle')}
              value={teacher.teacherInfo?.hasAcademicTitle ? t('common:label.yes') : t('common:label.no')}
            />
          </Col>
          {teacher.teacherInfo?.hasAcademicTitle && (
            <>
              <Col span={12}>
                <ViewField label={t('auth:account.academicTitleName')} value={teacher.teacherInfo?.academicTitleName} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.academicTitleSpeciality')} value={teacher.teacherInfo?.academicTitleSpeciality} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.academicTitleYear')} value={teacher.teacherInfo?.academicTitleYear} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.academicTitleAttestat')} value={teacher.teacherInfo?.academicTitleAttestat} />
              </Col>
            </>
          )}
        </Row>

        <Divider orientation="left">{t('auth:account.trainingDev')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.internshipsCount')} value={teacher.teacherInfo?.internshipsCount} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.trainingCount')} value={teacher.teacherInfo?.trainingCount} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.internshipsInfo')} value={teacher.teacherInfo?.internshipsInfo} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.trainingInfo')} value={teacher.teacherInfo?.trainingInfo} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.awardsSection')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.awardsField')} value={teacher.teacherInfo?.awardsField} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.awardsState')} value={teacher.teacherInfo?.awardsState} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.supervision')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.supervisedPhd')} value={teacher.teacherInfo?.supervisedPhd} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.supervisedDsc')} value={teacher.teacherInfo?.supervisedDsc} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.conferencesSection')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.conferencesRepublic')} value={teacher.teacherInfo?.conferencesRepublic} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.conferencesInternational')} value={teacher.teacherInfo?.conferencesInternational} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.seminarsRepublic')} value={teacher.teacherInfo?.seminarsRepublic} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.seminarsInternational')} value={teacher.teacherInfo?.seminarsInternational} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.projects')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.projectsFundamental')} value={teacher.teacherInfo?.projectsFundamental} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.projectsPractical')} value={teacher.teacherInfo?.projectsPractical} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.projectsYouth')} value={teacher.teacherInfo?.projectsYouth} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.projectsBusiness')} value={teacher.teacherInfo?.projectsBusiness} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.projectsInnovation')} value={teacher.teacherInfo?.projectsInnovation} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.innovativeIdeasCount')} value={teacher.teacherInfo?.innovativeIdeasCount} />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
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
      </Form>
    </div>
  );
};

export default TeacherAccountTab;
