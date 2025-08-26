import SearchLayout from '../components/search/SearchLayout';
import ReviewCard from '../components/ui/reviews/ReviewCard';

const ReviewsSearch = () => {
  const reviewsFilters = [
    {
      key: 'rating',
      label: 'Rating',
      type: 'range',
      min: 1,
      max: 5,
      defaultValue: [1, 5]
    },
    {
      key: 'sortBy',
      label: 'Sort By',
      type: 'select',
      options: [
        { value: 'recent', label: 'Most Recent' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'helpful', label: 'Most Helpful' },
        { value: 'length', label: 'Longest Reviews' }
      ],
      defaultValue: 'recent'
    },
    {
      key: 'movieId',
      label: 'Movie',
      type: 'text',
      placeholder: 'Search reviews for specific movie',
      defaultValue: null
    },
    {
      key: 'authorId',
      label: 'Reviewer',
      type: 'text',
      placeholder: 'Search by reviewer ID',
      defaultValue: null
    }
  ];

  const searchTypes = [
    { value: 'all', label: 'All' },
    { value: 'title', label: 'Review Title' },
    { value: 'content', label: 'Review Content' },
    { value: 'movie', label: 'Movie Title' },
    { value: 'author', label: 'Reviewer' }
  ];

  const ReviewResultCard = ({ item }) => (
    <ReviewCard 
      review={item}
      className="h-full"
    />
  );

  // Mock search function - replace with actual service when available
  const searchReviews = async (searchParams) => {
    // This would call an actual ReviewsService.searchReviews method
    console.log('Searching reviews with:', searchParams);
    return { items: [], totalCount: 0 };
  };

  return (
    <SearchLayout
      title="Reviews Search"
      description="Find movie reviews and ratings from the community"
      filters={reviewsFilters}
      searchFunction={searchReviews}
      resultComponent={ReviewResultCard}
      searchTypes={searchTypes}
      defaultSearchType="all"
    />
  );
};

export default ReviewsSearch;
