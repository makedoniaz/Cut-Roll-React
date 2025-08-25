import { useState } from "react";

const SearchTypesList = ({ 
  onItemSelect, 
  activeItem = 'All',
  className = '' 
}) => {
  const [selectedItem, setSelectedItem] = useState(activeItem);

  const menuItems = [
    { id: 'films', label: 'Movies' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'lists', label: 'Lists' },
    { id: 'production-companies', label: 'Production Companies' },
    { id: 'news', label: 'News' },
    { id: 'crew', label: 'Cast' },
    { id: 'cast', label: 'Crew' },
  ];

  const handleItemClick = (item) => {
    setSelectedItem(item.id);
    onItemSelect?.(item);
  };

  return (
    <div className={`bg-gray-800 text-white ${className}`}>
      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item) => (
            <button
                onClick={handleItemClick}
                className={`
                    w-full px-4 py-2 text-left text-sm transition-colors duration-150
                    ${selectedItem 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                `}
                >
                {item.label}
            </button>
        ))}
      </div>
    </div>
  );
};

export default SearchTypesList;