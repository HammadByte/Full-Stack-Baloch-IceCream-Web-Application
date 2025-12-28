import api from './api';

export const menuService = {
  getMenuItems: async (params = {}) => {
    const response = await api.get('/menu', { params });
    return response.data;
  },

  getMenuItem: async (id) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  createMenuItem: async (data) => {
    const response = await api.post('/menu', data);
    return response.data;
  },

  updateMenuItem: async (id, data) => {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  getByCategory: async (category) => {
    const response = await api.get(`/menu/category/${category}`);
    return response.data;
  },
};