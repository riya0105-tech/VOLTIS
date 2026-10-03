import { createContext, useContext, useState, ReactNode } from 'react';

export type NavItemKey =
  | 'dashboard'
  | 'factory-view'
  | 'energy-analytics'
  | 'ai-insights'
  | 'optimization'
  | 'maintenance'
  | 'carbon-report'
  | 'settings';

interface NavigationContextType {
  activeTab: NavItemKey;
  setActiveTab: (tab: NavItemKey) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  selectedFactoryId: string;
  setSelectedFactoryId: (id: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavItemKey>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFactoryId, setSelectedFactoryId] = useState('factory_001');

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        selectedFactoryId,
        setSelectedFactoryId,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
