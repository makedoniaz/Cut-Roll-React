import SectionHeading from "../common/SectionHeading";
import MovieListCard from "./MovieListCard";

const MovieListsGrid = ({heading, itemsPerRow, rows, movieLists}) => {
  // Create rows dynamically based on actual movie lists count
  const actualItemsPerRow = itemsPerRow || 4; // Default to 4 items per row
  const actualRows = [];
  
  console.log('MovieListsGrid: Total movie lists:', movieLists.length);
  
  for (let i = 0; i < movieLists.length; i += actualItemsPerRow) {
    const rowItems = movieLists.slice(i, i + actualItemsPerRow);
    console.log(`Row ${Math.floor(i/actualItemsPerRow)}:`, rowItems.length, 'items');
    actualRows.push(rowItems);
  }
  
  console.log('MovieListsGrid: Total rows created:', actualRows.length);

  return (
    <div className="py-2">
        <div className="max-w-7xl mx-auto">
            {heading && <SectionHeading heading={heading}/>}
            <div>
                {/* Dynamic rows based on actual content */}
                <div className="space-y-6">
                  {actualRows.map((rowItems, rowIndex) => (
                    <div key={rowIndex} className="flex flex-wrap gap-6">
                      {rowItems.map((movieList, itemIndex) => (
                        <div key={movieList.id} className="w-full md:w-1/2 lg:w-1/4">
                          <MovieListCard list={movieList} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default MovieListsGrid