import api from './api';

export const loyaltyRewardsService = {

  getAvailable: async (cinemaId) => {
    const response = await api.get('/loyalty-rewards/available', {
      params: { cinema: cinemaId },
    });
    return response.data.data;
  },

  redeem: async (rewardId, cinemaId) => {
    const response = await api.post(`/loyalty-rewards/${rewardId}/redeem`, {
      cinema: cinemaId,
    });
    return response.data.data;
  },
};
