import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserService } from '../services/userService.js';
import { FollowService } from '../services/followService.js';
import { useAuth } from '../hooks/useStores';
import FollowersList from '../components/profile/FollowersList.jsx';
import FollowingList from '../components/profile/FollowingList.jsx';
import Feed from '../components/profile/Feed.jsx';

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
  }, [username]); // Only depend on username to prevent duplicate calls

  const fetchFollowData = async (userId) => {
    try {
      // Fetch counts
      const [followers, following, followStatus] = await Promise.all([
        FollowService.getFollowersCount(userId),
        FollowService.getFollowingCount(userId),
        FollowService.isFollowing(currentUser.id, userId)
      ]);
      
      setFollowersCount(followers);
      setFollowingCount(following);
      setIsFollowing(followStatus);
    } catch (err) {
      console.error('Failed to fetch follow data:', err);
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
      
      if (isFollowing) {
        await FollowService.unfollow(currentUser.id, user.id);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await FollowService.follow(currentUser.id, user.id);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
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
    navigate('/action-lists/recently-watched');
  };

  const handleWantToWatchClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/action-lists/want-to-watch');
  };

  const handleLikedClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/action-lists/recently-liked');
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
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-600">
                    <img
                      src={user.avatarPath || '/default-avatar.png'}
                      alt={`${user.username}'s avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
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
                  <p className="text-gray-400 mb-4">{user.email}</p>
                  
                  {/* Follow Button */}
                  {!isOwnProfile && currentUser && (
                    <div className="mb-4">
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isFollowing
                            ? 'bg-gray-600 hover:bg-gray-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-50`}
                      >
                        {followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                      </button>
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
                    {!user.isBanned && !user.isMuted && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
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
                    className="bg-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-600 transition-colors"
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
                    className="bg-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-600 transition-colors"
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
                    className="bg-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-600 transition-colors"
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
                    className="bg-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-600 transition-colors"
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
                    className="bg-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-600 transition-colors"
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
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
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

                {/* Activity Feed */}
                <Feed userId={user.id} />
              </div>
            </div>
          </div>

          {/* Right Section - Follow Lists */}
          <div className="lg:col-span-1 space-y-6">
            <FollowersList 
              userId={user.id} 
              onCountChange={setFollowersCount}
            />
            <FollowingList 
              userId={user.id} 
              onCountChange={setFollowingCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;