import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { NewsService } from '../services/newsService';
import TextInput from '../components/ui/forms/inputs/TextInput';
import RichTextBox from '../components/ui/forms/inputs/RichTextEditor';

const NewsEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    references: []
  });

  // Fetch article data on component mount
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const articleData = await NewsService.getNewsById(id);
        
        // Check if user is the author
        if (articleData.authorId !== user?.id) {
          setError('You are not authorized to edit this article');
          return;
        }
        
        setArticle(articleData);
        setFormData({
          title: articleData.title || '',
          content: articleData.content || '',
          references: articleData.newsReferences || []
        });
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(err.message || 'Failed to fetch article');
      } finally {
        setLoading(false);
      }
    };

    if (id && user?.id) {
      fetchArticle();
    }
  }, [id, user?.id]);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await NewsService.updateNewsArticle(id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        references: formData.references
      });
      
      // Navigate back to the article
      navigate(`/news/${id}`);
    } catch (err) {
      console.error('Error updating article:', err);
      setError(err.message || 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/news/${id}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
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

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📰</div>
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/news/${id}`)}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Article
        </button>
        <div className="h-6 w-px bg-gray-700"></div>
        <h1 className="text-3xl font-bold text-white">Edit News Article</h1>
      </div>

      {/* Edit Form */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="space-y-6">
          <TextInput
            label="Article Title"
            value={formData.title}
            onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
            placeholder="Enter a compelling title for your article..."
            required
          />

          <RichTextBox
            label="Article Content"
            value={formData.content}
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            placeholder="Start writing your news article..."
            minHeight="20rem"
          />

          <div className="flex justify-between">
            <div className="text-sm text-gray-400">
              {/* You can add additional info here if needed */}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="cursor-pointer px-6 py-2 rounded-lg transition-colors bg-gray-600 text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                  saving
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsEditPage;
