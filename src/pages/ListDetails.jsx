import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import CommentSection from "../components/ui/comments/CommentSection";

const ListDetails = () => {
    const mockComments = [
  {
    id: 1,
    author: {
      name: 'killer_guy',
      avatar: '/api/placeholder/32/32',
      timeAgo: '5d'
    },
    text: '@BLUEberryYUMMY die hard is also up there with those too.'
  },
  {
    id: 2,
    author: {
      name: 'BLUEberryYUMMY',
      avatar: '/api/placeholder/32/32',
      timeAgo: '5d'
    },
    text: 'EVENIN THOUGHTHH I am not a 100% on board with DIE HARD I have THAT DECENCY and RESPECT to recognise it AS ONE OF THEE most DEFINING ACTION MOVIES EVAA EAAAAA SO I will agree with YOU'
  },
  {
    id: 3,
    author: {
      name: 'usertro99',
      avatar: '/api/placeholder/32/32',
      timeAgo: '5d'
    },
    text: 'This morgan account commenting heaps is insufferably self-righteous and pretentious.'
  },
  {
    id: 4,
    author: {
      name: 'OmgeeAlice',
      avatar: '/api/placeholder/32/32',
      timeAgo: '5d'
    },
    text: 'I hate the fact that my top 5 fav movies are in this list despite me watching the most niche movie and not liking so maybe I just have basic taste idk'
  },
  {
    id: 5,
    author: {
      name: 'OmgeeAlice',
      avatar: '/api/placeholder/32/32',
      timeAgo: '3d'
    },
    text: 'Hey just found out I have the most basic film taste haha....(I am NOT happy)'
  },
  {
    id: 6,
    author: {
      name: 'matiix',
      avatar: '/api/placeholder/32/32',
      timeAgo: '3d'
    },
    text: 'having "basic" taste means you have good taste. :)) don\'t worry about those things, just enjoy movies and if your favorite movies are not russian films with a 0 dollar budget who cares?'
  },
  {
    id: 7,
    author: {
      name: 'Morgan',
      avatar: '/api/placeholder/32/32',
      timeAgo: '3d'
    },
    text: 'You rang? I wasn\'t even interested in this anymore. But since you asked... Onto the subject of "basic" = good taste, that must mean supersize corn syrup-laden products from Walmart are "good food". You can like it, but you\'re deluding yourself if you think it\'s good food—and worse, assert it 😤. It\'s junk.'
  }
];
    const movies = [
    {
      id: 1,
      title: "Punch-Drunk Love",
      year: "2002",
      poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "All About Lily Chou-Chou",
      year: "2001",
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Chungking Express",
      year: "1994",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 4,
      title: "Drive",
      year: "2011",
      poster: "https://images.unsplash.com/photo-1485095329183-d0797cdc5676?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 5,
      title: "I Saw the TV Glow",
      year: "2024",
      poster: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 6,
      title: "Frances Ha",
      year: "2012",
      poster: "https://images.unsplash.com/photo-1489945052260-4f21c52268b9?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 7,
      title: "Kiki's Delivery Service",
      year: "1989",
      poster: "https://images.unsplash.com/photo-1541963463532-d68292c34d19?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 8,
      title: "Lars and the Real Girl",
      year: "2007",
      poster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 9,
      title: "Lost in Translation",
      year: "2003",
      poster: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 10,
      title: "The Social Network",
      year: "2010",
      poster: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 11,
      title: "Pain and Glory",
      year: "2019",
      poster: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 12,
      title: "Red",
      year: "1994",
      poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 13,
      title: "Amélie",
      year: "2001",
      poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 14,
      title: "Moonlight",
      year: "2016",
      poster: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 15,
      title: "In the Mood for Love",
      year: "2000",
      poster: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 16,
      title: "Her",
      year: "2013",
      poster: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 17,
      title: "Rear Window",
      year: "1954",
      poster: "https://images.unsplash.com/photo-1489599894245-72f566442c8a?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 18,
      title: "The Apartment",
      year: "1960",
      poster: "https://images.unsplash.com/photo-1594736797933-d0bdb6fdb609?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 19,
      title: "Taxi Driver",
      year: "1976",
      poster: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=300&h=450&fit=crop&crop=center"
    },
    {
      id: 20,
      title: "Ghost World",
      year: "2001",
      poster: "https://images.unsplash.com/photo-1489945052260-4f21c52268b9?w=300&h=450&fit=crop&crop=center"
    }
    ];

    const handleAddComment = (comment) => {
        console.log('New comment added:', comment);
    };


    return (
    <div>
      {/* Header Section */}
        <div className="relative overflow-hidden">
            <div className="py-16">
            <div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Befriending the lyrical loneliness...
                </h1>
                <p className="text-lg md:text-xl text-gray-300 max-w-4xl leading-relaxed">
                Essential movies for lonely people out there (like me) if you want to feel something in this 
                big big world. To see every color, every character in desperate search for some human 
                warmth, to understand and befriend them as we ourselves are looking for 
                genuine connection.
                </p>
            </div>
            </div>
        </div>

        {/* Single Movie Grid */}
        <div>
            <div className="mb-10">
                <MovieGrid 
                heading="Essential Movies for Connection" 
                rows={4} 
                itemsPerRow={6} 
                movies={movies} 
                CardComponent={SmallMovieCard}
                />
            </div>
            <CommentSection 
          initialComments={mockComments}
          onAddComment={handleAddComment}
        />
        </div>
    </div>
  );
};

export default ListDetails;