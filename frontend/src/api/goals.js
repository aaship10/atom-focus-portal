import { apiClient } from './client';

export const createGoal = async (data) => {
  const { response, data: result } = await apiClient('/goals/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = new Error('Failed to create goal');
    error.response = { data: result };
    throw error;
  }
  
  return result;
};

export const fetchEmployeeGoals = async (userId) => {
  // The backend GET /api/goals handles owner_id filtering.
  const endpoint = userId ? `/goals/?owner_id=${userId}` : '/goals/';
  const { response, data: result } = await apiClient(endpoint);
  
  if (!response.ok) {
    throw new Error('Failed to fetch goals');
  }
  
  return result;
};

export const logAchievement = async (goalId, data, bypass = false) => {
  const { response, data: result } = await apiClient(`/goals/${goalId}/achievements`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: bypass ? { 'X-Bypass-Restrictions': 'true' } : {}
  });
  
  if (!response.ok) {
    const error = new Error('Failed to log achievement');
    error.response = { data: result };
    throw error;
  }
  
  return result;
};

export const submitGoal = async (goalId) => {
  const { response, data: result } = await apiClient(`/goals/${goalId}/submit`, {
    method: 'PUT'
  });
  if (!response.ok) throw new Error('Failed to submit goal');
  return result;
};
