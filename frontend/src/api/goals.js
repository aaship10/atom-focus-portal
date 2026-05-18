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

// --- Task Management ---
export const createTask = async (goalId, data) => {
  const { response, data: result } = await apiClient(`/goals/${goalId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create task');
  return result;
};

export const updateTask = async (goalId, taskId, data) => {
  const { response, data: result } = await apiClient(`/goals/${goalId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update task');
  return result;
};

export const deleteTask = async (goalId, taskId) => {
  const { response, data: result } = await apiClient(`/goals/${goalId}/tasks/${taskId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete task');
  return result;
};

// --- Personal Notes and Weight ---
export const updatePersonalNotesWeight = async (goalId, data) => {
  const { response, data: result } = await apiClient(`/goals/${goalId}/personal-notes-weight`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = new Error('Failed to update weightage or personal notes');
    error.response = { data: result };
    throw error;
  }
  return result;
};

// --- Shared KPIs ---
export const createSharedKPI = async (data) => {
  const { response, data: result } = await apiClient('/shared-kpis/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to create shared KPI');
  return result;
};

export const fetchSharedKPIs = async (department) => {
  const endpoint = department ? `/shared-kpis/?department=${department}` : '/shared-kpis/';
  const { response, data: result } = await apiClient(endpoint);
  if (!response.ok) throw new Error('Failed to fetch shared KPIs');
  return result;
};

export const updateSharedKPIProgress = async (kpiId, progress) => {
  const { response, data: result } = await apiClient(`/shared-kpis/${kpiId}/achievement?achievement=${progress}`, {
    method: 'PUT'
  });
  if (!response.ok) throw new Error('Failed to update shared KPI progress');
  return result;
};

export const fetchLinkedEmployeeGoals = async (kpiId) => {
  const { response, data: result } = await apiClient(`/shared-kpis/${kpiId}/goals`);
  if (!response.ok) throw new Error('Failed to fetch linked employee goals');
  return result;
};
