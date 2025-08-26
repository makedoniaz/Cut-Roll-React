import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewsCard from "./NewsCard";
import { NewsService } from "../../../services/newsService";

const NewsFeed = () => {
  const navigate = useNavigate();
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentNews = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch recent news using pagination with 6 items
        const newsData = await NewsService.getNewsByPagination(0, 6);
        setNewsItems(newsData.data || []);
      } catch (err) {
        console.error('Error fetching recent news:', err);
        setError('Failed to load recent news');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentNews();
  }, []);

  const handleReadMore = (newsId) => {
    navigate(`/news/${newsId}`);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-700 rounded-lg overflow-hidden h-full">
              <div className="aspect-video bg-gray-600"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-600 rounded w-24"></div>
                <div className="h-6 bg-gray-600 rounded w-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                </div>
                <div className="h-4 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 text-lg mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No news available
  if (newsItems.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg">No recent news available</div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((item) => (
          <NewsCard
            key={item.id}
            image={item.photoUrl || item.photo || "/news-placeholder.jpg"}
            category={item.authorName || "News"}
            categoryIcon="📰"
            title={item.title}
            description={item.content}
            hasVideo={false}
            onReadMore={() => handleReadMore(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;