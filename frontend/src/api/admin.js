import { apiClient } from './client';

export const getCycles = async () => {
  const { response, data } = await apiClient('/admin/cycles');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch cycles');
  return data;
};

export const createCycle = async (cycleData) => {
  const { response, data } = await apiClient('/admin/cycles', {
    method: 'POST',
    body: JSON.stringify(cycleData),
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to create cycle');
  return data;
};

export const updateCycle = async (cycleId, cycleData) => {
  const { response, data } = await apiClient(`/admin/cycles/${cycleId}`, {
    method: 'PUT',
    body: JSON.stringify(cycleData),
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to update cycle');
  return data;
};

export const activateCycle = async (cycleId) => {
  const { response, data } = await apiClient(`/admin/cycles/${cycleId}/activate`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to activate cycle');
  return data;
};

export const getUsers = async () => {
  const { response, data } = await apiClient('/admin/users');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch users');
  return data;
};

export const updateUserHierarchy = async (userId, payload) => {
  const { response, data } = await apiClient(`/admin/users/${userId}/hierarchy`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to update user hierarchy');
  return data;
};

export const getRoles = async () => {
  const { response, data } = await apiClient('/admin/roles');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch roles');
  return data;
};

export const unlockGoal = async (goalId) => {
  const { response, data } = await apiClient(`/admin/goals/${goalId}/unlock`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to unlock goal');
  return data;
};

export const lockGoal = async (goalId) => {
  const { response, data } = await apiClient(`/admin/goals/${goalId}/lock`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to lock goal');
  return data;
};

export const getAuditLogs = async () => {
  const { response, data } = await apiClient('/admin/audit-logs');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch audit logs');
  return data;
};

export const getCompletionDashboard = async () => {
  const { response, data } = await apiClient('/admin/completion-dashboard');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch completion rates');
  return data;
};

export const getAchievementReports = async () => {
  const { response, data } = await apiClient('/admin/achievement-reports');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch achievement reports');
  return data;
};

export const exportAchievementReports = async () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/achievement-reports/export`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to export CSV report');
  return response.blob();
};

export const getEscalations = async () => {
  const { response, data } = await apiClient('/admin/escalations');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch escalations');
  return data;
};

export const generateEscalations = async () => {
  const { response, data } = await apiClient('/admin/escalations/generate', {
    method: 'POST',
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to generate escalations');
  return data;
};

export const resolveEscalation = async (escalationId) => {
  const { response, data } = await apiClient(`/admin/escalations/${escalationId}/resolve`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error(data?.detail || 'Failed to resolve escalation');
  return data;
};

export const getAnalytics = async () => {
  const { response, data } = await apiClient('/admin/analytics');
  if (!response.ok) throw new Error(data?.detail || 'Failed to fetch analytics');
  return data;
};
