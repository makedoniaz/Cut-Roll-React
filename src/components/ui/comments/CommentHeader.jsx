const CommentHeader = ({ totalComments, hasMore, showPrevious, onTogglePrevious }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <h3 className="font-medium text-gray-300">
        {totalComments} COMMENTS
      </h3>
      
      <div className="flex items-center gap-4">
        {hasMore && (
          <button
            onClick={onTogglePrevious}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {showPrevious ? 'Show recent 20' : 'Show previous'}
          </button>
        )}
        
      </div>
    </div>
  );
};

export default CommentHeader;