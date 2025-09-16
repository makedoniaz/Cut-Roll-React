import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import { WatchService } from '../services/watchService';
import { MovieLikeService } from '../services/movieLikeService';
import { WatchedService } from '../services/watchedService';
import { UserService } from '../services/userService';
import { useAuthStore } from '../stores/authStore';

const UsersActionLists = () => {
    const { username, type } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user: currentUser } = useAuthStore();
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [targetUser, setTargetUser] = useState(null);
    const pageSize = 24; // Show more movies on the dedicated page

    // Configuration for different list types
    const listConfig = {
        'want-to-watch': {
            title: 'Want to Watch',
            description: 'Movies they want to watch',
            fetchFunction: WatchService.getWantToWatchByUser,
            emptyMessage: 'No movies in their watchlist yet',
            emptySubMessage: 'This user hasn\'t added any movies to their watchlist.',
            emptyIcon: '📋'
        },
        'recently-watched': {
            title: 'Recently Watched',
            description: 'Movies they have recently watched',
            fetchFunction: WatchedService.getWatchedByUser,
            emptyMessage: 'No watched movies yet',
            emptySubMessage: 'This user hasn\'t watched any movies yet.',
            emptyIcon: '👁️'
        },
        'recently-liked': {
            title: 'Recently Liked',
            description: 'Movies they have recently liked',
            fetchFunction: MovieLikeService.getLikedByUser,
            emptyMessage: 'No liked movies yet',
            emptySubMessage: 'This user hasn\'t liked any movies yet.',
            emptyIcon: '💚'
        }
    };

    const config = listConfig[type];

    useEffect(() => {
        if (!config) {
            setError('Invalid list type');
            setLoading(false);
            return;
        }

        if (!isAuthenticated || !currentUser?.id) {
            navigate('/login');
            return;
        }

        if (!username) {
            setError('Username is required');
            setLoading(false);
            return;
        }

        fetchUserAndMovies();
    }, [type, isAuthenticated, currentUser?.id, username, page]);

    const fetchUserAndMovies = async () => {
        try {
            if (page === 0) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            // First, get the user by username to get their ID
            const userData = await UserService.getUserByUsername(username);
            setTargetUser(userData);

            // Then fetch their movies
            const response = await config.fetchFunction({
                userId: userData.id,
                page: page,
                pageSize: pageSize
            });

            // Handle different possible response formats
            let fetchedMovies = [];
            if (response && typeof response === 'object') {
                if (Array.isArray(response)) {
                    fetchedMovies = response;
                } else if (response.movies && Array.isArray(response.movies)) {
                    fetchedMovies = response.movies;
                } else if (response.data && Array.isArray(response.data)) {
                    fetchedMovies = response.data;
                }
            }

            // Transform the response to match the expected movie format
            const transformedMovies = fetchedMovies.map(item => {
                // Handle different item structures
                const movie = item.movie || item;
                
                return {
                    id: movie.movieId || movie.id,
                    title: movie.title,
                    year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'TBA',
                    poster: movie.poster || null,
                    rating: 0 // API doesn't provide rating in this response
                };
            });

            if (page === 0) {
                setMovies(transformedMovies);
            } else {
                setMovies(prev => [...prev, ...transformedMovies]);
            }

            setHasMore(transformedMovies.length === pageSize);
        } catch (error) {
            console.error(`Error fetching ${config.title} movies for user ${username}:`, error);
            setError(`Failed to fetch ${config.title.toLowerCase()} movies for ${username}`);
        } finally {
            if (page === 0) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">Invalid list type</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error}</div>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => {
                                setError(null);
                                setPage(0);
                                fetchUserAndMovies();
                            }}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => navigate(`/profile/${username}`)}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Back to Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(`/profile/${username}`)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        ← Back to Profile
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-white">
                    {targetUser ? `${targetUser.username}'s ${config.title}` : config.title}
                </h1>
            </div>

            {/* List Description */}
            <div className="mb-8">
                <p className="text-lg text-gray-300 max-w-4xl leading-relaxed">
                    {targetUser ? (
                        <>
                            {config.description.split('they').map((part, index, array) => (
                                <React.Fragment key={index}>
                                    {part}
                                    {index < array.length - 1 && (
                                        <Link 
                                            to={`/profile/${targetUser.username}`}
                                            className="text-green-400 hover:text-green-300 transition-colors duration-200"
                                        >
                                            {targetUser.username}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </>
                    ) : (
                        config.description
                    )}
                </p>
            </div>

            {/* Movies Grid */}
            {loading && page === 0 ? (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-white text-xl">Loading movies...</div>
                </div>
            ) : movies.length > 0 ? (
                <div className="mb-10">
                    <MovieGrid 
                        heading={
                            targetUser ? (
                                <>
                                    <Link 
                                        to={`/profile/${targetUser.username}`}
                                        className="text-green-400 hover:text-green-300 transition-colors duration-200"
                                    >
                                        {targetUser.username}
                                    </Link>
                                    's {config.title} ({movies.length})
                                </>
                            ) : (
                                `${config.title} (${movies.length})`
                            )
                        }
                        rows={Math.ceil(movies.length / 6)} 
                        itemsPerRow={6} 
                        movies={movies} 
                        CardComponent={SmallMovieCard}
                        showMore={false}
                    />
                    
                    {/* Load More Button */}
                    {hasMore && (
                        <div className="text-center mt-8">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loadingMore ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Loading...
                                    </div>
                                ) : (
                                    'Load More'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">{config.emptyIcon}</div>
                    <h2 className="text-2xl font-semibold text-gray-300 mb-2">{config.emptyMessage}</h2>
                    <p className="text-gray-500">{config.emptySubMessage}</p>
                    <div className="mt-6">
                        <button
                            onClick={() => navigate(`/profile/${username}`)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Back to Profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersActionLists;
