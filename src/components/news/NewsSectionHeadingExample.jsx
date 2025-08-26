import { useState } from 'react';
import NewsSectionHeading from './NewsSectionHeading';

const NewsSectionHeadingExample = () => {
    const [activeTab, setActiveTab] = useState('recent');

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        console.log('Active tab changed to:', tabId);
    };

    const handleMoreClick = () => {
        console.log('More button clicked');
        // Handle navigation to full news page or other actions
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'recent':
                return <div className="text-white">Recent News Content</div>;
            case 'my':
                return <div className="text-white">My News Content</div>;
            case 'liked':
                return <div className="text-white">Liked News Content</div>;
            default:
                return <div className="text-white">Select a tab</div>;
        }
    };

    return (
        <div className="p-6">
                        <NewsSectionHeading
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onMoreClick={handleMoreClick}
                isAuthenticated={true}
            />
            
            {/* Tab content area */}
            <div className="min-h-[200px] p-4 bg-gray-800 rounded-lg">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default NewsSectionHeadingExample;
