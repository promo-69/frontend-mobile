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
  if (!email || email.trim().length === 0) return true;
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}$/;
  return re.test(email) || "Correo electrónico inválido";
};

// Validación de contraseña (mínimo 8 caracteres, al menos 1 letra y 1 numero)
export const validatePassword = (password) => {
  if (!password) return true; // Deja que 'required: true' en el componente maneje esto
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (password.length < 8) return "Debe tener al menos 8 caracteres";
  if (!hasLetter || !hasNumber) return "Debe incluir al menos una letra y un número";
  
  return true;
};

//Validacion de nombres/apellidos (letras, tildes, Ñ y espacios, 2 a 50 caracteres)
export const validateNames = (name) => {
  if (!name || name.trim().length === 0) return true;
  const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ\s]{1,49}$/;
  return nameRegex.test(name.trim()) || "Solo letras (2-50 caracteres)";
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
  if (!phoneNumber || phoneNumber.trim().length === 0) return true;

  const cleanPhone = phoneNumber.replace(/[\s-]/g, '');
  const phoneRegex = /^(\+58|0)(412|414|424|416|426|2[0-9]{2})[0-9]{7}$/;

  return phoneRegex.test(cleanPhone) || "Formato de teléfono inválido (Ej: 04121234567)";
};

// Valida fecha real en formato (DD/MM/YYYY o DD-MM-YYYY)
export const validateDate = (date) => {
  if (!date) return "La fecha es requerida";

  let dateObj;
  if (typeof date === 'string') {
    // Intenta parsear formato DD/MM/AAAA común en inputs de fecha
    const parts = date.split('/');
    if (parts.length === 3) {
      dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }
  
  if (isNaN(dateObj.getTime())) return "Fecha inválida";

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

// Validación de Cédula de Identidad (Venezuela)
export const validateDocumentNumber = (number) => {
  if (!number || number.trim().length === 0) return true;

  // Limpiamos puntos o espacios por si acaso
  const cleanNumber = number.replace(/[\s.]/g, '');
  
  // Solo números, longitud entre 6 y 9 dígitos
  const dniRegex = /^[0-9]{6,9}$/;

  if (!dniRegex.test(cleanNumber)) {
    return "La cédula debe tener entre 6 y 9 números";
  }

  return true;
};

// Validación de selección mínima de géneros
export const validateGenres = (genresArray) => {
  if (!genresArray || !Array.isArray(genresArray)) return "Selecciona al menos 3 géneros";
  return genresArray.length >= 3 || "Selecciona al menos 3 categorías para continuar";
};