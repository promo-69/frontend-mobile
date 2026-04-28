export const normalizeLoginError = (error) => {
  const status = error?.response?.status;

  if (status === 401 || status === 422) {
    return 'Las credenciales no son correctas';
  }

  if (!error?.response || status >= 500) {
    return 'Problemas de conexión con el servidor';
  }

  return 'Problemas de conexión con el servidor';
};
