import { useState, useEffect } from 'react';
import {
  Bell,
  Menu,
  ChevronDown,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { isUsingMockData, subscribeMockStatus } from '../../services';

const factories = [
  {
    id: 'factory_001',
    name: 'Shree Textiles Pvt. Ltd.',
    location: 'Surat, Gujarat',
    type: 'Spinning & Weaving Plant',
  },
  {
    id: 'factory_002',
    name: 'Apex Precision Forgings',
    location: 'Ahmedabad, Gujarat',
    type: 'Heavy Engineering',
  },
];

export function Header() {
  const {
    activeTab,
    selectedFactoryId,
    setSelectedFactoryId,
    toggleSidebar,
  } = useNavigation();

  const [timeString, setTimeString] = useState('');
  const [isFactoryMenuOpen, setIsFactoryMenuOpen] = useState(false);
  const [isAlertMenuOpen, setIsAlertMenuOpen] = useState(false);
  const [isFallback, setIsFallback] = useState(isUsingMockData);

  useEffect(() => {
    return subscribeMockStatus(setIsFallback);
  }, []);

  // Live IST Clock (clean, minimal)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      setTimeString(`${formatted} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentFactory =
    factories.find((f) => f.id === selectedFactoryId) || factories[0];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Energy Overview';
      case 'factory-view':
        return 'Factory Floor & Machinery';
      case 'energy-analytics':
        return 'Energy Analytics';
      case 'ai-insights':
        return 'Insights & Alerts';
      case 'optimization':
        return 'Schedule Optimization';
      case 'maintenance':
        return 'Equipment Health';
      case 'carbon-report':
        return 'Carbon & Emissions';
      case 'settings':
        return 'Settings';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0e1424]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {currentFactory.name}
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs text-slate-300 font-medium truncate">
              {getPageTitle()}
            </span>
          </div>
          <h1 className="text-base font-semibold text-white tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right controls: Factory Switcher, Status Pill, Alert Bell, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Factory Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsFactoryMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-colors"
          >
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">
              Surat Plant
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {isFactoryMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-1.5 z-50"
              onMouseLeave={() => setIsFactoryMenuOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Facility
              </div>
              {factories.map((factory) => (
                <button
                  key={factory.id}
                  onClick={() => {
                    setSelectedFactoryId(factory.id);
                    setIsFactoryMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors ${
                    factory.id === selectedFactoryId
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-medium">{factory.name}</div>
                  <div className="text-[11px] text-slate-400">{factory.location}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Simple Health Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span>Attention needed (2 issues)</span>
        </div>

        {isFallback && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
            Demo / Offline data
          </span>
        )}

        {/* Live Clock */}
        <div className="hidden lg:flex items-center text-xs font-medium text-slate-400 px-2">
          {timeString}
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertMenuOpen((prev) => !prev)}
            aria-label="Alerts"
            className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {isAlertMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-xl shadow-xl p-3 z-50"
              onMouseLeave={() => setIsAlertMenuOpen(false)}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Active Issues</span>
                <span className="text-[11px] text-amber-400 font-medium">2 pending</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-800/60 border border-red-500/30">
                  <div className="font-medium text-red-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    Compressor #02: +35% Power
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Potential impact: ₹1,140/day</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/60 border border-amber-500/30">
                  <div className="font-medium text-amber-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    HVAC: High Idle Operation
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Avoidable waste: 42 kWh/day</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-xs font-semibold">
            RP
          </div>
          <div className="hidden xl:block text-left text-xs">
            <div className="font-medium text-slate-200">Rajesh Patel</div>
            <div className="text-[11px] text-slate-400">Plant Manager</div>
          </div>
        </div>
      </div>
    </header>
  );
}
