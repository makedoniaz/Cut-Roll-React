import { useState } from "react";
import TextInput from "./inputs/TextInput"
import RichTextEditor from "./inputs/RichTextEditor";

const THEME = {
  COLORS: {
    MAIN_GRAY: '#374151'
  }
};

const NewsForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSaveDraft = () => {
    console.log('Draft saved:', { title, content });
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
    
    console.log('Publishing:', { title, content });
    alert('Article published successfully!');
  };

  return (
    <div className="w-full">
      <div className="flex w-full min-h-[600px]">
        {/* Form Section - Left Side */}
        <div 
          className="w-1/2 p-6 overflow-y-auto max-h-[600px] bg-gray-800"
        >
          <h1 className="text-2xl font-bold text-white mb-6">Create News Article</h1>
          
          <div className="space-y-6">
            <TextInput
              label="Article Title"
              value={title}
              onChange={setTitle}
              placeholder="Enter news article title..."
              required
            />

            <RichTextEditor
              label="Article Content"
              value={content}
              onChange={setContent}
              placeholder="Start writing your news article..."
              minHeight="20rem"
            />

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Publish Article
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section - Right Side */}
        <div className="w-1/2 bg-gray-800 border-l border-gray-200 overflow-y-auto max-h-[600px]">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-gray-800 pb-2 border-b">
              Live Preview
            </h2>
            
            {title || content ? (
              <div className="bg-gray-800 p-6 rounded-lg">
                {title && (
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{title}</h3>
                )}
                {content && (
                  <div className="prose max-w-none text-white">
                    {content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3">
                        {paragraph || '\u00A0'}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="p-6  text-white">Start typing to see your article preview...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsForm;