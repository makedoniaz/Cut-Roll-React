import { ChevronLeft, ChevronRight } from 'lucide-react';
import { THEME } from "../../constants/index.js";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) => {
  const goToPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };
  
  const goToNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={goToPrevious}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        style={{ backgroundColor: "#1E2939" }}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
            currentPage === pageNum
              ? 'text-white shadow-lg transform scale-105'
              : 'text-gray-300 hover:text-white hover:scale-105'
          }`}
          style={{
            backgroundColor: currentPage === pageNum ? THEME.COLORS.PRIMARY : "#1E2939",
            borderColor: currentPage === pageNum ? THEME.COLORS.PRIMARY : '#4a5568'
          }}
        >
          {pageNum}
        </button>
      ))}
      
      <button
        onClick={goToNext}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border-2 border-gray-600 text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        style={{ backgroundColor: "#1E2939" }}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination