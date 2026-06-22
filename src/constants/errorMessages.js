export const AUTH_ERRORS = {
  INVALID_LOGIN:
    'Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.',
  UNVERIFIED_ACCOUNT: 'Tu cuenta aún no ha sido verificada.',
  ACCOUNT_LOCKED:
    'Tu cuenta ha sido bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo en unos minutos.',
  NETWORK_ERROR: 'Problemas de conexión con el servidor.',
  DEFAULT: '¡Ups!, hubo un problema. Danos un momento para resolverlo.',
};

export const getErrorMessage = (code, fallbackMessage) => {
  return AUTH_ERRORS[code] || fallbackMessage || AUTH_ERRORS.DEFAULT;
};
