import { useState } from "react";

const CommentForm = ({ onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment.trim());
      setComment('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-gray-700">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Reply as makedoniaz..."
        className="w-full bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        rows={3}
      />
      
      <div className="flex justify-between items-center mt-3">
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors"
        >
          POST
        </button>
      </div>
    </div>
  );
};

export default CommentForm;