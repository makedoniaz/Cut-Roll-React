import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FollowService } from '../../services/followService.js';
import { FollowType } from '../../constants/follow.js';
import { getAvatarUrl } from '../../utils/avatarUtils.js';

const FollowersList = ({ userId, onCountChange, refreshTrigger }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    console.log('🔄 FollowersList useEffect triggered:', { userId, refreshTrigger });
    if (refreshTrigger !== undefined) {
      // Reset pagination when refresh is triggered
      console.log('🔄 Resetting followers list due to refresh trigger');
      setPage(1);
      setFollowers([]);
      setHasMore(true);
    }
    fetchFollowers();
  }, [userId, refreshTrigger]);

  const fetchFollowers = async (pageNum = 1) => {
    if (!userId) return;

    try {
      console.log('📤 Fetching followers for userId:', userId, 'page:', pageNum);
      setLoading(true);
      const response = await FollowService.getFollowByUser(userId, pageNum, 10, FollowType.FOLLOWERS);
      console.log('📥 Followers response:', response);
      
      if (pageNum === 1) {
        setFollowers(response.data || []);
      } else {
        setFollowers(prev => [...prev, ...(response.data || [])]);
      }
      
      setHasMore(response.hasNextPage || false);
      setError('');
      
      // Notify parent component about count change
      if (onCountChange && response.totalCount !== undefined) {
        console.log('📊 Updating followers count to:', response.totalCount);
        onCountChange(response.totalCount);
      }
    } catch (err) {
      console.error('❌ Error fetching followers:', err);
      setError(err.message || 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFollowers(nextPage);
    }
  };

  if (loading && followers.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Followers
        </h3>
        <div className="text-center text-gray-400">Loading followers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Followers
        </h3>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Followers ({followers.length})
      </h3>
      
      {followers.length === 0 ? (
        <div className="text-center text-gray-400 py-4">No followers yet</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {followers.map((follower) => (
            <div key={follower.id} className="flex flex-col items-center text-center">
              <Link to={`/profile/${follower.userName}`} className="group flex flex-col items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-green-400 transition-colors mb-1">
                  <img
                    src={getAvatarUrl(follower.avatarPath, follower.id)}
                    alt={`${follower.userName}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <p className="text-xs text-white group-hover:text-green-400 font-medium transition-colors truncate max-w-full">
                  {follower.userName}
                </p>
              </Link>
            </div>
          ))}
          
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FollowersList;
