import { useState } from 'react';

const SectionHeaderWithTabs = ({ 
    heading, 
    tabs, 
    activeTab, 
    onTabChange, 
    onMoreClick,
    className = '' 
}) => {
    return ( 
        <div className={className}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-8">
                    {heading && (
                        <h2 className="text-base font-medium text-gray-400 tracking-wider">{heading}</h2>
                    )}
                    
                    {/* Tab Navigation as Horizontal Headings */}
                    <div className="flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`text-base font-medium tracking-wider transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'text-green-500'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* MORE Button */}
                <button 
                    className="cursor-pointer font-medium text-gray-400 hover:text-green-500 transition-colors"
                    onClick={() => onMoreClick(activeTab)}
                >
                    MORE
                </button>
            </div>
            <hr className="border-t border-gray-700 mb-8" />
        </div>
    );
}
 
export default SectionHeaderWithTabs;
