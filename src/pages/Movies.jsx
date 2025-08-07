import MovieSearch from '../components/search/MovieSearch';
import MovieCard from '../components/ui/movies/MovieCard';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';

const Movies = () => {
  const movies = [
    { id: 1, title: 'The Matrix Reloaded', year: 2003, poster: '🎬', rating: 4 },
    { id: 2, title: 'Inception Dreams', year: 2010, poster: '🎭', rating: 5 },
    { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
  ];

  return (
    <div>
      <MovieSearch />
      <div>
        <PaginatedGridContainer
        items={movies}
        itemsPerRow={4}
        rows={2}
        renderItem={(movie) => <MovieCard movie={movie} />}
        itemHeight="h-64"
        gap="gap-6"
        />
      </div>
    </div>
  );
};

export default Movies;