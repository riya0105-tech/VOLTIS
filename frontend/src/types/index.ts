/**
 * VOLTIS Frontend Type Definitions
 * Generated strictly in compliance with backend OpenAPI / Pydantic schemas.
 */

// Factory
export interface Factory {
  id: string;
  name: string;
  industry: string;
  location: string;
  production_capacity?: number;
  electricity_tariff?: number;
  production_target?: number;
  operating_hours?: number;
}

export interface FactoryKPIs {
  energy_today_kwh: number;
  cost_today: number;
  energy_intensity: number;
  co2_tonnes: number;
  production_units: number;
}

export interface FactoryOverview {
  factory: Factory;
  kpis: FactoryKPIs;
}

// Machines & Telemetry
export type MachineStatus = 'NORMAL' | 'WARNING' | 'ANOMALY' | 'OFFLINE';

export type MachineImportance = 'CRITICAL' | 'IMPORTANT' | 'NON_IMPORTANT';

export interface MachineTOUInfo {
  importance: MachineImportance;
  required_hours_day: number;
  current_hours_day: number;
  preferred_tou_window: string;
  shiftable: boolean;
  shift_restriction_notes?: string;
  daily_energy_kwh: number;
  daily_cost_inr: number;
}

export interface Machine {
  machine_id: string;
  name: string;
  type: string;
  status: MachineStatus;
  power_kw: number;
  temperature: number;
  vibration: number;
  rated_power_kw: number;
  production_association: string;
  tou_info?: MachineTOUInfo;
}

export interface SensorReading {
  id: number;
  machine_id: string;
  timestamp: string;
  power_kw: number;
  voltage: number;
  current: number;
  temperature: number;
  vibration: number;
  runtime_hours: number;
  production_units: number;
}

export interface MachineDetail {
  machine_id: string;
  factory_id: string;
  name: string;
  type: string;
  rated_power_kw: number;
  status: MachineStatus;
  operating_limit: number;
  production_association: string;
  power_kw: number;
  temperature: number;
  vibration: number;
  current_telemetry: SensorReading;
  recent_readings: SensorReading[];
}

// Energy Analytics
export interface EnergyDataPoint {
  timestamp: string;
  actual_kwh: number;
  expected_kwh: number;
  cost: number;
  energy_intensity: number;
}

// Alerts
export type AlertSeverity = 'NORMAL' | 'WARNING' | 'ANOMALY' | 'HIGH';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface Alert {
  id: string;
  machine_id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  estimated_waste_kwh: number;
  estimated_cost: number;
  status: AlertStatus;
  machine_name?: string;
  created_at?: string;
}

// Predictive Maintenance
export type MaintenanceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MaintenanceRecord {
  id: number;
  machine_id: string;
  maintenance_date: string;
  issue: string;
  severity: MaintenanceSeverity;
  notes?: string;
  machine_name?: string;
  machine_type?: string;
  health_score?: number;
  risk_level?: RiskLevel;
}

// Recommendations
export interface Recommendation {
  id: string;
  machine_id: string;
  alert_id?: string;
  problem: string;
  likely_cause: string;
  recommended_actions: string[];
  potential_saving: number;
  machine_name: string;
}

// Optimization
export interface OptimizationScenarioMetrics {
  energy_kwh: number;
  cost: number;
  co2_tonnes: number;
  production_units: number;
}

export interface OptimizationScenario {
  scenario_name: string;
  scenario_id?: string;
  current: OptimizationScenarioMetrics;
  optimized: OptimizationScenarioMetrics;
  energy_reduction_percent: number;
  co2_reduction_percent: number;
  cost_saving?: number;
  production_change_percent?: number;
}

export interface OptimizationSimulateRequest {
  scenario_name: string;
  batch_id: string;
  new_start_time: string;
}

export interface OptimizationApproveRequest {
  scenario_id: string;
}

export interface OptimizationApproveResponse {
  status: string;
  message: string;
}

// AI Energy Copilot
export interface CopilotContributor {
  machine: string;
  contribution_percent: number;
}

export interface CopilotResponse {
  answer: string;
  contributors: CopilotContributor[];
  recommendations: string[];
}

export interface CopilotRequest {
  message: string;
}

// Machine Learning Predictions
export interface MLPrediction {
  machine_id: string;
  status: MachineStatus;
  anomaly_score: number;
  health_score: number;
  risk: RiskLevel;
  possible_issue?: string | null;
  expected_energy?: number;
  energy_deviation_percent?: number;
  estimated_waste_kwh?: number;
  estimated_cost?: number;
  recommended_actions?: string[];
}

// Telemetry Ingestion
export interface TelemetryIngestRequest {
  machine_id: string;
  timestamp: string;
  power_kw: number;
  voltage: number;
  current: number;
  temperature: number;
  vibration: number;
  runtime_hours: number;
  production_units: number;
}

export interface TelemetryIngestResponse {
  success: boolean;
  reading_id: number;
  machine_id: string;
  timestamp: string;
  power_kw: number;
  message: string;
  anomaly_detected: boolean;
}

// Health Status
export interface SystemHealth {
  status: string;
  database: string;
  version?: string;
}
