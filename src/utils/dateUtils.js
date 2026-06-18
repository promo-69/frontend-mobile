/**
 * Convierte una fecha estándar (2026-04-06) a un formato legible (13 de)
 */

export const formatHumanDate = (dateString) => {
  if (!dateString) return '';
  
  // Forzamos que se procese en la zona horaria local para evitar saltos de día por UTC
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day); 

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};


/**
 * Genera las fechas formateadas identificando automaticamente "Hoy" y "Mañana"
 */

export const generateNextDays = (daysCount = 7) => {
    const daysList = [];

    //Obtener la fecha de hoy en formato YYY-MM-DD
    const baseDate = new Date();
    
    const formatDateString = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
   const todayString = formatDateString(baseDate);

  const tomorrowObj = new Date(baseDate);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowString = formatDateString(tomorrowObj);

    for(let i = 0; i < daysCount; i++) {
        const currentDate = new Date(baseDate);
        currentDate.setDate(currentDate.getDate() + i);
        
        //Formato de control ("2026-02-01")
        const fullDate = formatDateString(currentDate);

    // Obtener el nombre del día de la semana (Lun, Mar, Mié)
    let label = currentDate.toLocaleDateString('es-ES', { weekday: 'short' });
    label = label.replace('.', ''); // Limpiar puntos que mete JS en algunos entornos
    label = label.charAt(0).toUpperCase() + label.slice(1);

        //Comparación estricta de strings
        if(fullDate === todayString) {
            label='HOY'; 
        }else if (fullDate === tomorrowString) {
            label= 'MAÑANA';
        }

        const numberDay = currentDate.getDate().toString();
        
        let monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'short' });
monthLabel = monthLabel.replace('.', '').toUpperCase().substring(0, 3); // "JUN", "JUL"...

        daysList.push({
            id: fullDate,
            day: label,
            date: numberDay,
            month: monthLabel,
            fullDate
        });
    }

    return daysList;
}


const formatDate = (dateString) => {
  // Si no hay fecha, viene vacía o es nula, salimos de inmediato de forma segura
  if (!dateString || typeof dateString !== 'string') return 'No definida';
  
  try {
    // Extrae solo la parte de la fecha ignorando la hora si existiera (YYYY-MM-DD)
    const cleanDate = dateString.split('T')[0];
    // Separa por el guion 
    const parts = cleanDate.split('-');
    //Valida que tengamos los 3 componentes esenciales (Año, Mes, Día)
    if (parts.length !== 3) return dateString;
    
    const [year, month, day] = parts;
    
    // Retorna el formato: DD/MM/AAAA
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha de forma manual:', error);
    return dateString; 
  }
};