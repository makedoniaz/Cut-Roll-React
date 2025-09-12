const TextArea = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "", 
  required = false,
  className = "",
  rows = 4,
  maxLength,
  ...props 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        maxLength={maxLength}
        className="w-full px-4 py-2 rounded-lg bg-gray-900 outline-none transition-all resize-vertical"
        {...props}
      />
    </div>
  );
};

export default TextArea;
