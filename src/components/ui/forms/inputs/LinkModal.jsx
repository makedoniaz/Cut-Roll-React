import { useState, useEffect } from "react";
import { X } from 'lucide-react';

const LinkModal = ({ isOpen, onClose, onInsert, selectedText }) => {
  const [linkUrl, setLinkUrl] = useState('https://');

  useEffect(() => {
    if (isOpen) {
      setLinkUrl('https://');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (linkUrl && linkUrl !== 'https://') {
      onInsert(linkUrl);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Link to Selected Text</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Selected Text
            </label>
            <div className="px-3 py-2 bg-gray-900 rounded-lg text-gray-400">
              {selectedText}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              URL
            </label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 rounded-lg bg-gray-900 outline-none text-white"
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white hover:text-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!linkUrl || linkUrl === 'https://'}
            className="px-4 py-2 cursor-pointer bg-green-600 text-white rounded-lg hover:bg-green-700 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkModal