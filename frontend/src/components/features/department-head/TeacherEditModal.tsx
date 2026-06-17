import { Modal, Tabs } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TeacherRequirementsTab from './TeacherRequirementsTab';
import TeacherAccountTab from './TeacherAccountTab';
import type { User } from '../../../types';

interface TeacherEditModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  teacher: User | null;
}

const TeacherEditModal = ({ open, onCancel, onSuccess, teacher }: TeacherEditModalProps) => {
  const { t } = useTranslation(['head', 'auth']);
  const [activeTab, setActiveTab] = useState('requirements');

  if (!teacher) return null;

  const tabItems = [
    {
      key: 'requirements',
      label: t('head:requirements.title'),
      children: <TeacherRequirementsTab teacher={teacher} onSuccess={onSuccess} />,
    },
    {
      key: 'account',
      label: t('auth:account.title'),
      children: <TeacherAccountTab teacher={teacher} onSuccess={onSuccess} />,
    },
  ];

  return (
    <Modal
      title={`${teacher?.userInfo?.firstName} ${teacher?.userInfo?.lastName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
      style={{ top: 20 }}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Modal>
  );
};

export default TeacherEditModal;
