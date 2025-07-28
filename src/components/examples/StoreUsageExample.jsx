// src/components/examples/SimpleStoreTest.jsx
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useMovieStore } from '../../stores/movieStore';
import { useUIStore } from '../../stores/uiStore';

const SimpleStoreTest = () => {
  // Individual store selectors
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  
  const favorites = useMovieStore((state) => state.favorites);
  const addToFavorites = useMovieStore((state) => state.addToFavorites);
  
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const showSuccess = useUIStore((state) => state.showSuccess);

  const exampleMovie = {
    id: 550,
    title: "Fight Club",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4
  };

  const handleLogin = async () => {
    const result = await login({ 
      email: 'test@example.com', 
      password: 'password' 
    });
    
    if (result.success) {
      showSuccess('Login successful!');
    }
  };

  const handleAddFavorite = () => {
    addToFavorites(exampleMovie);
    showSuccess('Added to favorites!');
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Store Test</h2>
      
      <div className="space-y-4">
        {/* Auth Section */}
        <div>
          <h3 className="font-semibold mb-2">Authentication</h3>
          {isAuthenticated ? (
            <div>
              <p className="text-green-400">Logged in as: {user?.username}</p>
              <button 
                onClick={logout}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm"
            >
              Test Login
            </button>
          )}
        </div>

        {/* Movies Section */}
        <div>
          <h3 className="font-semibold mb-2">Movies</h3>
          <p className="text-gray-300 text-sm">Favorites: {favorites.length}</p>
          <button 
            onClick={handleAddFavorite}
            className="mt-1 px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Add Fight Club to Favorites
          </button>
        </div>

        {/* UI Section */}
        <div>
          <h3 className="font-semibold mb-2">UI</h3>
          <p className="text-gray-300 text-sm">Theme: {theme}</p>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="mt-1 px-3 py-1 bg-purple-600 text-white rounded text-sm"
          >
            Toggle Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleStoreTest;