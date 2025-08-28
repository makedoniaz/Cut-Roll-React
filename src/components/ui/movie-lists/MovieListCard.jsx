import { useNavigate } from 'react-router-dom';
import AuthorInfo from "./AuthorInfo";
import ListStats from "./ListStats";
import MovieListPoster from "./MovieListPoster";

const MovieListCard = ({ list }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/lists/${list.id}`);
  };

  return (
    <div 
      className="group cursor-pointer flex flex-col h-full"
      onClick={handleClick}
    >
      <div className="">
        <MovieListPoster images={list.coverImages} title={list.title} />
      </div>

      <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-blue-400 transition-colors w-60">
        {list.title}
      </h3>
    
      <div className="mt-auto space-y-2">
        <AuthorInfo author={list.author} />
        
        <ListStats 
          films={list.stats.films}
          likes={list.stats.likes}
          comments={list.stats.comments}
        />
      </div>
    </div>
  );
};

export default MovieListCard;