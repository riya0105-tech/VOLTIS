import { useState } from 'react';
import { Card, Button, Badge } from '../components/common';
import {
  Building2,
  Zap,
  Clock,
  Bell,
  Database,
  Save,
  RotateCcw,
  CheckCircle2,
  Sliders,
  Send,
  Download,
  AlertTriangle
} from 'lucide-react';

type SettingsTab = 'profile' | 'tariff' | 'shifts' | 'notifications' | 'integration';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaved, setIsSaved] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    facilityName: 'Shree Textiles Unit #1',
    location: 'Plot 42, GIDC Industrial Estate, Surat, Gujarat 394230',
    industry: 'Textiles & Technical Weaving',
    managerName: 'Demo Plant Manager',
    managerEmail: 'manager@voltis.demo',
    managerPhone: '+91 90000 00000',
    contractDemand: 450,
    sanctionedLoad: 380,
    baseTariff: 8.125,
    peakSurchargePercent: 20,
    offPeakRebatePercent: 15,
    ceaEmissionFactor: 0.82,
    powerFactorTarget: 0.98,
    shift1Start: '08:00',
    shift1End: '16:00',
    shift2Start: '16:00',
    shift2End: '00:00',
    shift3Start: '00:00',
    shift3End: '08:00',
    notifyWhatsapp: true,
    notifySms: true,
    notifyEmail: true,
    notifyIdleWaste: true,
    notifyShiftReport: true,
    sensitivity: 'standard', // 'conservative' | 'standard' | 'high'
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const handleReset = () => {
    setFormData({
      facilityName: 'Shree Textiles Unit #1',
      location: 'Plot 42, GIDC Industrial Estate, Surat, Gujarat 394230',
      industry: 'Textiles & Technical Weaving',
      managerName: 'Demo Plant Manager',
      managerEmail: 'manager@voltis.demo',
      managerPhone: '+91 90000 00000',
      contractDemand: 450,
      sanctionedLoad: 380,
      baseTariff: 8.125,
      peakSurchargePercent: 20,
      offPeakRebatePercent: 15,
      ceaEmissionFactor: 0.82,
      powerFactorTarget: 0.98,
      shift1Start: '08:00',
      shift1End: '16:00',
      shift2Start: '16:00',
      shift2End: '00:00',
      shift3Start: '00:00',
      shift3End: '08:00',
      notifyWhatsapp: true,
      notifySms: true,
      notifyEmail: true,
      notifyIdleWaste: true,
      notifyShiftReport: true,
      sensitivity: 'standard',
    });
  };

  const navTabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Factory Profile', icon: Building2 },
    { id: 'tariff', label: 'Tariff & Grid Demand', icon: Zap },
    { id: 'shifts', label: 'Shift Schedules', icon: Clock },
    { id: 'notifications', label: 'Alerts & Reports', icon: Bell },
    { id: 'integration', label: 'SCADA & MQTT Sync', icon: Database },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-industrial-900/80 border border-industrial-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100">Factory Settings & Configuration</h1>
            <Badge variant="emerald" className="text-xs">
              Live Facility: Surat #1
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure tariff rates, TOU schedules, operational shift timings, and alert dispatch rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              Settings saved
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-slate-300 border-industrial-700 hover:bg-industrial-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Grid: Settings Sidebar Tabs + Active Form Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Column */}
        <div className="md:col-span-1 space-y-2">
          <Card className="p-2 bg-industrial-900/60 border-industrial-800">
            <nav className="flex flex-col space-y-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-industrial-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Quick Info Box */}
          <Card className="p-4 bg-industrial-900/40 border-industrial-800/70 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Tariff Configuration</span>
            </div>
            <p className="leading-relaxed">
              Configured for the Surat/Gujarat demonstration environment.
            </p>
          </Card>
        </div>

        {/* Content Column */}
        <div className="md:col-span-3">
          {/* TAB 1: FACTORY PROFILE */}
          {activeTab === 'profile' && (
            <Card className="p-6 bg-industrial-900/60 border-industrial-800 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Facility Information
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  General identification and location details used across reports and carbon accounting.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Facility Name</label>
                  <input
                    type="text"
                    value={formData.facilityName}
                    onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Industry Sector</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Factory Address</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="border-t border-industrial-800/80 pt-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Plant Manager & Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Manager Name</label>
                    <input
                      type="text"
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Official Email</label>
                    <input
                      type="email"
                      value={formData.managerEmail}
                      onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Mobile (Alerts SMS/WhatsApp)</label>
                    <input
                      type="text"
                      value={formData.managerPhone}
                      onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 2: TARIFF & GRID DEMAND */}
          {activeTab === 'tariff' && (
            <Card className="p-6 bg-industrial-900/60 border-industrial-800 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Electricity Tariff & Contract Parameters
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set base industrial tariffs and time-of-day (TOD) surcharges to calculate energy costs accurately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-industrial-950/60 border border-industrial-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Tariff Rates</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Base Tariff Rate (₹ / kWh)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 text-sm">₹</span>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.baseTariff}
                        onChange={(e) => setFormData({ ...formData, baseTariff: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-industrial-950 border border-industrial-800 rounded-lg pl-8 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">DGVCL HTP-I High Tension Tariff</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Peak TOD Surcharge (%)</label>
                    <input
                      type="number"
                      value={formData.peakSurchargePercent}
                      onChange={(e) => setFormData({ ...formData, peakSurchargePercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Active between 08:00 – 18:00 (+₹1.625/kWh)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Off-Peak Night Rebate (%)</label>
                    <input
                      type="number"
                      value={formData.offPeakRebatePercent}
                      onChange={(e) => setFormData({ ...formData, offPeakRebatePercent: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Active between 22:00 – 06:00 (-₹1.218/kWh)</span>
                  </div>
                </div>

                <div className="bg-industrial-950/60 border border-industrial-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Demand & Emission Factors</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Contract Demand (kVA)</label>
                    <input
                      type="number"
                      value={formData.contractDemand}
                      onChange={(e) => setFormData({ ...formData, contractDemand: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Penalty triggers if demand exceeds 450 kVA</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Sanctioned Connected Load (kW)</label>
                    <input
                      type="number"
                      value={formData.sanctionedLoad}
                      onChange={(e) => setFormData({ ...formData, sanctionedLoad: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">Maximum sanctioned power draw</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Grid Carbon Emission Factor (kg CO₂ / kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.ceaEmissionFactor}
                      onChange={(e) => setFormData({ ...formData, ceaEmissionFactor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-industrial-950 border border-industrial-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">CEA India Baseline Database v19 standard</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 3: SHIFT SCHEDULES */}
          {activeTab === 'shifts' && (
            <Card className="p-6 bg-industrial-900/60 border-industrial-800 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Operational Shift Timings
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure plant shift rosters to segment energy analytics and align with shift-handover AI insights.
                </p>
              </div>

              <div className="space-y-4">
                {/* Shift 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                      S1
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">Shift 1 (Morning / General)</h4>
                      <p className="text-xs text-slate-400">Peak manufacturing output & weaving floor operation</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.shift1Start}
                      onChange={(e) => setFormData({ ...formData, shift1Start: e.target.value })}
                      className="bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={formData.shift1End}
                      onChange={(e) => setFormData({ ...formData, shift1End: e.target.value })}
                      className="bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Shift 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                      S2
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">Shift 2 (Evening)</h4>
                      <p className="text-xs text-slate-400">Dyeing house processing & continuous looms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.shift2Start}
                      onChange={(e) => setFormData({ ...formData, shift2Start: e.target.value })}
                      className="bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={formData.shift2End}
                      onChange={(e) => setFormData({ ...formData, shift2End: e.target.value })}
                      className="bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>

                {/* Shift 3 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      S3
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">Shift 3 (Night / Off-Peak)</h4>
                      <p className="text-xs text-slate-400">Time-of-Use optimized batch jobs & compressor maintenance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={formData.shift3Start}
                      onChange={(e) => setFormData({ ...formData, shift3Start: e.target.value })}
                      className="bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <span className="text-xs text-slate-400">to</span>
                    <input
                      type="time"
                      value={formData.shift3End}
                      onChange={(e) => setFormData({ ...formData, shift3End: e.target.value })}
                      className="bg-industrial-900 border border-industrial-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* TAB 4: ALERTS & NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <Card className="p-6 bg-industrial-900/60 border-industrial-800 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  Alert Rules & Dispatch Channels
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure automatic threshold notifications to prevent tariff penalties and power waste.
                </p>
              </div>

              {/* Alert Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">WhatsApp Alert for Critical Anomalies</h4>
                    <p className="text-xs text-slate-400">Immediate WhatsApp notification when machine draw exceeds +30% baseline</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifyWhatsapp}
                    onChange={(e) => setFormData({ ...formData, notifyWhatsapp: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">SMS to On-Duty Maintenance Engineer</h4>
                    <p className="text-xs text-slate-400">Direct mobile alert if Compressor or Transformer temperature crosses safety limit</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifySms}
                    onChange={(e) => setFormData({ ...formData, notifySms: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Idle Energy Waste Warnings</h4>
                    <p className="text-xs text-slate-400">Notify supervisor when HVAC or Exhaust draw power during inactive factory hours</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifyIdleWaste}
                    onChange={(e) => setFormData({ ...formData, notifyIdleWaste: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-industrial-950/60 border border-industrial-800">
                  <div>
                    <h4 className="text-sm font-medium text-slate-200">Daily Shift Handover PDF Report</h4>
                    <p className="text-xs text-slate-400">Automated summary sent to plant management email at end of each shift</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifyShiftReport}
                    onChange={(e) => setFormData({ ...formData, notifyShiftReport: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Anomaly Sensitivity */}
              <div className="border-t border-industrial-800 pt-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-400" />
                  AI Anomaly Detection Sensitivity
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Controls how strictly the autoencoder neural network flags deviations from expected power baselines.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {(['conservative', 'standard', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setFormData({ ...formData, sensitivity: level })}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.sensitivity === level
                          ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                          : 'border-industrial-800 bg-industrial-950 text-slate-400 hover:border-industrial-700'
                      }`}
                    >
                      <div className="text-xs font-semibold capitalize">{level}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {level === 'conservative' && 'Fewer alerts, flags only severe spikes (> 40%)'}
                        {level === 'standard' && 'Recommended. Flags anomalies > 25% deviation'}
                        {level === 'high' && 'Strict. Flags micro-variations > 15% deviation'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* TAB 5: INTEGRATION & SCADA */}
          {activeTab === 'integration' && (
            <Card className="p-6 bg-industrial-900/60 border-industrial-800 space-y-6">
              <div>
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  SCADA & IoT Telemetry Integration
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify connection status of physical IoT energy meters, Modbus gateways, and MQTT ingestion stream.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-industrial-950/60 border border-industrial-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-sm font-semibold text-slate-200">FastAPI Intelligence Engine</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">http://localhost:8000 | REST API v1.0.0 (ML Adapter & TimescaleDB)</p>
                  </div>
                  <Badge variant="emerald" className="text-xs">
                    Connected
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-industrial-950/60 border border-industrial-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-sm font-semibold text-slate-200">MQTT Live Telemetry Stream</h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">broker: 10.0.1.50:1883 | topic: voltis/factory_001/telemetry</p>
                  </div>
                  <Badge variant="emerald" className="text-xs">
                    Connected (10 Hz)
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-industrial-950/60 border border-industrial-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h4 className="text-sm font-semibold text-slate-200">RS-485 Modbus Energy Meters</h4>
                    </div>
                    <p className="text-xs text-slate-400">9 physical sub-meters connected across Weaving, Dyeing, and Utilities</p>
                  </div>
                  <Badge variant="emerald" className="text-xs">
                    9 / 9 Online
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-industrial-950/60 border border-industrial-800 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-sm font-semibold text-slate-200">ERP Production API Sync</h4>
                    </div>
                    <p className="text-xs text-slate-400">SAP / Tally ERP connector for automated EPI per-meter correlation</p>
                  </div>
                  <Badge variant="amber" className="text-xs">
                    Syncing Hourly
                  </Badge>
                </div>
              </div>

              {/* Data Export Box */}
              <div className="border-t border-industrial-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-200">Export Factory Energy History</h4>
                  <p className="text-xs text-slate-400">Download audited CSV dataset for energy auditor or GERC filing.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 border-industrial-700 text-slate-300 hover:bg-industrial-800"
                    onClick={() => alert('Exporting Surat Unit #1 Energy Logs (CSV)...')}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1.5 border-industrial-700 text-slate-300 hover:bg-industrial-800"
                    onClick={() => alert('Sending test notification to registered WhatsApp & Email...')}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Test Alert
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
