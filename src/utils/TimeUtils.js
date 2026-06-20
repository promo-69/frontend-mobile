export const formatTime = (isoString) => {
  if (!isoString) return '00:00';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatTime12hrs = (isoString) => {
if (!isoString) return '00:00';
  const date = new Date(isoString);
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // El formato de 0 horas se transforma en 12
  
  return {
    time: `${hours.toString().padStart(2, '0')}:${minutes}`,
    ampm
  };
};