import FavoriteGenreMovies from './favoriteGenreMovies';

export default function MovieGenresScreen() {
  const handleGenresChange = (selectedGenres) => {
    console.log('Géneros seleccionados:', selectedGenres);
    // Aquí puedes manejar el estado o enviar los datos al backend
  };

  return (
    <FavoriteGenreMovies
      value={[]}
      onChange={handleGenresChange}
      error={null} 
    />
  );
}