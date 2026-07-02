import React, { useState } from 'react';
import { App, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import PageHeader from '../components/ui/PageHeader';
import { useAuthStore } from '../store/authStore';
import AccountInfoTab from '../components/features/auth/AccountInfoTab';
import usersService from '../services/users.service';
import './AccountInfoPage.scss';

const AccountInfoPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { t, i18n } = useTranslation('auth');
  const { message } = App.useApp();
  const [printing, setPrinting] = useState(false);

  const handleAccountUpdate = (updatedUser?: any) => {
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handlePrint = async () => {
    if (!user) return;
    try {
      setPrinting(true);
      await usersService.downloadAccountSummaryPdf(user.id, i18n.language);
    } catch (error: any) {
      message.error(error.response?.data?.message || t('common:message.failedToLoad'));
    } finally {
      setPrinting(false);
    }
  };

  return (
    <MainLayout>
      <div className="account-info-page">
        <PageHeader
          title={t('auth:account.title')}
          subtitle={t('auth:account.subtitle')}
          actions={
            <Button icon={<PrinterOutlined />} onClick={handlePrint} loading={printing}>
              {t('auth:account.printPdf')}
            </Button>
          }
        />

        {user ? <AccountInfoTab user={user} onSuccess={handleAccountUpdate} /> : null}
      </div>
    </MainLayout>
  );
};

export default AccountInfoPage;
