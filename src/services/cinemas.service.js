import api from './api'

//GET - Toda la lista de Sucursales
export const getCinemas = async () => {
  const response = await api.get('/cinemas')
  return response.data.data 
}