import { apiClient } from './client';

export const getPendingTeamGoals = async () => {
  const { response, data: result } = await apiClient('/manager/pending-goals');
  if (!response.ok) throw new Error('Failed to fetch pending goals');
  return result;
};

export const approveGoal = async (goalId, data) => {
  const { response, data: result } = await apiClient(`/manager/goals/${goalId}/approve`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to approve goal');
  return result;
};

export const rejectGoal = async (goalId) => {
  const { response, data: result } = await apiClient(`/manager/goals/${goalId}/reject`, {
    method: 'PUT'
  });
  if (!response.ok) throw new Error('Failed to reject goal');
  return result;
};

export const getManagerDashboard = async () => {
  const { response, data: result } = await apiClient('/manager/dashboard');
  if (!response.ok) throw new Error('Failed to fetch manager dashboard');
  return result;
};

export const getTeamData = async (year) => {
  const query = year ? `?year=${year}` : '';
  const { response, data: result } = await apiClient(`/manager/team${query}`);
  if (!response.ok) throw new Error('Failed to fetch team data');
  return result;
};

export const submitManagerCheckin = async (goalId, quarter, comment) => {
  const { response, data: result } = await apiClient(`/manager/goals/${goalId}/checkins`, {
    method: 'POST',
    body: JSON.stringify({ quarter, comment })
  });
  if (!response.ok) throw new Error('Failed to submit check-in');
  return result;
};
