import CommentHeader from "./CommentHeader";
import CommentList from "./CommentList";
import CommentForm from "../forms/CommentForm";
import { CommentService } from "../../../services/commentService";
import { useAuthStore } from "../../../stores/authStore";

import { useState, useEffect } from "react";

const CommentSection = ({ reviewId, onAddComment }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrevious, setShowPrevious] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const { isAuthenticated, user } = useAuthStore();

  // Fetch comments when reviewId changes
  useEffect(() => {
    if (reviewId) {
      fetchComments();
    }
  }, [reviewId]);

  const fetchComments = async (resetPage = false) => {
    if (!reviewId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 1 : page;
      
      const response = await CommentService.getCommentsByReview({
        reviewId: reviewId,
        page: currentPage,
        pageSize: 10
      });
      
      if (resetPage || currentPage === 1) {
        setComments(response.data || []);
        setPage(1);
      } else {
        setComments(prev => [...prev, ...(response.data || [])]);
      }
      
      setHasMoreComments(response.hasNextPage || false);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!isAuthenticated || !user?.id || !reviewId) {
      return;
    }

    try {
      await CommentService.createComment({
        userId: user.id,
        reviewId: reviewId,
        content: commentText
      });
      
      // Refetch comments to get the latest data with proper structure
      await fetchComments(true);
      
      // Call the callback if provided
      onAddComment?.();
    } catch (err) {
      console.error('Error creating comment:', err);
      setError(err.message);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    if (!isAuthenticated || !user?.id || !reviewId) {
      return;
    }

    try {
      await CommentService.updateComment({
        userId: user.id,
        reviewId: reviewId,
        content: newContent
      });
      
      // Refetch comments to get the latest data
      await fetchComments(true);
    } catch (err) {
      console.error('Error updating comment:', err);
      setError(err.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated || !user?.id || !reviewId) {
      return;
    }

    try {
      await CommentService.deleteComment(reviewId);
      
      // Refetch comments to get the latest data
      await fetchComments(true);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err.message);
    }
  };

  const handleShowPrevious = () => {
    if (showPrevious) {
      setShowPrevious(false);
    } else {
      setShowPrevious(true);
      if (hasMoreComments && page === 1) {
        setPage(prev => prev + 1);
        fetchComments();
      }
    }
  };

  const visibleComments = showPrevious ? comments : comments.slice(0, 10);

  return (
    <div className="text-white">
      <CommentHeader 
        totalComments={comments.length}
        hasMore={hasMoreComments}
        showPrevious={showPrevious}
        onTogglePrevious={handleShowPrevious}
        loading={loading}
      />
      
      {error && (
        <div className=" bg-red-900/20 border border-red-500/30 rounded-lg mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <CommentList 
        comments={visibleComments} 
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
        currentUserId={user?.id}
      />
      
      {isAuthenticated && (
        <CommentForm onSubmit={handleAddComment} />
      )}
    </div>
  );
};

export default CommentSection;