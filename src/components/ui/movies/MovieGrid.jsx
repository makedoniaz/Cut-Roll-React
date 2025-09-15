import MovieCard from "./MovieCard"
import SectionHeading from '../common/SectionHeading';
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const MovieGrid = ({
    itemsPerRow, 
    rows, 
    movies, 
    heading, 
    CardComponent = MovieCard,  // Default to MovieCard if not provided
    loading = false,
    onMoreClick,
    showMore = true,
    emptyStateMessage = null,
    emptyStateIcon = null
}) => {
    return ( 
        <div className="py-2">
            <div className="max-w-7xl mx-auto">
                <SectionHeading heading={heading} onMoreClick={onMoreClick} showMore={showMore}/>
                <div>
                    {loading ? (
                        <div className="grid grid-cols-6 gap-6">
                            {Array.from({ length: itemsPerRow * rows }).map((_, index) => (
                                <div key={index} className="h-64 bg-gray-800 rounded-lg animate-pulse">
                                    <div className="w-full h-full bg-gray-700 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        movies && movies.length > 0 ? (
                            <PaginatedGridContainer
                                items={movies}
                                itemsPerRow={itemsPerRow}
                                rows={rows}
                                renderItem={(movie) => <CardComponent movie={movie} />}
                                itemHeight="h-64"
                                gap="gap-6"
                            />
                        ) : (
                            emptyStateMessage ? (
                                <div className="text-center py-8 text-gray-400">
                                    {emptyStateIcon && <div className="text-4xl mb-2">{emptyStateIcon}</div>}
                                    <p>{emptyStateMessage}</p>
                                </div>
                            ) : null
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
 
export default MovieGrid;