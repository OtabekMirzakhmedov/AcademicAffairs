import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { useAuthStore } from './store/authStore';
import branding from './config/branding.json';

function App() {
  const { loadUserFromStorage } = useAuthStore();

  useEffect(() => {
    loadUserFromStorage();
  }, [loadUserFromStorage]);

  return (
    <ConfigProvider
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            {branding.universityName}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Academic Affairs Management System
          </p>
          <p className="text-gray-500">
            Initial setup complete. Ready for development.
          </p>
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Next Steps:</h2>
            <ul className="text-left text-sm text-gray-700 space-y-2">
              <li>✅ Backend: NestJS + Fastify + Prisma</li>
              <li>✅ Frontend: React + Vite + Tailwind + Ant Design</li>
              <li>✅ Database Schema Created</li>
              <li>🔨 Authentication Module - In Progress</li>
              <li>📋 Login Page - Coming Next</li>
            </ul>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
