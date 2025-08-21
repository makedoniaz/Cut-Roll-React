import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';
import { useAuthStore } from '../../stores/authStore';

const NewsFeed = ({ type = 'all', userId = null, loading, setLoading }) => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuthStore();

  // Mock news data - replace with actual API calls
  const mockNews = [
    {
      id: 1,
      title: "New Marvel Movie Announced: 'Avengers: Secret Wars'",
      excerpt: "Marvel Studios has officially announced the next Avengers film, set to bring together heroes from across the multiverse in an epic battle against a mysterious new threat.",
      content: "Marvel Studios has officially announced the next Avengers film, set to bring together heroes from across the multiverse in an epic battle against a mysterious new threat. The film, titled 'Avengers: Secret Wars', will be directed by Destin Daniel Cretton and is expected to feature the largest ensemble cast in Marvel history.",
      author: {
        id: 1,
        name: "John Smith",
        avatar: null
      },
      publishedAt: "2024-01-15T10:30:00Z",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
      category: "Movie News",
      readTime: "3 min read",
      likes: 1247,
      comments: 89,
      isPublished: true
    },
    {
      id: 2,
      title: "Christopher Nolan's 'Oppenheimer' Sweeps Golden Globes",
      excerpt: "The biographical drama about J. Robert Oppenheimer won seven awards including Best Motion Picture - Drama and Best Director.",
      content: "Christopher Nolan's 'Oppenheimer' dominated the 81st Golden Globe Awards, winning seven awards including Best Motion Picture - Drama, Best Director for Nolan, and Best Actor - Drama for Cillian Murphy. The film's success marks a significant achievement for both Nolan and the biographical drama genre.",
      author: {
        id: 2,
        name: "Sarah Johnson",
        avatar: null
      },
      publishedAt: "2024-01-14T15:45:00Z",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
      category: "Awards",
      readTime: "4 min read",
      likes: 892,
      comments: 156,
      isPublished: true
    },
    {
      id: 3,
      title: "Streaming Wars: Netflix vs Disney+ - Who's Winning?",
      excerpt: "A comprehensive analysis of the streaming landscape and which platform is leading in subscriber growth and content quality.",
      content: "The streaming wars continue to heat up as Netflix and Disney+ battle for dominance in the crowded streaming market. While Netflix maintains its lead in total subscribers, Disney+ has shown impressive growth in recent quarters, particularly in family-friendly content and original programming.",
      author: {
        id: 3,
        name: "Mike Chen",
        avatar: null
      },
      publishedAt: "2024-01-13T09:15:00Z",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
      category: "Industry Analysis",
      readTime: "6 min read",
      likes: 567,
      comments: 43,
      isPublished: true
    },
    {
      id: 4,
      title: "Indie Film 'Past Lives' Gets Oscar Buzz",
      excerpt: "The Korean-American romantic drama has been receiving critical acclaim and is generating early Oscar buzz for its intimate storytelling.",
      content: "Celine Song's directorial debut 'Past Lives' has been making waves in the film festival circuit, receiving critical acclaim for its intimate storytelling and authentic portrayal of Korean-American identity. The film's success has generated early Oscar buzz, particularly for its screenplay and lead performances.",
      author: {
        id: 4,
        name: "Emily Rodriguez",
        avatar: null
      },
      publishedAt: "2024-01-12T14:20:00Z",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
      category: "Indie Films",
      readTime: "5 min read",
      likes: 423,
      comments: 67,
      isPublished: true
    },
    {
      id: 5,
      title: "The Future of Cinema: How AI is Changing Filmmaking",
      excerpt: "Exploring the impact of artificial intelligence on the film industry, from script writing to post-production.",
      content: "Artificial intelligence is rapidly transforming the film industry, from AI-assisted script writing to automated post-production processes. While some filmmakers embrace these new technologies, others worry about their impact on creativity and human artistry. This article explores both perspectives and what the future might hold.",
      author: {
        id: 5,
        name: "David Kim",
        avatar: null
      },
      publishedAt: "2024-01-11T11:00:00Z",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=400&fit=crop",
      category: "Technology",
      readTime: "7 min read",
      likes: 789,
      comments: 112,
      isPublished: true
    }
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (type === 'user' && userId) {
          // Filter news by user ID (user's own articles)
          const userNews = mockNews.filter(article => article.author.id === userId);
          setNews(userNews);
        } else {
          // Show all published news
          const publishedNews = mockNews.filter(article => article.isPublished);
          setNews(publishedNews);
        }
      } catch (err) {
        setError('Failed to fetch news articles');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [type, userId, setLoading]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-6 animate-pulse">
            <div className="h-48 bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-800 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading News</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (news.length === 0) {
    if (type === 'user') {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Articles Yet</h3>
          <p className="text-gray-400 mb-4">
            You haven't published any news articles yet. Start sharing your thoughts with the community!
          </p>
          <button
            onClick={() => window.location.href = '/news/create'}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Create Your First Article
          </button>
        </div>
      );
    }
    
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📰</div>
        <h3 className="text-xl font-semibold text-white mb-2">No News Available</h3>
        <p className="text-gray-400">
          Check back later for the latest movie news and updates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {news.map((article) => (
        <NewsCard
          key={article.id}
          article={article}
          showAuthor={type === 'all'}
          showActions={type === 'user'}
        />
      ))}
    </div>
  );
};

export default NewsFeed;
