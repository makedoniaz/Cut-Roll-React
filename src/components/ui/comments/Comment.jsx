import Avatar from "../users/Avatar"
import CommentAuthor from "./CommentAuthor"
import CommentText from "./CommentText";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Comment = ({ comment, onUpdateComment, onDeleteComment, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content || comment.text || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  
  const MAX_LENGTH = 500;

  const isMyComment = () => {
    if (!currentUserId || !comment) return false;
    const commentUserId = comment.userId || comment.user?.id || comment.userSimplified?.id;
    return commentUserId && String(commentUserId) === String(currentUserId);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content || comment.text || '');
  };

  const handleEditContentChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setEditContent(value);
    }
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() && editContent !== (comment.content || comment.text)) {
      await onUpdateComment?.(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content || comment.text || '');
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    await onDeleteComment?.(comment.id);
    setShowDeleteConfirm(false);
  };

  const getCommentUserName = () => {
    return comment?.userSimplified?.userName || 
           comment?.userName || 
           comment?.username || 
           comment?.authorName || 
           comment?.author?.name ||
           comment?.author ||
           'Anonymous';
  };

  const getCommentDate = () => {
    const date = comment.createdAt || comment.createdDate || comment.dateCreated || comment.timestamp || comment.date;
    if (!date) return 'Just now';
    
    const commentDate = new Date(date);
    const now = new Date();
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return commentDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getCommentAvatar = () => {
    return comment?.userSimplified?.avatarPath || 
           comment?.author?.avatar || 
           comment?.userSimplified?.avatar ||
           null;
  };

  const handleAuthorClick = () => {
    const userName = getCommentUserName();
    if (userName && userName !== 'Anonymous') {
      navigate(`/profile/${userName}`);
    }
  };

  const isNearLimit = editContent.length > MAX_LENGTH * 0.8;
  const isAtLimit = editContent.length >= MAX_LENGTH;

  return (
    <div className="flex gap-3 p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
      <Avatar 
        src={getCommentAvatar()} 
        alt={getCommentUserName()}
        size="sm"
      />
      
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="text-white font-medium text-sm cursor-pointer group/author hover:text-green-400 transition-colors"
            onClick={handleAuthorClick}
          >
            {getCommentUserName()}
          </span>
          <span className="text-gray-400 text-xs">{getCommentDate()}</span>
          
          {/* Edit and Delete buttons - Only show for authenticated users who are the author */}
          {isMyComment() && (
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {/* Edit Button */}
              <button
                onClick={handleEdit}
                className="p-1 cursor-pointer text-gray-400 hover:text-white transition-colors flex items-center justify-center group relative"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 010 2.828l-9.9 9.9a2 2 0 01-.878.502l-3.293.823a1 1 0 01-1.212-1.212l.823-3.293a2 2 0 01.502-.878l9.9-9.9a2 2 0 012.828 0zM15 4l-9.5 9.5-.5 2 2-.5L16 5 15 4z" />
                </svg>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Edit Comment
                </div>
              </button>
              
              {/* Delete Button */}
              <button
                onClick={handleDelete}
                className="p-1 cursor-pointer text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center group relative"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 7a1 1 0 011-1h6a1 1 0 011 1v9a2 2 0 01-2 2H8a2 2 0 01-2-2V7zm3-3a1 1 0 00-1 1v1H6a1 1 0 000 2h8a1 1 0 100-2h-2V5a1 1 0 00-1-1H9z" />
                </svg>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Delete Comment
                </div>
              </button>
            </div>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3 w-full">
            <textarea
              value={editContent}
              onChange={handleEditContentChange}
              className="w-full bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 transition-all"
              rows={3}
              autoFocus
              maxLength={MAX_LENGTH}
            />
            
            {/* Character count */}
            <div className="flex justify-between items-center">
              <div className={`text-xs ${isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-400'}`}>
                {editContent.length}/{MAX_LENGTH} characters
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap break-words overflow-hidden">
            {comment.content || comment.text || 'No comment content available.'}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Delete Comment</h3>
              <p className="text-gray-300 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comment;
