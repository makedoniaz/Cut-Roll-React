import { useState } from 'react';

const NewsSectionHeading = ({ 
    activeTab = "recent", 
    onTabChange,
    showMoreButton = true,
    onMoreClick,
    isAuthenticated = false
}) => {
    const tabs = [
        { id: "recent", label: "Recent News" },
        ...(isAuthenticated ? [
            { id: "my", label: "My News" },
            { id: "liked", label: "Liked News" }
        ] : [])
    ];

    return ( 
        <div>
            {/* Header with tabs and MORE button */}
            <div className="flex justify-between items-center mb-4">
                {/* Tabs as headings */}
                <div className="flex gap-6">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`pb-3 px-1 font-medium transition-colors relative ${
                                activeTab === tab.id 
                                    ? 'text-green-500' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                                                    {tab.label}
                        </button>
                    ))}
                </div>
                
                {/* MORE button */}
                {showMoreButton && (
                    <button 
                        className="cursor-pointer font-medium text-gray-400 hover:text-green-500"
                        onClick={onMoreClick}
                    >
                        MORE
                    </button>
                )}
            </div>
            
            {/* Single horizontal line under tabs */}
            <hr className="border-t border-gray-700 mb-8" />
        </div>
    );
}
 
export default NewsSectionHeading;
