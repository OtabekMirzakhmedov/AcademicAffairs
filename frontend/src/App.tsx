import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import enUS from 'antd/locale/en_US';
import ruRU from 'antd/locale/ru_RU';
import type { Locale } from 'antd/es/locale';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { router } from './router';

const antdLocaleMap: Record<string, Locale> = {
  uz: ruRU,
  ru: ruRU,
  en: enUS,
};

function App() {
  const { loadUserFromStorage } = useAuthStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <ConfigProvider
      locale={antdLocaleMap[i18n.language] ?? ruRU}
      theme={{
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#f5222d',
          colorInfo: '#1890ff',
          borderRadius: 4,
        },
      }}
    >
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
