import * as v from '../validators';

/**
   * Pruebas de nombres y apellidos
   * 
   */

describe('Pruebas de nombres y apellidos (validateNames)', () => {
    test('CP-NOM-01: Debe pasar con un nombre válido y acentos', () => {
      expect(v.validateNames("María Sofía")).toBe(true);
    });

    test('CP-NOM-02: Debe fallar si contiene números y letras', () => {
      expect(v.validateNames("Javier69")).toBe("Solo permiten letras");
    });

    test('CP-NOM-03: Debe fallar si es demasiado corto', () => {
      expect(v.validateNames("A")).toBe("El nombre es demasiado corto");
    });

    test('CP-NOM-04: Debe fallar si excede 50 caracteres', () => {
      const longName = "a".repeat(51);
      expect(v.validateNames(longName)).toBe("El nombre no puede exceder los 50 caracteres");
    });
  });

/**
* Pruebas de email
* 
*/
describe('Validacion de Email (validateEmail)', () => {
    test('CP-EML-01: Debe pasar con un email estándar', () => {
      expect(v.validateEmail("alexis@example.com")).toBe(true);
    });

    test('CP-EML-02: Debe fallar sin el símbolo @', () => {
      expect(v.validateEmail("usuario.example.com")).toBe("Formato de correo electrónico inválido");
    });

    test('CP-EML-03: Debe fallar si no tiene . en el dominio', () => {
      expect(v.validateEmail("mary@example")).toBe("Formato de correo electrónico inválido");
    });
});


describe('Validación de Teléfono (validatePhoneNumberVE)', () => {

  test('CP-TEL-01: Debe pasar con un número válido (0412)', () => {
    expect(v.validatePhoneNumberVE('04121234567')).toBe(true);
  });

  test('CP-TEL-02: Debe pasar con un número válido (0424)', () => {
    expect(v.validatePhoneNumberVE('04247654321')).toBe(true);
  });

  test('CP-TEL-03: Debe fallar si tiene 10 dígitos', () => {
    expect(v.validatePhoneNumberVE('0412123456')).toBe("Formato de teléfono inválido");
  });

  test('CP-TEL-04: Debe fallar si tiene 12 dígitos', () => {
    expect(v.validatePhoneNumberVE('041212345678')).toBe("Formato de teléfono inválido");
  });

  test('CP-TEL-05: Debe fallar con operadora inexistente', () => {
    expect(v.validatePhoneNumberVE('08881234567')).toBe("Formato de teléfono inválido");
  });

  test('CP-TEL-06: Debe fallar si contiene letras', () => {
    expect(v.validatePhoneNumberVE('0412123A567')).toBe("Formato de teléfono inválido");
  });
});

/**
   * Pruebas de fecha de nacimiento
   * Regla: >= 13 años y <= 120 años. No futura.
   */
  describe('Validación de Fecha (validateDate)', () => {
    beforeAll(() => {
      jest.useFakeTimers();
      // Seteamos la fecha fija al 9 de Abril de 2026 para que los tests sean deterministas
      jest.setSystemTime(new Date(2026, 3, 9)); 
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    // Asumiendo hoy es 09/04/2026
    test('TC-01: Debe pasar si tiene 13 años exactos', () => {
      expect(v.validateDate('09/04/2013')).toBe(true);
    });

    test('TC-02: Debe fallar si cumple 13 mañana ', () => {
      expect(v.validateDate('11/04/2013')).toContain("mayor de 13 años");
    });

    test('TC-04: Debe fallar si la fecha es futura', () => {
      expect(v.validateDate('11/04/2026')).toBe("La fecha no puede ser futura");
    });
  });


/**
   * Prubeas de documento de identidad (Cédula con Nacionalidad)
   * Regla: Tipo (V/E) y Número (6-9 dígitos)
   */
  describe('Validación de Documento (validateDocument)', () => {
    
    test('CP-DOC-01: Debe pasar con un formato válido V12345678', () => {
    expect(v.validateDocument('V12345678')).toBe(true);
    });

    test('CP-DOC-02: Debe pasar con nacionalidad extranjera E-123456', () => {
      expect(v.validateDocument('E123456')).toBe(true);
    });

    test('CP-DOC-02: Debe pasar con nacionalidad extranjeraK E123456', () => {
      expect(v.validateDocument('E123456')).toBe(true);
    });

    test('CP-DOC-04: Debe fallar con 5 dígitos', () => {
      expect(v.validateDocument('V99999')).toBe("La cédula debe tener entre 6 y 9 números");
    });

    test('CP-DOC-05: Debe pasar con el límite inferior de 6 dígitos', () => {
      expect(v.validateDocument('V100000')).toBe(true);
    });

    test('CP-DOC-06: Debe fallar con 10 dígitos', () => {
      expect(v.validateDocument('V1234567890')).toBe("La cédula debe tener entre 6 y 9 números");
    });
  });

/**
 * Pruebas de contraseñas
 * Rango: [8, 90] caracteres, al menos una letra y un número
 */
describe ('Validacion de contraseñas (validatePassword)', () => {

    
    test('CP-PWD-01: Debe pasar con 8 caracteres y composición válida', () => {
      expect(v.validatePassword('cine2026')).toBe(true);
    });

    test('CP-PWD-02: Debe fallar con 7 caracteres con letras y números', () => {
      expect(v.validatePassword('cine123')).toBe("Debe tener al menos 8 caracteres");
    });

    test('CP-PWD-04: Debe fallar si tiene 8 caracteres y solo contiene números', () => {
      expect(v.validatePassword('12345678')).toContain("una letra");
    });

    test('CP-PWD-05: Debe fallar si tiene 8 caracteres y solo contiene letras', () => {
      expect(v.validatePassword('abcdefgh')).toContain("un número");
    });

    test('CP-PWD-06: Debe fallar si la contraseña tiene 91 caracteres', () => {
        const tooLongPassword = "a1".repeat(45) + "b"; 
        expect(v.validatePassword(tooLongPassword)).toBe("La contraseña es muy larga");
    });

    test('CP-PWD-07: Debe pasar con exactamente 90 caracteres', () => {
        const maxPassword = "a1".repeat(45); 
        expect(v.validatePassword(maxPassword)).toBe(true);
    });


})

/**
   * PRUEBAS DE SANITIZACIÓN
   * Técnica: Pruebas de Dominio
   */
  describe('Sanitizacion de Entradas (sanitizeInput)', () => {
    test('Debe limpiar espacios y capitalizar nombres correctamente', () => {
      const input = "  jAVIER rICARDO123  ";
      expect(v.sanitizeInput(input, 'name')).toBe("Javier Ricardo");
    });

    test('Debe normalizar emails (minúsculas y sin espacios)', () => {
      const input = " Alexis@GMAIL.CoM ";
      expect(v.sanitizeInput(input, 'email')).toBe("alexis@gmail.com");
    });
});
