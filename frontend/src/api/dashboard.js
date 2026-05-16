import { apiClient } from './client';

export const getEmployeeDashboard = async () => {
  const { response, data: result } = await apiClient('/dashboard/employee');
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  
  return result;
};
