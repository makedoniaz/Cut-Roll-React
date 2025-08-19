import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";

const Lists = () => {

      const movieLists = [
  {
    id: 1,
    title: "Feminist Horror Starter Pack",
    author: {
      name: "Horrorville",
      avatar: "🎭"
    },
    stats: {
      films: 20,
      likes: 2100,
      comments: 24
    },
    coverImages: [
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop"
    ]
  },
  {
    id: 2,
    title: "That was their first movie???",
    author: {
      name: "Bailey",
      avatar: "👤"
    },
    stats: {
      films: 46,
      likes: 1500,
      comments: 76
    },
    coverImages: [
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
    ]
  },
  {
    id: 3,
    title: "New York Times' 100 Best Movies of the 21st Century",
    author: {
      name: "Mogwai_Synth",
      avatar: "🎬"
    },
    stats: {
      films: 100,
      likes: 2200,
      comments: 282
    },
    coverImages: [
      "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop"
    ]
  },
    {
    id: 4,
    title: "That was their first movie???",
    author: {
      name: "Bailey",
      avatar: "👤"
    },
    stats: {
      films: 46,
      likes: 1500,
      comments: 76
    },
    coverImages: [
      "https://images.unsplash.com/photo-1489599538824-2e2b8e3a5f3a?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop"
    ]
    },
    ];

    return (
        <div className>
            <MovieListsGrid heading={"POPULAR LISTS"} rows={1} itemsPerRow={4} movieLists={movieLists}/>
            <MovieListsGrid heading={"LIKED LISTS"} rows={1} itemsPerRow={4} movieLists={movieLists}/>
            <MovieListsGrid heading={"POPULAR LISTS"} rows={1} itemsPerRow={4} movieLists={movieLists}/>
        </div>
    );
};

export default Lists;