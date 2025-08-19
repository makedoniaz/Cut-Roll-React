import CommentHeader from "./CommentHeader";
import CommentList from "./CommentList";
import CommentForm from "../forms/CommentForm";

import { useState } from "react";

const CommentSection = ({ initialComments = [], onAddComment }) => {
  const [comments, setComments] = useState(initialComments);
  const [showPrevious, setShowPrevious] = useState(false);

  const handleAddComment = (commentText) => {
    const newComment = {
      id: Date.now(),
      author: {
        name: 'makedoniaz', // В реальном приложении берем из контекста пользователя
        avatar: '/api/placeholder/32/32',
        timeAgo: 'now'
      },
      text: commentText,
      timestamp: new Date()
    };
    
    setComments(prev => [...prev, newComment]);
    onAddComment?.(newComment);
  };

  const handleShowPrevious = () => {
    setShowPrevious(!showPrevious);
  };

  const visibleComments = showPrevious ? comments : comments.slice(-20);
  const hasMoreComments = true;

  return (
    <div className="bg-gray-800 rounded-lg text-white">
      <CommentHeader 
        totalComments={comments.length}
        hasMore={hasMoreComments}
        showPrevious={showPrevious}
        onTogglePrevious={handleShowPrevious}
      />
      
      <CommentList comments={visibleComments} />
      
      <CommentForm onSubmit={handleAddComment} />
    </div>
  );
};

export default CommentSection;