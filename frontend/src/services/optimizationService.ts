import { apiClient, setUsingMockData } from './api';
import {
  OptimizationScenario,
  OptimizationSimulateRequest,
  OptimizationApproveRequest,
  OptimizationApproveResponse,
} from '../types';
import { mockOptimizationScenario } from '../data/mockData';

export async function simulateOptimization(
  req: OptimizationSimulateRequest
): Promise<OptimizationScenario> {
  try {
    const response = await apiClient.post<OptimizationScenario>('/api/optimization/simulate', req);
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for optimization/simulate, using fallback:', error);
    setUsingMockData(true);
    return {
      ...mockOptimizationScenario,
      scenario_name: req.scenario_name || mockOptimizationScenario.scenario_name,
    };
  }
}

export async function approveOptimization(
  req: OptimizationApproveRequest
): Promise<OptimizationApproveResponse> {
  try {
    const response = await apiClient.post<OptimizationApproveResponse>(
      '/api/optimization/approve',
      req
    );
    setUsingMockData(false);
    return response.data;
  } catch (error) {
    console.warn('[VOLTIS API] Backend unreachable for optimization/approve, using fallback:', error);
    setUsingMockData(true);
    return {
      status: 'APPROVED',
      message: 'Optimization approved — simulated control instructions generated.',
    };
  }
}
