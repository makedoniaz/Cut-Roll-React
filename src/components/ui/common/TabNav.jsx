const TabNav = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex gap-6 border-b border-gray-700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === tab 
              ? 'text-green-500' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNav;