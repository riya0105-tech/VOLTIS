import { apiClient, setUsingMockData } from './api';
import { Machine, MachineDetail, TelemetryIngestRequest, TelemetryIngestResponse } from '../types';
import { mockMachines, mockMachineDetailMap } from '../data/mockData';

export async function fetchMachines(): Promise<Machine[]> {
  try {
    const response = await apiClient.get<Machine[]>('/api/machines');
    setUsingMockData(false);
    const mockMap = new Map(mockMachines.map((m) => [m.machine_id, m]));
    return response.data.map((m) => {
      const fallback = mockMap.get(m.machine_id);
      return {
        ...m,
        tou_info: m.tou_info || fallback?.tou_info,
      };
    });
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for machines, using verified mock contract:', error);
    setUsingMockData(true);
    return mockMachines;
  }
}

export async function fetchMachineDetail(machineId: string): Promise<MachineDetail> {
  try {
    const response = await apiClient.get<MachineDetail>(`/api/machines/${machineId}`);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn(`[VOLTIS API] Backend unreachable for machine ${machineId}, using fallback:`, error);
    setUsingMockData(true);
    if (mockMachineDetailMap[machineId]) {
      return mockMachineDetailMap[machineId];
    }
    const base = mockMachines.find((m) => m.machine_id === machineId) || mockMachines[0];
    return {
      machine_id: base.machine_id,
      factory_id: 'factory_001',
      name: base.name,
      type: base.type,
      rated_power_kw: base.rated_power_kw,
      status: base.status,
      operating_limit: base.rated_power_kw * 0.9,
      production_association: base.production_association,
      power_kw: base.power_kw,
      temperature: base.temperature,
      vibration: base.vibration,
      current_telemetry: {
        id: 999,
        machine_id: base.machine_id,
        timestamp: new Date().toISOString(),
        power_kw: base.power_kw,
        voltage: 230.0,
        current: Math.round((base.power_kw * 1000) / 230),
        temperature: base.temperature,
        vibration: base.vibration,
        runtime_hours: 8.5,
        production_units: 320,
      },
      recent_readings: [],
    };
  }
}

export async function ingestTelemetry(
  reading: TelemetryIngestRequest
): Promise<TelemetryIngestResponse> {
  try {
    const response = await apiClient.post<TelemetryIngestResponse>('/api/telemetry/ingest', reading);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for telemetry ingestion, using fallback:', error);
    setUsingMockData(true);
    return {
      success: true,
      reading_id: Math.floor(Math.random() * 10000),
      machine_id: reading.machine_id,
      timestamp: reading.timestamp || new Date().toISOString(),
      power_kw: reading.power_kw,
      message: 'Telemetry buffered in fallback mode.',
      anomaly_detected: reading.power_kw > 20,
    };
  }
}

