import MoviePoster from "../movies/MoviePoster";

const MovieListPoster = ({ images, title }) => {
  const postersToShow = images.slice(0, 5); // max 5 posters

  return (
    <div 
      className="relative h-28 flex items-end"
      style={{
        width: `${80 + (postersToShow.length - 1) * 50}px`, // ширина первого постера + отступы остальных
      }}
    >
      {postersToShow.map((image, index) => (
        <div
          key={index}
          className="absolute w-20 h-28 rounded-md overflow-hidden shadow-lg border border-gray-800"
          style={{
            left: `${index * 50}px`, // adjust spacing between posters
            zIndex: postersToShow.length - index, // первая фотка будет иметь наивысший zIndex
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