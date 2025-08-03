import SectionHeading from "../common/SectionHeading";
import MovieListCard from "./MovieListCard";
import PaginatedGridContainer from '../../layout/PaginatedGridContainer';

const MovieListsGrid = ({heading, itemsPerRow, rows, movieLists}) => {
  return (
    <div className="py-8">
        <div className="max-w-7xl mx-auto">
            <SectionHeading heading={heading}/>
            <div>
                <PaginatedGridContainer
                items={movieLists}
                itemsPerRow={itemsPerRow}
                rows={rows}
                renderItem={(movieList) => <MovieListCard list={movieList} />}
                itemHeight="h-52"
                gap="gap-12"
                />
            </div>
        </div>
    </div>
  );
};

export default MovieListsGrid