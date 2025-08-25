import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useStores';
import { AdminDashboardService } from '../services/adminDashboardService';
import { Filter, X, Search, Users, Shield, Ban, MicOff } from 'lucide-react';
import SelectFilter from '../components/search/filters/SelectFilter';
import RangeFilter from '../components/search/filters/RangeFilter';
import TextFilter from '../components/search/filters/TextFilter';
import CheckboxFilter from '../components/search/filters/CheckboxFilter';
import { USER_ROLES } from '../constants/adminDashboard';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Filter configuration for admin dashboard
  // Note: searchTerm is handled separately in the main search input above
  const adminFilters = [
    {
      key: 'role',
      label: 'User Role',
      type: 'select',
      placeholder: 'Select role...',
      options: [
        { value: null, label: 'All Roles' },
        { value: 1, label: 'User' },
        { value: 0, label: 'Admin' },
        { value: 2, label: 'Moderator' }
      ],
      defaultValue: null
    },
    {
      key: 'showBannedOnly',
      label: 'Banned Users Only',
      type: 'simpleCheckbox',
      defaultValue: false
    },
    {
      key: 'showMutedOnly',
      label: 'Muted Users Only',
      type: 'simpleCheckbox',
      defaultValue: false
    },
    {
      key: 'registrationDateRange',
      label: 'Registration Date Range',
      type: 'range',
      min: new Date('2025-08-01').getTime(),
      max: new Date().getTime(),
      defaultValue: [new Date('2025-08-01').getTime(), new Date().getTime()],
      step: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      startDate: '2025-08-01',
      endDate: new Date().toISOString().split('T')[0]
    }
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({
    role: null,
    showBannedOnly: false,
    showMutedOnly: false,
    registrationDateRange: [new Date('2025-08-01').getTime(), new Date().getTime()]
  });

  // Define default date range for comparison
  const defaultStartDate = new Date('2025-08-01').getTime();
  const defaultEndDate = new Date().getTime();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0); // Total users without filters
  const [hasSearched, setHasSearched] = useState(false);
  const [isFiltersSidebarOpen, setIsFiltersSidebarOpen] = useState(false);

  // Get total users count (without filters) for statistics
  const getTotalUsersCount = useCallback(async () => {
    try {
      console.log('🔍 Getting total users count...');
      const count = await AdminDashboardService.getUsersFilteredCount({
        searchTerm: null,
        role: null,
        isBanned: null,
        isMuted: null,
        registeredAfter: null,
        registeredBefore: null,
        pageNumber: null,
        pageSize: null
      });
      console.log('📊 Raw count response:', count);
      console.log('📊 Count type:', typeof count);
      console.log('📊 Count length:', count.length);
      console.log('📊 Count char codes:', Array.from(count).map(c => c.charCodeAt(0)));
      
      const parsedCount = parseInt(count);
      console.log('📊 Parsed count:', parsedCount);
      console.log('📊 Is NaN:', isNaN(parsedCount));
      
      setTotalUsers(parsedCount || 0);
      console.log('📊 Set totalUsers to:', parsedCount || 0);
    } catch (error) {
      console.error('Failed to get total users count:', error);
      setTotalUsers(0);
    }
  }, []);

  // Load total users count on component mount
  useEffect(() => {
    getTotalUsersCount();
  }, [getTotalUsersCount]);

  // Check if there are any active filters
  const hasActiveFilters = useCallback(() => {
    return Object.entries(filterValues).some(([key, value]) => {
      if (key === 'role') {
        return value !== null;
      }
      if (key === 'showBannedOnly' || key === 'showMutedOnly') {
        return value !== false; // Simple checkbox is active when not false
      }
      if (key === 'registrationDateRange') {
        return value && value.length === 2 && value[0] !== defaultStartDate && value[1] !== defaultEndDate;
      }
      return false;
    });
  }, [filterValues, defaultStartDate, defaultEndDate]);

  // Search users using admin dashboard service
  const searchUsers = useCallback(async (page = 1) => {
    const hasActive = hasActiveFilters();
    console.log('🔍 Admin search triggered with:', { searchQuery, hasActiveFilters: hasActive, page });
    console.log('Current filter values:', filterValues);
    
    if (!searchQuery.trim() && !hasActive) {
      console.log('No search query and no active filters, clearing results');
      setUsers([]);
      setTotalResults(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare search parameters for admin dashboard service
      const searchParams = {
        searchTerm: searchQuery.trim() || null,
        role: filterValues.role,
        isBanned: filterValues.showBannedOnly ? true : null, // Use showBannedOnly to filter banned
        isMuted: filterValues.showMutedOnly ? true : null, // Use showMutedOnly to filter muted
        registeredAfter: filterValues.registrationDateRange[0] ? `${new Date(filterValues.registrationDateRange[0]).toISOString().slice(0, 10)}T00:00:00.000Z` : null,
        registeredBefore: filterValues.registrationDateRange[1] ? `${new Date(filterValues.registrationDateRange[1]).toISOString().slice(0, 10)}T23:59:59.999Z` : null,
        pageNumber: page,
        pageSize: 10
      };

      // Add a note about filter behavior in the console
      if (filterValues.showBannedOnly && filterValues.showMutedOnly) {
        console.log('Both filters active: Will show users that are both banned AND muted');
      } else if (filterValues.showBannedOnly) {
        console.log('Banned filter active: Will show only banned users');
      } else if (filterValues.showMutedOnly) {
        console.log('Muted filter active: Will show only muted users');
      }

      // Remove null values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === null || searchParams[key] === '') {
          delete searchParams[key];
        }
      });

      console.log('Final search parameters being sent:', searchParams);

      const response = await AdminDashboardService.getUsersFiltered(searchParams);
      
      console.log('API Response:', response);
      
      if (response && response.data) {
        console.log('Setting users:', response.data);
        setUsers(response.data);
        // totalResults should represent the filtered count, not total users
        setTotalResults(response.totalCount || response.data.length);
        setTotalPages(response.totalPages || Math.ceil((response.totalCount || response.data.length) / 10));
        setCurrentPage(page);
        setHasSearched(true);
      } else {
        console.log('No data in response or response is empty');
        console.log('Response structure:', response);
        setUsers([]);
        setTotalResults(0);
        setTotalPages(1);
        setHasSearched(false);
      }
    } catch (err) {
      console.error('Admin search error:', err);
      setError(err.message);
      setUsers([]);
      setTotalResults(0);
      setTotalPages(1);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterValues, hasActiveFilters]);

  // Handle search query changes
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setHasSearched(false);
  };

  // Handle filter changes
  const handleFiltersChange = (filters) => {
    console.log('Filter values changed:', filters);
    console.log('Role filter value:', filters.role);
    setFilterValues(filters);
    setCurrentPage(1);
    setHasSearched(false);
  };

  // Handle explicit search button press
  const handleSearchButtonPress = () => {
    searchUsers(1);
  };

  // Handle page changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchUsers(page);
  };

  // Handle user actions
  const handleMuteUser = async (userId) => {
    try {
      await AdminDashboardService.toggleMute(userId);
      // Refresh the current search results
      searchUsers(currentPage);
    } catch (error) {
      console.error('Failed to toggle mute status:', error);
      alert('Failed to update user mute status');
    }
  };

  const handleBanUser = async (userId) => {
    try {
      await AdminDashboardService.toggleBan(userId);
      // Refresh the current search results
      searchUsers(currentPage);
    } catch (error) {
      console.error('Failed to toggle ban status:', error);
      alert('Failed to update user ban status');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      // First remove current role, then assign new role
      const currentUser = users.find(u => u.id === userId);
      if (currentUser && currentUser.role !== newRole) {
        if (window.confirm(`Are you sure you want to change ${currentUser.username}'s role from ${currentUser.role || 'No Role'} to ${newRole || 'No Role'}?`)) {
          // Remove current role first
          if (currentUser.role) {
            await AdminDashboardService.removeRole(userId, currentUser.role);
          }
          // Assign new role
          if (newRole) {
            await AdminDashboardService.assignRole(userId, newRole);
          }
          // Refresh the current search results
          searchUsers(currentPage);
        }
      }
    } catch (error) {
      console.error('Failed to change user role:', error);
      alert('Failed to update user role');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-600 text-white';
      case 'Moderator':
        return 'bg-blue-600 text-white';
      case 'User':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getRoleLabel = (role) => {
    return role || 'No Role';
  };

  const getStatusBadge = (user) => {
    if (user.isBanned) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Banned</span>;
    }
    if (user.isMuted) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Muted</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  // Disable body scroll when sidebar is open
  useEffect(() => {
    if (isFiltersSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFiltersSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and system settings</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{totalUsers}</div>
                <div className="text-gray-400 text-sm">Total Users</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {users.filter(u => u.role === 'Moderator').length}
                </div>
                <div className="text-gray-400 text-sm">Moderators</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MicOff className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {users.filter(u => u.isMuted).length}
                </div>
                <div className="text-gray-400 text-sm">Muted Users</div>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Ban className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {users.filter(u => u.isBanned).length}
                </div>
                <div className="text-gray-400 text-sm">Banned Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Dimming Effect */}
        <div className={`transition-all duration-300 ${isFiltersSidebarOpen ? 'opacity-70' : 'opacity-100'}`}>
          {/* Search Bar and Filter Button Row */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchButtonPress()}
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchButtonPress}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsFiltersSidebarOpen(!isFiltersSidebarOpen)}
              className="cursor-pointer flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-white whitespace-nowrap"
            >
              <Filter className="w-4 h-4" />
              <span>{isFiltersSidebarOpen ? 'Hide' : 'Show'} Filters</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
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
              {hasSearched && (searchQuery.trim() || hasActiveFilters()) && (
                <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="text-gray-300">
                    {users.length > 0 ? (
                      <>
                        <span className="font-semibold text-blue-400">
                          Found {totalResults} user{totalResults !== 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-400 ml-2">
                          out of {totalUsers} total users
                        </span>
                        {searchQuery.trim() && (
                          <span className="text-gray-400 ml-2">
                            for "{searchQuery.trim()}"
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
                        No users found
                        {searchQuery.trim() && ` for "${searchQuery.trim()}"`}
                        {hasActiveFilters() && ' with current filters'}
                        <span className="ml-2">(out of {totalUsers} total users)</span>
                      </span>
                    )}
                    
                    {/* Active Filters Display */}
                    {(filterValues.showBannedOnly || filterValues.showMutedOnly) && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <span className="text-gray-400 text-sm">Active filters: </span>
                        {filterValues.showBannedOnly && (
                          <span className="inline-block px-2 py-1 text-xs bg-red-900 text-red-200 rounded mr-2">
                            Banned Only
                          </span>
                        )}
                        {filterValues.showMutedOnly && (
                          <span className="inline-block px-2 py-1 text-xs bg-yellow-900 text-yellow-200 rounded mr-2">
                            Muted Only
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Results Message */}
              {users.length === 0 && hasSearched && (
                <div className="mt-8 text-center text-gray-400">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-lg mb-2">No users found matching your criteria</p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}

              {/* Users List */}
              {users.length > 0 && (
                <div className="mt-8 space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-lg font-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{user.username}</h4>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(user)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                        <div>
                          <span className="font-medium">Join Date:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">User ID:</span> {user.id}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {user.isBanned ? 'Banned' : user.isMuted ? 'Muted' : 'Active'}
                        </div>
                        <div>
                          <span className="font-medium">Avatar:</span> {user.avatarPath ? 'Yes' : 'No'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleMuteUser(user.id)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            user.isMuted 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          } transition-colors`}
                        >
                          {user.isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        
                        <button
                          onClick={() => handleBanUser(user.id)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            user.isBanned 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-red-600 hover:bg-red-700'
                          } transition-colors`}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>

                        <select
                          value={user.role || ''}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-3 py-1 text-xs font-medium bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">No Role</option>
                          <option value="User">User</option>
                          <option value="Moderator">Moderator</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-2 bg-gray-700 rounded-lg">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Initial State - No Search Yet */}
              {users.length === 0 && !searchQuery.trim() && !hasActiveFilters() && !hasSearched && (
                <div className="mt-8 text-center text-gray-400">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-lg mb-2">Ready to search for users?</p>
                  <p className="text-sm text-gray-500">
                    Enter a search term or use filters, then click Search to find users
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Overlay Sidebar */}
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
              isFiltersSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setIsFiltersSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`fixed top-0 right-0 h-full w-[500px] bg-gray-900 border-l border-gray-700 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
            isFiltersSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Admin Filters</h3>
                  <button
                    onClick={() => setIsFiltersSidebarOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Filters Content - Scrollable */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* Individual Filters */}
                <div className="space-y-6">
                  {adminFilters.map((filter) => {
                    let value;
                    if (filter.type === 'select' && filter.defaultValue !== undefined) {
                      value = filterValues.hasOwnProperty(filter.key) ? filterValues[filter.key] : filter.defaultValue;
                    } else if (filter.type === 'simpleCheckbox') {
                      value = filterValues.hasOwnProperty(filter.key) ? filterValues[filter.key] : filter.defaultValue;
                    } else if (filter.type === 'range') {
                      value = filterValues.hasOwnProperty(filter.key) ? filterValues[filter.key] : filter.defaultValue;
                    } else {
                      value = filterValues[filter.key] || filter.defaultValue || '';
                    }

                    let filterComponent;
                    switch (filter.type) {
                      case 'text':
                        filterComponent = (
                          <TextFilter
                            key={filter.key}
                            label={filter.label}
                            value={value}
                            onChange={(newValue) => {
                              const newFilterValues = { ...filterValues, [filter.key]: newValue };
                              setFilterValues(newFilterValues);
                            }}
                            placeholder={filter.placeholder}
                          />
                        );
                        break;
                      case 'select':
                        filterComponent = (
                          <SelectFilter
                            key={filter.key}
                            label={filter.label}
                            value={filterValues[filter.key] !== undefined ? filterValues[filter.key] : filter.defaultValue}
                            onChange={(newValue) => {
                              console.log('=== ADMIN DASHBOARD FILTER CHANGE ===');
                              console.log('Filter key:', filter.key);
                              console.log('Old value:', filterValues[filter.key]);
                              console.log('New value:', newValue);
                              console.log('Type of new value:', typeof newValue);
                              console.log('Current filterValues:', filterValues);
                              
                              const newFilterValues = { ...filterValues, [filter.key]: newValue };
                              console.log('New filterValues:', newFilterValues);
                              
                              setFilterValues(newFilterValues);
                              console.log('=== END FILTER CHANGE ===');
                            }}
                            options={filter.options}
                            placeholder={filter.placeholder}
                          />
                        );
                        break;
                      case 'simpleCheckbox':
                        filterComponent = (
                          <CheckboxFilter
                            key={filter.key}
                            label={filter.label}
                            value={value}
                            onChange={(newValue) => {
                              const newFilterValues = { ...filterValues, [filter.key]: newValue };
                              setFilterValues(newFilterValues);
                            }}
                            type="simpleCheckbox"
                          />
                        );
                        break;
                      case 'range':
                        filterComponent = (
                          <div key={filter.key} className="space-y-2">
                            <RangeFilter
                              label={filter.label}
                              value={value}
                              onChange={(newValue) => {
                                const newFilterValues = { ...filterValues, [filter.key]: newValue };
                                setFilterValues(newFilterValues);
                              }}
                              min={filter.min}
                              max={filter.max}
                              step={filter.step}
                              defaultValue={filter.defaultValue}
                              labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                          </div>
                        );
                        break;
                      default:
                        filterComponent = null;
                    }
                    return filterComponent;
                  })}
                </div>
              </div>
              
              {/* Footer with Clear Button - Static Position */}
              <div className="p-6 border-t border-gray-700">
                <button
                  onClick={() => {
                    const clearedFilters = {};
                    adminFilters.forEach(filter => {
                      if (filter.type === 'select' && filter.defaultValue !== undefined) {
                        clearedFilters[filter.key] = filter.defaultValue;
                      } else if (filter.type === 'simpleCheckbox') {
                        clearedFilters[filter.key] = false; // Clear simple checkbox values
                      } else if (filter.type === 'range') {
                        clearedFilters[filter.key] = [defaultStartDate, defaultEndDate];
                      } else {
                        clearedFilters[filter.key] = '';
                      }
                    });
                    setFilterValues(clearedFilters);
                    // Note: searchQuery is handled separately and not cleared here
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-gray-300 hover:text-white transition-colors border border-gray-600 rounded-lg hover:border-gray-500 bg-gray-800 hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default AdminDashboard;
