import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { mockMachines, mockMaintenanceRecords } from '../data/mockData';
import { MachineTelemetryModal } from '../components/digital-twin/MachineTelemetryModal';
import { Machine, MaintenanceRecord, MLPrediction } from '../types';
import { fetchMaintenanceRecords, fetchMaintenanceRecord, fetchMachines, fetchMLPredictions } from '../services';

export function MaintenancePage() {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [machines, setMachines] = useState<Machine[]>(mockMachines);
  const [records, setRecords] = useState<MaintenanceRecord[]>(mockMaintenanceRecords);
  const [mlPredictions, setMlPredictions] = useState<MLPrediction[]>([]);
  const [, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMaintenanceRecords(), fetchMachines(), fetchMLPredictions()])
      .then(([recData, machData, mlData]) => {
        if (recData && recData.length > 0) setRecords(recData);
        if (machData && machData.length > 0) setMachines(machData);
        if (mlData && mlData.length > 0) setMlPredictions(mlData);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectRecord = async (id: number) => {
    try {
      const rec = await fetchMaintenanceRecord(id);
      setSelectedRecord(rec);
    } catch (err) {
      console.warn('Failed to load maintenance record detail:', err);
    }
  };

  const getHealthLevel = (score: number) => {
    if (score < 85) return { label: 'High Risk', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
    if (score < 92) return { label: 'Needs Attention', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  };

  const assetList = [
    {
      machine_id: 'compressor_02',
      name: 'Air Compressor #02',
      section: 'Weaving Line 2 Substation',
      healthScore: 82,
      lastService: '12 Aug 2026',
      nextService: 'Emergency (Today)',
      possibleIssue: 'Bearing degradation & elevated discharge heat',
      recommendedAction: 'Emergency shaft bearing lubrication & pneumatic line leak audit',
      urgent: true,
    },
    {
      machine_id: 'hvac_01',
      name: 'Factory Central HVAC & Chiller',
      section: 'Main Facility',
      healthScore: 88,
      lastService: '20 Sep 2026',
      nextService: '15 Oct 2026',
      possibleIssue: 'Pre-filters partially fouled; thermostat night override engaged',
      recommendedAction: 'Clean intake air filters; reset automated night temperature setback',
      urgent: false,
    },
    {
      machine_id: 'furnace_01',
      name: 'Electric Heat-Setting Furnace',
      section: 'Dyeing & Finishing',
      healthScore: 96,
      lastService: '01 Sep 2026',
      nextService: '01 Nov 2026',
      possibleIssue: 'Nominal operation; heating coils operating balanced',
      recommendedAction: 'Routine quarterly electrical insulation check',
      urgent: false,
    },
    {
      machine_id: 'transformer_01',
      name: 'Main Step-Down Transformer',
      section: 'Plant Substation',
      healthScore: 98,
      lastService: '15 Jul 2026',
      nextService: '15 Dec 2026',
      possibleIssue: 'Transformer oil dielectric strength within normal limits',
      recommendedAction: 'Bi-annual oil breakdown voltage testing',
      urgent: false,
    },
    {
      machine_id: 'compressor_01',
      name: 'Air Compressor #01',
      section: 'Weaving Line 1',
      healthScore: 95,
      lastService: '05 Sep 2026',
      nextService: '05 Dec 2026',
      possibleIssue: 'Nominal pneumatic compression cycle',
      recommendedAction: 'Routine oil and separator filter check',
      urgent: false,
    },
    {
      machine_id: 'motor_01',
      name: 'Spinning Loom Motor #01',
      section: 'Spinning Section',
      healthScore: 92,
      lastService: '28 Aug 2026',
      nextService: '28 Nov 2026',
      possibleIssue: 'Slight drive belt wear',
      recommendedAction: 'Check belt tension during upcoming shift change',
      urgent: false,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-amber-400" />
            <span>Equipment Health & Preventive Maintenance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Condition-based asset health scores, maintenance logs, and scheduled service recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-medium">
            1 High-Risk Asset (Compressor #02)
          </span>
        </div>
      </div>

      {/* Equipment Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetList.map((asset) => {
          const ml = mlPredictions.find((p) => p.machine_id === asset.machine_id);
          const currentScore = ml?.health_score ?? asset.healthScore;
          const currentIssue = ml?.possible_issue || asset.possibleIssue;
          const currentAction = (ml?.recommended_actions && ml.recommended_actions.length > 0)
            ? ml.recommended_actions[0]
            : asset.recommendedAction;
          const health = getHealthLevel(currentScore);
          const fullMachine = machines.find((m) => m.machine_id === asset.machine_id) || mockMachines.find((m) => m.machine_id === asset.machine_id);

          return (
            <div
              key={asset.machine_id}
              onClick={() => fullMachine && setSelectedMachine(fullMachine)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                asset.urgent || (ml?.risk === 'HIGH')
                  ? 'bg-red-950/20 border-red-500/50 hover:border-red-400'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">{asset.name}</h3>
                    <p className="text-[11px] text-slate-400">{asset.section}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${health.bg} ${health.color}`}>
                    {health.label}
                  </span>
                </div>

                {/* Health Score Meter */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Health Score</span>
                    <span className="font-semibold text-white">{currentScore} / 100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        currentScore < 85 ? 'bg-red-500' : currentScore < 92 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${currentScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Issue & Action */}
              <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-slate-400 text-[11px] block">Condition:</span>
                  <p className="text-slate-200 mt-0.5">{currentIssue}</p>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">Recommended Action:</span>
                  <p className="text-emerald-400 mt-0.5 font-medium">{currentAction}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Last: {asset.lastService}</span>
                  <span className={asset.urgent ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                    Next: {asset.nextService}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Click to inspect telemetry</span>
                <span className="text-cyan-400 font-medium flex items-center gap-0.5">
                  Inspect →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Maintenance History Log Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center justify-between">
          <span>Recent Maintenance Log</span>
          <span className="text-xs text-slate-400 font-normal">PostgreSQL Plant Log</span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Equipment</th>
                <th className="p-3 font-medium">Observed Issue</th>
                <th className="p-3 font-medium">Action Performed / Notes</th>
                <th className="p-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {records.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => handleSelectRecord(m.id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3 text-slate-400 whitespace-nowrap">
                    {new Date(m.maintenance_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 font-medium text-white">{m.machine_name}</td>
                  <td className="p-3">{m.issue}</td>
                  <td className="p-3 text-slate-400">{m.notes}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        m.severity === 'HIGH' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {m.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Machine Telemetry Modal */}
      {selectedMachine && (
        <MachineTelemetryModal
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      )}
    </div>
  );
}
