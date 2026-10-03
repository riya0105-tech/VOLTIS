import { apiClient, setUsingMockData } from './api';
import { EnergyDataPoint } from '../types';
import { mockHourlyEnergy } from '../data/mockData';

export async function fetchTodayEnergy(machineId?: string): Promise<EnergyDataPoint[]> {
  try {
    const response = await apiClient.get<EnergyDataPoint[]>('/api/energy/today', {
      params: machineId ? { machine_id: machineId } : undefined,
    });
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for energy/today, using fallback:', error);
    setUsingMockData(true);
    return mockHourlyEnergy;
  }
}

export async function fetchHistoryEnergy(
  from?: string,
  to?: string,
  machineId?: string
): Promise<EnergyDataPoint[]> {
  try {
    const response = await apiClient.get<EnergyDataPoint[]>('/api/energy/history', {
      params: { from, to, machine_id: machineId },
    });
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for energy/history, using fallback:', error);
    setUsingMockData(true);
    return mockHourlyEnergy;
  }
}
