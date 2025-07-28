import FlexibleSearch from './FlexibleSearch';
import { useState } from 'react';

const MovieSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState({
    genre: [],
    year: [1980, 2024],
    rating: "",
    director: ""
  });

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const handleFiltersChange = (filters) => {
    setFilterValues(filters);
    console.log('Filters changed:', filters);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <FlexibleSearch
          placeholder="Search for movies..."
          filters={movieFilters}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          searchValue={searchQuery}
          filterValues={filterValues}
        />
      </div>
    </div>
  );
};

export default MovieSearch;