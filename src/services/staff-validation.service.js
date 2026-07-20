import api from './api';

/**
 * Validación de QR en puerta/confitería (staff).
 * El backend exige CRUD:READ/UPDATE:ORDER-DETAILS (el gate de UI es VIEW:ACCESS:QR).
 * validation_type: 1 = confitería, 2 = boletos (entrada a sala).
 */
export const staffValidationService = {
  // Detalle de boletos de la orden del QR (película, sala, asientos, si ya se usó)
  getTicketsByQr: async (qrCode) => {
    const response = await api.get(`/orders/qr/${encodeURIComponent(qrCode)}/tickets`);
    return response.data?.data ?? response.data;
  },

  // Detalle de confitería de la orden del QR (productos/combos, si ya se retiró)
  getConcessionsByQr: async (qrCode) => {
    const response = await api.get(`/orders/qr/${encodeURIComponent(qrCode)}/concessions`);
    return response.data?.data ?? response.data;
  },

  // Registra la validación (asistencia para boletos / entrega para confitería).
  // Doble validación => 409.
  validateQr: async (qrCode, validationType) => {
    const response = await api.post(`/orders/validate-qr/${encodeURIComponent(qrCode)}`, {
      validation_type: validationType,
    });
    return response.data?.data ?? response.data;
  },

  // Entrega de un PREMIO canjeado (producto/combo): descuenta inventario y marca entregado.
  redemptionPickup: async (qrCode) => {
    const response = await api.post(`/orders/redemption-pickup/${encodeURIComponent(qrCode)}`);
    return response.data?.data ?? response.data;
  },
};

export const VALIDATION_TYPE = { CONCESSIONS: 1, TICKETS: 2 };
