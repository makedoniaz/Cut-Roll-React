import { useState } from 'react';
import MovieSearch from '../components/search/MovieSearch';

const Search = () => {
  const [query, setQuery] = useState('');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Search Movies</h1>
      
      <MovieSearch />
    </div>
  );
};

export default Search;