const TabNav = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 border-b border-gray-700 mb-6">
      {tabs.map((tab, index) => {
        // Handle both string tabs and object tabs
        const tabId = typeof tab === 'string' ? tab : tab.id;
        const tabLabel = typeof tab === 'string' ? tab : tab.label;
        const tabIcon = typeof tab === 'object' ? tab.icon : null;
        
        return (
          <button
            key={tabId || index}
            onClick={() => onTabChange(tabId)}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === tabId 
                ? 'text-green-500' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              {tabIcon && tabIcon}
              {tabLabel}
            </div>
            {activeTab === tabId && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabNav;