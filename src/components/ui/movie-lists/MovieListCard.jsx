import AuthorInfo from "./AuthorInfo";
import ListStats from "./ListStats";
import MovieListPoster from "./MovieListPoster";


const MovieListCard = ({ list }) => {
  return (
    <div className="group cursor-pointer">
      <div className="mb-4">
        <MovieListPoster images={list.coverImages} title={list.title} />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-white font-semibold text-lg leading-tight group-hover:text-blue-400 transition-colors">
          {list.title}
        </h3>
        
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

export default MovieListCard