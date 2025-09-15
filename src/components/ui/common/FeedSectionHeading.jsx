import { useState } from 'react';

const FeedSectionHeading = ({ 
    heading, 
    selectedTimeFilter, 
    onTimeFilterChange, 
    selectedType, 
    onTypeChange,
    timeFilterOptions,
    activityTypeLabels 
}) => {
    const [isLoading, setIsLoading] = useState(false);

    return ( 
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-base font-medium text-gray-400 tracking-wider">{heading}</h2>
                
                {/* Filter Controls */}
                <div className="flex items-center space-x-4">
                    {/* Time Filter Dropdown */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="time-filter" className="text-sm text-gray-300">
                            Time:
                        </label>
                        <select
                            id="time-filter"
                            value={selectedTimeFilter}
                            onChange={onTimeFilterChange}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {Object.entries(timeFilterOptions).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Activity Type Dropdown */}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="activity-type" className="text-sm text-gray-300">
                            Type:
                        </label>
                        <select
                            id="activity-type"
                            value={selectedType}
                            onChange={onTypeChange}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {Object.entries(activityTypeLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <hr className="border-t border-gray-700 my-4 mb-8" />
        </div>
    );
};

export default FeedSectionHeading;
