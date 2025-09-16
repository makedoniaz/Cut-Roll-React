import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionHeading from '../common/SectionHeading';
import ReviewPreviewCard from './ReviewPreviewCard';
import { ReviewService } from '../../../services/reviewService';
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const ReviewGrid = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calculate date range for last week
  const getDateRange = () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    return {
      createdAfter: weekAgo.toISOString(),
      createdBefore: today.toISOString()
    };
  };

  // Load recent reviews
  const loadRecentReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const dateRange = getDateRange();
      const searchParams = {
        ...dateRange,
        page: 1,
        pageSize: 5,
        sortBy: 0, // Sort by CreatedAt
        sortDescending: true // Most recent first
      };

      const result = await ReviewService.searchReview(searchParams);
      setReviews(result.data || result.items || []);
    } catch (err) {
      console.error('Error fetching recent reviews:', err);
      setError('Failed to load recent reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews on component mount
  useEffect(() => {
    loadRecentReviews();
  }, []);

  // Handle "More" button click
  const handleMoreClick = () => {
    const dateRange = getDateRange();
    navigate('/search/reviews', {
      state: {
        prefillFilters: {
          dateRange: {
            from: dateRange.createdAfter,
            to: dateRange.createdBefore
          },
          sortBy: '0',
          sortDescending: true
        },
        autoSearch: true
      }
    });
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="flex justify-between items-start">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-96 w-48">
          <div className="animate-pulse bg-gray-700 rounded-lg h-full w-full"></div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="py-2">
        <div className="max-w-7xl mx-auto">
          <SectionHeading 
            heading="RECENT REVIEWS" 
            onMoreClick={handleMoreClick}
            showMore={false}
          />
          <div className="text-red-400 text-center py-8">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="max-w-7xl mx-auto">
        <SectionHeading 
          heading="RECENT REVIEWS" 
          onMoreClick={handleMoreClick}
          showMore={true}
        />
        
        <div>
          {isLoading ? (
            <LoadingSkeleton />
          ) : reviews.length > 0 ? (
            <div className="animate-fade-in">
              <PaginatedGridContainer
                items={reviews}
                itemsPerRow={5}
                rows={1}
                renderItem={(review) => (
                  <ReviewPreviewCard review={review} />
                )}
                itemHeight="h-96"
                itemWidth="w-48"
                gap="gap-12"
              />
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              No recent reviews available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewGrid;
