import { Modal, Tabs } from 'antd';
import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('requirements');

  const handleSuccess = () => {
    onSuccess();
  };

  if (!teacher) return null;

  const tabItems = [
    {
      key: 'requirements',
      label: 'Teaching Requirements',
      children: (
        <TeacherRequirementsTab teacher={teacher} onSuccess={handleSuccess} />
      ),
    },
    {
      key: 'account',
      label: 'Account Information',
      children: (
        <TeacherAccountTab teacher={teacher} onSuccess={handleSuccess} />
      ),
    },
  ];

  return (
    <Modal
      title={`Edit Teacher: ${teacher?.userInfo?.firstName} ${teacher?.userInfo?.lastName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={1200}
      destroyOnClose
      style={{ top: 20 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </Modal>
  );
};

export default TeacherEditModal;