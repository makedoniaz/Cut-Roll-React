const CastGrid = ({ cast }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {cast.map((member, index) => (
        <button 
          key={index}
          className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded text-sm text-center transition-colors"
        >
          {member}
        </button>
      ))}
    </div>
  );
};

export default CastGrid;