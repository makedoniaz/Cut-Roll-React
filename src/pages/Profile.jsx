import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserPlus, UserMinus, Camera, Shuffle } from 'lucide-react';
import { UserService } from '../services/userService.js';
import { FollowService } from '../services/followService.js';
import { AuthService } from '../services/authService.js';
import { RecommendationsService } from '../services/recommendationsService.js';
import { useAuth } from '../hooks/useStores';
import { useAuthStore } from '../stores/authStore';
import FollowersList from '../components/profile/FollowersList.jsx';
import FollowingList from '../components/profile/FollowingList.jsx';
import Modal from '../components/layout/Modal.jsx';
import { getAvatarUrl, updateAvatarCache } from '../utils/avatarUtils.js';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [refreshFollowers, setRefreshFollowers] = useState(0);
  const [followStatus, setFollowStatus] = useState({
    isFollowing: false,
    isFollowedBy: false,
    isMutualFollow: false
  });
  const [stats, setStats] = useState({
    reviewCount: 0,
    watchedCount: 0,
    likedCount: 0,
    listCount: 0,
    wantToWatchCount: 0,
    averageRating: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isFetchingStats, setIsFetchingStats] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [createMixLoading, setCreateMixLoading] = useState(false);
  const [mixError, setMixError] = useState('');
  
  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && username === currentUser.username;

  useEffect(() => {
    const fetchUser = async () => {
      console.log('Profile useEffect triggered for username:', username); // Debug log
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Reset fetching state when username changes
        setIsFetchingStats(false);
        
        const userData = await UserService.getUserByUsername(username);
        setUser(userData);
        setError('');
        
        // Fetch follow data if not own profile
        const isOwnProfile = currentUser && username === currentUser.username;
        if (!isOwnProfile && currentUser) {
          await fetchFollowData(userData.id);
        }
        
        // Fetch user statistics
        await fetchUserStats(userData.id);
      } catch (err) {
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, currentUser]); // Depend on both username and currentUser to fetch follow status when user changes

  // Separate useEffect to refresh follow status when needed
  useEffect(() => {
    if (user && currentUser && !isOwnProfile && refreshFollowers > 0) {
      console.log('🔄 Refreshing follow status after follow/unfollow action');
      fetchFollowData(user.id);
    }
  }, [refreshFollowers, user, currentUser, isOwnProfile]);

  const fetchFollowData = async (userId) => {
    try {
      console.log('📤 Fetching follow data for userId:', userId, 'currentUser:', currentUser.id);
      // Fetch counts and follow status
      const [followers, following, followStatusData] = await Promise.all([
        FollowService.getFollowersCount(userId),
        FollowService.getFollowingCount(userId),
        FollowService.getFollowStatus(currentUser.id, userId)
      ]);
      
      console.log('📥 Follow data received:', { followers, following, followStatusData });
      
      setFollowersCount(followers);
      setFollowingCount(following);
      setIsFollowing(followStatusData.isFollowing);
      setFollowStatus(followStatusData);
    } catch (err) {
      console.error('❌ Failed to fetch follow data:', err);
    }
  };

  const fetchUserStats = async (userId) => {
    // Prevent duplicate calls
    if (isFetchingStats) {
      console.log('Stats already being fetched, skipping duplicate call');
      return;
    }

    try {
      setIsFetchingStats(true);
      setStatsLoading(true);
      console.log('Fetching user stats for userId:', userId); // Debug log
      
      const [reviewCount, watchedCount, likedCount, listCount, wantToWatchCount, averageRating] = await Promise.all([
        UserService.getUserReviewCount(userId),
        UserService.getUserWatchedCount(userId),
        UserService.getUserMovieLikeCount(userId),
        UserService.getUserListCount(userId),
        UserService.getUserWantToWatchCount(userId),
        UserService.getUserAverageRating(userId)
      ]);
      
      console.log('User stats fetched:', { reviewCount, watchedCount, likedCount, listCount, wantToWatchCount, averageRating }); // Debug log
      
      setStats({
        reviewCount,
        watchedCount,
        likedCount,
        listCount,
        wantToWatchCount,
        averageRating
      });
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    } finally {
      setStatsLoading(false);
      setIsFetchingStats(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !user || followLoading) return;

    try {
      setFollowLoading(true);
      console.log('🔄 Follow toggle started. Current state:', { isFollowing, currentUser: currentUser.id, targetUser: user.id });
      
      if (isFollowing) {
        console.log('📤 Unfollowing user...');
        await FollowService.unfollow(currentUser.id, user.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
        // Update follow status
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: false,
          isMutualFollow: false // If we unfollow, it can't be mutual
        }));
        console.log('✅ Unfollow successful');
      } else {
        console.log('📤 Following user...');
        await FollowService.follow(currentUser.id, user.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
        // Update follow status
        setFollowStatus(prev => ({
          ...prev,
          isFollowing: true,
          isMutualFollow: prev.isFollowedBy ? true : false // Only mutual if they also follow us
        }));
        console.log('✅ Follow successful');
      }
      
      // Trigger refresh of followers list
      console.log('🔄 Triggering followers refresh...');
      setRefreshFollowers(prev => {
        const newValue = prev + 1;
        console.log('🔄 Refresh trigger updated to:', newValue);
        return newValue;
      });
    } catch (err) {
      console.error('❌ Failed to toggle follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Navigation functions for statistics cards
  const handleWatchedClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isOwnProfile) {
      navigate('/action-lists/recently-watched');
    } else {
      navigate(`/users/${username}/action-lists/recently-watched`);
    }
  };

  const handleWantToWatchClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isOwnProfile) {
      navigate('/action-lists/want-to-watch');
    } else {
      navigate(`/users/${username}/action-lists/want-to-watch`);
    }
  };

  const handleLikedClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isOwnProfile) {
      navigate('/action-lists/recently-liked');
    } else {
      navigate(`/users/${username}/action-lists/recently-liked`);
    }
  };

  const handleListsClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isOwnProfile) {
      navigate('/lists/my');
    } else {
      navigate(`/lists/${username}`);
    }
  };

  const handleReviewsClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (isOwnProfile) {
      navigate('/reviews/my');
    } else {
      navigate(`/reviews/${username}`);
    }
  };

  // Avatar upload functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setAvatarError('');
    
    if (file) {
      // Validate file type (only JPG and PNG)
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setAvatarError('Please select a JPG or PNG image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAvatarError('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setAvatarUploading(true);
      setAvatarError('');
      
      const updatedUser = await AuthService.updateAvatar(selectedFile);
      
      console.log('Avatar update response:', updatedUser);
      console.log('New avatar path:', updatedUser.avatarPath);
      
      // Update the user state with new avatar
      setUser(prev => ({
        ...prev,
        avatarPath: updatedUser.avatarPath
      }));
      
      // Update cache key to force image reload
      updateAvatarCache(user.id);
      
      // Also update the auth store if this is the current user's profile
      if (isOwnProfile && currentUser) {
        console.log('Updating auth store with new avatar path');
        const { updateProfile } = useAuthStore.getState();
        await updateProfile({ ...currentUser, avatarPath: updatedUser.avatarPath });
      }
      
      // Close modal and reset state
      setIsAvatarModalOpen(false);
      setSelectedFile(null);
      setAvatarPreview(null);
      
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      setAvatarError('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const openAvatarModal = () => {
    setIsAvatarModalOpen(true);
    setSelectedFile(null);
    setAvatarPreview(null);
    setAvatarError('');
  };

  const handleCreateMix = async () => {
    if (!currentUser || !user || createMixLoading) return;

    try {
      setCreateMixLoading(true);
      setMixError('');
      
      const recommendations = await RecommendationsService.getFriendRecommendations({
        userId1: currentUser.id,
        userId2: user.id,
        limit: 20,
        preferredGenres: null,
        minRating: null,
        minVoteCount: null,
        minReleaseDate: null,
        maxReleaseDate: null
      });

      console.log('Friend recommendations:', recommendations);
      
      // Navigate to MovieMix page with the recommendations data
      navigate('/movie-mix', {
        state: {
          recommendations: recommendations,
          mixData: {
            user1Name: currentUser.username,
            user2Name: user.username,
            user1Id: currentUser.id,
            user2Id: user.id
          }
        }
      });
      
    } catch (err) {
      console.error('Failed to create mix:', err);
      setMixError(err.message || 'Failed to create mix');
    } finally {
      setCreateMixLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Section - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-600 group">
                    <img
                      src={getAvatarUrl(user.avatarPath, user.id)}
                      alt={`${user.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Prevent infinite loop by checking if we're already showing the default avatar
                        if (e.target.src !== window.location.origin + '/default-avatar.png') {
                          e.target.src = '/default-avatar.png';
                        }
                      }}
                    />
                    {/* Hover overlay for own profile */}
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <button
                          onClick={openAvatarModal}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                          title="Change Avatar"
                        >
                          <Camera className="w-6 h-6" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                      {isOwnProfile && (
                        <Link
                          to="/settings"
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                          title="Account Settings"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </Link>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {!isOwnProfile && currentUser && (
                      <div className="flex items-center gap-3">
                        {/* Follow Button */}
                        <button
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isFollowing
                              ? 'bg-gray-600 hover:bg-gray-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                        </button>
                        
                        {/* Create Mix Button - Only show if mutual follow */}
                        {(() => {
                          console.log('🔍 Create Mix Button visibility check:', {
                            isMutualFollow: followStatus.isMutualFollow,
                            isFollowing: followStatus.isFollowing,
                            isFollowedBy: followStatus.isFollowedBy,
                            followStatus: followStatus
                          });
                          return followStatus.isMutualFollow;
                        })() && (
                          <button
                            onClick={handleCreateMix}
                            disabled={createMixLoading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            title="Create Mix"
                          >
                            <Shuffle className="w-4 h-4" />
                            {createMixLoading ? 'Creating...' : 'Create Mix'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  
                  {/* Mix Error Display */}
                  {mixError && (
                    <div className="mb-4 p-3 bg-red-500 text-white rounded-lg text-sm">
                      {mixError}
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {/* Role Badge */}
                    {user.role === 2 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Publisher
                      </span>
                    )}
                    {user.role === 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Admin
                      </span>
                    )}
                    {user.isBanned && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Banned
                      </span>
                    )}
                    {user.isMuted && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Muted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="mt-8 pt-8 border-t border-gray-700">
                <h2 className="text-xl font-semibold text-white mb-6">Profile Statistics</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                  <div 
                    className="border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={handleReviewsClick}
                  >
                    <div className="text-xl font-bold text-green-400 mb-1">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mx-auto"></div>
                      ) : (
                        stats.reviewCount
                      )}
                    </div>
                    <div className="text-xs text-gray-300">Reviews</div>
                  </div>
                  <div 
                    className="border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={handleWatchedClick}
                  >
                    <div className="text-xl font-bold text-green-400 mb-1">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mx-auto"></div>
                      ) : (
                        stats.watchedCount
                      )}
                    </div>
                    <div className="text-xs text-gray-300">Watched</div>
                  </div>
                  <div 
                    className="border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={handleWantToWatchClick}
                  >
                    <div className="text-xl font-bold text-green-400 mb-1">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mx-auto"></div>
                      ) : (
                        stats.wantToWatchCount
                      )}
                    </div>
                    <div className="text-xs text-gray-300">Want to Watch</div>
                  </div>
                  <div 
                    className="border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={handleLikedClick}
                  >
                    <div className="text-xl font-bold text-green-400 mb-1">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mx-auto"></div>
                      ) : (
                        stats.likedCount
                      )}
                    </div>
                    <div className="text-xs text-gray-300">Liked Movies</div>
                  </div>
                  <div 
                    className="border border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:border-gray-600 transition-colors"
                    onClick={handleListsClick}
                  >
                    <div className="text-xl font-bold text-green-400 mb-1">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mx-auto"></div>
                      ) : (
                        stats.listCount
                      )}
                    </div>
                    <div className="text-xs text-gray-300">Lists</div>
                  </div>
                </div>

                {/* Average Rating */}
                <div className="mt-6 mb-8">
                  <div className="border border-gray-700 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-lg font-semibold text-white">Average Rating</span>
                    </div>
                    <div className="text-3xl font-bold text-green-400 mb-1">
                      {statsLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto"></div>
                      ) : (
                        stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      {statsLoading ? 'Loading...' : (stats.averageRating > 0 ? 'out of 5' : 'No ratings yet')}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Section - Follow Lists */}
          <div className="lg:col-span-1 space-y-6">
            <FollowersList 
              userId={user.id} 
              onCountChange={setFollowersCount}
              refreshTrigger={refreshFollowers}
            />
            <FollowingList 
              userId={user.id} 
              onCountChange={setFollowingCount}
              refreshTrigger={refreshFollowers}
            />
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <Modal isOpen={isAvatarModalOpen} onClose={() => setIsAvatarModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Change Avatar</h2>
          
          {/* Error Message */}
          {avatarError && (
            <div className="mb-4 p-3 bg-orange-500 text-white rounded-lg text-sm">
              {avatarError}
            </div>
          )}
          
          {/* File Input */}
          <div className="mb-6">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              <Camera className="w-5 h-5 mr-2" />
              Choose Image
            </label>
          </div>

          {/* Preview */}
          {avatarPreview && (
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-green-500">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-gray-300 text-sm mt-2">Preview</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAvatarUpload}
              disabled={!selectedFile || avatarUploading || avatarError}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {avatarUploading ? 'Uploading...' : 'Save Avatar'}
            </button>
          </div>

          {/* File Requirements */}
          <div className="mt-6 text-sm text-gray-400">
            <p>Supported formats: JPG, PNG</p>
            <p>Maximum file size: 5MB</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;