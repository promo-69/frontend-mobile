export const QR_ALLOWED_ROLES = [
  'USHER',
  'CASHIER',
  'CINEMA_MANAGER',
  'GENERAL_MANAGER',
  'SUPER_ADMIN',
];

// Un empleado es cualquier usuario con roleCode presente.
export const isEmployee = (user) => Boolean(user?.roleCode);

export const canAccessScanner = (user) =>
  Boolean(user?.roleCode) && QR_ALLOWED_ROLES.includes(user.roleCode);
