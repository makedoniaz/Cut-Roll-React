// Utility functions for content handling
// Since references are now article-level, we don't need to parse embedded markers

/**
 * Parse content and return it as-is with references
 * @param {string} content - Content from the API
 * @param {Array} references - Array of references from the API
 * @returns {Object} - { text: string, references: Array }
 */
export const parseContentWithReferences = (content, references = []) => {
  if (!content) return { text: '', references: [] };

  // Map API references to a simpler format for display
  const processedRefs = references.map((ref, index) => {
    // Map reference type back to string format
    let refTypeStr;
    switch (ref.referenceType) {
      case 0: refTypeStr = 'movie'; break;
      case 1: refTypeStr = 'people'; break;
      case 2: refTypeStr = 'genre'; break;
      case 3: refTypeStr = 'production_company'; break;
      case 4: refTypeStr = 'keyword'; break;
      case 5: refTypeStr = 'news'; break;
      default: refTypeStr = 'unknown';
    }

    return {
      id: ref.referencedId,
      type: refTypeStr,
      referenceType: ref.referenceType,
      referencedId: ref.referencedId
    };
  });

  return {
    text: content,
    references: processedRefs
  };
};

/**
 * Convert parsed content to HTML with clickable reference links
 * @param {string} text - Parsed text content
 * @param {Array} references - Processed references
 * @returns {string} - HTML string with reference links
 */
export const convertToHTMLWithReferences = (text, references) => {
  if (!text || !references.length) return text;

  // Since references are article-level, we can add them as a separate section
  // or return the text as-is
  return text;
};

/**
 * Get plain text from content
 * @param {string} content - Content from the API
 * @returns {string} - The content as-is (no markers to remove)
 */
export const getPlainText = (content) => {
  if (!content) return '';
  
  // Return content as-is since there are no markers
  return content;
};
