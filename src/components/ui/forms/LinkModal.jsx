import { useState } from "react";
import SearchDropdown from "../../search/SearchDropdown";

function LinkModal({ selectedText, onClose }) {
  const [linkType, setLinkType] = useState('url');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const linkTypes = [
    { value: 'movie', label: 'Movie' },
    { value: 'people', label: 'People' },
    { value: 'genre', label: 'Genre' },
    { value: 'production_company', label: 'Production Company'},
    { value: 'keyword', label: 'Keyword' },
    { value: 'news', label: 'News' }
  ];


  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Add Reference</h2>
      
      {/* Selected Text Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Selected Text
        </label>
        <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg">
          <p className="text-white italic">
            {selectedText ? `"${selectedText}"` : 'No text selected'}
          </p>
        </div>
      </div>

      {/* Link Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Reference Type
        </label>
        <select
          value={linkType}
          onChange={(e) => setLinkType(e.target.value)}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {linkTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar with Dropdown */}
      <div className="mb-6 relative">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Search for reference
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
              onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            placeholder={`Search for reference...`}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Search Results Dropdown */}
          {dropdownOpen && (
            <SearchDropdown
              searchQuery={searchQuery}
              results={Array.from({ length: 10 }, (_, i) => `Result ${i + 1}`)}
              onClose={() => setDropdownOpen(false)} // только закрытие
              onSelect={(item) => {
                setSearchQuery(item); // вставка в input
                setDropdownOpen(false); // закрываем дропдаун
              }}
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selectedText || !searchQuery}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedText && searchQuery
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }`}
        >
          Add Reference
        </button>
      </div>
    </div>
  );
}

export default LinkModal;
