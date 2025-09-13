const CommentHeader = ({ totalComments, hasMore, showPrevious, onTogglePrevious, loading }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">
          {loading ? 'Loading comments...' : `${totalComments} Comments`}
        </h3>
        
        <div className="flex items-center gap-4">
          {hasMore && !loading && (
            <button
              onClick={onTogglePrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {showPrevious ? 'Show recent 10' : 'Show previous'}
            </button>
          )}
        </div>
      </div>
      
      {/* Horizontal line */}
      <hr className="border-gray-700" />
    </div>
  );
};

export default CommentHeader;