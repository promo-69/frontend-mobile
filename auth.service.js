export const authService = {
  /**
   * Simulación de inicio de sesión exitoso por defecto
   */
  login: jest.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        user: {
          id: 'mock-uid-123',
          firstName: 'Usuario',
          lastName: 'Prueba',
          email: 'test@example.com',
        },
        tokens: {
          accessToken: 'mock-access-token-jwt',
          refreshToken: 'mock-refresh-token-jwt',
        },
      },
    })
  ),

  signUp: jest.fn(() =>
    Promise.resolve({
      success: true,
      message: 'Usuario registrado exitosamente',
    })
  ),

  verifyEmail: jest.fn(() =>
    Promise.resolve({
      success: true,
      message: 'Email verificado',
    })
  ),

  sendRecoveryEmailRequest: jest.fn(() =>
    Promise.resolve({
      success: true,
      message: 'Correo de recuperación enviado',
    })
  ),

  verifyRecoveryCodeRequest: jest.fn(() =>
    Promise.resolve({ success: true, resetToken: 'mock-reset-token-64-chars' })
  ),

  resetPasswordRequest: jest.fn(() =>
    Promise.resolve({ success: true, message: 'Contraseña actualizada' })
  ),

  refreshToken: jest.fn(() =>
    Promise.resolve({
      success: true,
      data: { tokens: { accessToken: 'new-mock-token' } },
    })
  ),

  logout: jest.fn(() =>
    Promise.resolve({ success: true, message: 'Sesión cerrada' })
  ),
};
