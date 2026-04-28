export const INVALID_CREDENTIALS_MESSAGE = 'Credenciales inválidas, intentelo de nuevo';
export const LOGIN_SERVER_ERROR_MESSAGE =
  'No pudimos iniciar sesión en este momento. Inténtelo nuevamente más tarde.';

export const normalizeLoginError = (error) => {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message?.toLowerCase?.() || '';

  if (
    [400, 401, 403, 404, 422].includes(status) ||
    backendMessage.includes('credencial') ||
    backendMessage.includes('password') ||
    backendMessage.includes('contraseña') ||
    backendMessage.includes('correo') ||
    backendMessage.includes('email') ||
    backendMessage.includes('usuario')
  ) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (!error?.response || status >= 500) {
    return LOGIN_SERVER_ERROR_MESSAGE;
  }

  return INVALID_CREDENTIALS_MESSAGE;
};
