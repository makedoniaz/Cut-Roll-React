import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

const DropdownSectionHeading = ({ 
  heading, 
  onToggle, 
  isExpanded = false,
  onRefreshClick, 
  showRefresh = false, 
  isRefreshing = false,
  loading = false 
}) => {
  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isExpanded);
    }
  };

  return ( 
    <div>
      <div className="flex justify-between items-center">
        <h2 className="text-base font-medium text-gray-400 tracking-wider">{heading}</h2>
        <div className="flex items-center gap-3">
          {showRefresh && isExpanded && (
            <button 
              onClick={onRefreshClick}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button 
            onClick={handleToggle}
            disabled={loading}
            className="flex items-center gap-2 cursor-pointer font-medium text-gray-400 hover:text-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                LOADING...
              </>
            ) : (
              <>
                {isExpanded ? 'HIDE' : 'SHOW'}
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </>
            )}
          </button>
        </div>
      </div>
      <hr className="border-t border-gray-700 my-4 mb-8" />
    </div>
  );
}

export default DropdownSectionHeading;
