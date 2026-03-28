
//Capitaliza nombres
export const capitalizeNames = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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

    case 'phone':
      // Deja solo números y el signo +
      return clean.replace(/[^0-9+]/g, '');

    default:
      // Normaliza espacios
      return clean.replace(/\s+/g, ' '); 
  }
};

// Validación de correo electrónico
export const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,12}$/;
  return re.test(email);
};


// Validación de contraseña (mínimo 8 caracteres, al menos 1 letra y 1 numero)
export const validatePassword = (password) => {
  if(!password) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= 8 && hasLetter && hasNumber;
};

//Validacion de nombres/apellidos (letras, tildes, Ñ y espacios, 2 a 50 caracteres)
export const validateNames = (name) => {
  if (!name) return false;
  const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ][a-zA-ZÁÉÍÓÚáéíóúÑñ\s]{1,49}$/;
  return nameRegex.test(name.trim());
};

// Validación de coincidencia de contraseñas
export const validatePasswordMatch = ( password, confirmPassword,) => {
  return password === confirmPassword;
};

// Validación de campos vacíos
export const validateRequiredFields = (fields) => {
  return fields.every((field) => {
    return field !== null && field!= undefined && String(field).trim() !== '';
  });
};

// Validación de longitud del teléfono celular general
export const validatePhoneNumberLength = (phoneNumber) => {
  if(!phoneNumber) return false;
  
  // Limpiamos espacios o guiones si el usuario los puso
  const cleanPhone = phone.replace(/[\s-]/g, '');

  if(phoneNumber.length >= 8 && phoneNumber.length <= 15) return  phoneNumber.test(cleanPhone);
};

// Validación de longitud del teléfono celular venezolano
export const validatePhoneNumberVE = (phone) => {
  if (!phone) return false;

  // Limpiamos espacios o guiones si el usuario los puso
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Explicación de la Regex:
  // ^(\+58|0) -> Debe empezar con +58 o con 0
  // (412|414|424|416|426|2[0-9]{2}) -> Códigos móviles o fijos (02XX)
  // [0-9]{7}$ -> Seguido de exactamente 7 números
  const phoneRegex = /^(\+58|0)(412|414|424|416|426|2[0-9]{2})[0-9]{7}$/;

  return phoneRegex.test(cleanPhone);
};

// Valida fecha real en formato (DD/MM/YYYY o DD-MM-YYYY)
export const validateDate = (dateString) => {
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/]\d{4}$/;
  if (!dateRegex.test(dateString)) return false;

  const [day, month, year] = dateString.split(/[-/]/).map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};