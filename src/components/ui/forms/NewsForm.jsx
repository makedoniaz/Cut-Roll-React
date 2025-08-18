import { useState } from "react";
import TextInput from "./inputs/TextInput"
import RichTextBox from "./inputs/RichTextEditor";
import MediaUploader from "./MediaUploader";
import Modal from "../../layout/Modal";
import LinkModal from "./LinkModal";
import { ExternalLink } from "lucide-react";

function NewsForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [savedSelectedText, setSavedSelectedText] = useState(''); // Сохраненный текст для модалки

  const handleSelectionChange = (text) => {
    console.log('Selection changed:', text);
    setSelectedText(text);
  };

  const handleSaveDraft = () => {
    console.log('Draft saved:', { 
      title, 
      content, 
      mediaType,
      image: image?.name,
      videoUrl 
    });
    alert('Draft saved successfully!');
  };

  const handlePublish = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    if (!content.trim() || content === '<br>') {
      alert('Please enter some content');
      return;
    }
    
    console.log('Publishing:', { 
      title, 
      content, 
      mediaType,
      image: image ? { name: image.name, size: image.size } : null,
      videoUrl
    });
    
    const mediaInfo = mediaType === 'image' && image ? ' with image' : 
                     mediaType === 'video' && videoUrl ? ' with video' : '';
    alert(`Article published successfully${mediaInfo}!`);
  };

  const handleOpenModal = () => {
    console.log('Button clicked! selectedText:', selectedText, 'isModalOpen:', isModalOpen);
    
    // Сохраняем текущий выделенный текст перед открытием модалки
    const currentSelection = window.getSelection().toString().trim();
    const textToSave = selectedText || currentSelection;
    
    if (textToSave) {
      setSavedSelectedText(textToSave);
      setIsModalOpen(true);
      console.log('Modal opened with saved text:', textToSave);
    }
  };

  // Button should only be enabled when text is selected
  const isButtonEnabled = selectedText.length > 0;

  return (
    <div className="w-full">
      <div className="flex w-full min-h-[600px]">
        <div className="w-full rounded-lg p-6 bg-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Create News Article</h1>
          </div>
          
          <div className="space-y-6">
            <TextInput
              label="Article Title"
              value={title}
              onChange={setTitle}
              placeholder="Enter news article title..."
              required
            />

            <MediaUploader 
              image={image}
              onImageChange={setImage}
              videoUrl={videoUrl}
              onVideoUrlChange={setVideoUrl}
              mediaType={mediaType}
              onMediaTypeChange={setMediaType}
            />

            <RichTextBox
              label="Article Content"
              value={content}
              onChange={setContent}
              placeholder="Start writing your news article..."
              minHeight="20rem"
              onSelectionChange={handleSelectionChange}
            />
            
            <button
              type="button"
              onMouseDown={(e) => {
                // Предотвращаем потерю фокуса при клике на кнопку
                e.preventDefault();
                handleOpenModal();
              }}
              disabled={!isButtonEnabled}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isButtonEnabled 
                  ? 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Add reference
            </button>

            <div className="flex justify-between">
              <div className="text-sm text-gray-400">
                {selectedText && `Selected: "${selectedText.substring(0, 30)}${selectedText.length > 30 ? '...' : ''}"`}
                {mediaType === 'image' && image && ` | Image: ${image.name}`}
                {mediaType === 'video' && videoUrl && ` | Video: ${videoUrl.length > 40 ? videoUrl.substring(0, 40) + '...' : videoUrl}`}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="cursor-pointer px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="cursor-pointer px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Publish Article
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <LinkModal selectedText={savedSelectedText} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

export default NewsForm;