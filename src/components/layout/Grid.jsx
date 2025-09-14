import { THEME } from "../../constants/index.js";

const Grid = ({ 
  items, 
  itemsPerRow, 
  rows, 
  renderItem,
  itemHeight = 'h-64',
  gap = 'gap-4',
  className = '',
  itemWidth = 'w-48',
  justify
}) => {
  const totalSlots = itemsPerRow * rows;
  
  // Разбиваем элементы по строкам
  const itemsByRows = [];
  for (let i = 0; i < rows; i++) {
    const startIndex = i * itemsPerRow;
    const endIndex = startIndex + itemsPerRow;
    itemsByRows.push(Array.from({ length: itemsPerRow }).map((_, index) => {
      const itemIndex = startIndex + index;
      return items[itemIndex] || null;
    }));
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {itemsByRows.map((rowItems, rowIndex) => (
        <div 
          key={rowIndex}
          className={`flex items-start ${gap}`}
        >
          {rowItems.map((item, itemIndex) => {
            const globalIndex = rowIndex * itemsPerRow + itemIndex;
            return (
              <div key={globalIndex} className={`${itemHeight} ${itemWidth}`}>
                {item ? (
                  renderItem ? renderItem(item, globalIndex) : (
                    <div 
                      className="h-full rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium"
                      style={{ backgroundColor: THEME.COLORS.DARK_LIGHTER }}
                    >
                      Item {globalIndex + 1}
                    </div>
                  )
                ) : (
                  <div className="h-full" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Grid;