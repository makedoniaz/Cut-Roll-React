import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Share2 } from 'lucide-react';
import ListMovieGrid from "../components/ui/movies/ListMovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import RemovableMovieCard from '../components/ui/movies/RemovableMovieCard';
import CommentSection from "../components/ui/comments/CommentSection";
import AddMoviesModal from "../components/ui/forms/AddMoviesModal";
import { ListsService } from '../services/listsService';
import { ListsLikeService } from '../services/listsLikeService';
import { useAuthStore } from '../stores/authStore';
import { USER_ROLES } from '../constants/adminDashboard';

const ListDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Movies state
    const [movies, setMovies] = useState([]);
    const [moviesLoading, setMoviesLoading] = useState(false);
    const [moviesError, setMoviesError] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    
    // Edit states
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    // Like states
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    
    // Add Movies Modal state
    const [isAddMoviesModalOpen, setIsAddMoviesModalOpen] = useState(false);
    
    // Delete confirmation state
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper function to check if user can edit lists (only owners, not admins)
    const canEditList = () => {
        if (!isAuthenticated || !user || !list) return false;
        
        // Only list owners can edit (admins cannot edit due to backend issues)
        return list.userSimplified?.id === user.id;
    };

    // Helper function to check if user can delete lists (owners and admins)
    const canDeleteList = () => {
        if (!isAuthenticated || !user || !list) return false;
        
        // Handle both string and numeric role values
        const userRole = user.role;
        
        // Admin can delete any list (check both numeric and string values)
        if (userRole === USER_ROLES.ADMIN || userRole === 'Admin') return true;
        
        // User must be the owner to delete their own list
        if (list.userSimplified?.id === user.id) return true;
        
        return false;
    };

    useEffect(() => {
        const fetchList = async () => {
            try {
                setLoading(true);
                setError(null);
                const listData = await ListsService.getListById(id);
                setList(listData);
                setEditTitle(listData.title || '');
                setEditDescription(listData.description || '');
                setLikeCount(listData.likesCount || 0);
            } catch (err) {
                console.error('Error fetching list:', err);
                setError(err.message || 'Failed to fetch list');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchList();
        }
    }, [id]);

    // Check if list is liked when user and list are available
    useEffect(() => {
        if (isAuthenticated && user?.id && list?.id) {
            checkIfLiked();
        }
    }, [isAuthenticated, user?.id, list?.id]);

    // Fetch movies from list when list is loaded
    useEffect(() => {
        const fetchMovies = async () => {
            if (!list?.id) return;

            try {
                setMoviesLoading(true);
                setMoviesError(null);
                const moviesData = await ListsService.getMoviesFromList({
                    listId: list.id,
                    page: currentPage,
                    pageSize: 12 // Show 12 movies per page (2 rows of 6)
                });
                
                // Update movies and pagination data
                setMovies(moviesData.data || []);
                setTotalCount(moviesData.totalCount || 0);
                setTotalPages(moviesData.totalPages || 1);
                setHasNextPage(moviesData.hasNextPage || false);
                setHasPreviousPage(moviesData.hasPreviousPage || false);
            } catch (err) {
                console.error('Error fetching movies from list:', err);
                setMoviesError(err.message || 'Failed to fetch movies');
            } finally {
                setMoviesLoading(false);
            }
        };

        fetchMovies();
    }, [list?.id, currentPage]);

    const handleBackToLists = () => {
        navigate('/lists');
    };

    const handleAddComment = (comment) => {
        console.log('New comment added:', comment);
    };

    const handleAddMovies = () => {
        setIsAddMoviesModalOpen(true);
    };

    const handleMoviesAdded = async (addedMovies) => {
        console.log('Movies added to list:', addedMovies);
        // Refresh the movies list after adding new movies
        try {
            setMoviesLoading(true);
            setMoviesError(null);
            const moviesData = await ListsService.getMoviesFromList({
                listId: list.id,
                page: currentPage,
                pageSize: 12
            });
            
            // Update movies and pagination data
            setMovies(moviesData.data || []);
            setTotalCount(moviesData.totalCount || 0);
            setTotalPages(moviesData.totalPages || 1);
            setHasNextPage(moviesData.hasNextPage || false);
            setHasPreviousPage(moviesData.hasPreviousPage || false);
        } catch (err) {
            console.error('Error refreshing movies after adding:', err);
            setMoviesError(err.message || 'Failed to refresh movies');
        } finally {
            setMoviesLoading(false);
        }
    };

    const handleMovieRemoved = async (removedMovieId) => {
        console.log('Movie removed from list:', removedMovieId);
        // Refresh the movies list after removing a movie
        try {
            setMoviesLoading(true);
            setMoviesError(null);
            const moviesData = await ListsService.getMoviesFromList({
                listId: list.id,
                page: currentPage,
                pageSize: 12
            });
            
            // Update movies and pagination data
            setMovies(moviesData.data || []);
            setTotalCount(moviesData.totalCount || 0);
            setTotalPages(moviesData.totalPages || 1);
            setHasNextPage(moviesData.hasNextPage || false);
            setHasPreviousPage(moviesData.hasPreviousPage || false);
        } catch (err) {
            console.error('Error refreshing movies after removal:', err);
            setMoviesError(err.message || 'Failed to refresh movies');
        } finally {
            setMoviesLoading(false);
        }
    };

    const handleCloseAddMoviesModal = () => {
        setIsAddMoviesModalOpen(false);
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleNextPage = () => {
        if (hasNextPage) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (hasPreviousPage) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        if (!list?.id || !canDeleteList()) return;

        try {
            setIsDeleting(true);
            setError(null);

            await ListsService.deleteList(list.id);
            
            // Navigate back to lists page after successful deletion
            navigate('/lists');
        } catch (err) {
            console.error('Error deleting list:', err);
            setError(err.message || 'Failed to delete list');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    const handleShareList = async () => {
        if (!list?.id) return;

        try {
            const shareUrl = `${window.location.origin}/lists/${list.id}`;
            
            if (navigator.share) {
                // Use native share API if available (mobile devices)
                await navigator.share({
                    title: list.title,
                    text: `Check out this movie list: ${list.title}`,
                    url: shareUrl
                });
            } else {
                // Fallback to clipboard copy
                await navigator.clipboard.writeText(shareUrl);
                alert('List URL copied to clipboard!');
            }
        } catch (err) {
            console.error('Error sharing list:', err);
            // Fallback: show the URL to user
            const shareUrl = `${window.location.origin}/lists/${list.id}`;
            prompt('Copy this URL to share the list:', shareUrl);
        }
    };

    // Check if current user owns this list
    const isOwner = list && user && list.userSimplified?.id === user.id;
    
    // Debug logging for ownership check
    console.log('Ownership Check:', {
        isAuthenticated,
        currentUserId: user?.id,
        listOwnerUserId: list?.userSimplified?.id,
        isOwner
    });

    const handleEditTitle = () => {
        // Cancel description editing if active
        if (isEditingDescription) {
            setIsEditingDescription(false);
            setEditDescription(list.description || '');
        }
        setIsEditingTitle(true);
        setEditTitle(list.title || '');
    };

    const handleEditDescription = () => {
        // Cancel title editing if active
        if (isEditingTitle) {
            setIsEditingTitle(false);
            setEditTitle(list.title || '');
        }
        setIsEditingDescription(true);
        setEditDescription(list.description || '');
    };

    const handleSaveTitle = async () => {
        if (editTitle.length > 150) {
            setError('Title must be 150 characters or less');
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);
            
            const updateData = {
                id: list.id,
                userId: list.userSimplified?.id, // Use original creator's ID, not current user's ID
                title: editTitle.trim(),
                description: list.description // Keep existing description
            };

            await ListsService.updateList(updateData);
            
            // Update local state directly since API doesn't return updated entity
            setList(prevList => ({
                ...prevList,
                title: editTitle.trim()
            }));
            
            setIsEditingTitle(false);
        } catch (err) {
            console.error('Error updating title:', err);
            setError(err.message || 'Failed to update title');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveDescription = async () => {
        if (!editDescription.trim()) {
            setError('Description cannot be empty');
            return;
        }

        if (editDescription.length > 1000) {
            setError('Description must be 1000 characters or less');
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);
            
            const updateData = {
                id: list.id,
                userId: list.userSimplified?.id, // Use original creator's ID, not current user's ID
                title: list.title, // Keep existing title
                description: editDescription.trim()
            };

            await ListsService.updateList(updateData);
            
            // Update local state directly since API doesn't return updated entity
            setList(prevList => ({
                ...prevList,
                description: editDescription.trim()
            }));
            
            setIsEditingDescription(false);
        } catch (err) {
            console.error('Error updating description:', err);
            setError(err.message || 'Failed to update description');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingTitle(false);
        setIsEditingDescription(false);
        setEditTitle(list.title || '');
        setEditDescription(list.description || '');
        setError(null);
    };

    // Validation helpers
    const isTitleValid = () => {
        const trimmedTitle = editTitle.trim();
        return trimmedTitle !== '' && trimmedTitle !== (list.title || '');
    };

    const isDescriptionValid = () => {
        const trimmedDescription = editDescription.trim();
        return trimmedDescription !== '' && trimmedDescription !== (list.description || '');
    };

    // Like functionality
    const checkIfLiked = async () => {
        if (!isAuthenticated || !user?.id || !list?.id) return;
        
        try {
            const liked = await ListsLikeService.isListLiked(user.id, list.id);
            setIsLiked(liked);
        } catch (error) {
            console.error('Error checking if list is liked:', error);
        }
    };

    const handleLikeToggle = async () => {
        if (!isAuthenticated || !user?.id || !list?.id) return;
        
        try {
            setIsLikeLoading(true);
            
            if (isLiked) {
                // Unlike
                await ListsLikeService.unlikeList({
                    userId: user.id,
                    listId: list.id
                });
                setIsLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                // Like
                await ListsLikeService.likeList({
                    userId: user.id,
                    listId: list.id
                });
                setIsLiked(true);
                setLikeCount(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            setError('Failed to update like status');
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleAuthorClick = () => {
        if (list?.userSimplified?.userName) {
            navigate(`/profile/${list.userSimplified.userName}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Loading list...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-xl mb-4">{error}</div>
                    <button
                        onClick={handleBackToLists}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Back to Lists
                    </button>
                </div>
            </div>
        );
    }

    if (!list) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-xl mb-4">List not found</div>
                    <button
                        onClick={handleBackToLists}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Back to Lists
                    </button>
                </div>
            </div>
        );
    }

    // Mock comments for now - in a real app, these would come from a comments service
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
        }
    ];

    // Movies are now fetched separately using getMoviesFromList method

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Error Display */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* List Header Section */}
            <div className="relative overflow-hidden mb-10">
                <div className="py-16">
                    <div>
                        {/* Action Buttons Section */}
                        <div className="flex items-center justify-between mb-6">
                            {/* Left side: Caption with Delete button */}
                            <div className="flex items-center gap-4">
                                {list.userSimplified && (
                                    <div 
                                        className="text-lg text-gray-400 cursor-pointer group/author"
                                        onClick={handleAuthorClick}
                                    >
                                        List by <span className="font-bold text-white group-hover/author:text-green-400 transition-colors">{list.userSimplified.userName}</span>
                                    </div>
                                )}
                                
                                {/* Delete Button - Only show for users who can delete lists */}
                                {canDeleteList() && (
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
                                )}
                            </div>

                            {/* Right side: Share and Like buttons */}
                            <div className="flex items-center space-x-3">
                                {/* Like Button */}
                                {isAuthenticated && (
                                    <button
                                        onClick={handleLikeToggle}
                                        disabled={isLikeLoading}
                                        className={`cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative ${
                                            isLikeLoading
                                                ? 'text-gray-500 cursor-not-allowed' 
                                                : isLiked
                                                    ? 'text-green-400 hover:text-green-500'
                                                    : 'text-gray-400 hover:text-green-400'
                                        }`}
                                    >
                                        {isLikeLoading ? (
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
                                            {isLikeLoading ? 'Processing...' : (isLiked ? 'Unlike' : 'Like')}
                                        </div>
                                    </button>
                                )}

                                {/* Share Button */}
                                <button
                                    onClick={handleShareList}
                                    className="cursor-pointer p-2 rounded-lg transition-all duration-200 transform hover:scale-105 group relative text-gray-400 hover:text-green-400"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 transition-transform duration-200 group-hover:-rotate-12"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                                        />
                                    </svg>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                        Share
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Horizontal Line */}
                        <hr className="border-t border-gray-700 mb-6" />

                        {/* Editable Title */}
                        <div className="mb-6">
                            {isEditingTitle ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full text-3xl md:text-4xl font-bold text-white bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                                        placeholder="Enter list title..."
                                        maxLength={150}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-400">
                                            {editTitle.length}/150 characters
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveTitle}
                                                disabled={isUpdating || !isTitleValid()}
                                                className={`px-3 py-2 rounded-lg transition-colors ${
                                                    isUpdating || !isTitleValid()
                                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {isUpdating ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                                         ) : (
                                 <div className="group relative inline-flex items-center">
                                     <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                         {list.title || 'Untitled List'}
                                     </h1>
                                     {canEditList() && (
                                         <button
                                             onClick={handleEditTitle}
                                             className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-yellow-400 rounded-lg group relative"
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
                                         </button>
                                     )}
                                 </div>
                             )}
                        </div>

                        {/* Editable Description */}
                        <div className="mb-4">
                            {isEditingDescription ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full text-lg md:text-xl text-gray-300 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 outline-none focus:border-blue-500 resize-vertical"
                                        placeholder="Enter list description..."
                                        rows={4}
                                        maxLength={1000}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-400">
                                            {editDescription.length}/1000 characters
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveDescription}
                                                disabled={isUpdating || !isDescriptionValid()}
                                                className={`px-3 py-2 rounded-lg transition-colors ${
                                                    isUpdating || !isDescriptionValid()
                                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                }`}
                                            >
                                                {isUpdating ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                                         ) : (
                                 <div className="group relative flex items-start w-full">
                                     <p className="text-lg md:text-xl text-gray-300 leading-relaxed whitespace-pre-wrap flex-1">
                                         {list.description || 'No description available'}
                                     </p>
                                     {canEditList() && (
                                         <button
                                             onClick={handleEditDescription}
                                             className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-yellow-400 rounded-lg group relative flex-shrink-0"
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
                                         </button>
                                     )}
                                 </div>
                             )}
                        </div>

                        {/* Like Count Display */}
                        <div className="mt-4 flex items-center gap-2">
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
                            <span className="text-sm text-gray-400">
                                {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movies Grid */}
            <div className="mb-6">
                {moviesLoading ? (
                    <div className="text-center py-8">
                        <div className="text-white text-lg">Loading movies...</div>
                    </div>
                ) : moviesError ? (
                    <div className="text-center py-8">
                        <div className="text-red-400 text-lg mb-4">{moviesError}</div>
                        <button
                            onClick={() => {
                                // Retry fetching movies
                                const fetchMovies = async () => {
                                    if (!list?.id) return;
                                    try {
                                        setMoviesLoading(true);
                                        setMoviesError(null);
                                        const moviesData = await ListsService.getMoviesFromList({
                                            listId: list.id,
                                            page: currentPage,
                                            pageSize: 12
                                        });
                                        
                                        // Update movies and pagination data
                                        setMovies(moviesData.data || []);
                                        setTotalCount(moviesData.totalCount || 0);
                                        setTotalPages(moviesData.totalPages || 1);
                                        setHasNextPage(moviesData.hasNextPage || false);
                                        setHasPreviousPage(moviesData.hasPreviousPage || false);
                                    } catch (err) {
                                        console.error('Error fetching movies from list:', err);
                                        setMoviesError(err.message || 'Failed to fetch movies');
                                    } finally {
                                        setMoviesLoading(false);
                                    }
                                };
                                fetchMovies();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <ListMovieGrid 
                        heading={`Movies in this List (${totalCount})`}
                        rows={Math.ceil(movies.length / 6)} 
                        itemsPerRow={6} 
                        movies={movies} 
                        CardComponent={RemovableMovieCard}
                        onAddMoviesClick={canEditList() ? handleAddMovies : null}
                        showAddMovies={canEditList()}
                        listId={list.id}
                        isOwner={canEditList()}
                        onMovieRemoved={handleMovieRemoved}
                    />
                )}
                
                {/* Pagination Controls */}
                {!moviesLoading && !moviesError && totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={handlePreviousPage}
                            disabled={!hasPreviousPage}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                hasPreviousPage
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Previous
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={handleNextPage}
                            disabled={!hasNextPage}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                hasNextPage
                                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>


            {/* Delete Confirmation */}
            {showDeleteConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🗑️</div>
                            <h3 className="text-xl font-semibold text-white mb-2">Delete List</h3>
                            <p className="text-gray-400 mb-6">
                                Are you sure you want to delete "{list?.title}"? This action cannot be undone.
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={handleDeleteCancel}
                                    disabled={isDeleting}
                                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Movies Modal */}
            <AddMoviesModal 
                isOpen={isAddMoviesModalOpen}
                onClose={handleCloseAddMoviesModal}
                listId={list?.id}
                onMoviesAdded={handleMoviesAdded}
            />
        </div>
    );
};

export default ListDetails;