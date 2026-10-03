import { apiClient, setUsingMockData } from './api';
import { MaintenanceRecord } from '../types';
import { mockMaintenanceRecords } from '../data/mockData';

export async function fetchMaintenanceRecords(params?: {
  machine_id?: string;
  severity?: string;
}): Promise<MaintenanceRecord[]> {
  try {
    const response = await apiClient.get<MaintenanceRecord[]>('/api/maintenance', { params });
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for maintenance records, using fallback:', error);
    setUsingMockData(true);
    let records = [...mockMaintenanceRecords];
    if (params?.machine_id) {
      records = records.filter((r) => r.machine_id === params.machine_id);
    }
    if (params?.severity) {
      records = records.filter((r) => r.severity === params.severity);
    }
    return records;
  }
}

export async function fetchMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
  try {
    const response = await apiClient.get<MaintenanceRecord>(`/api/maintenance/${id}`);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn(`[VOLTIS API] Backend unreachable for maintenance record ${id}, using fallback:`, error);
    setUsingMockData(true);
    const found = mockMaintenanceRecords.find((r) => r.id === id);
    if (found) return found;
    return mockMaintenanceRecords[0];
  }
}
