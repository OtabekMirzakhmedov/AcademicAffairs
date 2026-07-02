import { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Avatar, Select } from 'antd';
import type { MenuProps } from 'antd';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  FileText,
  FileSearch,
  AppWindow,
  User,
  LogOut,
  Settings,
  Users,
  Building2,
  SlidersHorizontal,
  IdCard,
  Globe,
  History,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import usersService from '../../services/users.service';
import branding from '../../config/branding.json';
import './MainLayout.scss';

const universityLogo = '/university-logo.png';

const { Header, Sider, Content } = Layout;

const LANGUAGES = [
  { value: 'uz', label: "O'zbek" },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

const Icon = ({ icon: I }: { icon: LucideIcon }) => (
  <I size={18} strokeWidth={1.75} className="nav-icon" />
);

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
            icon: <Icon icon={LayoutDashboard} />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/dashboard'),
          },
          {
            key: '/teaching-activities',
            icon: <Icon icon={BookOpen} />,
            label: t('teacher:teachingActivities.title'),
            onClick: () => navigate('/teaching-activities'),
          },
          {
            key: '/scientific-activities',
            icon: <Icon icon={FlaskConical} />,
            label: t('teacher:publications.title'),
            onClick: () => navigate('/scientific-activities'),
          },
          {
            key: '/scientific-tasks',
            icon: <Icon icon={FileText} />,
            label: t('teacher:scientificTasks.title'),
            onClick: () => navigate('/scientific-tasks'),
          },
          {
            key: '/account-info',
            icon: <Icon icon={IdCard} />,
            label: t('auth:account.title'),
            onClick: () => navigate('/account-info'),
          },
          {
            key: '/research-activities',
            icon: <Icon icon={FileSearch} />,
            label: t('teacher:researchActivities.title'),
            onClick: () => navigate('/research-activities'),
          },
          {
            key: '/other-activities',
            icon: <Icon icon={AppWindow} />,
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
            icon: <Icon icon={LayoutDashboard} />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/department/dashboard'),
          },
          {
            key: '/account-info',
            icon: <Icon icon={IdCard} />,
            label: t('auth:account.title'),
            onClick: () => navigate('/account-info'),
          },
          { type: 'divider' as const },
          {
            key: 'department',
            icon: <Icon icon={Building2} />,
            label: t('head:activities.title'),
            children: [
              {
                key: '/department/activities',
                icon: <Icon icon={BookOpen} />,
                label: t('teacher:teachingActivities.title'),
                onClick: () => navigate('/department/activities'),
              },
              {
                key: '/department/teachers',
                icon: <Icon icon={Users} />,
                label: t('head:teachers.title'),
                onClick: () => navigate('/department/teachers'),
              },
              {
                key: '/department/scientific-reports',
                icon: <Icon icon={FlaskConical} />,
                label: t('head:scientificReports.title'),
                onClick: () => navigate('/department/scientific-reports'),
              },
              {
                key: '/department/publications',
                icon: <Icon icon={FileText} />,
                label: t('head:publications.navTitle'),
                onClick: () => navigate('/department/publications'),
              },
            ],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            key: '/admin/dashboard',
            icon: <Icon icon={LayoutDashboard} />,
            label: t('nav.dashboard'),
            onClick: () => navigate('/admin/dashboard'),
          },
          { type: 'divider' as const },
          {
            key: 'administration',
            icon: <Icon icon={SlidersHorizontal} />,
            label: t('nav.administration'),
            children: [
              {
                key: '/admin/users',
                icon: <Icon icon={Users} />,
                label: t('admin:nav.users'),
                onClick: () => navigate('/admin/users'),
              },
              {
                key: '/admin/departments',
                icon: <Icon icon={Building2} />,
                label: t('admin:nav.departments'),
                onClick: () => navigate('/admin/departments'),
              },
              {
                key: '/admin/scientific-tasks',
                icon: <Icon icon={FlaskConical} />,
                label: t('admin:nav.scientificTasks'),
                onClick: () => navigate('/admin/scientific-tasks'),
              },
              {
                key: '/admin/research-activities',
                icon: <Icon icon={FileSearch} />,
                label: t('admin:nav.researchActivities'),
                onClick: () => navigate('/admin/research-activities'),
              },
              {
                key: '/admin/audit-logs',
                icon: <Icon icon={History} />,
                label: t('admin:nav.auditLogs'),
                onClick: () => navigate('/admin/audit-logs'),
              },
            ],
          },
        ]
      : []),
  ];

  const bottomMenuItems: MenuProps['items'] = [
    {
      key: '/settings',
      icon: <Icon icon={Settings} />,
      label: t('nav.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <Icon icon={LogOut} />,
      label: t('nav.logout'),
      onClick: handleLogout,
      danger: true,
    },
  ];

  const siderContent = (
    <div className="sider-inner">
      <div className="logo-container">
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

      <div className="sider-menu-wrap">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="sidebar-menu"
        />
      </div>

      <div className="sider-bottom">
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={bottomMenuItems}
          className="bottom-menu"
        />
      </div>
    </div>
  );

  return (
    <Layout className="main-layout">
      {!mobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="main-sider"
          width={250}
          collapsedWidth={80}
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

      {mobile && (
        <Drawer
          placement="left"
          onClose={() => setCollapsed(true)}
          open={!collapsed}
          closable={false}
          width={250}
          className="mobile-drawer"
          styles={{ body: { padding: 0, background: '#ffffff', height: '100%' } }}
        >
          {siderContent}
        </Drawer>
      )}

      <Layout style={{ marginLeft: !mobile ? (collapsed ? 80 : 250) : 0 }}>
        <Header className="main-header">
          <div className="header-left">
            <Button
              type="text"
              icon={
                collapsed ? (
                  <PanelLeftOpen size={18} strokeWidth={1.75} />
                ) : (
                  <PanelLeftClose size={18} strokeWidth={1.75} />
                )
              }
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
              suffixIcon={<Globe size={14} strokeWidth={1.75} />}
            />
            {isAdmin && (
              <Button
                type="primary"
                icon={<SlidersHorizontal size={16} strokeWidth={2} />}
                onClick={() => navigate('/admin/users')}
                className="admin-btn"
              >
                {t('nav.administration')}
              </Button>
            )}
            <div className="user-profile">
              <Avatar size="default" icon={<User size={16} strokeWidth={2} />} className="user-avatar" />
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
