import { useEffect, useState, useRef } from "react";

function SearchDropdown({ searchQuery, results, onClose, onSelect }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!searchQuery) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-full
                 bg-gray-700 border border-gray-600 rounded-lg shadow-lg
                 max-h-48 overflow-y-auto z-50"
    >
      <ul>
        {results.map((item, i) => (
          <li
            key={i}
            className="px-4 py-2 hover:bg-gray-600 cursor-pointer text-white"
            onClick={() => {
              onSelect(item); // вызываем callback
              onClose();      // закрываем дропдаун
            }}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchDropdown;
