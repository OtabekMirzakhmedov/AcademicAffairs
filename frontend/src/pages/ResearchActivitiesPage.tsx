import { Card } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import ScientificResearchTab from '../components/features/research-activities/ScientificResearchTab';

const ResearchActivitiesPage: React.FC = () => {
  return (
    <MainLayout>
      <Card title="Scientific and Research Activities">
        <ScientificResearchTab />
      </Card>
    </MainLayout>
  );
};

export default ResearchActivitiesPage;
