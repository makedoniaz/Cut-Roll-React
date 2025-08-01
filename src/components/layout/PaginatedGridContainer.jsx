import { useState, useMemo } from 'react';
import Pagination from '../ui/Pagination';
import Grid from './Grid';

const PaginatedGridContainer = ({
  items = [],
  itemsPerRow = 6,
  rows = 2,
  renderItem,
  itemHeight = 'h-64',
  gap = 'gap-4',
  showPagination = true,
  showPageInfo = true,
  className = '',
  gridClassName = '',
  paginationClassName = '',
  pageInfoClassName = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = itemsPerRow * rows;
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  return (
    <div className={`w-full ${className}`}>
      <Grid
        items={paginatedData}
        itemsPerRow={itemsPerRow}
        rows={rows}
        renderItem={renderItem}
        itemHeight={itemHeight}
        gap={gap}
        className={`mb-6 ${gridClassName}`}
      />
      
      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className={`mb-4 ${paginationClassName}`}
        />
      )}
    </div>
  );
};

export default PaginatedGridContainer