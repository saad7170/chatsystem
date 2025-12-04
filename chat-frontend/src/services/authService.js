import axios from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';

export const authService = {
  register: async (data) => {
    const response = await axios.post(ENDPOINTS.REGISTER, data);
    return response.data;
  },

  login: async (data) => {
    const response = await axios.post(ENDPOINTS.LOGIN, data);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(ENDPOINTS.LOGOUT);
    return response.data;
  },

  getMe: async () => {
    const response = await axios.get(ENDPOINTS.GET_ME);
    return response.data;
  },
};
