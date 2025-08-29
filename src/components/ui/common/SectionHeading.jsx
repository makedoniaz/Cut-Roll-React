import { useState } from 'react';

const SectionHeading = ({ heading, onMoreClick, showMore = true }) => {
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
            <hr className="border-t border-gray-700 my-4 mb-8" />
        </div>
    );
}
 
export default SectionHeading;