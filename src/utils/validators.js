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
  return re.test(email) || 'Formato de correo electrónico inválido';
};

// Validación de contraseña (mínimo 8 caracteres, al menos 1 letra y 1 numero)
export const validatePassword = (password) => {
  if (!password) return true; // Deja que 'required: true' en el componente maneje esto

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (password.length < 8) return 'Debe tener al menos 8 caracteres';
  if (password.length > 90) return 'La contraseña es muy larga';
  if (!hasLetter || !hasNumber)
    return 'Debe incluir al menos una letra y un número';

  return true;
};

//Validacion de nombres/apellidos (letras, tildes, Ñ y espacios, 2 a 50 caracteres)
export const validateNames = (name) => {
  if (!name || name.trim().length === 0) return true;

  const trimmedName = name.trim();

  if (trimmedName.length < 2) return 'El nombre es demasiado corto';

  if (trimmedName.length > 50)
    return 'El nombre no puede exceder los 50 caracteres';

  const nameRegex = /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/;

  if (!nameRegex.test(trimmedName)) return 'Solo permiten letras';

  return true;
};

// Validación de coincidencia de contraseñas
export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword || 'Las contraseñas no coinciden';
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
  return (cleanPhone >= 8 && cleanPhone.length <= 15) || 'Teléfono inválido';
};

// Validación de longitud del teléfono celular venezolano
export const validatePhoneNumberVE = (phone) => {
  if (!phone || phone.trim().length === 0) return true;

  // Sanitización básica: quitar espacios o guiones si el usuario los puso
  const cleanPhone = phone.replace(/[\s-]/g, '');

  /**
   * Explicación del Regex:
   * ^0(2|4) -> Debe empezar por 02 o 04
   * (12|14|24|16|26|51|11) -> Prefijos comunes (puedes añadir más)
   * [0-9]{7}$ -> Seguido de exactamente 7 números
   */
  const phoneRegex = /^0(2|4)(12|14|24|16|26|51|11)[0-9]{7}$/;

  return phoneRegex.test(cleanPhone) || 'Formato de teléfono inválido';
};

// Valida fecha real en formato (DD/MM/YYYY o DD-MM-YYYY)
export const validateDate = (date) => {
  if (!date) return 'La fecha es requerida';

  let dateObj;
  if (typeof date === 'string') {
    const parts = date.split('/');
    const isoParts = date.split('-');

    if (parts.length === 3) {
      // Soporte para formato visual DD/MM/AAAA
      dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
    } else if (isoParts.length === 3) {
      // Soporte para formato DB YYYY-MM-DD
      dateObj = new Date(isoParts[0], isoParts[1] - 1, isoParts[2]);
    } else {
      dateObj = new Date(date);
    }
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) return 'Fecha inválida';

  const today = new Date();

  if (dateObj > today) {
    return 'La fecha no puede ser futura';
  }

  const ageLimit = 13;
  let age = today.getFullYear() - dateObj.getFullYear();
  const monthDiff = today.getMonth() - dateObj.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateObj.getDate())
  ) {
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
    return 'La cédula debe tener entre 6 y 9 números';
  }

  return true;
};

export const validateDocument = (fullDocument) => {
  if (!fullDocument || typeof fullDocument !== 'string') return true;

  const type = fullDocument.charAt(0);
  const numberPart = fullDocument.slice(1);

  const validTypes = ['V', 'E'];
  if (!validTypes.includes(type)) {
    return 'Tipo de documento inválido';
  }

  const cleanNumber = numberPart.replace(/\D/g, '');

  if (cleanNumber.length < 6 || cleanNumber.length > 9) {
    return 'La cédula debe tener entre 6 y 9 números';
  }

  return true;
};

// Validación de selección mínima de géneros
export const validateGenres = (genresArray) => {
  if (!genresArray || !Array.isArray(genresArray))
    return 'Selecciona al menos 3 géneros';
  return (
    genresArray.length >= 3 || 'Selecciona al menos 3 categorías para continuar'
  );
};
