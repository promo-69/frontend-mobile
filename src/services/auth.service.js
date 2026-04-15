import api from './api';

export const authService = {
  async loginRequest(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data; // { token, user }
  },

  async registerRequest(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logoutRequest() {
    return await api.post('/auth/logout');
  },
};
