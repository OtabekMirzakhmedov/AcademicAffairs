import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, App as AntApp } from 'antd';
import enUS from 'antd/locale/en_US';
import ruRU from 'antd/locale/ru_RU';
import type { Locale } from 'antd/es/locale';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';
import { router } from './router';

const antdLocaleMap: Record<string, Locale> = {
  uz: ruRU,
  ru: ruRU,
  en: enUS,
};

const FONT_FAMILY =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

// Light/dark values mirror frontend/src/styles/_variables.scss so AntD components
// and the SCSS-driven parts of the UI stay visually consistent across themes.
const themeTokens = {
  light: {
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
    siderBg: '#ffffff',
    headerBg: '#ffffff',
    bodyBg: '#fafaf9',
    menuItemSelectedBg: '#eef2ff',
    menuItemHoverBg: '#f5f5f4',
    menuItemColor: '#57534e',
    menuItemHoverColor: '#1c1917',
    tableHeaderBg: '#fafaf9',
    tableHeaderColor: '#57534e',
    tableRowHoverBg: '#fafaf9',
  },
  dark: {
    colorPrimary: '#6366f1',
    colorSuccess: '#34d399',
    colorWarning: '#fbbf24',
    colorError: '#f87171',
    colorInfo: '#6366f1',
    colorLink: '#818cf8',
    colorBgLayout: '#121110',
    colorBorder: '#3f3a35',
    colorBorderSecondary: '#292524',
    colorText: '#f5f5f4',
    colorTextSecondary: '#d6d3d1',
    siderBg: '#1c1917',
    headerBg: '#1c1917',
    bodyBg: '#121110',
    menuItemSelectedBg: 'rgba(99, 102, 241, 0.16)',
    menuItemHoverBg: '#292524',
    menuItemColor: '#d6d3d1',
    menuItemHoverColor: '#f5f5f4',
    tableHeaderBg: '#1c1917',
    tableHeaderColor: '#d6d3d1',
    tableRowHoverBg: '#292524',
  },
};

function App() {
  const { loadUserFromStorage } = useAuthStore();
  const { mode } = useThemeStore();
  const { i18n } = useTranslation();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  const tokens = themeTokens[mode];

  return (
    <ConfigProvider
      locale={antdLocaleMap[i18n.language] ?? ruRU}
      theme={{
        algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: tokens.colorPrimary,
          colorSuccess: tokens.colorSuccess,
          colorWarning: tokens.colorWarning,
          colorError: tokens.colorError,
          colorInfo: tokens.colorInfo,
          colorLink: tokens.colorLink,
          colorBgLayout: tokens.colorBgLayout,
          colorBorder: tokens.colorBorder,
          colorBorderSecondary: tokens.colorBorderSecondary,
          colorText: tokens.colorText,
          colorTextSecondary: tokens.colorTextSecondary,
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
            siderBg: tokens.siderBg,
            headerBg: tokens.headerBg,
            bodyBg: tokens.bodyBg,
            headerHeight: 64,
            headerPadding: '0 24px',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: tokens.menuItemSelectedBg,
            itemSelectedColor: tokens.colorPrimary,
            itemHoverBg: tokens.menuItemHoverBg,
            itemColor: tokens.menuItemColor,
            itemHoverColor: tokens.menuItemHoverColor,
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
            headerBg: tokens.tableHeaderBg,
            headerColor: tokens.tableHeaderColor,
            rowHoverBg: tokens.tableRowHoverBg,
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
