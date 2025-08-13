import MovieCard from "./MovieCard"
import SectionHeading from '../common/SectionHeading';
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const MovieGrid = ({
    itemsPerRow, 
    rows, 
    movies, 
    heading, 
    CardComponent = MovieCard  // Default to MovieCard if not provided
}) => {
    return ( 
        <div className="py-2">
            <div className="max-w-7xl mx-auto">
                <SectionHeading heading={heading}/>
                <div>
                    <PaginatedGridContainer
                    items={movies}
                    itemsPerRow={itemsPerRow}
                    rows={rows}
                    renderItem={(movie) => <CardComponent movie={movie} />}
                    itemHeight="h-66"
                    gap="gap-6"
                    />
                </div>
            </div>
        </div>
    );
}
 
export default MovieGrid;