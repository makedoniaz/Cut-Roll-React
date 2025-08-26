import SearchLayout from '../components/search/SearchLayout';
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import { MovieService } from '../services/movieService';
import { genres } from '../constants/genres';

const MovieSearch = () => {
  const movieFilters = [
    {
      key: 'genres',
      label: 'Genres',
      type: 'multiselect',
      options: genres.map(genre => ({ value: genre, label: genre })),
      defaultValue: []
    },
    {
      key: 'actor',
      label: 'Actor',
      type: 'text',
      placeholder: 'Search by actor name',
      defaultValue: null
    },
    {
      key: 'director',
      label: 'Director',
      type: 'text',
      placeholder: 'Search by director name',
      defaultValue: null
    },
    {
      key: 'year',
      label: 'Release Year',
      type: 'range',
      min: 1950,
      max: 2025,
      defaultValue: [1950, 2025]
    },
    {
      key: 'rating',
      label: 'Minimum Rating',
      type: 'range',
      min: 0,
      max: 10,
      defaultValue: [0, 10]
    },
    {
      key: 'runtime',
      label: 'Runtime (minutes)',
      type: 'range',
      min: 0,
      max: 300,
      defaultValue: [0, 300]
    }
  ];

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'title', label: 'Title' },
    { value: 'overview', label: 'Overview' },
    { value: 'cast', label: 'Cast' },
    { value: 'crew', label: 'Crew' }
  ];

  const MovieResultCard = ({ item }) => (
    <SmallMovieCard 
      movie={item}
      className="h-full"
    />
  );

  return (
    <SearchLayout
      title="Movie Search"
      description="Find your next favorite movie with advanced search and filtering options"
      filters={movieFilters}
      searchFunction={MovieService.searchMovies}
      resultComponent={MovieResultCard}
      searchTypes={searchTypes}
      defaultSearchType="all"
    />
  );
};

export default MovieSearch;
