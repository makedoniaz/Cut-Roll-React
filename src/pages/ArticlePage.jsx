import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NewsService } from "../services/newsService";
import { parseContentWithReferences } from "../utils/contentParser";
import { useAuthStore } from "../stores/authStore";

function ArticlePage() {
    const [copied, setCopied] = useState(false);
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parsedContent, setParsedContent] = useState({ text: '', references: [] });
    const [isLiking, setIsLiking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) {
                setError('No article ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('Fetching article with ID:', id);
                const articleData = await NewsService.getNewsById(id);
                console.log('Article data received:', articleData);
                setArticle(articleData);
                
                // Parse content with references
                if (articleData.content) {
                    const parsed = parseContentWithReferences(articleData.content, articleData.newsReferences || []);
                    setParsedContent(parsed);
                    console.log('Parsed content:', parsed);
                }

                // Check if the article is liked by the current user
                if (isAuthenticated) {
                    try {
                        const likedStatus = await NewsService.getIsLikedArticle(id);
                        setIsLiked(likedStatus);
                        console.log('Article like status:', likedStatus);
                    } catch (err) {
                        console.error('Error checking like status:', err);
                        // Don't set error for like status check, just log it
                    }
                }
            } catch (err) {
                console.error('Error fetching article:', err);
                setError(err.message || 'Failed to fetch article');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, isAuthenticated]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // getReferenceTypeName function removed as it's not being used

        const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(window.location.href).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const handleLike = async () => {
        if (!article || isLiking) return;
        
        setIsLiking(true);
        try {
            // Like/unlike the article (the API handles toggling)
            await NewsService.likeNewsArticle(article.id);
            
            // Toggle the like state
            const newLikedState = !isLiked;
            setIsLiked(newLikedState);
            
            // Update the likes count
            setArticle(prev => ({
                ...prev,
                likesCount: newLikedState 
                    ? (prev.likesCount || 0) + 1 
                    : Math.max(0, (prev.likesCount || 0) - 1)
            }));
        } catch (error) {
            console.error('Error toggling article like:', error);
            // You could show a toast notification here
        } finally {
            setIsLiking(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        if (!article || !isAuthenticated || user?.id !== article.authorId) return;
        
        setIsDeleting(true);
        try {
            // Delete the article
            await NewsService.deleteNewsArticle(article.id);
            
            // Redirect to news page without popup
            navigate('/news');
        } catch (error) {
            console.error('Error deleting article:', error);
            // You could show a toast notification here instead of alert
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    const handleAuthorClick = () => {
        if (article?.author?.userName) {
            navigate(`/profile/${article.author.userName}`);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading article...</p>
                </div>
                
                {/* Loading skeleton */}
                <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-64 bg-gray-800 rounded"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-800 rounded"></div>
                        <div className="h-4 bg-gray-800 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-800 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Error Loading Article</h3>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <div className="flex justify-center space-x-3">
                        <button
                            onClick={() => navigate('/news')}
                            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            Back to News
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No article found
    if (!article) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-white mb-2">Article Not Found</h3>
                    <p className="text-gray-400 mb-4">The article you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/news')}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                    >
                        Back to News
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 text-gray-100">
            {/* Header with Edit/Delete buttons on left and Like/Share buttons on right */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold">{article.title}</h1>
                    {/* Edit and Delete buttons - Only show for authenticated users who are the author */}
                    {isAuthenticated && user?.id === article.authorId && (
                        <div className="flex items-center space-x-2">
                            {/* Edit Button */}
                            <button
                                onClick={() => navigate(`/news/edit/${article.id}`)}
                                className="cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 text-gray-400 hover:text-yellow-400 group relative"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 transition-transform duration-200"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                    Edit
                                </div>
                            </button>

                            {/* Delete Button */}
                            {!showDeleteConfirmation ? (
                                <button
                                    onClick={handleDeleteClick}
                                    disabled={isDeleting}
                                    className={`cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative ${
                                        isDeleting 
                                            ? 'text-gray-500 cursor-not-allowed' 
                                            : 'text-gray-400 hover:text-red-400'
                                    }`}
                                >
                                    {isDeleting ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 transition-transform duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    )}
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                        Delete
                                    </div>
                                </button>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <span className="text-red-400 text-sm font-medium">Are you sure?</span>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        disabled={isDeleting}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Yes'}
                                    </button>
                                    <button
                                        onClick={handleDeleteCancel}
                                        disabled={isDeleting}
                                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center space-x-3">
                    {/* Like Button - Only show for authenticated users */}
                    {isAuthenticated && (
                        <button
                            onClick={handleLike}
                            disabled={isLiking}
                            className={`cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative ${
                                isLiking
                                    ? 'text-gray-500 cursor-not-allowed' 
                                    : isLiked
                                        ? 'text-green-400 hover:text-green-500'
                                        : 'text-gray-400 hover:text-green-400'
                            }`}
                        >
                            {isLiking ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 transition-transform duration-200"
                                    fill={isLiked ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                {isLiking ? 'Processing...' : (isLiked ? 'Unlike' : 'Like')}
                            </div>
                        </button>
                    )}

                    {/* Share Button */}
                    <button
                        onClick={handleShare}
                        className={`cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative ${
                            copied 
                                ? 'text-green-400' 
                                : 'text-gray-400 hover:text-green-400'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 transition-transform duration-200 ${copied ? 'rotate-0' : 'group-hover:-rotate-12'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {copied ? (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            ) : (
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                />
                            )}
                        </svg>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                            {copied ? 'Copied!' : 'Share'}
                        </div>
                    </button>
                </div>
            </div>

            {/* Article metadata */}
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
                {/* Author info with avatar */}
                {article.author && (
                    <div 
                        className="flex items-center gap-3 cursor-pointer group/author"
                        onClick={handleAuthorClick}
                    >
                        <img
                            src={article.author.avatarPath || '/poster-placeholder.png'}
                            alt={article.author.userName}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-white font-medium group-hover/author:text-green-400 transition-colors">{article.author.userName}</span>
                    </div>
                )}
                <span>•</span>
                <span>{formatDate(article.createdAt)}</span>
                {article.updatedAt && article.updatedAt !== article.createdAt && (
                    <>
                        <span>•</span>
                        <span>Updated: {formatDate(article.updatedAt)}</span>
                    </>
                )}
            </div>

            {/* Article image */}
            <img
                src={article.photoPath || '/poster-placeholder.png'}
                alt={article.title}
                className="w-full rounded-lg mb-6 object-cover max-h-96"
            />

            {/* Article content */}
            <div className="prose prose-invert max-w-none">
                {parsedContent.text ? (
                    parsedContent.text.split("\n").map((paragraph, i) => (
                        <p key={i} className="mb-4 leading-relaxed">
                            {paragraph || '\u00A0'} {/* Non-breaking space for empty paragraphs */}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-400">No content available</p>
                )}
            </div>

            {/* References section */}
            {article.newsReferences && article.newsReferences.length > 0 && (
                <div className="mt-6">
                    <div className="flex flex-wrap gap-2">
                        {article.newsReferences.map((ref, index) => (
                            <span
                                key={index}
                                className="inline-block px-3 py-1 bg-green-600/20 text-green-300 text-sm rounded border border-green-600/30"
                            >
                                {ref.referencedUrl || 'Unknown Reference'}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Article stats */}
            <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-green-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                        </svg>
                        {article.likesCount || 0} likes
                    </span>
                    <span>•</span>
                    <span>Article ID: {article.id}</span>
                </div>
            </div>
        </div>
    );
}

export default ArticlePage;
