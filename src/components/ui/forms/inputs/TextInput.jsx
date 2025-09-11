const TextInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "", 
  required = false,
  className = "",
  maxLength,
  showCharCount = false,
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full px-4 py-2 rounded-lg bg-gray-900 outline-none transition-all"
        {...props}
      />
      {showCharCount && maxLength && (
        <div className="text-xs text-gray-400">
          {value.length}/{maxLength} characters
        </div>
      )}
    </div>
  );
};

export default TextInput