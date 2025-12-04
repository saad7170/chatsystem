import axios from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';

export const userService = {
  getUsers: async (search = '') => {
    const response = await axios.get(ENDPOINTS.GET_USERS, {
      params: { search },
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axios.get(ENDPOINTS.GET_USER(id));
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.put(ENDPOINTS.UPDATE_PROFILE, data);
    return response.data;
  },

  updateStatus: async (status) => {
    const response = await axios.put(ENDPOINTS.UPDATE_STATUS, { status });
    return response.data;
  },
};
