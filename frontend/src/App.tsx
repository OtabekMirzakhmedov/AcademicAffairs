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

const FONT_FAMILY =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

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
          colorPrimary: '#4f46e5',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#4f46e5',
          colorLink: '#4f46e5',
          colorBgLayout: '#fafaf9',
          colorBorder: '#e7e5e4',
          colorBorderSecondary: '#f5f5f4',
          colorText: '#1c1917',
          colorTextSecondary: '#57534e',
          borderRadius: 8,
          borderRadiusLG: 10,
          borderRadiusSM: 6,
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          boxShadowSecondary: '0 1px 2px rgba(0, 0, 0, 0.04)',
          controlHeight: 36,
        },
        components: {
          Layout: {
            siderBg: '#ffffff',
            headerBg: '#ffffff',
            bodyBg: '#fafaf9',
            headerHeight: 64,
            headerPadding: '0 24px',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: '#eef2ff',
            itemSelectedColor: '#4f46e5',
            itemHoverBg: '#f5f5f4',
            itemColor: '#57534e',
            itemHoverColor: '#1c1917',
            iconSize: 18,
            collapsedIconSize: 20,
            itemBorderRadius: 8,
            itemHeight: 40,
            itemMarginInline: 8,
            itemPaddingInline: 12,
            subMenuItemBg: 'transparent',
          },
          Card: {
            borderRadiusLG: 12,
            paddingLG: 20,
            boxShadowTertiary: '0 1px 2px rgba(0, 0, 0, 0.04)',
          },
          Button: {
            borderRadius: 8,
            controlHeight: 36,
            fontWeight: 500,
            primaryShadow: 'none',
          },
          Input: {
            borderRadius: 8,
            controlHeight: 40,
          },
          InputNumber: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Select: {
            borderRadius: 8,
            controlHeight: 40,
          },
          DatePicker: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Tag: {
            borderRadiusSM: 6,
          },
          Table: {
            borderRadius: 10,
            headerBg: '#fafaf9',
            headerColor: '#57534e',
            rowHoverBg: '#fafaf9',
          },
          Modal: {
            borderRadiusLG: 12,
          },
          Statistic: {
            titleFontSize: 13,
            contentFontSize: 28,
          },
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
