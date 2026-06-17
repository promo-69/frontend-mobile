/**
 * Mock manual para storageHelper
 * Simula la persistencia local sin interactuar con AsyncStorage.
 */
export const storageHelper = {
  /**
   * Simula el guardado de tokens.
   */
  saveTokens: jest.fn(() => Promise.resolve()),

  /**
   * Simula el guardado de sesión completa.
   */
  saveSession: jest.fn(() => Promise.resolve()),

  /**
   * Simula la actualización de datos de usuario.
   */
  updateUserData: jest.fn(() => Promise.resolve()),

  /**
   * Simula la obtención del Access Token.
   */
  getAccessToken: jest.fn(() => Promise.resolve(null)),

  /**
   * Simula la obtención del Refresh Token.
   */
  getRefreshToken: jest.fn(() => Promise.resolve(null)),

  /**
   * Simula la obtención de datos de usuario (Nulo por defecto).
   */
  getUserData: jest.fn(() => Promise.resolve(null)),

  /**
   * Simula la limpieza de sesión.
   */
  clearSession: jest.fn(() => Promise.resolve()),

  /**
   * Simula el guardado genérico de valores.
   */
  saveValue: jest.fn(() => Promise.resolve()),

  /**
   * Simula la obtención genérica de valores (Nulo por defecto).
   */
  getValue: jest.fn(() => Promise.resolve(null)),
};
