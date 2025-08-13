const TinyMovieCard = ({ movie }) => {
  return (
    <div className="group cursor-pointer min-w-0">
      <div className="relative overflow-hidden rounded-md shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg">
        <img 
          src={'/poster-placeholder.png'}
          alt={movie.title}
          className="w-full min-w-0 object-cover transition-all duration-200 group-hover:brightness-110"
        />
        
        {/* Optional overlay on hover */}
        <div className="absolute group-hover:bg-opacity-20 transition-all duration-200"></div>
      </div>
    </div>
  );
};

export default TinyMovieCard;