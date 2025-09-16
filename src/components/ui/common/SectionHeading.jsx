import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const SectionHeading = ({ heading, onMoreClick, showMore = true, onRefreshClick, showRefresh = false, isRefreshing = false }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleMoreClick = async () => {
        if (onMoreClick) {
            setIsLoading(true);
            try {
                await onMoreClick();
            } finally {
                setIsLoading(false);
            }
        }
    };

    return ( 
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-base font-medium text-gray-400 tracking-wider">{heading}</h2>
                <div className="flex items-center gap-3">
                    {showRefresh && (
                        <button 
                            onClick={onRefreshClick}
                            disabled={isRefreshing}
                            className="p-1 text-gray-400 hover:text-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Refresh recommendations"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                    {showMore && (
                        <button 
                            onClick={handleMoreClick}
                            disabled={isLoading}
                            className="cursor-pointer font-medium text-gray-400 hover:text-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'LOADING...' : 'MORE'}
                        </button>
                    )}
                </div>
            </div>
            <hr className="border-t border-gray-700 my-4 mb-8" />
        </div>
    );
}
 
export default SectionHeading;