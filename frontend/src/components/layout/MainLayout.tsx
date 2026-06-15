import { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Avatar } from 'antd';
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
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import branding from '../../config/branding.json';
import universityLogo from '../../../public/university-logo.png';
import './MainLayout.scss';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

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

  const isAdmin = user?.role?.name === 'admin';
  const isDeptHead = user?.role?.name === 'departmenthead';
  const isTeacher = user?.role?.name === 'teacher';

  const menuItems: MenuProps['items'] = [
    ...(isTeacher
      ? [
          {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
            onClick: () => navigate('/dashboard'),
          },
          {
            key: '/teaching-activities',
            icon: <BookOutlined />,
            label: 'Teaching Activities',
            onClick: () => navigate('/teaching-activities'),
          },
          {
            key: '/scientific-activities',
            icon: <ExperimentOutlined />,
            label: 'Publications',
            onClick: () => navigate('/scientific-activities'),
          },
          {
            key: '/scientific-tasks',
            icon: <FileTextOutlined />,
            label: 'Scientific Tasks',
            onClick: () => navigate('/scientific-tasks'),
          },
          {
            key: '/account-info',
            icon: <IdcardOutlined />,
            label: 'Account Information',
            onClick: () => navigate('/account-info'),
          },
          {
            key: '/research-activities',
            icon: <FileSearchOutlined />,
            label: 'Research Activities',
            onClick: () => navigate('/research-activities'),
          },
          {
            key: '/other-activities',
            icon: <AppstoreOutlined />,
            label: 'Other Activities',
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
            label: 'Dashboard',
            onClick: () => navigate('/department/dashboard'),
          },
          { type: 'divider' as const },
          {
            key: 'department',
            icon: <BankOutlined />,
            label: 'Department Management',
            children: [
              {
                key: '/department/activities',
                icon: <BookOutlined />,
                label: 'Teaching Activities',
                onClick: () => navigate('/department/activities'),
              },
              {
                key: '/department/teachers',
                icon: <TeamOutlined />,
                label: 'Teachers',
                onClick: () => navigate('/department/teachers'),
              },
              {
                key: '/department/scientific-reports',
                icon: <ExperimentOutlined />,
                label: 'Scientific Reports',
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
            label: 'Dashboard',
            onClick: () => navigate('/admin/dashboard'),
          },
          { type: 'divider' as const },
          {
            key: 'administration',
            icon: <ControlOutlined />,
            label: 'Administration',
            children: [
              {
                key: '/admin/users',
                icon: <TeamOutlined />,
                label: 'Users',
                onClick: () => navigate('/admin/users'),
              },
              {
                key: '/admin/departments',
                icon: <BankOutlined />,
                label: 'Departments',
                onClick: () => navigate('/admin/departments'),
              },
              {
                key: '/admin/scientific-tasks',
                icon: <ExperimentOutlined />,
                label: 'Scientific Tasks',
                onClick: () => navigate('/admin/scientific-tasks'),
              },
              {
                key: '/admin/research-activities',
                icon: <FileSearchOutlined />,
                label: 'Research Activities',
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
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
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
            <span className="header-title">Academic Affairs</span>
          </div>

          <div className="header-right">
            {isAdmin && (
              <Button
                type="primary"
                icon={<ControlOutlined />}
                onClick={() => navigate('/admin/users')}
                className="admin-btn"
              >
                Administration
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
