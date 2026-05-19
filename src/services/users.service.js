import api from './api';

export const usersService = {
    /**
     * Peticion de obtener datos del usuarios logueado
     */
    getProfile: async () => {
        const response = await api.get ('/users/me');
        return response.data;
    },

    /**
     * Petición de actualizar datos del usuario logueado
     */
    updateProfile: async (data) => {
        const response = await api.patch('/users/me/profile', data);
        return response.data;
    },

    /** 
     * Petición de actualizar contraseña del usuario logueado
    */

    changePassword: async (data) => {
        const response = await api.patch('/users/me/security', data);
        return response.data;
    }
}