const TextFilter = ({ label, value, onChange, placeholder }) => (
  <div className="flex flex-col space-y-1">
    <label className="text-sm font-medium text-gray-300">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
    />
  </div>
);

export default TextFilter;