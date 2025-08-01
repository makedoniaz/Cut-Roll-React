import { THEME } from "../../constants/index.js";

const Grid = ({ 
  items, 
  itemsPerRow, 
  rows, 
  renderItem,
  itemHeight = 'h-64',
  gap = 'gap-4',
  className = '' 
}) => {
  const totalSlots = itemsPerRow * rows;
  
  return (
    <div 
      className={`grid ${gap} ${className}`} 
      style={{ 
        gridTemplateColumns: `repeat(${itemsPerRow}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }}
    >
      {Array.from({ length: totalSlots }).map((_, index) => {
        const item = items[index];
        return (
          <div key={index} className={`w-full ${itemHeight}`}>
            {item ? (
              renderItem ? renderItem(item, index) : (
                <div 
                  className="w-full h-full rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium"
                  style={{ backgroundColor: THEME.COLORS.DARK_LIGHTER }}
                >
                  Item {index + 1}
                </div>
              )
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Grid