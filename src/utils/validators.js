//Capitaliza nombres
export const capitalizeNames = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

//Filtro para limpiar entradas antes de validar o guardar
export const sanitizeInput = (input, type = 'text') => {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim();

  switch (type) {
    case 'name':
      // Quita números/símbolos y capitaliza
      const onlyLetters = clean.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
      return capitalizeNames(onlyLetters);

    case 'email':
      // Minúsculas y quita espacios internos
      return clean.toLowerCase().replace(/\s/g, '');

    case 'phoneNumber':
      // Deja solo números y el signo +
      return clean.replace(/[^0-9+]/g, '');

    default:
      // Normaliza espacios
      return clean.replace(/\s+/g, ' ');
  }
};

// Validación de correo electrónico
export const validateEmail = (email) => {
  if (!email) return "El correo es requerido";
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}$/;
  return re.test(email) || "Correo electrónico inválido";
};

// Validación de contraseña (mínimo 8 caracteres, al menos 1 letra y 1 numero)
export const validatePassword = (password) => {
  if (!password) return "La contraseña es requerida";
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const IsLongEnough = password.length >= 8;

  if(!IsLongEnough) return "Debe tener al menos 8 caracteres";
  if (!hasLetter || !hasNumber) return "Debe incluir al menos una letra y un número";
  return true;
};

//Validacion de nombres/apellidos (letras, tildes, Ñ y espacios, 2 a 50 caracteres)
export const validateNames = (name) => {
  if (!name) return "El nombre es requerido";
  const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ\s]{1,49}$/;
  return nameRegex.test(name.trim()) || "Usa solo letras (2-50 caracteres)";
};

// Validación de coincidencia de contraseñas
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Validación de campos vacíos
export const validateRequiredFields = (fields) => {
  return fields.every((field) => {
    return field !== null && field != undefined && String(field).trim() !== '';
  });
};

// Validación de longitud del teléfono celular general
export const validatePhoneNumberLength = (phoneNumber) => {
  if (!phoneNumber) return false;
  // Limpiamos espacios o guiones si el usuario los puso
  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
  return (cleanPhone >=8 && cleanPhone.length <= 15) || "Teléfono inválido";
};

// Validación de longitud del teléfono celular venezolano
export const validatePhoneNumberVE = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Limpiamos espacios o guiones si el usuario los puso
  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');

  // Explicación de la Regex:
  // ^(\+58|0) -> Debe empezar con +58 o con 0
  // (412|414|424|416|426|2[0-9]{2}) -> Códigos móviles o fijos (02XX)
  // [0-9]{7}$ -> Seguido de exactamente 7 números
  const phoneRegex = /^(\+58|0)(412|414|424|416|426|2[0-9]{2})[0-9]{7}$/;

  return phoneRegex.test(cleanPhone) || "Formato de teléfono inválido";
};

// Valida fecha real en formato (DD/MM/YYYY o DD-MM-YYYY)
export const validateDate = (date) => {
  if (!date) return "La fecha es requerida";

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const today = new Date();
  
  if (dateObj > today) {
    return "La fecha no puede ser futura";
  }

  const ageLimit = 13;
  let age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateObj.getDate())) {
    age--;
  }

  if (age < ageLimit) {
    return `Debes ser mayor de ${ageLimit} años para registrarte`;
  }

  return true; 
};
