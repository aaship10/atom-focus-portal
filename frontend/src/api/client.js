export const apiClient = async (endpoint, options = {}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  
  return { response, data };
};
