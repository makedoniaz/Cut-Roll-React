import MovieCard from "./MovieCard"
import ListSectionHeading from '../common/ListSectionHeading';
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const ListMovieGrid = ({
    itemsPerRow, 
    rows, 
    movies, 
    heading, 
    CardComponent = MovieCard,  // Default to MovieCard if not provided
    loading = false,
    onAddMoviesClick,
    showAddMovies = true
}) => {
    return ( 
        <div className="py-2">
            <div className="max-w-7xl mx-auto">
                <ListSectionHeading 
                    heading={heading} 
                    onAddMoviesClick={onAddMoviesClick} 
                    showAddMovies={showAddMovies}
                />
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
                        ) : null
                    )}
                </div>
            </div>
        </div>
    );
}
 
export default ListMovieGrid;
