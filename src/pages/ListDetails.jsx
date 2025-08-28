import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import MovieGrid from "../components/ui/movies/MovieGrid";
import SmallMovieCard from '../components/ui/movies/SmallMovieCard';
import CommentSection from "../components/ui/comments/CommentSection";
import { ListsService } from '../services/listsService';
import { ListsLikeService } from '../services/listsLikeService';
import { useAuthStore } from '../stores/authStore';

const ListDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
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

    const handleBackToLists = () => {
        navigate('/lists');
    };

    const handleAddComment = (comment) => {
        console.log('New comment added:', comment);
    };

    // Check if current user owns this list
    const isOwner = list && user && list.userSimlified?.id === user.id;
    
    // Debug logging
    console.log('Debug Info:', {
        isAuthenticated,
        user: user ? { id: user.id, username: user.username } : null,
        list: list ? { 
            id: list.id, 
            userId: list.userSimlified?.id, 
            userName: list.userSimlified?.userName,
            title: list.title 
        } : null,
        isOwner
    });

    const handleEditTitle = () => {
        setIsEditingTitle(true);
        setEditTitle(list.title || '');
    };

    const handleEditDescription = () => {
        setIsEditingDescription(true);
        setEditDescription(list.description || '');
    };

    const handleSaveTitle = async () => {
        if (!editTitle.trim()) {
            setError('Title cannot be empty');
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);
            
            const updateData = {
                id: list.id,
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

        if (editDescription.length > 350) {
            setError('Description must be 350 characters or less');
            return;
        }

        try {
            setIsUpdating(true);
            setError(null);
            
            const updateData = {
                id: list.id,
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

    // Mock movies for now - in a real app, these would come from the list data or a separate movies service
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
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={handleBackToLists}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    ← Back to Lists
                </button>
                <div className="h-6 w-px bg-gray-700"></div>
                <h1 className="text-3xl font-bold text-white">List Details</h1>
            </div>

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
                        {/* Editable Title */}
                        <div className="mb-6">
                            {isEditingTitle ? (
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="text-4xl md:text-6xl font-bold text-white bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
                                        placeholder="Enter list title..."
                                        maxLength={100}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveTitle}
                                            disabled={isUpdating}
                                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
                                                         ) : (
                                 <div className="group relative inline-block">
                                     <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                                         {list.title || 'Untitled List'}
                                     </h1>
                                     {isOwner && (
                                         <button
                                             onClick={handleEditTitle}
                                             className="absolute -right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                             title="Edit title"
                                         >
                                             <Edit2 className="h-5 w-5" />
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
                                        maxLength={350}
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-400">
                                            {editDescription.length}/350 characters
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveDescription}
                                                disabled={isUpdating}
                                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
                                 <div className="group relative inline-block">
                                     <p className="text-lg md:text-xl text-gray-300 max-w-4xl leading-relaxed">
                                         {list.description || 'No description available'}
                                     </p>
                                                                           {isOwner && (
                                          <button
                                              onClick={handleEditDescription}
                                              className="absolute -right-12 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                                              title="Edit description"
                                          >
                                              <Edit2 className="h-5 w-5" />
                                          </button>
                                      )}
                                 </div>
                             )}
                        </div>

                        {list.userSimlified && (
                            <div className="mt-4 flex items-center gap-3">
                                <div className="text-sm text-gray-400">
                                    Created by: {list.userSimlified.userName}
                                </div>
                                {isOwner && (
                                    <div className="px-2 py-1 bg-blue-600/20 border border-blue-600/30 rounded text-xs text-blue-400">
                                        Your List
                                    </div>
                                )}
                                {!isOwner && isAuthenticated && (
                                    <div className="px-2 py-1 bg-gray-600/20 border border-gray-600/30 rounded text-xs text-gray-400">
                                        Not Your List
                                    </div>
                                )}
                                {!isAuthenticated && (
                                    <div className="px-2 py-1 bg-red-600/20 border border-red-600/30 rounded text-xs text-red-400">
                                        Not Logged In
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Like Button and Count */}
                        <div className="mt-4 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLikeToggle}
                                    disabled={!isAuthenticated || isLikeLoading}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                                        isLiked 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    title={!isAuthenticated ? 'Sign in to like this list' : ''}
                                >
                                    <svg 
                                        className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none'}`} 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                        />
                                    </svg>
                                    {isLikeLoading ? '...' : (isLiked ? 'Liked' : 'Like')}
                                </button>
                                <span className="text-sm text-gray-400">
                                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Movies Grid */}
            <div className="mb-10">
                <MovieGrid 
                    heading={`Movies in this List (${list.moviesCount || 0})`}
                    rows={Math.ceil(movies.length / 6)} 
                    itemsPerRow={6} 
                    movies={movies} 
                    CardComponent={SmallMovieCard}
                />
            </div>

            {/* Comments Section */}
            <CommentSection 
                initialComments={mockComments}
                onAddComment={handleAddComment}
            />
        </div>
    );
};

export default ListDetails;