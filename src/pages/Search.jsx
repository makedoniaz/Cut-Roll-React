import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

const Search = () => {
  const [query, setQuery] = useState('');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Search Movies</h1>
      
      <div className="relative max-w-md mb-8">
        <SearchIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
        />
      </div>
      
      <div className="text-gray-300">
        {query ? `Searching for "${query}"...` : 'Enter a movie title to search'}
      </div>
    </div>
  );
};

export default Search;