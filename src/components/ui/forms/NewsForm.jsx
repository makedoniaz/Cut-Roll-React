import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TextInput from "./inputs/TextInput"
import RichTextBox from "./inputs/RichTextEditor";
import MediaUploader from "./MediaUploader";
import Modal from "../../layout/Modal";
import LinkModal from "./LinkModal";
import { ExternalLink, X } from "lucide-react";
import { NewsService } from "../../../services/newsService";
import { useAuthStore } from "../../../stores/authStore";
import { REFERENCE_TYPES } from "../../../constants/news";

function NewsForm({ onClose }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [references, setReferences] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Check authentication status when component loads
  useEffect(() => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a news article. Please log in and try again.');
    } else {
      setError('');
    }
  }, [isAuthenticated]);

  const handleSaveDraft = () => {
    console.log('Draft saved:', { 
      title, 
      content, 
      image: image?.name
    });
    alert('Draft saved successfully!');
  };

  // Transform references from the current format to the API format
  const transformReferencesForAPI = () => {
    return references.map(ref => ({
      referenceType: REFERENCE_TYPES[ref.reference.type] || 0,
      referencedId: ref.reference.id,
      referenceUrl: ref.reference.url || null
    }));
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      setError('You must be logged in to create a news article.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your news article.');
      return;
    }

    if (!content.trim()) {
      setError('Please enter content for your news article.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newsData = {
        title: title.trim(),
        content: content.trim(),
        authorId: user.id,
        photo: image?.file || null,
        references: transformReferencesForAPI()
      };

      console.log('Publishing news article:', newsData);
      
      const createdNewsId = await NewsService.createNewsArticle(newsData);
      
      console.log('News article created successfully with ID:', createdNewsId);
      
      // Show success message before navigating
      alert('News article created successfully!');
      
      // Navigate to the created news article or back to news list
      navigate('/news');
      
    } catch (error) {
      console.error('Failed to create news article:', error);
      setError(error.message || 'Failed to create news article. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenModal = () => {
    console.log('Opening reference modal...');
    setIsModalOpen(true);
  };

  const handleAddReference = (referenceData) => {
    console.log('Reference added:', referenceData);
    
    // Check if reference already exists (same ID and type)
    const isDuplicate = references.some(existingRef => 
      existingRef.reference.id === referenceData.reference.id && 
      existingRef.reference.type === referenceData.reference.type
    );
    
    if (isDuplicate) {
      console.log('Reference already exists, not adding duplicate');
      // Close modal without adding duplicate
      setIsModalOpen(false);
      return;
    }
    
    setReferences(prev => [...prev, referenceData]);
    
    // Close the modal after adding reference
    setIsModalOpen(false);
    
    // Log the current references state
    console.log('Current references:', references);
  };

  return (
    <div className="w-full">
      <div className="flex w-full min-h-[600px]">
        <div className="w-full rounded-lg p-6 bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Create News Article</h1>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <TextInput
              label="Article Title"
              value={title}
              onChange={setTitle}
              placeholder="Enter news article title..."
              required
              disabled={!isAuthenticated}
            />

            <MediaUploader 
              image={image}
              onImageChange={setImage}
              disabled={!isAuthenticated}
            />

            {/* Note about image support */}
            {image && (
              <div className="text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                <p>⚠️ <strong>Note:</strong> Image uploads are now supported by the API and will be saved with your article.</p>
              </div>
            )}

            <RichTextBox
              label="Article Content"
              value={content}
              onChange={setContent}
              placeholder="Start writing your news article..."
              minHeight="20rem"
              disabled={!isAuthenticated}
            />
            
            <button
              type="button"
              onClick={handleOpenModal}
              disabled={!isAuthenticated}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isAuthenticated
                  ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Add reference
            </button>

            {/* References Display */}
            {references.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white mb-3">Added References ({references.length})</h3>
                {references.map((ref, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="text-white">
                      <span className="text-gray-200">{ref.reference.name}</span>
                    </div>
                    <button
                      onClick={() => setReferences(prev => prev.filter((_, i) => i !== index))}
                      disabled={!isAuthenticated}
                      className={`p-1 text-red-400 hover:text-red-300 transition-colors rounded ${
                        isAuthenticated 
                          ? 'hover:bg-red-500/20' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <div className="text-sm text-gray-400">
                {image && `Image: ${image.name}`}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={!isAuthenticated}
                  className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                    isAuthenticated 
                      ? 'bg-gray-600 text-white hover:bg-gray-500' 
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || !isAuthenticated}
                  className={`cursor-pointer px-6 py-2 rounded-lg transition-colors ${
                    isSubmitting || !isAuthenticated
                      ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <LinkModal 
          onClose={() => setIsModalOpen(false)}
          onAddReference={handleAddReference}
        />
      </Modal>
    </div>
  );
}

export default NewsForm;