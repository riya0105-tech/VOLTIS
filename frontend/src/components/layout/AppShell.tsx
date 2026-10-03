import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useNavigation } from '../../context/NavigationContext';
import { cn } from '../../utils/cn';

export interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isSidebarOpen } = useNavigation();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'md:pl-60' : 'md:pl-18'
        )}
      >
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Container with generous breathing room */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Clean Footer */}
        <footer className="h-12 border-t border-slate-800/60 bg-[#0b0f19] px-6 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>VOLTIS Energy Intelligence</span>
            <span>•</span>
            <span>Surat Manufacturing Facility</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Telemetry active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
