import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AppShell } from './components/layout';
import { DashboardPage } from './pages/DashboardPage';
import { FactoryFloorPage } from './pages/FactoryFloorPage';
import { EnergyTrendsPage } from './pages/EnergyTrendsPage';
import { InsightsAlertsPage } from './pages/InsightsAlertsPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { CarbonReportPage } from './pages/CarbonReportPage';
import { SettingsPage } from './pages/SettingsPage';

function PageRouter() {
  const { activeTab } = useNavigation();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardPage />;
    case 'factory-view':
      return <FactoryFloorPage />;
    case 'energy-analytics':
      return <EnergyTrendsPage />;
    case 'ai-insights':
      return <InsightsAlertsPage />;
    case 'optimization':
      return <OptimizationPage />;
    case 'maintenance':
      return <MaintenancePage />;
    case 'carbon-report':
      return <CarbonReportPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

export default function App() {
  return (
    <NavigationProvider>
      <AppShell>
        <PageRouter />
      </AppShell>
    </NavigationProvider>
  );
}
