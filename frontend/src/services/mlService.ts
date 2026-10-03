import { apiClient, setUsingMockData } from './api';
import { MLPrediction } from '../types';
import { mockMLPredictions } from '../data/mockData';

export interface MLTelemetryInput {
  machine_id: string;
  timestamp?: string;
  power_kw: number;
  voltage?: number;
  current?: number;
  temperature?: number;
  vibration?: number;
  runtime_hours?: number;
  production_units?: number;
}

export async function fetchMLPredictions(): Promise<MLPrediction[]> {
  try {
    const response = await apiClient.get<MLPrediction[]>('/api/ml/predictions');
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for ML predictions, using fallback:', error);
    setUsingMockData(true);
    return mockMLPredictions;
  }
}

export async function fetchMLPrediction(machineId: string): Promise<MLPrediction> {
  try {
    const response = await apiClient.get<MLPrediction>(`/api/ml/prediction/${machineId}`);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn(`[VOLTIS API] Backend unreachable for ML prediction ${machineId}, using fallback:`, error);
    setUsingMockData(true);
    const found = mockMLPredictions.find((p) => p.machine_id === machineId);
    if (found) return found;
    return {
      machine_id: machineId,
      status: 'NORMAL',
      anomaly_score: 0.1,
      health_score: 95,
      risk: 'LOW',
    };
  }
}

export async function predictTelemetry(telemetry: MLTelemetryInput): Promise<MLPrediction> {
  try {
    const response = await apiClient.post<MLPrediction>('/api/ml/predict', telemetry);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for ML predict, using fallback:', error);
    setUsingMockData(true);
    const found = mockMLPredictions.find((p) => p.machine_id === telemetry.machine_id);
    if (found) return found;
    return {
      machine_id: telemetry.machine_id,
      status: telemetry.power_kw > 20 ? 'WARNING' : 'NORMAL',
      anomaly_score: telemetry.power_kw > 20 ? 0.45 : 0.08,
      health_score: telemetry.power_kw > 20 ? 82 : 95,
      risk: telemetry.power_kw > 20 ? 'MEDIUM' : 'LOW',
    };
  }
}
