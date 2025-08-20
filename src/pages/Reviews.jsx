import { useState } from 'react';
import MovieReviews from '../components/ui/reviews/MovieReviews';
import SectionHeading from '../components/ui/common/SectionHeading';
import SelectFilter from '../components/search/filters/SelectFilter';

const Reviews = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: 'All Reviews' },
    { value: 'recent', label: 'Recent Reviews' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'top-rated', label: 'Top Rated' },
    { value: 'controversial', label: 'Most Controversial' }
  ];

  const handleFilterChange = (value) => {
    setSelectedFilter(value);
    // TODO: Implement filter logic
    console.log('Filter changed to:', value);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Movie Reviews</h1>
          <p className="text-gray-300 text-lg">
            Discover what the community thinks about the latest releases and classics
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Filter by:</span>
              <SelectFilter
                options={filterOptions}
                value={selectedFilter}
                onChange={handleFilterChange}
                placeholder="Select filter"
              />
            </div>
            <div className="text-gray-400">
              Showing reviews for: <span className="text-white font-medium">{selectedFilter}</span>
            </div>
          </div>
        </div>

        {/* Featured Reviews Section */}
        <div className="mb-12">
          <SectionHeading heading="Featured Reviews" />
          <MovieReviews heading="" />
        </div>

        {/* Recent Reviews Section */}
        <div className="mb-12">
          <SectionHeading heading="Recent Reviews" />
          <MovieReviews heading="" />
        </div>

        {/* Popular Reviews Section */}
        <div className="mb-12">
          <SectionHeading heading="Most Popular Reviews" />
          <MovieReviews heading="" />
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <div className="bg-gray-800 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Want to share your thoughts?
            </h3>
            <p className="text-gray-300 mb-6">
              Join the conversation and write your own movie reviews
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Write a Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;
