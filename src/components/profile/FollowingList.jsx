import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FollowService } from '../../services/followService.js';
import { FollowType } from '../../constants/follow.js';

const FollowingList = ({ userId, onCountChange }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, [userId]);

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
        <div className="space-y-3">
          {following.map((followedUser) => (
            <div key={followedUser.id} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600">
                <img
                  src={followedUser.avatarPath || '/default-avatar.png'}
                  alt={`${followedUser.username}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </div>
              <div className="flex-1">
                <Link
                  to={`/profile/${followedUser.username}`}
                  className="text-white hover:text-blue-400 font-medium"
                >
                  {followedUser.username}
                </Link>
                <p className="text-sm text-gray-400">{followedUser.email}</p>
              </div>
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
