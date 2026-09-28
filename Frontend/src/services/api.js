import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gp_token');
      localStorage.removeItem('gp_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  refresh: () => api.post('/api/auth/refresh'),
};

export const plantsAPI = {
  getAll: (params) => api.get('/api/plants', { params }),
  getById: (id) => api.get(`/api/plants/${id}`),
  create: (data) => api.post('/api/plants', data),
  update: (id, data) => api.put(`/api/plants/${id}`, data),
  markSold: (id) => api.patch(`/api/plants/${id}/sold`),
  delete: (id) => api.delete(`/api/plants/${id}`),
  getMine: () => api.get('/api/plants/my'),
};

export const chatAPI = {
  getOrCreateRoom: (plantId) => api.post(`/api/chat/room?plantId=${plantId}`),
  getMyRooms: () => api.get('/api/chat/rooms'),
  getRoomMessages: (roomId) => api.get(`/api/chat/rooms/${roomId}/messages`),
};

export const adminAPI = {
  getMetrics: () => api.get('/api/admin/metrics'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  blockUser: (userId) => api.patch(`/api/admin/users/${userId}/block`),
  unblockUser: (userId) => api.patch(`/api/admin/users/${userId}/unblock`),
  removeListing: (plantId) => api.patch(`/api/admin/plants/${plantId}/remove`),
};

export const uploadImage = async (file) => {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  const res = await axios.post(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    formData
  );
  return res.data.secure_url;
};

export default api;
