import React, { useState, useEffect } from 'react';
import { FollowService } from '../../services/followService.js';
import { ActivityType } from '../../constants/follow.js';
import MovieLikeFeedCard from './MovieLikeFeedCard.jsx';
import MovieWatchedFeedCard from './MovieWatchedFeedCard.jsx';
import MovieWantToWatchFeedCard from './MovieWantToWatchFeedCard.jsx';
import MovieReviewFeedCard from './MovieReviewFeedCard.jsx';
import ReviewLikedFeedCard from './ReviewLikedFeedCard.jsx';
import ListCreatedFeedCard from './ListCreatedFeedCard.jsx';
import ListLikedFeedCard from './ListLikedFeedCard.jsx';
import { useAuth } from '../../hooks/useStores';
import FeedSectionHeading from '../ui/common/FeedSectionHeading';

const Feed = ({ showHeading = true }) => {
  const { user: currentUser } = useAuth();
  const [selectedType, setSelectedType] = useState(ActivityType.MOVIE_LIKE);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [feedData, setFeedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const activityTypeLabels = {
    [ActivityType.MOVIE_LIKE]: 'Movie Likes',
    [ActivityType.MOVIE_REVIEW]: 'Movie Reviews',
    [ActivityType.MOVIE_WATCHED]: 'Movies Watched',
    [ActivityType.WANT_TO_WATCH]: 'Want to Watch',
    [ActivityType.LIST_CREATED]: 'Lists Created',
    [ActivityType.LIST_LIKED]: 'Lists Liked',
    [ActivityType.REVIEW_LIKED]: 'Reviews Liked'
  };

  const timeFilterOptions = {
    'all': 'All Time',
    'month': 'Last Month',
    'week': 'Last Week',
    'today': 'Today'
  };

  useEffect(() => {
    // Use authenticated user's ID for the feed, not the profile user's ID
    const feedUserId = currentUser?.id;
    if (feedUserId) {
      fetchFeed();
    }
  }, [currentUser?.id, selectedType, selectedTimeFilter]);

  const getFromDate = () => {
    if (selectedTimeFilter === 'all') {
      return null; // null means get all time
    }

    const now = new Date();
    
    switch (selectedTimeFilter) {
      case 'today':
        // Start of today (00:00:00)
        return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      case 'week':
        // 7 days ago from now
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return weekAgo.toISOString();
      case 'month':
        // 30 days ago from now
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 30);
        return monthAgo.toISOString();
      default:
        return null;
    }
  };

  const fetchFeed = async (pageNum = 1) => {
    const feedUserId = currentUser?.id;
    if (!feedUserId) return;

    try {
      setLoading(true);
      setError('');
      
      console.log('Feed.fetchFeed called with authenticated userId:', feedUserId, 'page:', pageNum, 'type:', selectedType);
      
      const response = await FollowService.getFollowFeed(
        feedUserId,
        pageNum,
        6,
        selectedType,
        getFromDate()
      );

      if (pageNum === 1) {
        setFeedData(response.data || []);
      } else {
        setFeedData(prev => [...prev, ...(response.data || [])]);
      }
      
      setHasMore(response.hasNextPage || false);
    } catch (err) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeed(nextPage);
    }
  };

  const handleTypeChange = (event) => {
    const newType = parseInt(event.target.value);
    setSelectedType(newType);
    setPage(1);
    setFeedData([]);
    setHasMore(true);
  };

  const handleTimeFilterChange = (event) => {
    const newTimeFilter = event.target.value;
    setSelectedTimeFilter(newTimeFilter);
    setPage(1);
    setFeedData([]);
    setHasMore(true);
  };

  const renderFeedCard = (activity) => {
    switch (selectedType) {
      case ActivityType.MOVIE_LIKE:
        return <MovieLikeFeedCard key={activity.id} activity={activity} />;
      case ActivityType.MOVIE_REVIEW:
        return <MovieReviewFeedCard key={activity.id} activity={activity} />;
      case ActivityType.MOVIE_WATCHED:
        return <MovieWatchedFeedCard key={activity.id} activity={activity} />;
      case ActivityType.WANT_TO_WATCH:
        return <MovieWantToWatchFeedCard key={activity.id} activity={activity} />;
      case ActivityType.LIST_CREATED:
        return <ListCreatedFeedCard key={activity.id} activity={activity} />;
      case ActivityType.LIST_LIKED:
        return <ListLikedFeedCard key={activity.id} activity={activity} />;
      case ActivityType.REVIEW_LIKED:
        return <ReviewLikedFeedCard key={activity.id} activity={activity} />;
      default:
        return null;
    }
  };

  // Show message if user is not authenticated
  if (!currentUser) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="text-center text-gray-400 py-8">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-lg font-medium mb-2">Activity Feed</p>
          <p>Please log in to view your activity feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="max-w-7xl mx-auto">
        {showHeading && (
          <FeedSectionHeading 
            heading="SUBSCRIPTIONS FEED"
            selectedTimeFilter={selectedTimeFilter}
            onTimeFilterChange={handleTimeFilterChange}
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
            timeFilterOptions={timeFilterOptions}
            activityTypeLabels={activityTypeLabels}
          />
        )}
        
        <div>

      {/* Feed Content */}
      {loading && feedData.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          Loading feed...
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-8">{error}</div>
      ) : feedData.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No {activityTypeLabels[selectedType].toLowerCase()} found
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedData.map(renderFeedCard)}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default Feed;
