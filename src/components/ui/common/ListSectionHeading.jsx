import { useState } from 'react';
import { Plus } from 'lucide-react';

const ListSectionHeading = ({ heading, onAddMoviesClick, showAddMovies = true }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleAddMoviesClick = async () => {
        if (onAddMoviesClick) {
            setIsLoading(true);
            try {
                await onAddMoviesClick();
            } finally {
                setIsLoading(false);
            }
        }
    };

    return ( 
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-base font-medium text-gray-400 tracking-wider">{heading}</h2>
                {showAddMovies && (
                    <button 
                        onClick={handleAddMoviesClick}
                        disabled={isLoading}
                        className="cursor-pointer font-medium text-gray-400 hover:text-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        {isLoading ? 'LOADING...' : 'ADD MOVIES'}
                    </button>
                )}
            </div>
            <hr className="border-t border-gray-700 my-4 mb-8" />
        </div>
    );
}
 
export default ListSectionHeading;
