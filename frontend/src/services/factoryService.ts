import { apiClient, setUsingMockData } from './api';
import { FactoryOverview } from '../types';
import { mockFactoryOverview } from '../data/mockData';

export async function fetchFactoryOverview(factoryId: string = 'factory_001'): Promise<FactoryOverview> {
  try {
    const id = factoryId || 'factory_001';
    const response = await apiClient.get<FactoryOverview>(`/api/factory/overview?factory_id=${encodeURIComponent(id)}`);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for factory overview, using verified mock contract:', error);
    setUsingMockData(true);
    return mockFactoryOverview;
  }
}

export async function checkSystemHealth(): Promise<{ status: string; database: string; version?: string }> {
  try {
    const response = await apiClient.get<{ status: string; database: string; version?: string }>('/health');
    return response.data;
  } catch {
    return {
      status: 'offline',
      database: 'disconnected',
      version: '1.0.0',
    };
  }
}

