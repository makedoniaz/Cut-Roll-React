import MovieList from "../components/ui/movies/MovieList";
import NewsFeed from "../components/ui/news/NewsFeed";

const Home = () => {
  const movies = [
    { id: 1, title: 'The Matrix Reloaded', year: 2003, poster: '🎬', rating: 4 },
    { id: 2, title: 'Inception Dreams', year: 2010, poster: '🎭', rating: 5 },
    { id: 3, title: 'Interstellar Journey', year: 2014, poster: '🚀', rating: 5 },
    { id: 4, title: 'The Dark Knight Rises', year: 2012, poster: '🦇', rating: 4 },
    { id: 5, title: 'Pulp Fiction Classic', year: 1994, poster: '🔫', rating: 5 },
  ];


  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome to CutRoll</h1>

      <MovieList heading={"NEW ON CUT-N-ROLL"} rows={1} itemsPerRow={5} movies={movies} />
      <MovieList heading={"POPULAR ON CUT-N-ROLL"} rows={1} itemsPerRow={5} movies={movies} />
      <NewsFeed />
    </div>
  );
};

export default Home;