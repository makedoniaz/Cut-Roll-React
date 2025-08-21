const CategoryBadge = ({ category }) => {
  // Define category colors
  const getCategoryColor = (category) => {
    const colors = {
      'Movie News': 'bg-blue-600',
      'Awards': 'bg-yellow-600',
      'Industry Analysis': 'bg-purple-600',
      'Indie Films': 'bg-green-600',
      'Technology': 'bg-indigo-600',
      'Reviews': 'bg-red-600',
      'Interviews': 'bg-pink-600',
      'Box Office': 'bg-orange-600'
    };
    
    return colors[category] || 'bg-gray-600';
  };

  return (
    <span className={`${getCategoryColor(category)} text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg`}>
      {category}
    </span>
  );
};

export default CategoryBadge;
