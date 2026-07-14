export const QR_PERMISSION = 'VIEW:ACCESS:QR';

// Un empleado es cualquier usuario con roleCode presente.
export const isEmployee = (user) => Boolean(user?.roleCode);

// Puede abrir el escáner si su lista de permisos incluye VIEW:ACCESS:QR.
export const canAccessScanner = (user) =>
  Array.isArray(user?.permissions) && user.permissions.includes(QR_PERMISSION);
