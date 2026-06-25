import api from './api'


// De un evento, obtengo las sucursales y funciones disponibles 
export const getMoviesShowtimebyDateCinema = async (cinemaId, date) => {
  const response = await api.get(`/showtimes/billboard/full`, {
  params: { 
    cinemaId,
    date
   }
  })
  return response.data.data 
}

// Catalogo de lenguajes 
export const getLanguages = async () => {
  const response = await api.get(`/catalogs/languages`)
  return response.data.data 
}

// Catalogo de Tipo de Proyecciones 
export const getProjectionTypes = async () => {
  const response = await api.get(`/catalogs/projection-types`)
  return response.data.data 
}
