import { useState, useEffect } from 'react';

const ReferencedText = ({ 
  htmlText, 
  references = [], 
  onReferenceClick, 
  className = "",
  editable = false,
  onTextChange
}) => {
  const [currentHtmlText, setCurrentHtmlText] = useState(htmlText || '');
  const [currentReferences, setCurrentReferences] = useState(references || []);

  // Update local state when props change
  useEffect(() => {
    setCurrentHtmlText(htmlText || '');
  }, [htmlText]);

  useEffect(() => {
    setCurrentReferences(references || []);
  }, [references]);

  // Handle reference link clicks
  const handleReferenceClick = (event, referenceId, referenceType) => {
    event.preventDefault();
    
    // Find the reference data
    const reference = currentReferences.find(ref => ref.id === referenceId && ref.type === referenceType);
    
    if (reference && onReferenceClick) {
      onReferenceClick(reference, event);
    }
  };

  // Handle text editing (if editable)
  const handleTextChange = (event) => {
    if (editable && onTextChange) {
      const newText = event.target.innerHTML;
      setCurrentHtmlText(newText);
      onTextChange(newText);
    }
  };

  // Process HTML text to add click handlers to reference links
  const processHtmlText = (html) => {
    if (!html) return '';

    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Find all reference links and add click handlers
    const referenceLinks = tempDiv.querySelectorAll('a[data-reference-id]');
    referenceLinks.forEach(link => {
      const referenceId = link.getAttribute('data-reference-id');
      const referenceType = link.getAttribute('data-reference-type');
      
      // Add click handler
      link.addEventListener('click', (e) => handleReferenceClick(e, referenceId, referenceType));
      
      // Ensure proper styling
      link.className = 'reference-link text-blue-400 hover:text-blue-300 underline cursor-pointer';
    });

    return tempDiv.innerHTML;
  };

  // Render the HTML text with proper event handling
  const renderHtmlText = () => {
    if (editable) {
      return (
        <div
          contentEditable={true}
          dangerouslySetInnerHTML={{ __html: currentHtmlText }}
          onInput={handleTextChange}
          className={`outline-none focus:outline-none ${className}`}
          suppressContentEditableWarning={true}
        />
      );
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: processHtmlText(currentHtmlText) }}
        className={className}
      />
    );
  };

  return (
    <div className="referenced-text-container">
      {renderHtmlText()}
      
      {/* Reference count indicator */}
      {currentReferences.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          {currentReferences.length} reference{currentReferences.length !== 1 ? 's' : ''} added
        </div>
      )}
    </div>
  );
};

export default ReferencedText;
