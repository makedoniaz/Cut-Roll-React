import { Link } from 'react-router-dom';
import { Search, Film, Newspaper, List, Star, Users, Filter } from 'lucide-react';

const SearchHub = () => {
  const searchCategories = [
    {
      title: 'Movies',
      description: 'Search through our extensive movie database',
      icon: Film,
      path: '/search/movies',
      color: 'bg-blue-500',
      features: ['Genre filtering', 'Year range', 'Rating filters', 'Cast & crew search']
    },
    {
      title: 'News',
      description: 'Find articles, reviews, and industry updates',
      icon: Newspaper,
      path: '/search/news',
      color: 'bg-green-500',
      features: ['Category filtering', 'Date ranges', 'Author search', 'Content search']
    },
    {
      title: 'Lists',
      description: 'Discover curated movie lists from the community',
      icon: List,
      path: '/search/lists',
      color: 'bg-purple-500',
      features: ['Sort by popularity', 'Minimum movies', 'Visibility filters', 'Author search']
    },
    {
      title: 'Reviews',
      description: 'Find movie reviews and ratings',
      icon: Star,
      path: '/search/reviews',
      color: 'bg-yellow-500',
      features: ['Rating filters', 'Sort options', 'Movie-specific', 'Reviewer search']
    },
    {
      title: 'Users',
      description: 'Connect with other movie enthusiasts',
      icon: Users,
      path: '/search/users',
      color: 'bg-red-500',
      features: ['Activity sorting', 'Review counts', 'List counts', 'Verification status']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-900/20 rounded-full">
              <Search className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Search Hub
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find exactly what you're looking for across our entire platform. 
            Choose from specialized search tools for different content types.
          </p>
        </div>

        {/* Search Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {searchCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.path}
                to={category.path}
                className="group block"
              >
                                 <div className="bg-gray-700 rounded-xl shadow-sm border border-gray-600 p-6 hover:shadow-lg hover:border-gray-500 transition-all duration-200 group-hover:scale-105">
                   <div className="flex items-center mb-4">
                     <div className={`p-3 rounded-lg ${category.color} text-white mr-4`}>
                       <IconComponent className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-semibold text-white">
                       {category.title}
                     </h3>
                   </div>
                   
                   <p className="text-gray-300 mb-4">
                     {category.description}
                   </p>
                   
                   <ul className="space-y-2">
                     {category.features.map((feature, index) => (
                       <li key={index} className="flex items-center text-sm text-gray-400">
                         <Filter className="w-4 h-4 mr-2 text-gray-500" />
                         {feature}
                       </li>
                     ))}
                   </ul>
                   
                   <div className="mt-4 pt-4 border-t border-gray-600">
                     <span className="text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                       Start searching →
                     </span>
                   </div>
                 </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Search Section */}
        <div className="bg-gray-700 rounded-xl shadow-sm border border-gray-600 p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Quick Search
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="What are you looking for?"
                className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Search All
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mt-3 text-center">
              Use the quick search above to search across all content types, or choose a specialized search tool above for more targeted results.
            </p>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-blue-900/20 rounded-xl p-8 border border-blue-800/30">
          <h3 className="text-xl font-semibold text-blue-300 mb-4">
            Search Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-200 mb-2">Use Filters</h4>
              <p className="text-blue-100 text-sm">
                Each search page has specialized filters to help you narrow down results quickly.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-200 mb-2">Save Searches</h4>
              <p className="text-blue-100 text-sm">
                Bookmark your favorite search combinations for future use.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-200 mb-2">Advanced Queries</h4>
              <p className="text-blue-100 text-sm">
                Use quotes for exact phrases and minus signs to exclude terms.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-200 mb-2">Sort Results</h4>
              <p className="text-blue-100 text-sm">
                Most search pages allow you to sort by relevance, date, popularity, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHub;
