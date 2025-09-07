import MoviePoster from "../movies/MoviePoster";

const MovieListPoster = ({ images, title }) => {
  // Always show exactly 4 posters - mix of real movie posters and placeholders
  const realImages = images && images.length > 0 ? images.slice(0, 4) : [];
  const placeholdersNeeded = 4 - realImages.length;
  const placeholders = Array(placeholdersNeeded).fill('/poster-placeholder.png');
  const postersToShow = [...realImages, ...placeholders];

  return (
    <div 
      className="relative h-28 flex items-end"
      style={{
        width: `${80 + (4 - 1) * 50}px`, // Fixed width for 4 posters
      }}
    >
      {postersToShow.map((image, index) => (
        <div
          key={index}
          className="absolute w-20 h-28 rounded-md overflow-hidden shadow-lg border border-gray-800"
          style={{
            left: `${index * 50}px`, // adjust spacing between posters
            zIndex: 4 - index, // первая фотка будет иметь наивысший zIndex
          }}
        >
          <MoviePoster
            src={image}
            alt={`${title} poster ${index + 1}`}
            className="w-full h-full"
          />
        </div>
      ))}
    </div>
  );
};

export default MovieListPoster;