import { Link } from 'react-router-dom';
import { Search, Film, Newspaper, List, Star, Users } from 'lucide-react';

const SearchHub = () => {
  const searchCategories = [
    {
      title: 'Movies',
      description: 'Search through our extensive movie database',
      icon: Film,
      path: '/search/movies'
    },
    {
      title: 'News',
      description: 'Find articles, reviews, and industry updates',
      icon: Newspaper,
      path: '/search/news'
    },
    {
      title: 'Lists',
      description: 'Discover curated movie lists',
      icon: List,
      path: '/search/lists'
    },
    {
      title: 'Reviews',
      description: 'Find movie reviews and ratings',
      icon: Star,
      path: '/search/reviews'
    },
    {
      title: 'Users',
      description: 'Connect with other movie enthusiasts',
      icon: Users,
      path: '/search/users'
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-900/20 rounded-full">
              <Search className="w-8 h-8 text-green-400" />
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
                                 <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-600 p-6 hover:shadow-lg hover:border-gray-500 transition-all duration-200 group-hover:scale-105">
                   <div className="flex items-center mb-4">
                     <div className="p-3 rounded-lg bg-green-600 text-white mr-4">
                       <IconComponent className="w-6 h-6" />
                     </div>
                     <h3 className="text-xl font-semibold text-white">
                       {category.title}
                     </h3>
                   </div>
                   
                   <p className="text-gray-300 mb-4">
                     {category.description}
                   </p>
                   
                   <div className="mt-4 pt-4 border-t border-gray-600">
                     <span className="text-green-400 font-medium group-hover:text-green-300 transition-colors">
                       Start searching →
                     </span>
                   </div>
                 </div>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default SearchHub;
