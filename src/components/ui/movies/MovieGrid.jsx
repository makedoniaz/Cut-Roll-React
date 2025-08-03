import MovieCard from "./MovieCard"
import SectionHeading from '../common/SectionHeading';
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const MovieGrid = ({itemsPerRow, rows, movies, heading}) => {
    return ( 
        <div className="py-8">
            <div className="max-w-7xl mx-auto">
                <SectionHeading heading={heading}/>
                <div>
                    <PaginatedGridContainer
                    items={movies}
                    itemsPerRow={itemsPerRow}
                    rows={rows}
                    renderItem={(movie) => <MovieCard movie={movie} />}
                    itemHeight="h-64"
                    gap="gap-6"
                    />
                </div>
            </div>
        </div>
    );
}
 
export default MovieGrid;