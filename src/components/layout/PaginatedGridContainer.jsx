import { useState, useMemo } from 'react';
import Pagination from '../ui/common/Pagination';
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
  pageInfoClassName = '',
  itemWidth = 'w-48',
  justify = "justify-start",
  // New props for external pagination control
  currentPage: externalCurrentPage,
  totalPages: externalTotalPages,
  onPageChange: externalOnPageChange,
  useExternalPagination = false
}) => {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  
  // Use external pagination if provided, otherwise use internal
  const currentPage = useExternalPagination ? externalCurrentPage : internalCurrentPage;
  const totalPages = useExternalPagination ? externalTotalPages : Math.ceil(items.length / (itemsPerRow * rows));
  
  const itemsPerPage = itemsPerRow * rows;
  
  const paginatedData = useMemo(() => {
    if (useExternalPagination) {
      // For external pagination, show all items (pagination is handled externally)
      return items;
    } else {
      // For internal pagination, slice the items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return items.slice(startIndex, endIndex);
    }
  }, [items, currentPage, itemsPerPage, useExternalPagination]);
  
  const handlePageChange = (page) => {
    if (useExternalPagination && externalOnPageChange) {
      externalOnPageChange(page);
    } else {
      setInternalCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <Grid
        items={paginatedData}
        itemsPerRow={itemsPerRow}
        rows={rows}
        renderItem={renderItem}
        itemHeight={itemHeight}
        itemWidth={itemWidth}
        gap={gap}
        className={`mb-6 ${gridClassName}`}
        justify={justify}
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