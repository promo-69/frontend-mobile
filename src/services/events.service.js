import api from '../api/axios'

// Obtener eventos próximos - Mary  
export const getEvents = async () => {
  const response = await api.get('/special-events')
  return response.data.data 
}

// Obtener la informacion del Evento con el id - Mary
export const getEventById = async (eventId) => {
  const response = await api.get(`/special-events/${eventId}`)
  return response.data.data
}

// De un evento, obtengo las sucursales y funciones disponibles - Mary
export const getCinemaShowtimebyDate = async (eventId, date) => {
  const response = await api.get(`/showtimes/by-content/event/${eventId}/`, {
  params: { date }
  })
  return response.data.data 
}