import { useRef, useEffect, useState } from "react";

const RichTextBox = ({ 
  label,
  value = "",
  onChange,
  onSelectionChange, // Новый пропс для отслеживания выделения
  placeholder = "Start typing...",
  minHeight = "16rem",
  className = "",
  disabled = false
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
      onChange(editorRef.current.innerHTML);
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
        className={`rich-text-editor w-full p-4 border rounded-lg outline-none bg-gray-900 text-white overflow-y-auto min-h-[20rem] ${
          isEditorFocused ? "border-transparent" : "border-gray-800"
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ minHeight }}
        suppressContentEditableWarning={true}
        data-placeholder={disabled ? '' : placeholder}
      />
    </div>
  );
};

export default RichTextBox;