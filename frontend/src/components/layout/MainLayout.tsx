import { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Button, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BookOutlined,
  ExperimentOutlined,
  FileSearchOutlined,
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  TeamOutlined,
  BankOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import branding from '../../config/branding.json';
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

  const menuItems: MenuProps['items'] = [
    {
      key: '/teaching-activities',
      icon: <BookOutlined />,
      label: 'Teaching Activities',
      onClick: () => navigate('/teaching-activities'),
    },
    {
      key: '/scientific-activities',
      icon: <ExperimentOutlined />,
      label: 'Scientific Activities',
      onClick: () => navigate('/scientific-activities'),
    },
    {
      key: '/research-activities',
      icon: <FileSearchOutlined />,
      label: 'Research Activities',
      onClick: () => navigate('/research-activities'),
      disabled: true,
    },
    {
      key: '/other-activities',
      icon: <AppstoreOutlined />,
      label: 'Other Activities',
      onClick: () => navigate('/other-activities'),
      disabled: true,
    },
    ...(isDeptHead
      ? [
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
            ],
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  const siderContent = (
    <>
      <div className="logo-container">
        {!collapsed && (
          <div className="logo-text">
            <img
              src='src/assets/university-logo.png'
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
                src='src/assets/university-logo.png'
                alt={branding.universityName}
                className="logo-image-collapsed"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
            />
          </div>
        )}
      </div>

      <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="sidebar-menu"
      />
    </>
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
          styles={{ body: { padding: 0, background: '#001529' } }}
        >
          {siderContent}
        </Drawer>
      )}

      <Layout>
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
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-profile">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  className="user-avatar"
                />
                <span className="user-name">
                  {user?.userInfo?.firstName || user?.login}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content className="main-content">{children}</Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
