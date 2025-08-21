import { useState, useCallback } from 'react';

export const useReferences = (initialText = '', initialReferences = []) => {
  const [htmlText, setHtmlText] = useState(initialText);
  const [references, setReferences] = useState(initialReferences);
  const [plainText, setPlainText] = useState(initialText);

  // Add a new reference to the text
  const addReference = useCallback(({ originalText, htmlText: newHtmlText, reference }) => {
    // Add the reference to our references array
    setReferences(prev => [...prev, reference]);
    
    // Update the HTML text (this should replace the original text with the HTML link)
    setHtmlText(prev => {
      // For now, we'll append the new reference
      // In a real implementation, you'd want to replace the specific selected text
      return prev + ' ' + newHtmlText;
    });
    
    // Update plain text
    setPlainText(prev => prev + ' ' + originalText);
  }, []);

  // Remove a reference by ID and type
  const removeReference = useCallback((referenceId, referenceType) => {
    setReferences(prev => prev.filter(ref => !(ref.id === referenceId && ref.type === referenceType)));
    
    // Remove the HTML link from the text
    setHtmlText(prev => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = prev;
      
      // Find and remove the specific reference link
      const linkToRemove = tempDiv.querySelector(`a[data-reference-id="${referenceId}"][data-reference-type="${referenceType}"]`);
      if (linkToRemove) {
        // Replace the link with just the text
        const textContent = linkToRemove.textContent;
        linkToRemove.replaceWith(textContent);
      }
      
      return tempDiv.innerHTML;
    });
  }, []);

  // Update the HTML text directly
  const updateHtmlText = useCallback((newHtmlText) => {
    setHtmlText(newHtmlText);
    
    // Extract plain text from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHtmlText;
    setPlainText(tempDiv.textContent || tempDiv.innerText || '');
  }, []);

  // Update the plain text directly
  const updatePlainText = useCallback((newPlainText) => {
    setPlainText(newPlainText);
    setHtmlText(newPlainText);
  }, []);

  // Get all references of a specific type
  const getReferencesByType = useCallback((type) => {
    return references.filter(ref => ref.type === type);
  }, [references]);

  // Get a specific reference by ID and type
  const getReference = useCallback((referenceId, referenceType) => {
    return references.find(ref => ref.id === referenceId && ref.type === referenceType);
  }, [references]);

  // Clear all references
  const clearAllReferences = useCallback(() => {
    setReferences([]);
    setHtmlText(plainText);
  }, [plainText]);

  // Export references data for storage
  const exportReferences = useCallback(() => {
    return {
      htmlText,
      plainText,
      references,
      timestamp: new Date().toISOString()
    };
  }, [htmlText, plainText, references]);

  // Import references data
  const importReferences = useCallback((data) => {
    if (data.htmlText) setHtmlText(data.htmlText);
    if (data.plainText) setPlainText(data.plainText);
    if (data.references) setReferences(data.references);
  }, []);

  return {
    // State
    htmlText,
    plainText,
    references,
    
    // Actions
    addReference,
    removeReference,
    updateHtmlText,
    updatePlainText,
    getReferencesByType,
    getReference,
    clearAllReferences,
    
    // Export/Import
    exportReferences,
    importReferences
  };
};
