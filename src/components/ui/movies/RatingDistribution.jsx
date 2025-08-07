const RatingDistribution = () => {
  const distribution = [
    { stars: 5, count: 450, percent: 45 },
    { stars: 4, count: 300, percent: 30 },
    { stars: 3, count: 150, percent: 15 },
    { stars: 2, count: 70, percent: 7 },
    { stars: 1, count: 30, percent: 3 }
  ];
  
  return (
    <div className="space-y-2">
      {distribution.map((item) => (
        <div key={item.stars} className="flex items-center gap-3">
          <span className="text-yellow-400 w-4">{item.stars}</span>
          <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-green-500 h-full transition-all duration-500"
              style={{ width: `${item.percent}%` }}
            />
          </div>
          <span className="text-gray-400 text-sm w-10 text-right">{item.percent}%</span>
        </div>
      ))}
    </div>
  );
};

export default RatingDistribution;