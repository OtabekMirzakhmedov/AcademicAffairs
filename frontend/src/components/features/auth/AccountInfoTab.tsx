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
} from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import usersService, { type UpdateUserAccountRequest } from '../../../services/users.service';
import type { User } from '../../../types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;
const { TextArea } = Input;

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

  const ViewField = ({ label, value }: { label: string; value: any }) => (
    <div style={{ marginBottom: 16 }}>
      <Text type="secondary" style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>
        {label}
      </Text>
      <Text strong style={{ fontSize: '14px' }}>{value || '-'}</Text>
    </div>
  );

  if (!isEditing) {
    return (
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <Title level={4}>{t('auth:account.title')}</Title>
          <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
            {t('auth:account.editProfile')}
          </Button>
        </div>

        <Divider orientation="left">{t('auth:account.mainInfo')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.firstName')} value={user.userInfo?.firstName} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.lastName')} value={user.userInfo?.lastName} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.middleName')} value={user.userInfo?.middleName} />
          </Col>
          <Col span={8}>
            <ViewField
              label={t('auth:account.dateOfBirth')}
              value={user.userInfo?.dateOfBirth ? dayjs(user.userInfo.dateOfBirth).format('YYYY-MM-DD') : '-'}
            />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.gender')} value={user.userInfo?.gender} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.nationality')} value={user.userInfo?.nationality} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.birthInfo')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.countryOfBirth')} value={user.userInfo?.countryOfBirth} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.regionOfBirth')} value={user.userInfo?.regionOfBirth} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.addressInfo')}</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label={t('auth:account.currentAddress')} value={user.userInfo?.currentAddress} />
          </Col>
          <Col span={12}>
            <ViewField label={t('auth:account.permanentAddress')} value={user.userInfo?.permanentAddress} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.identification')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.passportSerial')} value={user.userInfo?.passportSerial} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.personalId')} value={user.userInfo?.personalId} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.stirInn')} value={user.userInfo?.stirInn} />
          </Col>
        </Row>

        <Divider orientation="left">{t('auth:account.contactInfo')}</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label={t('auth:account.englishLevel')} value={user.userInfo?.englishLevel} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.phone')} value={user.userInfo?.phone1} />
          </Col>
          <Col span={8}>
            <ViewField label={t('auth:account.email')} value={user.userInfo?.email1} />
          </Col>
        </Row>

        {user.role.name === 'teacher' && (
          <>
            <Divider orientation="left">{t('auth:account.bachelorDegree')}</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label={t('auth:account.bachelorUniversity')} value={user.teacherInfo?.bachelorUniversity} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.bachelorYear')} value={user.teacherInfo?.bachelorYear} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.bachelorDirection')} value={user.teacherInfo?.bachelorDirection} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.bachelorDiplomaNumber')} value={user.teacherInfo?.bachelorDiplomaNumber} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.masterDegree')}</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label={t('auth:account.masterUniversity')} value={user.teacherInfo?.masterUniversity} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.masterYear')} value={user.teacherInfo?.masterYear} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.masterDirection')} value={user.teacherInfo?.masterDirection} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.masterDiplomaNumber')} value={user.teacherInfo?.masterDiplomaNumber} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.research')}</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField label={t('auth:account.researchArea')} value={user.teacherInfo?.researchArea} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.phdDegree')}</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField
                  label={t('auth:account.hasPhdDegree')}
                  value={user.teacherInfo?.hasPhdDegree ? t('common:label.yes') : t('common:label.no')}
                />
              </Col>
              {user.teacherInfo?.hasPhdDegree && (
                <>
                  <Col span={12}>
                    <ViewField label={t('auth:account.phdYear')} value={user.teacherInfo?.phdYear} />
                  </Col>
                  <Col span={12}>
                    <ViewField label={t('auth:account.phdSpeciality')} value={user.teacherInfo?.phdSpeciality} />
                  </Col>
                  <Col span={24}>
                    <ViewField label={t('auth:account.phdTopic')} value={user.teacherInfo?.phdTopic} />
                  </Col>
                  <Col span={8}>
                    <ViewField label={t('auth:account.phdDiplomaNumber')} value={user.teacherInfo?.phdDiplomaNumber} />
                  </Col>
                  <Col span={8}>
                    <ViewField label={t('auth:account.phdCountry')} value={user.teacherInfo?.phdCountry} />
                  </Col>
                  <Col span={8}>
                    <ViewField label={t('auth:account.phdOrganization')} value={user.teacherInfo?.phdOrganization} />
                  </Col>
                </>
              )}
            </Row>

            <Divider orientation="left">{t('auth:account.dscDegree')}</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField
                  label={t('auth:account.hasDscDegree')}
                  value={user.teacherInfo?.hasDscDegree ? t('common:label.yes') : t('common:label.no')}
                />
              </Col>
              {user.teacherInfo?.hasDscDegree && (
                <>
                  <Col span={12}>
                    <ViewField label={t('auth:account.dscYear')} value={user.teacherInfo?.dscYear} />
                  </Col>
                  <Col span={12}>
                    <ViewField label={t('auth:account.dscSpeciality')} value={user.teacherInfo?.dscSpeciality} />
                  </Col>
                  <Col span={24}>
                    <ViewField label={t('auth:account.dscTopic')} value={user.teacherInfo?.dscTopic} />
                  </Col>
                  <Col span={8}>
                    <ViewField label={t('auth:account.dscDiplomaNumber')} value={user.teacherInfo?.dscDiplomaNumber} />
                  </Col>
                  <Col span={8}>
                    <ViewField label={t('auth:account.dscCountry')} value={user.teacherInfo?.dscCountry} />
                  </Col>
                  <Col span={8}>
                    <ViewField label={t('auth:account.dscOrganization')} value={user.teacherInfo?.dscOrganization} />
                  </Col>
                </>
              )}
            </Row>

            <Divider orientation="left">{t('auth:account.academicTitle')}</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField
                  label={t('auth:account.hasAcademicTitle')}
                  value={user.teacherInfo?.hasAcademicTitle ? t('common:label.yes') : t('common:label.no')}
                />
              </Col>
              {user.teacherInfo?.hasAcademicTitle && (
                <>
                  <Col span={12}>
                    <ViewField label={t('auth:account.academicTitleName')} value={user.teacherInfo?.academicTitleName} />
                  </Col>
                  <Col span={12}>
                    <ViewField label={t('auth:account.academicTitleSpeciality')} value={user.teacherInfo?.academicTitleSpeciality} />
                  </Col>
                  <Col span={12}>
                    <ViewField label={t('auth:account.academicTitleYear')} value={user.teacherInfo?.academicTitleYear} />
                  </Col>
                  <Col span={12}>
                    <ViewField label={t('auth:account.academicTitleAttestat')} value={user.teacherInfo?.academicTitleAttestat} />
                  </Col>
                </>
              )}
            </Row>

            <Divider orientation="left">{t('auth:account.trainingDev')}</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label={t('auth:account.internshipsCount')} value={user.teacherInfo?.internshipsCount} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.trainingCount')} value={user.teacherInfo?.trainingCount} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.internshipsInfo')} value={user.teacherInfo?.internshipsInfo} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.trainingInfo')} value={user.teacherInfo?.trainingInfo} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.awardsSection')}</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label={t('auth:account.awardsField')} value={user.teacherInfo?.awardsField} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.awardsState')} value={user.teacherInfo?.awardsState} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.supervision')}</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label={t('auth:account.supervisedPhd')} value={user.teacherInfo?.supervisedPhd} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.supervisedDsc')} value={user.teacherInfo?.supervisedDsc} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.conferencesSection')}</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label={t('auth:account.conferencesRepublic')} value={user.teacherInfo?.conferencesRepublic} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.conferencesInternational')} value={user.teacherInfo?.conferencesInternational} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.seminarsRepublic')} value={user.teacherInfo?.seminarsRepublic} />
              </Col>
              <Col span={12}>
                <ViewField label={t('auth:account.seminarsInternational')} value={user.teacherInfo?.seminarsInternational} />
              </Col>
            </Row>

            <Divider orientation="left">{t('auth:account.projects')}</Divider>
            <Row gutter={24}>
              <Col span={8}>
                <ViewField label={t('auth:account.projectsFundamental')} value={user.teacherInfo?.projectsFundamental} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.projectsPractical')} value={user.teacherInfo?.projectsPractical} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.projectsYouth')} value={user.teacherInfo?.projectsYouth} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.projectsBusiness')} value={user.teacherInfo?.projectsBusiness} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.projectsInnovation')} value={user.teacherInfo?.projectsInnovation} />
              </Col>
              <Col span={8}>
                <ViewField label={t('auth:account.innovativeIdeasCount')} value={user.teacherInfo?.innovativeIdeasCount} />
              </Col>
            </Row>
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
