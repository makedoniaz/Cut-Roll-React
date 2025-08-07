const StreamingService = ({ service, type }) => {
  const services = {
    'Netflix AZ': { bg: 'bg-red-600', icon: 'N', color: 'text-white' },
    'Netflix US': { bg: 'bg-red-600', icon: 'N', color: 'text-white' },
    'Netflix Standalone US': { bg: 'bg-gray-700', icon: 'N', color: 'text-gray-300' }
  };
  
  const config = services[service] || { bg: 'bg-gray-700', icon: service[0], color: 'text-gray-300' };
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${config.bg} rounded flex items-center justify-center font-bold ${config.color}`}>
          {config.icon}
        </div>
        <div>
          <div className="font-medium text-white">{service}</div>
        </div>
      </div>
      <span className="text-xs bg-gray-700 px-2 py-1 rounded">{type}</span>
    </div>
  );
};

export default StreamingService;