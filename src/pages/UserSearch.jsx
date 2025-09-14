import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PaginatedGridContainer from '../components/layout/PaginatedGridContainer';
import UserCard from '../components/ui/users/UserCard';
import { UserService } from '../services/userService';
import { Search as SearchIcon } from 'lucide-react';

const UserSearch = () => {
  const location = useLocation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [lastSearchSource, setLastSearchSource] = useState(null);

  // Handle pre-filled search from navigation state
  useEffect(() => {
    if (location.state?.prefillSearch) {
      const prefillSearch = location.state.prefillSearch;
      console.log('Applying pre-filled search:', prefillSearch);
      
      setIsRestoring(true);
      setSearchQuery(prefillSearch.query || '');
      
      // Clear the navigation state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Search users using userService
  const searchUsers = useCallback(async (page = 1, source = 'unknown') => {
    console.log('🔍 User search triggered with:', { searchQuery, page, isManualSearch, source });
    
    if (!searchQuery.trim()) {
      console.log('No search query, clearing results');
      setUsers([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters for userService searchUsers method
      const searchParams = {
        searchTerm: searchQuery.trim(),
        pageNumber: page,
        pageSize: 20 // Show 20 users per page
      };

      console.log('Final user search parameters being sent:', searchParams);

      const response = await UserService.searchUsers(searchParams);
      
      console.log('User search API Response:', response);
      
      if (response && response.data) {
        setUsers(response.data);
        setTotalResults(response.totalCount || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.data.length) / 20));
        setCurrentPage(page);
        setHasSearched(true);
      } else {
        console.log('No data in response or response is empty');
        setUsers([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
      }
    } catch (err) {
      console.error('User search error:', err);
      setError(err.message);
      setUsers([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(false);
    } finally {
      setLoading(false);
      setIsManualSearch(false);
    }
  }, [searchQuery]);

  // Handle restoring search state when coming back from user profile
  useEffect(() => {
    if (location.state?.restoreSearch) {
      const restoreData = location.state.restoreSearch;
      console.log('Restoring user search state:', restoreData);
      
      setIsRestoring(true);
      
      // Restore all search state
      setSearchQuery(restoreData.searchQuery || '');
      setCurrentPage(restoreData.currentPage || 1);
      setTotalPages(restoreData.totalPages || 1);
      setTotalResults(restoreData.totalResults || 0);
      setHasSearched(restoreData.hasSearched || false);
      
      console.log('State restored, will trigger auto-restore effect');
      
      // Clear the navigation state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
      
      // Clean up stored search context from sessionStorage
      sessionStorage.removeItem('lastUserSearchContext');
      
      // Reset the flag after a short delay to allow state updates to complete
      setTimeout(() => {
        setIsRestoring(false);
      }, 200);
    }
  }, [location.state]);

  // Auto-restore search results when state is restored
  useEffect(() => {
    if (isRestoring) {
      console.log('⏭️ Skipping auto-restore - currently restoring from pre-filled search');
      return;
    }
    
    if (isManualSearch) {
      console.log('⏭️ Skipping auto-restore - this was a manual search');
      return;
    }
    
    if (lastSearchSource === 'manual' || lastSearchSource === 'prefill') {
      console.log('⏭️ Skipping auto-restore - last search was:', lastSearchSource);
      return;
    }
    
    console.log('🔄 Auto-restore effect triggered:', { hasSearched, searchQuery });
    if (hasSearched && searchQuery.trim()) {
      console.log('🔄 Restoring user search results for page:', currentPage);
      const timer = setTimeout(() => {
        setLastSearchSource('restore');
        searchUsers(currentPage, 'restore');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [hasSearched, searchQuery, currentPage, isRestoring, isManualSearch, lastSearchSource, searchUsers]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (!location.state) {
        setUsers([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
        setCurrentPage(1);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.state]);

  // Auto-trigger search when search is pre-filled
  useEffect(() => {
    if (location.state?.prefillSearch) {
      const timer = setTimeout(async () => {
        setIsManualSearch(true);
        setLastSearchSource('prefill');
        await searchUsers(1, 'prefill');
        setIsRestoring(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [location.state?.prefillSearch, searchUsers]);

  // Handle search query changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasSearched(false);
    setIsManualSearch(false);
    setLastSearchSource(null);
  };

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    setIsManualSearch(true);
    setLastSearchSource('manual');
    searchUsers(1, 'manual');
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsManualSearch(true);
    setLastSearchSource('manual');
    searchUsers(page, 'manual');
  };

  // Handle item selection (navigation to user profile)
  const onItemSelect = (user) => {
    console.log("Selected user:", user);
    // Navigation is handled by UserCard component
  };

  return (
    <div className="relative">
      <h1 className="text-3xl font-bold mb-8">Search Users</h1>
      
      {/* Main Content */}
      <div className="transition-all duration-300">
        {/* Search Bar Row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="relative flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
                />
              </div>
              <button
                onClick={handleSearchButtonPress}
                className="cursor-pointer px-4 py-3 bg-green-600 hover:bg-green-700 border border-green-600 rounded-r-lg transition-colors"
              >
                <SearchIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Searching users...</p>
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
            {/* Results Count */}
            {hasSearched && searchQuery.trim() && (
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-gray-300">
                  {users.length > 0 ? (
                    <>
                      <span className="font-semibold text-green-400">
                        Found {totalResults} user{totalResults !== 1 ? 's' : ''}
                      </span>
                      {searchQuery.trim() && (
                        <span className="text-gray-400 ml-2">
                          for "{searchQuery.trim()}"
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">
                      No users found
                      {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {users.length === 0 && hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-lg mb-2">No users found matching your criteria</p>
                <p className="text-sm text-gray-500">
                  Try adjusting your search terms
                </p>
              </div>
            )}

            {/* Users Grid */}
            {users.length > 0 && (
              <div className="mt-8">
                <PaginatedGridContainer
                  items={users}
                  itemsPerRow={3}
                  rows={7}
                  renderItem={(user) => (
                    <UserCard 
                      key={user.id}
                      user={user}
                    />
                  )}
                  itemHeight="h-64"
                  gap="gap-6"
                  itemWidth="w-80"
                  useExternalPagination={true}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Initial State - No Search Yet */}
            {users.length === 0 && !searchQuery.trim() && !hasSearched && (
              <div className="mt-8 text-center text-gray-400">
                <div className="text-6xl mb-4">👥</div>
                <p className="text-lg mb-2">Ready to search for users?</p>
                <p className="text-sm text-gray-500">
                  Enter a search term, then click Search to find users
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
