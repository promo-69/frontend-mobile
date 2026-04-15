import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TOKEN: '@Cineflix:token',
  USER: '@Cineflix:user',
};

export const storageHelper = {
  async saveSession(token, user) {
    try {
      await AsyncStorage.multiSet([
        [KEYS.TOKEN, token],
        [KEYS.USER, JSON.stringify(user)],
      ]);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  },

  async getToken() {
    try {
      return await AsyncStorage.getItem(KEYS.TOKEN);
    } catch (error) {
      return null;
    }
  },

  async getUser() {
    try {
      const user = await AsyncStorage.getItem(KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },

  async clearSession() {
    try {
      await AsyncStorage.multiRemove([KEYS.TOKEN, KEYS.USER]);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
};
