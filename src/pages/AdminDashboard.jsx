import React, { useState } from 'react';
import { useAuth } from '../hooks/useStores';

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user',
    isMuted: false,
    isBanned: false,
    joinDate: '2024-01-15',
    lastActive: '2024-12-01'
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'moderator',
    isMuted: false,
    isBanned: false,
    joinDate: '2024-02-20',
    lastActive: '2024-12-01'
  },
  {
    id: 3,
    username: 'bob_wilson',
    email: 'bob@example.com',
    role: 'user',
    isMuted: true,
    isBanned: false,
    joinDate: '2024-03-10',
    lastActive: '2024-11-28'
  },
  {
    id: 4,
    username: 'alice_brown',
    email: 'alice@example.com',
    role: 'user',
    isMuted: false,
    isBanned: true,
    joinDate: '2024-01-05',
    lastActive: '2024-11-15'
  },
  {
    id: 5,
    username: 'charlie_davis',
    email: 'charlie@example.com',
    role: 'user',
    isMuted: false,
    isBanned: false,
    joinDate: '2024-04-12',
    lastActive: '2024-12-01'
  },
  {
    id: 6,
    username: 'diana_evans',
    email: 'diana@example.com',
    role: 'user',
    isMuted: false,
    isBanned: false,
    joinDate: '2024-05-18',
    lastActive: '2024-12-01'
  },
  {
    id: 7,
    username: 'frank_garcia',
    email: 'frank@example.com',
    role: 'moderator',
    isMuted: false,
    isBanned: false,
    joinDate: '2024-06-22',
    lastActive: '2024-11-30'
  },
  {
    id: 8,
    username: 'grace_lee',
    email: 'grace@example.com',
    role: 'user',
    isMuted: true,
    isBanned: false,
    joinDate: '2024-07-08',
    lastActive: '2024-11-25'
  }
];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filteredUsers = mockUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredUsers);
      setIsSearching(false);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleMuteUser = (userId) => {
    const action = searchResults.find(u => u.id === userId)?.isMuted ? 'unmute' : 'mute';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isMuted: !user.isMuted }
            : user
        )
      );
    }
  };

  const handleBanUser = (userId) => {
    const action = searchResults.find(u => u.id === userId)?.isBanned ? 'unban' : 'ban';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      setSearchResults(prev => 
        prev.map(user => 
          user.id === userId 
            ? { ...user, isBanned: !user.isBanned }
            : user
        )
      );
    }
  };

  const handleRoleChange = (userId, newRole) => {
    const currentUser = searchResults.find(u => u.id === userId);
    if (currentUser && currentUser.role !== newRole) {
      if (window.confirm(`Are you sure you want to change ${currentUser.username}'s role from ${currentUser.role} to ${newRole}?`)) {
        setSearchResults(prev => 
          prev.map(user => 
            user.id === userId 
              ? { ...user, role: newRole }
              : user
          )
        );
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 text-white';
      case 'moderator':
        return 'bg-blue-600 text-white';
      case 'user':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users and system settings</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{mockUsers.length}</div>
            <div className="text-gray-400 text-sm">Total Users</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-400">
              {mockUsers.filter(u => u.role === 'moderator').length}
            </div>
            <div className="text-gray-400 text-sm">Moderators</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {mockUsers.filter(u => u.isMuted).length}
            </div>
            <div className="text-gray-400 text-sm">Muted Users</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-400">
              {mockUsers.filter(u => u.isBanned).length}
            </div>
            <div className="text-gray-400 text-sm">Banned Users</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Search Users</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search by username or email... (Press Enter to search)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Search Results ({searchResults.length} users found)
            </h3>
            <div className="space-y-4">
              {searchResults.map((user) => (
                <div key={user.id} className="bg-gray-700 rounded-lg p-4">
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
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                    <div>
                      <span className="font-medium">Join Date:</span> {user.joinDate}
                    </div>
                    <div>
                      <span className="font-medium">Last Active:</span> {user.lastActive}
                    </div>
                    <div>
                      <span className="font-medium">User ID:</span> {user.id}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {user.isBanned ? 'Banned' : user.isMuted ? 'Muted' : 'Active'}
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
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="px-3 py-1 text-xs font-medium bg-gray-600 border border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="publisher">Publisher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">No users found matching "{searchQuery}"</p>
          </div>
        )}

        {/* Instructions */}
        {!searchQuery && searchResults.length === 0 && (
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">Enter a username or email to search for users</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
