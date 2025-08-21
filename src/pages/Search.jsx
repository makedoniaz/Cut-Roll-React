import { useState, useEffect, useCallback } from 'react';
import SearchBar from '../components/search/SearchBar';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import SearchTypesList from '../components/search/SearchTypesList';
import { MovieService } from '../services/movieService';

const Search = () => {
  // Enhanced filters that match movieService search parameters
  const movieFilters = [
    {
      key: 'genres',
      label: 'Genres',
      type: 'multiselect',
      options: [
        { value: 'Action', label: 'Action' },
        { value: 'Comedy', label: 'Comedy' },
        { value: 'Drama', label: 'Drama' },
        { value: 'Horror', label: 'Horror' },
        { value: 'Sci-fi', label: 'Sci-Fi' },
        { value: 'Romance', label: 'Romance' },
        { value: 'Thriller', label: 'Thriller' },
        { value: 'Adventure', label: 'Adventure' },
        { value: 'Fantasy', label: 'Fantasy' },
        { value: 'Animation', label: 'Animation' }
      ],
      defaultValue: []
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
      label: 'Rating Range',
      type: 'range',
      min: 0,
      max: 10,
      step: 0.5,
      defaultValue: [0, 10]
    },
    {
      key: 'director',
      label: 'Director',
      type: 'text',
      placeholder: 'Enter director name...'
    },
    {
      key: 'actor',
      label: 'Actor',
      type: 'text',
      placeholder: 'Enter actor name...'
    },
    {
      key: 'keyword',
      label: 'Keyword',
      type: 'text',
      placeholder: 'Enter keyword...'
    },
    {
      key: 'country',
      label: 'Country',
      type: 'text',
      placeholder: 'Enter country...'
    },
    {
      key: 'language',
      label: 'Language',
      type: 'text',
      placeholder: 'Enter language...'
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      placeholder: 'Sort by...',
      options: [
        { value: 'title', label: 'Title' },
        { value: 'rating', label: 'Rating' },
        { value: 'releasedate', label: 'Release Date' },
        { value: 'revenue', label: 'Revenue' }
      ]
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    genres: [],
    year: [1950, 2025],
    rating: [0, 10],
    director: '',
    actor: '',
    keyword: '',
    country: '',
    language: '',
    sortBy: ''
  });

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Search movies using movieService
  const searchMovies = useCallback(async (page = 1) => {
    console.log('Search triggered with:', { searchQuery, hasActiveFilters: hasActiveFilters() });
    
    if (!searchQuery.trim() && !hasActiveFilters()) {
      console.log('No search query and no active filters, clearing results');
      setMovies([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters for movieService
      const searchParams = {
        page: page,
        pageSize: 20, // Show 20 movies per page
        title: searchQuery.trim() || null,
        genres: filterValues.genres.length > 0 ? filterValues.genres : null,
        actor: filterValues.actor || null,
        director: filterValues.director || null,
        keyword: filterValues.keyword || null,
        year: filterValues.year[1] !== 2025 ? filterValues.year[1] : null, // Use max year if not default
        minRating: filterValues.rating[0] !== 0 ? filterValues.rating[0] : null,
        maxRating: filterValues.rating[1] !== 5 ? filterValues.rating[1] : null,
        country: filterValues.country || null,
        language: filterValues.language || null,
        sortBy: filterValues.sortBy || null,
        sortDescending: true
      };

      // Remove null values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === '') {
          delete searchParams[key];
        }
      });

      // Debug: Log the final search parameters being sent
      console.log('Final search parameters being sent:', searchParams);

      const response = await MovieService.searchMovies(searchParams);
      
      // Debug logging to see the actual response structure
      console.log('Search API Response:', response);
      console.log('Search Parameters:', searchParams);
      
      if (response && response.data) {
        setMovies(response.data);
        setTotalResults(response.totalCount || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.data.length) / 20));
        setCurrentPage(page);
      } else {
        console.log('No data in response or response is empty');
        setMovies([]);
        setTotalResults(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message);
      setMovies([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterValues]);

  // Check if there are any active filters
  const hasActiveFilters = () => {
    return Object.values(filterValues).some(value => {
      if (Array.isArray(value)) {
        if (value.length === 2) {
          // For range filters, check if they're not at default values
          if (value[0] === 1950 && value[1] === 2025) return false; // year
          if (value[0] === 0 && value[1] === 5) return false; // rating
          return true;
        }
        return value.length > 0;
      }
      return value && value !== '';
    });
  };

  // Handle search query changes (just update state, don't search yet)
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page
  };

  // Handle filter changes (just update state, don't search yet)
  const handleFiltersChange = (filters) => {
    setFilterValues(filters);
    setCurrentPage(1); // Reset to first page
  };

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    searchMovies(1);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchMovies(page);
  };

  // Handle item selection (navigation to movie details)
  const onItemSelect = (movie) => {
    console.log("Selected movie:", movie);
    // Navigation is handled by SmallMovieCard component
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Search Movies</h1>
      <div className="flex gap-8">
        {/* Left column - Search and Results */}
        <div className="flex-1">
          <SearchBar
            filters={movieFilters}
            filterValues={filterValues}
            handleSearch={handleSearch}
            handleFiltersChange={handleFiltersChange}
            onSearchButtonPress={handleSearchButtonPress}
          />

          {/* Loading State */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-400">Searching movies...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-8 p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-200">Error: {error}</p>
            </div>
          )}

          {/* Results Container */}
          {!loading && !error && (
            <>
              {/* Results Count - Show when there's a search query or active filters */}
              {(searchQuery.trim() || hasActiveFilters()) && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-gray-300">
                    {movies.length > 0 ? (
                      <>
                        <span className="font-semibold text-green-400">
                          Found {totalResults} movie{totalResults !== 1 ? 's' : ''}
                        </span>
                        {searchQuery.trim() && (
                          <span className="text-gray-400 ml-2">
                            for "{searchQuery.trim()}""
                          </span>
                        )}
                        {hasActiveFilters() && (
                          <span className="text-gray-400 ml-2">
                            with applied filters
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">
                        No movies found
                        {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                        {hasActiveFilters() && ' with current filters'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {movies.length === 0 && (searchQuery.trim() || hasActiveFilters()) && (
                <div className="mt-8 text-center text-gray-400">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg mb-2">No movies found matching your criteria</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}

              {/* Movies Grid */}
              {movies.length > 0 && (
                <div className="mt-8">
                  <PaginatedGridContainer
                    items={movies}
                    itemsPerRow={5}
                    rows={4}
                    renderItem={(movie) => <SmallMovieCard movie={movie} />}
                    itemHeight="h-64"
                    gap="gap-6"
                    itemWidth="w-40"
                    useExternalPagination={true}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Initial State - No Search Yet */}
              {movies.length === 0 && !searchQuery.trim() && !hasActiveFilters() && (
                <div className="mt-8 text-center text-gray-400">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-lg mb-2">Ready to search for movies?</p>
                  <p className="text-sm text-gray-500">
                    Enter a search term or use filters, then click Search to find movies
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right column - Search Types */}
        <div className="w-1/4">
          <SearchTypesList onItemSelect={onItemSelect} />
        </div>
      </div>
    </div>
  );
};

export default Search;