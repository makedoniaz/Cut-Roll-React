import FlexibleSearch from './FlexibleSearch';

const SearchBar = ({ filters, filterValues, handleFiltersChange, handleSearch, onSearchButtonPress, searchValue = "" }) => {
  return (
    <div className="bg-gray-900">
      <div className="max-w-8xl">
        <FlexibleSearch
          placeholder="Search for movies..."
          filters={filters}
          onSearch={handleSearch}
          onFiltersChange={handleFiltersChange}
          onSearchButtonPress={onSearchButtonPress}
          searchValue={searchValue}
          filterValues={filterValues}
        />
      </div>
    </div>
  );
};

export default SearchBar;