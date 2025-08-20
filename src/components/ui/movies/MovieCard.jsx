import { THEME } from "../../../constants/index.js";
import { useNavigate } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  
  // Handle both old and new data formats
  const movieId = movie.movieId || movie.id;
  
  // Handle click to navigate to movie details
  const handleClick = () => {
    if (movieId) {
      navigate(`/movie/${movieId}`);
    }
  };

  return (
    <div 
      className="w-58 h-full rounded-xl shadow-lg cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2"
      style={{ 
        backgroundColor: "#1E2939",
        borderColor: THEME.COLORS.DARK,
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div 
        className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${THEME.COLORS.PRIMARY}99, ${THEME.COLORS.ACCENT}99)`
        }}
      >
        <span className="text-4xl filter drop-shadow-lg">{movie.poster}</span>
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            background: `linear-gradient(45deg, ${THEME.COLORS.SECONDARY}33, transparent)`
          }}
        />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-2">{movie.title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">{movie.year}</span>
          <div className="flex" style={{ color: THEME.COLORS.SECONDARY }}>
            {'★'.repeat(Math.floor(movie.rating || 4))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard