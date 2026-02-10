import React from 'react';
import { IdcardOutlined } from '@ant-design/icons';
import MainLayout from '../components/layout/MainLayout';
import { useAuthStore } from '../store/authStore';
import AccountInfoTab from '../components/features/auth/AccountInfoTab';

const AccountInfoPage: React.FC = () => {
  const { user, setUser } = useAuthStore();

  const handleAccountUpdate = (updatedUser?: any) => {
    // Update the auth store with the fresh user data returned from the API
    if (updatedUser) {
      setUser(updatedUser);
      // Update localStorage to persist
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>
            <IdcardOutlined style={{ marginRight: 8 }} />
            Account Information
          </h1>
          <p style={{ margin: '4px 0 0', color: '#8c8c8c' }}>
            Manage your personal and academic information
          </p>
        </div>

        {user ? <AccountInfoTab user={user} onSuccess={handleAccountUpdate} /> : null}
      </div>
    </MainLayout>
  );
};

export default AccountInfoPage;
