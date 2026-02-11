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
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (teacher) {
      form.setFieldsValue({
        // Personal Information
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

        // Educational Background - Bachelor
        bachelorUniversity: teacher.teacherInfo?.bachelorUniversity,
        bachelorYear: teacher.teacherInfo?.bachelorYear,
        bachelorDirection: teacher.teacherInfo?.bachelorDirection,
        bachelorDiplomaNumber: teacher.teacherInfo?.bachelorDiplomaNumber,

        // Educational Background - Master
        masterUniversity: teacher.teacherInfo?.masterUniversity,
        masterYear: teacher.teacherInfo?.masterYear,
        masterDirection: teacher.teacherInfo?.masterDirection,
        masterDiplomaNumber: teacher.teacherInfo?.masterDiplomaNumber,

        // Research
        researchArea: teacher.teacherInfo?.researchArea,

        // PhD Information
        hasPhdDegree: teacher.teacherInfo?.hasPhdDegree,
        phdYear: teacher.teacherInfo?.phdYear,
        phdSpeciality: teacher.teacherInfo?.phdSpeciality,
        phdTopic: teacher.teacherInfo?.phdTopic,
        phdDiplomaNumber: teacher.teacherInfo?.phdDiplomaNumber,
        phdCountry: teacher.teacherInfo?.phdCountry,
        phdOrganization: teacher.teacherInfo?.phdOrganization,

        // DSc Information
        hasDscDegree: teacher.teacherInfo?.hasDscDegree,
        dscYear: teacher.teacherInfo?.dscYear,
        dscSpeciality: teacher.teacherInfo?.dscSpeciality,
        dscTopic: teacher.teacherInfo?.dscTopic,
        dscDiplomaNumber: teacher.teacherInfo?.dscDiplomaNumber,
        dscCountry: teacher.teacherInfo?.dscCountry,
        dscOrganization: teacher.teacherInfo?.dscOrganization,

        // Academic Title
        hasAcademicTitle: teacher.teacherInfo?.hasAcademicTitle,
        academicTitleName: teacher.teacherInfo?.academicTitleName,
        academicTitleSpeciality: teacher.teacherInfo?.academicTitleSpeciality,
        academicTitleYear: teacher.teacherInfo?.academicTitleYear,
        academicTitleAttestat: teacher.teacherInfo?.academicTitleAttestat,

        // Training and Development
        internshipsCount: teacher.teacherInfo?.internshipsCount,
        internshipsInfo: teacher.teacherInfo?.internshipsInfo,
        trainingCount: teacher.teacherInfo?.trainingCount,
        trainingInfo: teacher.teacherInfo?.trainingInfo,

        // Awards and Recognition
        awardsField: teacher.teacherInfo?.awardsField,
        awardsState: teacher.teacherInfo?.awardsState,

        // Supervision
        supervisedPhd: teacher.teacherInfo?.supervisedPhd,
        supervisedDsc: teacher.teacherInfo?.supervisedDsc,

        // Conference and Seminar Participation
        conferencesRepublic: teacher.teacherInfo?.conferencesRepublic,
        conferencesInternational: teacher.teacherInfo?.conferencesInternational,
        seminarsRepublic: teacher.teacherInfo?.seminarsRepublic,
        seminarsInternational: teacher.teacherInfo?.seminarsInternational,

        // Projects
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

      // Convert date to ISO string if present
      const payload: UpdateUserAccountRequest = {
        ...values,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
      };

      await usersService.updateAccount(teacher.id, payload);
      message.success('Account information updated successfully');
      setIsEditing(false);
      onSuccess();
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
            <ViewField label="Name" value={teacher.userInfo?.firstName} />
          </Col>
          <Col span={8}>
            <ViewField label="Surname" value={teacher.userInfo?.lastName} />
          </Col>
          <Col span={8}>
            <ViewField label="Middle name" value={teacher.userInfo?.middleName} />
          </Col>
          <Col span={8}>
            <ViewField
              label="Date of birth"
              value={teacher.userInfo?.dateOfBirth ? dayjs(teacher.userInfo.dateOfBirth).format('YYYY-MM-DD') : '-'}
            />
          </Col>
          <Col span={8}>
            <ViewField label="Gender" value={teacher.userInfo?.gender} />
          </Col>
          <Col span={8}>
            <ViewField label="Nationality" value={teacher.userInfo?.nationality} />
          </Col>
        </Row>

        <Divider orientation="left">Birth Information</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Country of birth" value={teacher.userInfo?.countryOfBirth} />
          </Col>
          <Col span={12}>
            <ViewField label="Region of birth" value={teacher.userInfo?.regionOfBirth} />
          </Col>
        </Row>

        <Divider orientation="left">Address Information</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Currently registered address" value={teacher.userInfo?.currentAddress} />
          </Col>
          <Col span={12}>
            <ViewField label="Permanently registered address" value={teacher.userInfo?.permanentAddress} />
          </Col>
        </Row>

        <Divider orientation="left">Identification</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label="Passport serial number" value={teacher.userInfo?.passportSerial} />
          </Col>
          <Col span={8}>
            <ViewField label="Personal identification number (14 digits)" value={teacher.userInfo?.personalId} />
          </Col>
          <Col span={8}>
            <ViewField label="STIR/INN" value={teacher.userInfo?.stirInn} />
          </Col>
        </Row>

        <Divider orientation="left">Contact Information</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label="English level" value={teacher.userInfo?.englishLevel} />
          </Col>
          <Col span={8}>
            <ViewField label="Phone number" value={teacher.userInfo?.phone1} />
          </Col>
          <Col span={8}>
            <ViewField label="Email" value={teacher.userInfo?.email1} />
          </Col>
        </Row>

        <Divider orientation="left">Bachelor's Degree</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Name of graduated university (bachelor)" value={teacher.teacherInfo?.bachelorUniversity} />
          </Col>
          <Col span={12}>
            <ViewField label="Year of graduation (bachelor)" value={teacher.teacherInfo?.bachelorYear} />
          </Col>
          <Col span={12}>
            <ViewField label="Direction (bachelor)" value={teacher.teacherInfo?.bachelorDirection} />
          </Col>
          <Col span={12}>
            <ViewField label="Diploma number (bachelor)" value={teacher.teacherInfo?.bachelorDiplomaNumber} />
          </Col>
        </Row>

        <Divider orientation="left">Master's Degree</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Name of graduated university (master)" value={teacher.teacherInfo?.masterUniversity} />
          </Col>
          <Col span={12}>
            <ViewField label="Year of graduation (master)" value={teacher.teacherInfo?.masterYear} />
          </Col>
          <Col span={12}>
            <ViewField label="Direction (master)" value={teacher.teacherInfo?.masterDirection} />
          </Col>
          <Col span={12}>
            <ViewField label="Diploma number (master)" value={teacher.teacherInfo?.masterDiplomaNumber} />
          </Col>
        </Row>

        <Divider orientation="left">Research</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField label="Research area" value={teacher.teacherInfo?.researchArea} />
          </Col>
        </Row>

        <Divider orientation="left">PhD Degree</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField label="Do you have an academic degree (PhD)?" value={teacher.teacherInfo?.hasPhdDegree ? 'Yes' : 'No'} />
          </Col>
          {teacher.teacherInfo?.hasPhdDegree && (
            <>
              <Col span={12}>
                <ViewField label="Year of approval for academic degree (PhD)" value={teacher.teacherInfo?.phdYear} />
              </Col>
              <Col span={12}>
                <ViewField label="Defenced speciality code and name (PhD)" value={teacher.teacherInfo?.phdSpeciality} />
              </Col>
              <Col span={24}>
                <ViewField label="The topic of the dissertation (PhD)" value={teacher.teacherInfo?.phdTopic} />
              </Col>
              <Col span={8}>
                <ViewField label="Diploma number (PhD)" value={teacher.teacherInfo?.phdDiplomaNumber} />
              </Col>
              <Col span={8}>
                <ViewField label="Country (PhD)" value={teacher.teacherInfo?.phdCountry} />
              </Col>
              <Col span={8}>
                <ViewField label="Organization (PhD)" value={teacher.teacherInfo?.phdOrganization} />
              </Col>
            </>
          )}
        </Row>

        <Divider orientation="left">DSc Degree</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField label="Do you have an academic degree (DSc)?" value={teacher.teacherInfo?.hasDscDegree ? 'Yes' : 'No'} />
          </Col>
          {teacher.teacherInfo?.hasDscDegree && (
            <>
              <Col span={12}>
                <ViewField label="Year of approval for academic degree (DSc)" value={teacher.teacherInfo?.dscYear} />
              </Col>
              <Col span={12}>
                <ViewField label="Defenced speciality code and name (DSc)" value={teacher.teacherInfo?.dscSpeciality} />
              </Col>
              <Col span={24}>
                <ViewField label="The topic of the dissertation (DSc)" value={teacher.teacherInfo?.dscTopic} />
              </Col>
              <Col span={8}>
                <ViewField label="Diploma number (DSc)" value={teacher.teacherInfo?.dscDiplomaNumber} />
              </Col>
              <Col span={8}>
                <ViewField label="Country (DSc)" value={teacher.teacherInfo?.dscCountry} />
              </Col>
              <Col span={8}>
                <ViewField label="Organization (DSc)" value={teacher.teacherInfo?.dscOrganization} />
              </Col>
            </>
          )}
        </Row>

        <Divider orientation="left">Academic Title</Divider>
        <Row gutter={24}>
          <Col span={24}>
            <ViewField label="Do you have an academic title?" value={teacher.teacherInfo?.hasAcademicTitle ? 'Yes' : 'No'} />
          </Col>
          {teacher.teacherInfo?.hasAcademicTitle && (
            <>
              <Col span={12}>
                <ViewField label="Name of academic title" value={teacher.teacherInfo?.academicTitleName} />
              </Col>
              <Col span={12}>
                <ViewField label="Defenced speciality code and name" value={teacher.teacherInfo?.academicTitleSpeciality} />
              </Col>
              <Col span={12}>
                <ViewField label="Year of approval for academic title" value={teacher.teacherInfo?.academicTitleYear} />
              </Col>
              <Col span={12}>
                <ViewField label="Attestat number" value={teacher.teacherInfo?.academicTitleAttestat} />
              </Col>
            </>
          )}
        </Row>

        <Divider orientation="left">Training and Development</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Number of internships (completed in the last year)" value={teacher.teacherInfo?.internshipsCount} />
          </Col>
          <Col span={12}>
            <ViewField label="Number of places passed the qualification training (completed in the last year)" value={teacher.teacherInfo?.trainingCount} />
          </Col>
          <Col span={12}>
            <ViewField label="More information about the internship" value={teacher.teacherInfo?.internshipsInfo} />
          </Col>
          <Col span={12}>
            <ViewField label="More information about the training" value={teacher.teacherInfo?.trainingInfo} />
          </Col>
        </Row>

        <Divider orientation="left">Awards and Recognition</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Awards on the field (name; time of receipt)" value={teacher.teacherInfo?.awardsField} />
          </Col>
          <Col span={12}>
            <ViewField label="State awards (name; time of receipt)" value={teacher.teacherInfo?.awardsState} />
          </Col>
        </Row>

        <Divider orientation="left">Supervision</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Number of supervised students (PhD)" value={teacher.teacherInfo?.supervisedPhd} />
          </Col>
          <Col span={12}>
            <ViewField label="Number of supervised students (DSc)" value={teacher.teacherInfo?.supervisedDsc} />
          </Col>
        </Row>

        <Divider orientation="left">Conferences and Seminars</Divider>
        <Row gutter={24}>
          <Col span={12}>
            <ViewField label="Number of conferences attended - In the Republic" value={teacher.teacherInfo?.conferencesRepublic} />
          </Col>
          <Col span={12}>
            <ViewField label="Number of conferences attended - International" value={teacher.teacherInfo?.conferencesInternational} />
          </Col>
          <Col span={12}>
            <ViewField label="Number of seminars attended - In the Republic" value={teacher.teacherInfo?.seminarsRepublic} />
          </Col>
          <Col span={12}>
            <ViewField label="Number of seminars attended - International" value={teacher.teacherInfo?.seminarsInternational} />
          </Col>
        </Row>

        <Divider orientation="left">Projects</Divider>
        <Row gutter={24}>
          <Col span={8}>
            <ViewField label="Fundamental" value={teacher.teacherInfo?.projectsFundamental} />
          </Col>
          <Col span={8}>
            <ViewField label="Practical" value={teacher.teacherInfo?.projectsPractical} />
          </Col>
          <Col span={8}>
            <ViewField label="Youth" value={teacher.teacherInfo?.projectsYouth} />
          </Col>
          <Col span={8}>
            <ViewField label="Business agreement" value={teacher.teacherInfo?.projectsBusiness} />
          </Col>
          <Col span={8}>
            <ViewField label="Innovation" value={teacher.teacherInfo?.projectsInnovation} />
          </Col>
          <Col span={8}>
            <ViewField label="Number of innovative ideas and developments" value={teacher.teacherInfo?.innovativeIdeasCount} />
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
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
            <Form.Item name="trainingCount" label="Number of places passed the qualification training (completed in the last year)">
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
            <Form.Item name="conferencesRepublic" label="Number of conferences attended - In the Republic">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="conferencesInternational" label="Number of conferences attended - International">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="seminarsRepublic" label="Number of seminars attended - In the Republic">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="seminarsInternational" label="Number of seminars attended - International">
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
            <Form.Item name="innovativeIdeasCount" label="Number of innovative ideas and developments">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default TeacherAccountTab;
