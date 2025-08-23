import { useState } from 'react';
import DynamicSearchFilter from '../search/filters/DynamicSearchFilter';

const DynamicSearchFilterExample = () => {
  const [keywordValue, setKeywordValue] = useState([]);
  const [countryValue, setCountryValue] = useState(null);

  const handleKeywordChange = (value) => {
    console.log('Keywords changed:', value);
    setKeywordValue(value);
  };

  const handleCountryChange = (value) => {
    console.log('Countries changed:', value);
    setCountryValue(value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Dynamic Search Filter Example
        </h1>
        <p className="text-gray-400">
          Testing the new DynamicSearchFilter for keywords and countries
        </p>
      </div>

      {/* Keyword Filter Example */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Keywords Filter</h2>
        <p className="text-gray-400 mb-4">
          This filter allows you to search for keywords dynamically and select multiple ones.
        </p>
        
        <DynamicSearchFilter
          label="Keywords"
          value={keywordValue}
          onChange={handleKeywordChange}
          placeholder="Search for keywords..."
          type="keyword"
        />
        
        {keywordValue.length > 0 && (
          <div className="mt-4 p-4 bg-green-600/20 border border-green-600 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Selected Keywords:</h3>
            <div className="space-y-2">
              {keywordValue.map((keyword, index) => (
                <div key={keyword.id || index} className="text-green-300">
                  <strong>{keyword.name}</strong>
                  {keyword.description && (
                    <span className="text-green-200 ml-2">- {keyword.description}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Country Filter Example */}
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Countries Filter</h2>
        <p className="text-gray-400 mb-4">
          This filter allows you to search for countries dynamically and select one country.
        </p>
        
        <DynamicSearchFilter
          label="Countries"
          value={countryValue}
          onChange={handleCountryChange}
          placeholder="Search for countries..."
          type="country"
        />
        
        {countryValue && (
          <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
            <h3 className="font-semibold text-white mb-2">Selected Country:</h3>
            <div className="text-blue-300">
              <strong>{countryValue.name}</strong>
              {countryValue.description && (
                <span className="text-blue-200 ml-2">- {countryValue.description}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Debug Information</h3>
        <pre className="text-sm text-gray-300 overflow-auto">
          {JSON.stringify({ keywordValue, countryValue }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DynamicSearchFilterExample;
