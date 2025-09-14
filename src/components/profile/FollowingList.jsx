import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FollowService } from '../../services/followService.js';
import { FollowType } from '../../constants/follow.js';

const FollowingList = ({ userId, onCountChange, refreshTrigger }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      // Reset pagination when refresh is triggered
      setPage(1);
      setFollowing([]);
      setHasMore(true);
    }
    fetchFollowing();
  }, [userId, refreshTrigger]);

  const fetchFollowing = async (pageNum = 1) => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await FollowService.getFollowByUser(userId, pageNum, 10, FollowType.FOLLOWING);
      
      if (pageNum === 1) {
        setFollowing(response.data || []);
      } else {
        setFollowing(prev => [...prev, ...(response.data || [])]);
      }
      
      setHasMore(response.hasNextPage || false);
      setError('');
      
      // Notify parent component about count change
      if (onCountChange && response.totalCount !== undefined) {
        onCountChange(response.totalCount);
      }
    } catch (err) {
      setError(err.message || 'Failed to load following');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFollowing(nextPage);
    }
  };

  if (loading && following.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Following
        </h3>
        <div className="text-center text-gray-400">Loading following...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Following
        </h3>
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Following ({following.length})
      </h3>
      
      {following.length === 0 ? (
        <div className="text-center text-gray-400 py-4">Not following anyone yet</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {following.map((followedUser) => (
            <div key={followedUser.id} className="flex flex-col items-center text-center">
              <Link to={`/profile/${followedUser.userName}`} className="group">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-green-400 transition-colors">
                  <img
                    src={followedUser.avatarPath || '/default-avatar.png'}
                    alt={`${followedUser.userName}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <p className="text-xs text-white group-hover:text-green-400 font-medium mt-1 transition-colors truncate w-full">
                  {followedUser.userName}
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

export default FollowingList;
