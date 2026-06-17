import { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Avatar, Select } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  BookOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  ControlOutlined,
  IdcardOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import usersService from '../../services/users.service';
import branding from '../../config/branding.json';
import universityLogo from '../../../public/university-logo.png';
import './MainLayout.scss';

const { Header, Sider, Content } = Layout;

const LANGUAGES = [
  { value: 'uz', label: "O'zbek" },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation(['common', 'teacher', 'head', 'admin']);

  useEffect(() => {
    const checkMobile = () => {
      setMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('locale', lang);
    if (user?.id) {
      try {
        await usersService.updateAccount(user.id, { locale: lang });
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.userInfo) parsed.userInfo.locale = lang;
          localStorage.setItem('user', JSON.stringify(parsed));
        }
      } catch {
        // fire-and-forget; locale already applied locally
      }
    }
  };

  const isAdmin = user?.role?.name === 'admin';
  const isDeptHead = user?.role?.name === 'departmenthead';
  const isTeacher = user?.role?.name === 'teacher';

  const menuItems: MenuProps['items'] = [
    ...(isTeacher
      ? [
          {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/dashboard'),
          },
          {
            key: '/teaching-activities',
            icon: <BookOutlined />,
            label: t('teacher:teachingActivities.title'),
            onClick: () => navigate('/teaching-activities'),
          },
          {
            key: '/scientific-activities',
            icon: <ExperimentOutlined />,
            label: t('teacher:publications.title'),
            onClick: () => navigate('/scientific-activities'),
          },
          {
            key: '/scientific-tasks',
            icon: <FileTextOutlined />,
            label: t('teacher:scientificTasks.title'),
            onClick: () => navigate('/scientific-tasks'),
          },
          {
            key: '/account-info',
            icon: <IdcardOutlined />,
            label: t('auth:account.title'),
            onClick: () => navigate('/account-info'),
          },
          {
            key: '/research-activities',
            icon: <FileSearchOutlined />,
            label: t('teacher:researchActivities.title'),
            onClick: () => navigate('/research-activities'),
          },
          {
            key: '/other-activities',
            icon: <AppstoreOutlined />,
            label: t('teacher:otherActivities'),
            onClick: () => navigate('/other-activities'),
            disabled: true,
          },
        ]
      : []),
    ...(isDeptHead
      ? [
          {
            key: '/department/dashboard',
            icon: <DashboardOutlined />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/department/dashboard'),
          },
          { type: 'divider' as const },
          {
            key: 'department',
            icon: <BankOutlined />,
            label: t('head:activities.title'),
            children: [
              {
                key: '/department/activities',
                icon: <BookOutlined />,
                label: t('teacher:teachingActivities.title'),
                onClick: () => navigate('/department/activities'),
              },
              {
                key: '/department/teachers',
                icon: <TeamOutlined />,
                label: t('head:teachers.title'),
                onClick: () => navigate('/department/teachers'),
              },
              {
                key: '/department/scientific-reports',
                icon: <ExperimentOutlined />,
                label: t('head:scientificReports.title'),
                onClick: () => navigate('/department/scientific-reports'),
              },
            ],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/admin/dashboard'),
          },
          { type: 'divider' as const },
          {
            key: 'administration',
            icon: <ControlOutlined />,
            label: t('nav.administration'),
            children: [
              {
                key: '/admin/users',
                icon: <TeamOutlined />,
                label: t('admin:nav.users'),
                onClick: () => navigate('/admin/users'),
              },
              {
                key: '/admin/departments',
                icon: <BankOutlined />,
                label: t('admin:nav.departments'),
                onClick: () => navigate('/admin/departments'),
              },
              {
                key: '/admin/scientific-tasks',
                icon: <ExperimentOutlined />,
                label: t('admin:nav.scientificTasks'),
                onClick: () => navigate('/admin/scientific-tasks'),
              },
              {
                key: '/admin/research-activities',
                icon: <FileSearchOutlined />,
                label: t('admin:nav.researchActivities'),
                onClick: () => navigate('/admin/research-activities'),
              },
            ],
          },
        ]
      : []),
  ];

  const bottomMenuItems: MenuProps['items'] = [
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('nav.logout'),
      onClick: handleLogout,
      danger: true,
      style: { color: '#ff4d4f' },
    },
  ];


  const siderContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="logo-container" style={{ flexShrink: 0 }}>
        {!collapsed && (
          <div className="logo-text">
            <img
              src={universityLogo}
              alt={branding.universityName}
              className="logo-image"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="university-name">{branding.universityShortName}</span>
          </div>
        )}
        {collapsed && (
          <div className="logo-icon">
            <img
                src={universityLogo}
                alt={branding.universityName}
                className="logo-image-collapsed"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
            />
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="sidebar-menu"
            style={{ borderBottom: 'none' }}
        />
      </div>

      <div style={{ flexShrink: 0 }}>
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={bottomMenuItems}
            style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
            className="bottom-menu"
        />
      </div>
    </div>
  );

  return (
      <Layout className="main-layout">
      {/* Desktop Sidebar */}
      {!mobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="main-sider"
          width={250}
          style={{
            overflow: 'hidden',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
        >
          {siderContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      {mobile && (
        <Drawer
          placement="left"
          onClose={() => setCollapsed(true)}
          open={!collapsed}
          closable={false}
          width={250}
          className="mobile-drawer"
          styles={{ body: { padding: 0, background: '#001529', height: '100%' } }}
        >
          {siderContent}
        </Drawer>
      )}

      <Layout style={{ marginLeft: !mobile ? (collapsed ? 80 : 250) : 0 }}>
        <Header className="main-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
            />
            <span className="header-title">{t('appTitle')}</span>
          </div>

          <div className="header-right">
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              options={LANGUAGES}
              size="small"
              style={{ width: 110 }}
              suffixIcon={<GlobalOutlined />}
            />
            {isAdmin && (
              <Button
                type="primary"
                icon={<ControlOutlined />}
                onClick={() => navigate('/admin/users')}
                className="admin-btn"
              >
                {t('nav.administration')}
              </Button>
            )}
            <div className="user-profile">
              <Avatar
                size="default"
                icon={<UserOutlined />}
                className="user-avatar"
              />
              <span className="user-name">
                {user?.userInfo?.firstName && user?.userInfo?.lastName
                  ? `${user.userInfo.firstName} ${user.userInfo.lastName}`
                  : user?.login}
              </span>
            </div>
          </div>
        </Header>

        <Content className="main-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
