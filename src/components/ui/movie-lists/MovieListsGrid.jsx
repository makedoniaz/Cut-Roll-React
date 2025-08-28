import SectionHeading from "../common/SectionHeading";
import MovieListCard from "./MovieListCard";
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const MovieListsGrid = ({heading, itemsPerRow, rows, movieLists}) => {
  return (
    <div className="py-2">
        <div className="max-w-7xl mx-auto">
            {heading && <SectionHeading heading={heading}/>}
            <div>
                <PaginatedGridContainer
                items={movieLists}
                itemsPerRow={itemsPerRow}
                rows={rows}
                renderItem={(movieList) => <MovieListCard list={movieList} />}
                itemHeight="h-60"
                itemWidth="w-58"
                justify="justify-between"
                />
            </div>
        </div>
    </div>
  );
};

export default MovieListsGrid