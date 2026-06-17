import { useTranslation } from 'react-i18next';
import { Card } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import ScientificResearchTab from '../components/features/research-activities/ScientificResearchTab';

const ResearchActivitiesPage: React.FC = () => {
  const { t } = useTranslation('teacher');

  return (
    <MainLayout>
      <Card title={t('teacher:researchActivities.scientificResearch')}>
        <ScientificResearchTab />
      </Card>
    </MainLayout>
  );
};

export default ResearchActivitiesPage;
