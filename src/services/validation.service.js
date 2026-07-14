import api from './api';

//   1 = MANUAL → confitería
//   2 = QR     → boletos
export const VALIDATION_TYPE = {
  CONCESSIONS: 1,
  TICKETS: 2,
};

// El token se inyecta solo vía interceptor de `api`.
export const validationService = {
  // GET boletos por QR → { tickets, tickets_used }
  getTicketsByQr: async (qrCode) => {
    const res = await api.get(`/orders/qr/${encodeURIComponent(qrCode)}/tickets`);
    return res.data?.data ?? res.data;
  },

  // GET confitería por QR → { concessions, concessions_used }
  getConcessionsByQr: async (qrCode) => {
    const res = await api.get(
      `/orders/qr/${encodeURIComponent(qrCode)}/concessions`
    );
    return res.data?.data ?? res.data;
  },

  // POST validar/quemar el QR. validationType: VALIDATION_TYPE.*
  validateQr: async (qrCode, validationType) => {
    const res = await api.post(
      `/orders/validate-qr/${encodeURIComponent(qrCode)}`,
      { validation_type: validationType }
    );
    return res.data;
  },
};
