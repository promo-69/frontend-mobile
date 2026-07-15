import api from './api';

/**
 * Envía el mensaje del usuario al asistente de IA de Cineflix (texto)
 * @param {string} message - Mensaje del usuario
 * @param {number} cinemaId - ID del cine seleccionado
 * @returns {Promise<Object>} Respuesta del backend
 */
export const sendAssistantMessage = async (message, cinemaId) => {
  try {
    const response = await api.post('/assistant/chat', { message, cinemaId });
    return response.data;
  } catch (error) {
    console.error('Error en sendAssistantMessage service:', error);
    throw error;
  }
};

/**
 * Envía un archivo de audio al asistente de IA de Cineflix
 * Preparado para cuando el endpoint /assistant/chat-audio esté listo
 * @param {string} audioUri - URI local del archivo de audio
 * @param {number} cinemaId - ID del cine seleccionado
 * @param {string} sessionId - ID de sesión del chat
 * @param {number} userId - ID del usuario autenticado
 * @returns {Promise<Object>} Respuesta del backend
 */
export const sendAudioMessage = async (audioUri, cinemaId, sessionId, userId) => {
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'voice-note.m4a',
    });
    formData.append('cinemaId', String(cinemaId));
    formData.append('sessionId', sessionId);
    formData.append('userId', String(userId));

    const response = await api.post('/assistant/chat-audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error en sendAudioMessage service:', error);
    throw error;
  }
};
