const MoviePoster = ({ src, alt, className = "" }) => {
  return (
    <div className={`relative overflow-hidden rounded-md ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};

export default MoviePoster