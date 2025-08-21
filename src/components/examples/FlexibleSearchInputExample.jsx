import { useState } from 'react';
import FlexibleSearchInput from '../ui/common/FlexibleSearchInput';

// Mock search functions for demonstration
const mockMovieSearch = async (query) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const mockMovies = [
    { id: 1, title: 'The Shawshank Redemption', description: '1994 drama film', image: null },
    { id: 2, title: 'The Godfather', description: '1972 crime film', image: null },
    { id: 3, title: 'Pulp Fiction', description: '1994 crime film', image: null },
    { id: 4, title: 'Fight Club', description: '1999 psychological thriller', image: null },
    { id: 5, title: 'Inception', description: '2010 science fiction film', image: null },
    { id: 6, title: 'The Matrix', description: '1999 science fiction film', image: null },
    { id: 7, title: 'Interstellar', description: '2014 science fiction film', image: null },
    { id: 8, title: 'The Dark Knight', description: '2008 superhero film', image: null },
    { id: 9, title: 'Forrest Gump', description: '1994 drama film', image: null },
    { id: 10, title: 'Goodfellas', description: '1990 crime film', image: null },
    { id: 11, title: 'The Silence of the Lambs', description: '1991 thriller film', image: null },
    { id: 12, title: 'Schindler\'s List', description: '1993 historical drama', image: null }
  ];
  
  return mockMovies.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase())
  );
};

const mockUserSearch = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const mockUsers = [
    { id: 1, name: 'John Doe', description: 'Software Developer', image: null },
    { id: 2, name: 'Jane Smith', description: 'Product Manager', image: null },
    { id: 3, name: 'Mike Johnson', description: 'Designer', image: null },
    { id: 4, name: 'Sarah Wilson', description: 'Marketing Specialist', image: null },
    { id: 5, name: 'David Brown', description: 'Data Analyst', image: null },
    { id: 6, name: 'Emily Davis', description: 'UX Researcher', image: null },
    { id: 7, name: 'Chris Miller', description: 'Frontend Developer', image: null },
    { id: 8, name: 'Lisa Garcia', description: 'Backend Developer', image: null },
    { id: 9, name: 'Tom Anderson', description: 'DevOps Engineer', image: null },
    { id: 10, name: 'Amy Taylor', description: 'QA Engineer', image: null }
  ];
  
  return mockUsers.filter(user => 
    user.name.toLowerCase().includes(query.toLowerCase())
  );
};

const FlexibleSearchInputExample = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [movieSearchValue, setMovieSearchValue] = useState('');
  const [userSearchValue, setUserSearchValue] = useState('');

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    console.log('Selected movie:', movie);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    console.log('Selected user:', user);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Flexible Search Input Examples
        </h1>
        <p className="text-gray-400">
          Demonstrating the flexible search input component with different search functions
        </p>
      </div>

      {/* Movie Search Example */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Movie Search</h2>
        <p className="text-gray-400 mb-4">
          Search for movies with 3-second debounce. Shows up to 10 results.
        </p>
        
        <FlexibleSearchInput
          placeholder="Search for movies..."
          searchFunction={mockMovieSearch}
          onSelect={handleMovieSelect}
          value={movieSearchValue}
          onChange={setMovieSearchValue}
          maxResults={10}
          debounceMs={3000}
        />
        
        {selectedMovie && (
          <div className="mt-4 p-4 bg-green-600 rounded-lg">
            <h3 className="font-semibold text-white">Selected Movie:</h3>
            <p className="text-white">{selectedMovie.title}</p>
            <p className="text-green-100">{selectedMovie.description}</p>
          </div>
        )}
      </div>

      {/* User Search Example */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">User Search</h2>
        <p className="text-gray-400 mb-4">
          Search for users with 3-second debounce. Shows up to 10 results.
        </p>
        
        <FlexibleSearchInput
          placeholder="Search for users..."
          searchFunction={mockUserSearch}
          onSelect={handleUserSelect}
          value={userSearchValue}
          onChange={setUserSearchValue}
          maxResults={10}
          debounceMs={3000}
        />
        
        {selectedUser && (
          <div className="mt-4 p-4 bg-blue-600 rounded-lg">
            <h3 className="font-semibold text-white">Selected User:</h3>
            <p className="text-white">{selectedUser.name}</p>
            <p className="text-blue-100">{selectedUser.description}</p>
          </div>
        )}
      </div>

      {/* Custom Configuration Example */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Custom Configuration</h2>
        <p className="text-gray-400 mb-4">
          Example with custom styling and different debounce time.
        </p>
        
        <FlexibleSearchInput
          placeholder="Custom search..."
          searchFunction={mockMovieSearch}
          onSelect={handleMovieSelect}
          className="max-w-md"
          maxResults={5}
          debounceMs={1000}
        />
      </div>

      {/* Features List */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Component Features</h2>
        <ul className="text-gray-300 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Flexible search function passed as prop
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Configurable debounce time (default: 3 seconds)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Shows up to 10 results (configurable)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Selected items displayed as removable tags
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Loading states and error handling
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Keyboard navigation support
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Responsive design with Tailwind CSS
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FlexibleSearchInputExample;
