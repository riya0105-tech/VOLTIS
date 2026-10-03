import { apiClient, setUsingMockData } from './api';
import { Alert, Recommendation } from '../types';
import { mockAlerts, mockRecommendations } from '../data/mockData';

export async function fetchAlerts(params?: {
  severity?: string;
  status?: string;
  machine_id?: string;
}): Promise<Alert[]> {
  try {
    const response = await apiClient.get<Alert[]>('/api/alerts', { params });
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for alerts, using fallback:', error);
    setUsingMockData(true);
    return mockAlerts;
  }
}

export async function fetchRecommendations(params?: {
  machine_id?: string;
  alert_id?: string;
}): Promise<Recommendation[]> {
  try {
    const response = await apiClient.get<Recommendation[]>('/api/recommendations', { params });
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for recommendations, using fallback:', error);
    setUsingMockData(true);
    return mockRecommendations;
  }
}

export async function fetchRecommendation(recommendationId: string): Promise<Recommendation> {
  try {
    const response = await apiClient.get<Recommendation>(`/api/recommendations/${recommendationId}`);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn(`[VOLTIS API] Backend unreachable for recommendation ${recommendationId}, using fallback:`, error);
    setUsingMockData(true);
    const found = mockRecommendations.find((r) => r.id === recommendationId);
    if (found) return found;
    return mockRecommendations[0];
  }
}

