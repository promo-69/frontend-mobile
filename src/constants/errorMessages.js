export const AUTH_ERRORS = {
  INVALID_LOGIN: 'Correo o contraseña incorrectos. Por favor, inténtalo de nuevo.',
  UNVERIFIED_ACCOUNT: 'Tu cuenta aún no ha sido verificada.',
  NETWORK_ERROR: 'Problemas de conexión con el servidor.',
  DEFAULT: '¡Ups!, hubo un problema. Danos un momento para resolverlo.',
};

export const getErrorMessage = (code) => {
  return AUTH_ERRORS[code] || AUTH_ERRORS.DEFAULT;
};