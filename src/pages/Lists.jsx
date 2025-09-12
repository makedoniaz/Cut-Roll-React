import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MovieListsGrid from "../components/ui/movie-lists/MovieListsGrid";
import TabNav from "../components/ui/common/TabNav";
import { useAuthStore } from "../stores/authStore";
import { ListsService } from "../services/listsService";
import { ListsLikeService } from "../services/listsLikeService";

const Lists = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('popular');
  const [popularLists, setPopularLists] = useState([]);
  const [myLists, setMyLists] = useState([]);
  const [likedLists, setLikedLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myListsLoading, setMyListsLoading] = useState(false);
  const [likedListsLoading, setLikedListsLoading] = useState(false);

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

  const fetchPopularLists = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching popular lists...');
      
      // For now, let's use a dummy userId to test the API
      // In a real scenario, you might want to create a different endpoint for popular lists
      const searchParams = {
        userId: null,
        title: null,
        fromDate: null,
        toDate: null,
        page: 1,
        pageSize: 10
      };
      
      console.log('📤 Search params:', searchParams);
      const result = await ListsService.searchLists(searchParams);
      console.log('📥 API result:', result);
      
      // Extract the data array from the API response
      const listsData = result.data || result.items || result || [];
      
      // Transform API data to match MovieListCard expected structure
      const transformedLists = listsData.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        coverImages: list.preview || [], // Use preview property from API for movie posters
        author: {
          name: list.userSimplified?.userName || 'Unknown',
          avatar: list.userSimplified?.avatarPath || '👤'
        },
        stats: {
          films: list.moviesCount || 0,
          likes: list.likesCount || 0,
          comments: 0 // API doesn't provide comments count yet
        }
      }));
      
      setPopularLists(transformedLists);
      console.log('✅ Popular lists set:', transformedLists);
    } catch (error) {
      console.error('❌ Error fetching popular lists:', error);
      // For now, fall back to mock data if API fails
      setPopularLists(movieLists);
    } finally {
      setLoading(false);
      console.log('🏁 Loading finished');
    }
  };

  const fetchMyLists = async () => {
    if (!user?.id) return;
    
    try {
      setMyListsLoading(true);
      console.log('🔍 Fetching my lists...');
      
      const params = {
        userId: user.id,
        page: 1,
        pageSize: 10
      };
      
      console.log('📤 My lists params:', params);
      const result = await ListsService.getListsByUser(params);
      console.log('📥 My lists result:', result);
      
      // Extract the data array from the API response
      const listsData = result.data || result.items || result || [];
      
      // Transform API data to match MovieListCard expected structure
      const transformedLists = listsData.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        coverImages: list.preview || [], // Use preview property from API for movie posters
        author: {
          name: list.userSimplified?.userName || 'Unknown',
          avatar: list.userSimplified?.avatarPath || '👤'
        },
        stats: {
          films: list.moviesCount || 0,
          likes: list.likesCount || 0,
          comments: 0 // API doesn't provide comments count yet
        }
      }));
      
      setMyLists(transformedLists);
      console.log('✅ My lists set:', transformedLists);
    } catch (error) {
      console.error('❌ Error fetching my lists:', error);
      setMyLists([]);
    } finally {
      setMyListsLoading(false);
      console.log('🏁 My lists loading finished');
    }
  };

  const fetchLikedLists = async () => {
    if (!user?.id) return;
    
    try {
      setLikedListsLoading(true);
      console.log('🔍 Fetching liked lists...');
      
      const params = {
        userId: user.id,
        page: null, // Will default to 1
        pageSize: null // Will default to 8
      };
      
      console.log('📤 Liked lists params:', params);
      const result = await ListsLikeService.getLikedLists(params);
      console.log('📥 Liked lists result:', result);
      
      // Extract the data array from the API response
      const listsData = result.data || result.items || result || [];
      
      // Transform API data to match MovieListCard expected structure
      const transformedLists = listsData.map(list => ({
        id: list.id,
        title: list.title,
        description: list.description,
        coverImages: list.preview || [], // Use preview property from API for movie posters
        author: {
          name: list.userSimplified?.userName || 'Unknown',
          avatar: list.userSimplified?.avatarPath || '👤'
        },
        stats: {
          films: list.moviesCount || 0,
          likes: list.likesCount || 0,
          comments: 0 // API doesn't provide comments count yet
        }
      }));
      
      setLikedLists(transformedLists);
      console.log('✅ Liked lists set:', transformedLists);
    } catch (error) {
      console.error('❌ Error fetching liked lists:', error);
      setLikedLists([]);
    } finally {
      setLikedListsLoading(false);
      console.log('🏁 Liked lists loading finished');
    }
  };

  useEffect(() => {
    fetchPopularLists();
    if (isAuthenticated && user?.id) {
      fetchMyLists();
      fetchLikedLists();
    }
  }, [isAuthenticated, user?.id]);

  const handleTabChange = (tabId) => {
    // For non-authenticated users, only allow 'popular' tab
    if (!isAuthenticated && (tabId === 'my' || tabId === 'liked')) {
      return;
    }
    setActiveTab(tabId);
  };

  const tabs = [
    { id: "popular", label: "Popular Lists" },
    ...(isAuthenticated ? [
      { id: "liked", label: "Liked Lists" },
      { id: "my", label: "My Lists" }
    ] : [])
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Create List Button */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Movie Lists</h1>
        <button
          onClick={() => navigate('/lists/create')}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Create List
        </button>
      </div>

      {/* Tab Navigation */}
      <TabNav 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showMoreButton={true}
        onMoreClick={() => {
          // Navigate to lists search page
          navigate('/lists/search');
        }}
      />

      {/* Content based on active tab */}
      <div className="min-h-96">
        {activeTab === 'popular' && (
          loading ? (
            <div className="text-center p-8">
              <div className="text-white text-xl">Loading popular lists...</div>
            </div>
          ) : (
            <MovieListsGrid 
              rows={Math.ceil(popularLists.length / 4)} 
              itemsPerRow={4} 
              movieLists={popularLists}
            />
          )
        )}
        
        {activeTab === 'liked' && isAuthenticated && (
          likedListsLoading ? (
            <div className="text-center p-8">
              <div className="text-white text-xl">Loading liked lists...</div>
            </div>
          ) : likedLists.length > 0 ? (
            <MovieListsGrid 
              rows={Math.ceil(likedLists.length / 4)} 
              itemsPerRow={4} 
              movieLists={likedLists}
            />
          ) : (
            <div className="text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="text-6xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Liked Lists
              </h3>
              <p className="text-gray-400 mb-4">
                Lists you've liked will appear here. Start liking movie lists to see them in this tab.
              </p>
            </div>
          )
        )}

                 {activeTab === 'my' && isAuthenticated && (
           myListsLoading ? (
             <div className="text-center p-8">
               <div className="text-white text-xl">Loading your lists...</div>
             </div>
           ) : myLists.length > 0 ? (
             <MovieListsGrid 
               rows={Math.ceil(myLists.length / 4)} 
               itemsPerRow={4} 
               movieLists={myLists}
             />
           ) : (
             <div className="text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
               <div className="text-6xl mb-4">📝</div>
               <h3 className="text-xl font-semibold text-white mb-2">
                 My Lists
               </h3>
               <p className="text-gray-400 mb-4">
                 Lists you've created will appear here. Create your first list to get started!
               </p>
               <button
                 onClick={() => navigate('/lists/create')}
                 className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
               >
                 Create Your First List
               </button>
             </div>
           )
         )}
      </div>

      {/* Welcome message for non-authenticated users */}
      {!isAuthenticated && (
        <div className="mt-12 text-center p-8 bg-gray-900 border border-gray-700 rounded-lg">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Want to create your own lists?
          </h3>
          <p className="text-gray-400 mb-4">
            Sign in to create movie lists, like other users' lists, and access all list features.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Sign In
          </button>
        </div>
      )}
    </div>
  );
};

export default Lists;