import { useState, useRef, useEffect } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link } from 'lucide-react';
import LinkModal from "./LinkModal"

const RichTextEditor = ({ 
  label,
  value = "",
  onChange,
  placeholder = "Start typing...",
  minHeight = "16rem",
  className = ""
}) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [savedSelection, setSavedSelection] = useState(null);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const executeCommand = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  };

  const isCommandActive = (command) => {
    try {
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  const createList = (type) => {
    editorRef.current?.focus();
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (selectedText) {
      // If text is selected, wrap it in a list
      const listTag = type === 'ul' ? 'ul' : 'ol';
      const listHTML = `<${listTag}><li>${selectedText}</li></${listTag}>`;
      range.deleteContents();
      range.insertNode(range.createContextualFragment(listHTML));
    } else {
      // If no text selected, create an empty list
      const listTag = type === 'ul' ? 'ul' : 'ol';
      const listHTML = `<${listTag}><li></li></${listTag}>`;
      range.insertNode(range.createContextualFragment(listHTML));
      
      // Position cursor inside the li
      const newList = editorRef.current.querySelector(`${listTag}:last-child li`);
      if (newList) {
        const newRange = document.createRange();
        newRange.setStart(newList, 0);
        newRange.setEnd(newList, 0);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    handleContentChange();
  };

  const checkSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    const isWithinEditor = editorRef.current?.contains(selection.anchorNode);
    
    setHasSelection(selectedText.length > 0 && isWithinEditor);
  };

  const handleSelectionChange = () => {
    checkSelection();
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const endContainer = range.endContainer;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      
      return {
        startContainer,
        endContainer,
        startOffset,
        endOffset,
        text: range.toString()
      };
    }
    return null;
  };

  const restoreSelection = (savedRange) => {
    if (savedRange && editorRef.current) {
      try {
        const range = document.createRange();
        range.setStart(savedRange.startContainer, savedRange.startOffset);
        range.setEnd(savedRange.endContainer, savedRange.endOffset);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        editorRef.current.focus();
        return true;
      } catch (e) {
        console.warn('Could not restore selection:', e);
        return false;
      }
    }
    return false;
  };

  const handleLinkInsert = (url) => {
    if (savedSelection) {
      const restored = restoreSelection(savedSelection);
      if (restored) {
        setTimeout(() => {
          executeCommand('createLink', url);
        }, 50);
      } else {
        // Fallback: create link with saved text
        const linkHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${savedSelection.text}</a>`;
        executeCommand('insertHTML', linkHTML);
      }
      setSavedSelection(null);
    }
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (!selectedText) {
      return; // Button should be disabled, but just in case
    }
    
    // Save the current selection with more detail
    const savedRange = saveSelection();
    if (savedRange) {
      setSavedSelection(savedRange);
      setSelectedText(selectedText);
      setShowLinkModal(true);
    }
  };

  const formatButtons = [
    { 
      command: 'bold', 
      icon: Bold, 
      title: 'Bold (Ctrl+B)',
      action: () => executeCommand('bold')
    },
    { 
      command: 'italic', 
      icon: Italic, 
      title: 'Italic (Ctrl+I)',
      action: () => executeCommand('italic')
    },
    { 
      command: 'underline', 
      icon: Underline, 
      title: 'Underline (Ctrl+U)',
      action: () => executeCommand('underline')
    }
  ];

  const listButtons = [
    { 
      command: 'insertUnorderedList', 
      icon: List, 
      title: 'Bullet List',
      action: () => createList('ul')
    },
    { 
      command: 'insertOrderedList', 
      icon: ListOrdered, 
      title: 'Numbered List',
      action: () => createList('ol')
    }
  ];

  const handleKeyDown = (e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  };

  const handleFontSizeChange = (e) => {
    const size = e.target.value;
    if (size) {
      executeCommand('fontSize', size);
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      
      {/* Add global styles for links in the editor */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor a {
            color: #2563eb !important;
            text-decoration: underline !important;
            cursor: pointer !important;
          }
          .rich-text-editor a:hover {
            color: #1d4ed8 !important;
          }
          .rich-text-editor a:visited {
            color: #7c3aed !important;
          }
        `
      }} />
      
      {/* Toolbar */}
      <div className="rounded-t-lg bg-gray-900  p-2">
        <div className="flex flex-wrap items-center gap-1">

          {/* Font Size Selector */}
          <select
            onChange={handleFontSizeChange}
            className="px-2 py-1 text-sm border border-gray-700 rounded hover:bg-gray-700 focus:outline-none"
            defaultValue=""
          >
            <option value="">Size</option>
            <option value="1">Small</option>
            <option value="3">Normal</option>
            <option value="4">Medium</option>
            <option value="5">Large</option>
            <option value="6">X-Large</option>
            <option value="7">XX-Large</option>
          </select>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Format Buttons */}
          {formatButtons.map(({ command, icon: Icon, title, action }) => (
            <button
              key={command}
              type="button"
              onClick={action}
              className={`p-2 rounded transition-colors hover:bg-green-600 cursor-pointer ${
                isCommandActive(command) ? 'bg-green-600' : 'text-white'
              }`}
              title={title}
            >
              <Icon size={16} />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* List Buttons */}
          {listButtons.map(({ command, icon: Icon, title, action }) => (
            <button
              key={command}
              type="button"
              onClick={action}
              className="p-2 rounded transition-colors hover:bg-green-600 cursor-pointer text-white"
              title={title}
            >
              <Icon size={16} />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Link Button */}
          <button
            type="button"
            onClick={handleLinkClick}
            disabled={!hasSelection}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`p-2 rounded transition-colors ${
              hasSelection 
                ? 'hover:bg-green-500 text-white' 
                : 'text-gray-700 cursor-not-allowed'
            }`}
            title={hasSelection ? "Add Link to Selected Text" : "Select text first to add a link"}
          >
            <Link size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        onKeyDown={handleKeyDown}
        onMouseUp={checkSelection} // Check selection on mouse up
        onKeyUp={checkSelection}   // Check selection on key up
        className={`rich-text-editor w-full p-4 border-x border-b border-gray-800 rounded-b-lg outline-none bg-gray-900 overflow-y-auto ${
          isEditorFocused ? 'border-transparent' : ''
        }`}
        style={{ minHeight }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />
      
      <div className="text-sm text-gray-500 space-y-1">
        <p>Use the toolbar to format text or keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)</p>
        <p>To add links: Select text first, then the link button will become available</p>
      </div>

      {/* Link Modal */}
      <LinkModal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setSavedSelection(null);
        }}
        onInsert={handleLinkInsert}
        selectedText={selectedText}
      />
    </div>
  );
};

export default RichTextEditor;