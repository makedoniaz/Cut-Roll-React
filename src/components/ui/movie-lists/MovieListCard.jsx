import { useNavigate } from 'react-router-dom';
import AuthorInfo from "./AuthorInfo";
import ListStats from "./ListStats";
import MovieListPoster from "./MovieListPoster";

const MovieListCard = ({ list }) => {
  const navigate = useNavigate();

  const handleListClick = () => {
    navigate(`/lists/${list.id}`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation(); // Prevent list click
    navigate(`/profile/${list.author.name}`);
  };

  return (
    <div className="group flex flex-col h-full">
      {/* Clickable poster and title section */}
      <div 
        className="cursor-pointer group/list-section"
        onClick={handleListClick}
      >
        <div className="">
          <MovieListPoster images={list.coverImages} title={list.title} />
        </div>

        <h3 className="text-white font-semibold text-lg leading-tight group-hover/list-section:text-green-400 transition-colors w-60 mb-2">
          {list.title}
        </h3>
      </div>
    
      <div className="mt-auto space-y-2">
        {/* Clickable author section */}
        <div onClick={handleAuthorClick} className="cursor-pointer">
          <AuthorInfo author={list.author} />
        </div>
        
        <ListStats 
          films={list.stats.films}
          likes={list.stats.likes}
        />
      </div>
    </div>
  );
};

export default MovieListCard;