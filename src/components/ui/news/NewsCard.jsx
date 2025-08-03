import CategoryBadge from "./CategoryBadge";
import truncateText from "../../../utils/text"

import { Play } from 'lucide-react';
import { THEME } from "../../../constants/index"

const NewsCard = ({ 
  image, 
  category, 
  categoryIcon,
  title, 
  description, 
  hasVideo = false,
  onReadMore 
}) => {
  return (
    <div
      style={{ backgroundColor: THEME.COLORS.MAIN_GRAY }}
      className="rounded-lg overflow-hidden transition-transform transition-colors duration-300 hover:scale-105 h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-gray-800 cursor-pointer">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-60 rounded-full p-4 hover:bg-opacity-80 transition-all">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col">
        <CategoryBadge category={category} icon={categoryIcon} />
        
        <h3 className="text-xl font-bold text-white mb-3 leading-tight cursor-pointer">
          {title}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-1">
          {truncateText(description)}
        </p>
        
        <button 
          onClick={onReadMore}
          className="text-sm font-medium hover:text-green-400 transition-colors self-start cursor-pointer text-green-500"
        >
          READ MORE
        </button>
      </div>
    </div>
  );
};

export default NewsCard