import { useRef, useEffect, useState } from "react";

const RichTextBox = ({ 
  label,
  value = "",
  onChange,
  onSelectionChange, // Новый пропс для отслеживания выделения
  placeholder = "Start typing...",
  minHeight = "16rem",
  className = "",
  disabled = false,
  maxLength,
  showCharCount = false
}) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Функция для обработки изменения выделения
  const handleSelectionChange = () => {
    if (!onSelectionChange || disabled) return;
    
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // Проверяем, что выделение находится внутри нашего редактора
    if (editorRef.current && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        onSelectionChange(selectedText);
      }
    }
  };

  // Глобальное отслеживание изменений выделения
  useEffect(() => {
    const handleDocumentSelectionChange = () => {
      if (isEditorFocused && !disabled) {
        handleSelectionChange();
      }
    };

    document.addEventListener('selectionchange', handleDocumentSelectionChange);
    
    return () => {
      document.removeEventListener('selectionchange', handleDocumentSelectionChange);
    };
  }, [isEditorFocused, onSelectionChange, disabled]);

  const handleContentChange = () => {
    if (editorRef.current && !disabled) {
      const newContent = editorRef.current.innerHTML;
      
      // Check character limit if specified
      if (maxLength) {
        const textContent = editorRef.current.textContent || editorRef.current.innerText || '';
        if (textContent.length > maxLength) {
          // Truncate content if it exceeds the limit
          const truncatedText = textContent.substring(0, maxLength);
          editorRef.current.innerHTML = truncatedText;
          onChange(truncatedText);
          return;
        }
      }
      
      onChange(newContent);
    }
  };

  const handleFocus = () => {
    if (!disabled) {
      setIsEditorFocused(true);
    }
  };

  const handleBlur = () => {
    setIsEditorFocused(false);
    // Очищаем выделение при потере фокуса
    if (onSelectionChange) {
      onSelectionChange('');
    }
  };

  // Дополнительные обработчики для более точного отслеживания
  const handleMouseUp = () => {
    if (isEditorFocused && !disabled) {
      setTimeout(handleSelectionChange, 0); // Небольшая задержка для корректной работы
    }
  };

  const handleKeyUp = () => {
    if (isEditorFocused && !disabled) {
      setTimeout(handleSelectionChange, 0);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}

      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseUp={handleMouseUp}
        onKeyUp={handleKeyUp}
        className={`rich-text-editor w-full p-4 border rounded-lg outline-none bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent overflow-y-auto min-h-[20rem] ${
          isEditorFocused ? "border-green-500" : "border-gray-600"
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ minHeight }}
        suppressContentEditableWarning={true}
        data-placeholder={disabled ? '' : placeholder}
      />
      {showCharCount && maxLength && (
        <div className="text-xs text-gray-400">
          {(value.replace(/<[^>]*>/g, '').length)}/{maxLength} characters
        </div>
      )}
    </div>
  );
};

export default RichTextBox;