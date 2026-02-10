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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        // Personal Information
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

        // Educational Background - Bachelor
        bachelorUniversity: user.teacherInfo?.bachelorUniversity,
        bachelorYear: user.teacherInfo?.bachelorYear,
        bachelorDirection: user.teacherInfo?.bachelorDirection,
        bachelorDiplomaNumber: user.teacherInfo?.bachelorDiplomaNumber,

        // Educational Background - Master
        masterUniversity: user.teacherInfo?.masterUniversity,
        masterYear: user.teacherInfo?.masterYear,
        masterDirection: user.teacherInfo?.masterDirection,
        masterDiplomaNumber: user.teacherInfo?.masterDiplomaNumber,

        // Research
        researchArea: user.teacherInfo?.researchArea,

        // PhD Information
        hasPhdDegree: user.teacherInfo?.hasPhdDegree,
        phdYear: user.teacherInfo?.phdYear,
        phdSpeciality: user.teacherInfo?.phdSpeciality,
        phdTopic: user.teacherInfo?.phdTopic,
        phdDiplomaNumber: user.teacherInfo?.phdDiplomaNumber,
        phdCountry: user.teacherInfo?.phdCountry,
        phdOrganization: user.teacherInfo?.phdOrganization,

        // DSc Information
        hasDscDegree: user.teacherInfo?.hasDscDegree,
        dscYear: user.teacherInfo?.dscYear,
        dscSpeciality: user.teacherInfo?.dscSpeciality,
        dscTopic: user.teacherInfo?.dscTopic,
        dscDiplomaNumber: user.teacherInfo?.dscDiplomaNumber,
        dscCountry: user.teacherInfo?.dscCountry,
        dscOrganization: user.teacherInfo?.dscOrganization,

        // Academic Title
        hasAcademicTitle: user.teacherInfo?.hasAcademicTitle,
        academicTitleName: user.teacherInfo?.academicTitleName,
        academicTitleSpeciality: user.teacherInfo?.academicTitleSpeciality,
        academicTitleYear: user.teacherInfo?.academicTitleYear,
        academicTitleAttestat: user.teacherInfo?.academicTitleAttestat,

        // Training and Development
        internshipsCount: user.teacherInfo?.internshipsCount,
        internshipsInfo: user.teacherInfo?.internshipsInfo,
        trainingCount: user.teacherInfo?.trainingCount,
        trainingInfo: user.teacherInfo?.trainingInfo,

        // Awards and Recognition
        awardsField: user.teacherInfo?.awardsField,
        awardsState: user.teacherInfo?.awardsState,

        // Supervision
        supervisedPhd: user.teacherInfo?.supervisedPhd,
        supervisedDsc: user.teacherInfo?.supervisedDsc,

        // Conference and Seminar Participation
        conferencesRepublic: user.teacherInfo?.conferencesRepublic,
        conferencesInternational: user.teacherInfo?.conferencesInternational,
        seminarsRepublic: user.teacherInfo?.seminarsRepublic,
        seminarsInternational: user.teacherInfo?.seminarsInternational,

        // Projects
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

      // Convert date to ISO string if present
      const payload: UpdateUserAccountRequest = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
      };

      const updatedUser = await usersService.updateAccount(user.id, payload);
      message.success('Account information updated successfully');
      setIsEditing(false);
      onSuccess(updatedUser);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        'Failed to update account information';
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
          <Title level={4}>Account Information</Title>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        </div>

        <Divider orientation="left">Main Information</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label="Name" value={user.userInfo?.firstName} />
          </Col>
          <Col span={8}>
            <ViewField label="Surname" value={user.userInfo?.lastName} />
          </Col>
          <Col span={8}>
            <ViewField label="Middle name" value={user.userInfo?.middleName} />
          </Col>
          <Col span={8}>
            <ViewField
              label="Date of birth"
              value={user.userInfo?.dateOfBirth ? dayjs(user.userInfo.dateOfBirth).format('YYYY-MM-DD') : '-'}
            />
          </Col>
          <Col span={8}>
            <ViewField label="Gender" value={user.userInfo?.gender} />
          </Col>
          <Col span={8}>
            <ViewField label="Nationality" value={user.userInfo?.nationality} />
          </Col>
        </Row>

        <Divider orientation="left">Birth Information</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Country of birth" value={user.userInfo?.countryOfBirth} />
          </Col>
          <Col span={12}>
            <ViewField label="Region of birth" value={user.userInfo?.regionOfBirth} />
          </Col>
        </Row>

        <Divider orientation="left">Address Information</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Currently registered address" value={user.userInfo?.currentAddress} />
          </Col>
          <Col span={12}>
            <ViewField label="Permanently registered address" value={user.userInfo?.permanentAddress} />
          </Col>
        </Row>

        <Divider orientation="left">Identification</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label="Passport serial number" value={user.userInfo?.passportSerial} />
          </Col>
          <Col span={8}>
            <ViewField label="Personal identification number (14 digits)" value={user.userInfo?.personalId} />
          </Col>
          <Col span={8}>
            <ViewField label="STIR/INN" value={user.userInfo?.stirInn} />
          </Col>
        </Row>

        <Divider orientation="left">Contact Information</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label="English level" value={user.userInfo?.englishLevel} />
          </Col>
          <Col span={8}>
            <ViewField label="Phone number" value={user.userInfo?.phone1} />
          </Col>
          <Col span={8}>
            <ViewField label="Email" value={user.userInfo?.email1} />
          </Col>
        </Row>

        {user.role.name === 'teacher' && (
          <>
            <Divider orientation="left">Bachelor's Degree</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label="Name of graduated university (bachelor)" value={user.teacherInfo?.bachelorUniversity} />
              </Col>
              <Col span={12}>
                <ViewField label="Year of graduation (bachelor)" value={user.teacherInfo?.bachelorYear} />
              </Col>
              <Col span={12}>
                <ViewField label="Direction (bachelor)" value={user.teacherInfo?.bachelorDirection} />
              </Col>
              <Col span={12}>
                <ViewField label="Diploma number (bachelor)" value={user.teacherInfo?.bachelorDiplomaNumber} />
              </Col>
            </Row>

            <Divider orientation="left">Master's Degree</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label="Name of graduated university (master)" value={user.teacherInfo?.masterUniversity} />
              </Col>
              <Col span={12}>
                <ViewField label="Year of graduation (master)" value={user.teacherInfo?.masterYear} />
              </Col>
              <Col span={12}>
                <ViewField label="Direction (master)" value={user.teacherInfo?.masterDirection} />
              </Col>
              <Col span={12}>
                <ViewField label="Diploma number (master)" value={user.teacherInfo?.masterDiplomaNumber} />
              </Col>
            </Row>

            <Divider orientation="left">Research</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField label="Research area" value={user.teacherInfo?.researchArea} />
              </Col>
            </Row>

            <Divider orientation="left">PhD Degree</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField label="Do you have an academic degree (PhD)?" value={user.teacherInfo?.hasPhdDegree ? 'Yes' : 'No'} />
              </Col>
              {user.teacherInfo?.hasPhdDegree && (
                <>
                  <Col span={12}>
                    <ViewField label="Year of approval for academic degree (PhD)" value={user.teacherInfo?.phdYear} />
                  </Col>
                  <Col span={12}>
                    <ViewField label="Defenced speciality code and name (PhD)" value={user.teacherInfo?.phdSpeciality} />
                  </Col>
                  <Col span={24}>
                    <ViewField label="The topic of the dissertation (PhD)" value={user.teacherInfo?.phdTopic} />
                  </Col>
                  <Col span={8}>
                    <ViewField label="Diploma number (PhD)" value={user.teacherInfo?.phdDiplomaNumber} />
                  </Col>
                  <Col span={8}>
                    <ViewField label="Country (PhD)" value={user.teacherInfo?.phdCountry} />
                  </Col>
                  <Col span={8}>
                    <ViewField label="Organization (PhD)" value={user.teacherInfo?.phdOrganization} />
                  </Col>
                </>
              )}
            </Row>

            <Divider orientation="left">DSc Degree</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField label="Do you have an academic degree (DSc)?" value={user.teacherInfo?.hasDscDegree ? 'Yes' : 'No'} />
              </Col>
              {user.teacherInfo?.hasDscDegree && (
                <>
                  <Col span={12}>
                    <ViewField label="Year of approval for academic degree (DSc)" value={user.teacherInfo?.dscYear} />
                  </Col>
                  <Col span={12}>
                    <ViewField label="Defenced speciality code and name (DSc)" value={user.teacherInfo?.dscSpeciality} />
                  </Col>
                  <Col span={24}>
                    <ViewField label="The topic of the dissertation (DSc)" value={user.teacherInfo?.dscTopic} />
                  </Col>
                  <Col span={8}>
                    <ViewField label="Diploma number (DSc)" value={user.teacherInfo?.dscDiplomaNumber} />
                  </Col>
                  <Col span={8}>
                    <ViewField label="Country (DSc)" value={user.teacherInfo?.dscCountry} />
                  </Col>
                  <Col span={8}>
                    <ViewField label="Organization (DSc)" value={user.teacherInfo?.dscOrganization} />
                  </Col>
                </>
              )}
            </Row>

            <Divider orientation="left">Academic Title</Divider>
            <Row gutter={24}>
              <Col span={24}>
                <ViewField label="Do you have an academic title?" value={user.teacherInfo?.hasAcademicTitle ? 'Yes' : 'No'} />
              </Col>
              {user.teacherInfo?.hasAcademicTitle && (
                <>
                  <Col span={12}>
                    <ViewField label="Name of academic title" value={user.teacherInfo?.academicTitleName} />
                  </Col>
                  <Col span={12}>
                    <ViewField label="Defenced speciality code and name" value={user.teacherInfo?.academicTitleSpeciality} />
                  </Col>
                  <Col span={12}>
                    <ViewField label="Year of approval for academic title" value={user.teacherInfo?.academicTitleYear} />
                  </Col>
                  <Col span={12}>
                    <ViewField label="Attestat number" value={user.teacherInfo?.academicTitleAttestat} />
                  </Col>
                </>
              )}
            </Row>

            <Divider orientation="left">Training and Development</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label="Number of internships (completed in the last year)" value={user.teacherInfo?.internshipsCount} />
              </Col>
              <Col span={12}>
                <ViewField label="Number of places passed the qualification training" value={user.teacherInfo?.trainingCount} />
              </Col>
              <Col span={12}>
                <ViewField label="More information about the internship" value={user.teacherInfo?.internshipsInfo} />
              </Col>
              <Col span={12}>
                <ViewField label="More information about the training" value={user.teacherInfo?.trainingInfo} />
              </Col>
            </Row>

            <Divider orientation="left">Awards and Recognition</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label="Awards on the field (name; time of receipt)" value={user.teacherInfo?.awardsField} />
              </Col>
              <Col span={12}>
                <ViewField label="State awards (name; time of receipt)" value={user.teacherInfo?.awardsState} />
              </Col>
            </Row>

            <Divider orientation="left">Supervision</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label="Number of supervised students (PhD)" value={user.teacherInfo?.supervisedPhd} />
              </Col>
              <Col span={12}>
                <ViewField label="Number of supervised students (DSc)" value={user.teacherInfo?.supervisedDsc} />
              </Col>
            </Row>

            <Divider orientation="left">Conferences and Seminars</Divider>
            <Row gutter={24}>
              <Col span={12}>
                <ViewField label="Conferences - In the Republic" value={user.teacherInfo?.conferencesRepublic} />
              </Col>
              <Col span={12}>
                <ViewField label="Conferences - International" value={user.teacherInfo?.conferencesInternational} />
              </Col>
              <Col span={12}>
                <ViewField label="Seminars - In the Republic" value={user.teacherInfo?.seminarsRepublic} />
              </Col>
              <Col span={12}>
                <ViewField label="Seminars - International" value={user.teacherInfo?.seminarsInternational} />
              </Col>
            </Row>

            <Divider orientation="left">Projects</Divider>
            <Row gutter={24}>
              <Col span={8}>
                <ViewField label="Fundamental" value={user.teacherInfo?.projectsFundamental} />
              </Col>
              <Col span={8}>
                <ViewField label="Practical" value={user.teacherInfo?.projectsPractical} />
              </Col>
              <Col span={8}>
                <ViewField label="Youth" value={user.teacherInfo?.projectsYouth} />
              </Col>
              <Col span={8}>
                <ViewField label="Business agreement" value={user.teacherInfo?.projectsBusiness} />
              </Col>
              <Col span={8}>
                <ViewField label="Innovation" value={user.teacherInfo?.projectsInnovation} />
              </Col>
              <Col span={8}>
                <ViewField label="Innovative ideas and developments" value={user.teacherInfo?.innovativeIdeasCount} />
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
        <Title level={4}>Edit Account Information</Title>
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={loading}
          >
            Save Changes
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Divider orientation="left">Main Information</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="firstName" label="Name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="lastName" label="Surname">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="middleName" label="Middle name">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dateOfBirth" label="Date of birth">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="gender" label="Gender">
              <Select placeholder="Select gender">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
                <Select.Option value="other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="nationality" label="Nationality">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Birth Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="countryOfBirth" label="Country of birth">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="regionOfBirth" label="Region of birth">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Address Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="currentAddress" label="Currently registered address">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="permanentAddress" label="Permanently registered address">
              <TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Identification</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="passportSerial" label="Passport serial number">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="personalId" label="Personal identification number (14 digits)">
              <Input maxLength={14} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="stirInn" label="STIR/INN">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Contact Information</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="englishLevel" label="English level">
              <Select placeholder="Select English level">
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
            <Form.Item name="phone1" label="Phone number">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="email1" label="Email">
              <Input type="email" />
            </Form.Item>
          </Col>
        </Row>

        {user.role.name === 'teacher' && (
          <>
            <Divider orientation="left">Bachelor's Degree</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="bachelorUniversity" label="Name of graduated university (bachelor)">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bachelorYear" label="Year of graduation (bachelor)">
                  <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bachelorDirection" label="Direction (bachelor)">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="bachelorDiplomaNumber" label="Diploma number (bachelor)">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Master's Degree</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="masterUniversity" label="Name of graduated university (master)">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="masterYear" label="Year of graduation (master)">
                  <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="masterDirection" label="Direction (master)">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="masterDiplomaNumber" label="Diploma number (master)">
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Research</Divider>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name="researchArea" label="Research area">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">PhD Degree</Divider>
            <Form.Item name="hasPhdDegree" valuePropName="checked">
              <Checkbox>Do you have an academic degree (PhD)?</Checkbox>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasPhdDegree !== cur.hasPhdDegree}>
              {({ getFieldValue }) =>
                getFieldValue('hasPhdDegree') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="phdYear" label="Year of approval for academic degree (PhD)">
                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="phdSpeciality" label="Defenced speciality code and name (PhD)">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="phdTopic" label="The topic of the dissertation (PhD)">
                        <TextArea rows={3} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phdDiplomaNumber" label="Diploma number (PhD)">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phdCountry" label="Country (PhD)">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phdOrganization" label="Organization (PhD)">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">DSc Degree</Divider>
            <Form.Item name="hasDscDegree" valuePropName="checked">
              <Checkbox>Do you have an academic degree (DSc)?</Checkbox>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasDscDegree !== cur.hasDscDegree}>
              {({ getFieldValue }) =>
                getFieldValue('hasDscDegree') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="dscYear" label="Year of approval for academic degree (DSc)">
                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="dscSpeciality" label="Defenced speciality code and name (DSc)">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="dscTopic" label="The topic of the dissertation (DSc)">
                        <TextArea rows={3} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="dscDiplomaNumber" label="Diploma number (DSc)">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="dscCountry" label="Country (DSc)">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="dscOrganization" label="Organization (DSc)">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">Academic Title</Divider>
            <Form.Item name="hasAcademicTitle" valuePropName="checked">
              <Checkbox>Do you have an academic title?</Checkbox>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.hasAcademicTitle !== cur.hasAcademicTitle}>
              {({ getFieldValue }) =>
                getFieldValue('hasAcademicTitle') ? (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="academicTitleName" label="Name of academic title">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="academicTitleSpeciality" label="Defenced speciality code and name">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="academicTitleYear" label="Year of approval for academic title">
                        <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear()} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="academicTitleAttestat" label="Attestat number">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null
              }
            </Form.Item>

            <Divider orientation="left">Training and Development</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="internshipsCount" label="Number of internships (completed in the last year)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trainingCount" label="Number of places passed the qualification training">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="internshipsInfo" label="More information about the internship">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="trainingInfo" label="More information about the training">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Awards and Recognition</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="awardsField" label="Awards on the field (name; time of receipt)">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="awardsState" label="State awards (name; time of receipt)">
                  <TextArea rows={3} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Supervision</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="supervisedPhd" label="Number of supervised students (PhD)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="supervisedDsc" label="Number of supervised students (DSc)">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Conferences and Seminars</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="conferencesRepublic" label="Number of conferences - In the Republic">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="conferencesInternational" label="Number of conferences - International">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="seminarsRepublic" label="Number of seminars - In the Republic">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="seminarsInternational" label="Number of seminars - International">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Projects</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="projectsFundamental" label="Fundamental">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsPractical" label="Practical">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsYouth" label="Youth">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsBusiness" label="Business agreement">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="projectsInnovation" label="Innovation">
                  <InputNumber style={{ width: '100%' }} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="innovativeIdeasCount" label="Innovative ideas and developments">
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
