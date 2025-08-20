import FlexibleSearch from './FlexibleSearch';
import { useState } from 'react';

const SearchBar = ({ filters, filterValues, handleFiltersChange, handleSearch, onSearchButtonPress }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-gray-900">
      <div className="max-w-8xl">
        <FlexibleSearch
          placeholder="Search for movies..."
          filters={filters}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          onSearchButtonPress={onSearchButtonPress}
          searchValue={searchQuery}
          filterValues={filterValues}
        />
      </div>
    </div>
  );
};

export default SearchBar;