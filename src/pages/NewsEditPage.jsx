import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewsService } from '../services/newsService';
import { useAuthStore } from '../stores/authStore';

function NewsEditPage() {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        newTitle: '',
        newContent: ''
    });
    
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
                console.log('Fetching article for editing with ID:', id);
                const articleData = await NewsService.getNewsById(id);
                console.log('Article data received:', articleData);
                
                // Check if user is authorized to edit this article
                if (!isAuthenticated || user?.id !== articleData.authorId) {
                    setError('You are not authorized to edit this article');
                    setLoading(false);
                    return;
                }
                
                setArticle(articleData);
                setFormData({
                    newTitle: articleData.title || '',
                    newContent: articleData.content || ''
                });
            } catch (err) {
                console.error('Error fetching article:', err);
                setError(err.message || 'Failed to fetch article');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, isAuthenticated, user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.newTitle.trim() && !formData.newContent.trim()) {
            setError('At least one field (title or content) must be provided');
            return;
        }

        setSaving(true);
        setError(null);
        
        try {
            // Prepare update data - only include fields that have been changed
            const updateData = {};
            if (formData.newTitle.trim() !== article.title) {
                updateData.newTitle = formData.newTitle.trim();
            }
            if (formData.newContent.trim() !== article.content) {
                updateData.newContent = formData.newContent.trim();
            }

            // If no changes, just redirect back
            if (Object.keys(updateData).length === 0) {
                navigate(`/news/${id}`);
                return;
            }

            // Update the article
            await NewsService.updateNewsArticle(id, updateData);
            
            // Redirect back to article without popup
            navigate(`/news/${id}`);
        } catch (error) {
            console.error('Error updating article:', error);
            setError(error.message || 'Failed to update article');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigate(`/news/${id}`);
    };

    // Loading state
    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading article for editing...</p>
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
                    <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
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
                    <p className="text-gray-400 mb-4">The article you're trying to edit doesn't exist.</p>
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
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                    ← Cancel
                </button>
                <div className="h-6 w-px bg-gray-700"></div>
                <h1 className="text-3xl font-bold text-white">Edit News Article</h1>
            </div>

            {/* Edit Form with same background as NewsForm */}
            <div className="w-full">
                <div className="flex w-full min-h-[600px]">
                    <div className="w-full rounded-lg p-6 bg-gray-800">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-2xl font-bold text-white">Edit News Article</h1>
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Field */}
                            <div>
                                <label htmlFor="newTitle" className="block text-sm font-medium text-gray-300 mb-2">
                                    Article Title
                                </label>
                                <input
                                    type="text"
                                    id="newTitle"
                                    name="newTitle"
                                    value={formData.newTitle}
                                    onChange={handleInputChange}
                                    maxLength={200}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Enter article title..."
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    {formData.newTitle.length}/200 characters
                                </div>
                            </div>

                            {/* Content Field */}
                            <div>
                                <label htmlFor="newContent" className="block text-sm font-medium text-gray-300 mb-2">
                                    Article Content
                                </label>
                                <textarea
                                    id="newContent"
                                    name="newContent"
                                    value={formData.newContent}
                                    onChange={handleInputChange}
                                    maxLength={10000}
                                    rows={15}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
                                    placeholder="Enter article content..."
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    {formData.newContent.length}/10,000 characters
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className={`px-6 py-3 font-medium rounded-lg transition-colors duration-200 ${
                                        saving
                                            ? 'bg-green-700 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                    } text-white`}
                                >
                                    {saving ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Saving...</span>
                                        </div>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsEditPage;
