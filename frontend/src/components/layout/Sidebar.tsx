import {
  LayoutDashboard,
  Layers,
  LineChart,
  AlertCircle,
  Sliders,
  Wrench,
  Leaf,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigation, NavItemKey } from '../../context/NavigationContext';
import { cn } from '../../utils/cn';

interface NavItemConfig {
  key: NavItemKey;
  label: string;
  icon: typeof LayoutDashboard;
  badge?: string;
  badgeColor?: 'red' | 'cyan';
}

const navItems: NavItemConfig[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'factory-view', label: 'Factory Floor', icon: Layers },
  { key: 'energy-analytics', label: 'Energy Trends', icon: LineChart },
  {
    key: 'ai-insights',
    label: 'Insights & Alerts',
    icon: AlertCircle,
    badge: '1',
    badgeColor: 'red',
  },
  { key: 'optimization', label: 'Optimization', icon: Sliders },
  { key: 'maintenance', label: 'Maintenance', icon: Wrench },
  { key: 'carbon-report', label: 'Carbon & ESG', icon: Leaf },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { activeTab, setActiveTab, isSidebarOpen, toggleSidebar } = useNavigation();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out',
        'bg-[#0b101d] border-r border-slate-800/80 flex flex-col',
        isSidebarOpen ? 'w-60' : 'w-18'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex items-center justify-center h-9 w-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Zap className="h-4 w-4 fill-emerald-400/20 stroke-emerald-400" />
          </div>

          {isSidebarOpen && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold text-white tracking-tight">
                VOLTIS
              </span>
              <span className="text-[11px] text-slate-400 font-normal truncate">
                Energy Intelligence
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              title={!isSidebarOpen ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left select-none',
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-emerald-400' : 'text-slate-400'
                )}
              />

              {isSidebarOpen && (
                <span className="flex-1 truncate text-xs font-medium">
                  {item.label}
                </span>
              )}

              {isSidebarOpen && item.badge && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-semibold rounded-full shrink-0',
                    item.badgeColor === 'red'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Clean Status Footer */}
      <div className="p-3 border-t border-slate-800/80 shrink-0">
        {isSidebarOpen ? (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Plant connected</span>
            </span>
            <span className="text-[11px] text-slate-500">v1.0</span>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" title="Plant connected" />
          </div>
        )}
      </div>
    </aside>
  );
}
