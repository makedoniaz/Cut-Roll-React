import { useState, useRef } from 'react';
import { useReferences } from '../../hooks/useReferences';
import ReferencedText from '../ui/common/ReferencedText';
import LinkModal from '../ui/forms/LinkModal';

const ReferenceExample = () => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  
  const textAreaRef = useRef(null);
  
  // Use our custom hook to manage references
  const {
    htmlText,
    plainText,
    references,
    addReference,
    removeReference,
    updateHtmlText,
    clearAllReferences,
    exportReferences,
    importReferences
  } = useReferences('Start typing your text here...');

  // Handle text selection
  const handleTextSelection = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText.trim()) {
      setSelectedText(selectedText);
      setSelectionRange({ start, end, text: selectedText });
      setIsLinkModalOpen(true);
    }
  };

  // Handle adding a reference
  const handleAddReference = ({ originalText, htmlText: newHtmlText, reference }) => {
    // Replace the selected text with the HTML link
    if (selectionRange) {
      const beforeText = plainText.substring(0, selectionRange.start);
      const afterText = plainText.substring(selectionRange.end);
      const newText = beforeText + newHtmlText + afterText;
      
      updateHtmlText(newText);
      
      // Add the reference to our collection
      addReference({ originalText, htmlText: newHtmlText, reference });
      
      // Clear selection
      setSelectionRange(null);
      setSelectedText('');
    }
  };

  // Handle reference click
  const handleReferenceClick = (reference, event) => {
    console.log('Reference clicked:', reference);
    // You can show a modal, navigate to the reference, etc.
    alert(`Clicked on ${reference.type}: ${reference.name}`);
  };

  // Export references to localStorage
  const saveToLocalStorage = () => {
    const data = exportReferences();
    localStorage.setItem('referencedText', JSON.stringify(data));
    alert('References saved to localStorage!');
  };

  // Load references from localStorage
  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('referencedText');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        importReferences(data);
        alert('References loaded from localStorage!');
      } catch (error) {
        alert('Error loading saved references');
      }
    } else {
      alert('No saved references found');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Reference System Example</h1>
      
      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-300 mb-2">How to use:</h2>
        <ol className="text-blue-200 text-sm space-y-1 list-decimal list-inside">
          <li>Type or paste text in the textarea below</li>
          <li>Select a word or phrase you want to reference</li>
          <li>Click "Add Reference" button</li>
          <li>Choose reference type and search for items</li>
          <li>Click on a result to add the reference</li>
        </ol>
      </div>

      {/* Text Input Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-300">
            Your Text (select text to add references)
          </label>
          <button
            onClick={handleTextSelection}
            disabled={!selectedText.trim()}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedText.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Add Reference
          </button>
        </div>
        
        <textarea
          ref={textAreaRef}
          value={plainText}
          onChange={(e) => updateHtmlText(e.target.value)}
          onSelect={handleTextSelection}
          className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
          placeholder="Start typing your text here..."
        />
      </div>

      {/* Formatted Text Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Formatted Text with References:</h3>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <ReferencedText
            htmlText={htmlText}
            references={references}
            onReferenceClick={handleReferenceClick}
            className="text-white leading-relaxed"
          />
        </div>
      </div>

      {/* References List */}
      {references.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">All References ({references.length}):</h3>
          <div className="grid gap-3">
            {references.map((reference, index) => (
              <div
                key={`${reference.id}-${reference.type}`}
                className="flex items-center justify-between p-3 bg-gray-800 border border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {reference.image && (
                    <img
                      src={reference.image}
                      alt={reference.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="text-white font-medium">{reference.name}</div>
                    <div className="text-sm text-gray-400">
                      {reference.type} • {reference.description}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeReference(reference.id, reference.type)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={clearAllReferences}
          disabled={references.length === 0}
          className={`px-4 py-2 rounded-lg transition-colors ${
            references.length > 0
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
        >
          Clear All References
        </button>
        
        <button
          onClick={saveToLocalStorage}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Save to LocalStorage
        </button>
        
        <button
          onClick={loadFromLocalStorage}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Load from LocalStorage
        </button>
      </div>

      {/* Link Modal */}
      {isLinkModalOpen && (
        <LinkModal
          selectedText={selectedText}
          onClose={() => {
            setIsLinkModalOpen(false);
            setSelectedText('');
            setSelectionRange(null);
          }}
          onAddReference={handleAddReference}
        />
      )}
    </div>
  );
};

export default ReferenceExample;
