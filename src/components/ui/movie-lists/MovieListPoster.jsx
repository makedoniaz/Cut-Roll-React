import MoviePoster from "../movies/MoviePoster";

const MovieListPoster = ({ images, title }) => {
  const postersToShow = images.slice(0, 5); // max 5 posters

  return (
    <div className="relative w-full h-32 flex items-end">
      {postersToShow.map((image, index) => (
        <div
          key={index}
          className="absolute w-20 h-28 rounded-md overflow-hidden shadow-lg border border-gray-800"
          style={{
            left: `${index * 64}px`, // adjust spacing between posters
            zIndex: index,
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