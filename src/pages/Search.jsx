import { useState } from 'react';
import SearchBar from '../components/search/SearchBar';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import SearchTypesList from '../components/search/SearchTypesList';

const Search = () => {

    const movieFilters = [
    {
      key: 'genre',
      label: 'Genre',
      type: 'multiselect',
      options: [
        { value: 'action', label: 'Action' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'drama', label: 'Drama' },
        { value: 'horror', label: 'Horror' },
        { value: 'sci-fi', label: 'Sci-Fi' },
        { value: 'romance', label: 'Romance' }
      ],
      defaultValue: []
    },
    {
      key: 'year',
      label: 'Release Year',
      type: 'range',
      min: 1980,
      max: 2024,
      defaultValue: [1980, 2024]
    },
    {
      key: 'rating',
      label: 'Rating',
      type: 'select',
      placeholder: 'Any rating',
      options: [
        { value: 'G', label: 'G' },
        { value: 'PG', label: 'PG' },
        { value: 'PG-13', label: 'PG-13' },
        { value: 'R', label: 'R' },
        { value: 'NC-17', label: 'NC-17' }
      ]
    },
    {
      key: 'director',
      label: 'Director',
      type: 'text',
      placeholder: 'Enter director name...'
    }
  ];

  const [filterValues, setFilterValues] = useState({
    genre: [],
    year: [1980, 2024],
    rating: "",
    director: ""
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const handleFiltersChange = (filters) => {
    setFilterValues(filters);
    console.log('Filters changed:', filters);
  };

  const onItemSelect = () => {
    console.log("test")
  }

  const movies = [
    { id: 1, title: 'The Matrix Reloaded', year: 2003, poster: '🎬', rating: 4 },
    { id: 2, title: 'Inception Dreams', year: 2010, poster: '🎭', rating: 5 },
    { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
  ];

  return (
    <div>
  <h1 className="text-3xl font-bold mb-8">Search content</h1>
  <div className="flex gap-8">
    {/* Левая колонка */}
    <div className="flex-1">
      <SearchBar
        filters={movieFilters}
        filterValues={filterValues}
        handleSearch={handleSearch}
        handleFiltersChange={handleFiltersChange}
      />

      {/* Грид будет прямо под поиском и не залезет под правый блок */}
      <div className="mt-8">
        <PaginatedGridContainer
          items={movies}
          itemsPerRow={5}
          rows={2}
          renderItem={(movie) => <SmallMovieCard movie={movie} />}
          itemHeight="h-64"
          gap="gap-6"
          itemWidth="w-40"
        />
      </div>
    </div>

    {/* Правая колонка */}
    <div className="w-1/4">
      <SearchTypesList onItemSelect={onItemSelect} />
    </div>
  </div>
</div>
  );
};

export default Search;