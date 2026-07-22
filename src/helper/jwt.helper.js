import { jwtDecode } from 'jwt-decode';

export const jwtHelper = {
  /**
   * Decodifica un token de forma segura
   */
  decode(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  },

  /**
   * Verifica si un token ha expirado
   * @param {string} token
   * @param {number} bufferSeconds - Margen de tiempo para considerar expirado antes (ej. 10s)
   */
  isExpired(token, bufferSeconds = 0) {
    const decoded = this.decode(token);
    if (!decoded || !decoded.exp) return true;

    const currentTime = Date.now() / 1000;
    // Si el tiempo de expiración menos el buffer es menor al tiempo actual, expiró
    return decoded.exp - bufferSeconds < currentTime;
  },
};
