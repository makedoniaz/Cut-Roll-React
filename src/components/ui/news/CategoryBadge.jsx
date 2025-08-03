const CategoryBadge = ({ category, icon }) => {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <span className="text-lg">{icon}</span>}
      <span className="text-sm font-medium text-gray-300">{category}</span>
    </div>
  );
};

export default CategoryBadge