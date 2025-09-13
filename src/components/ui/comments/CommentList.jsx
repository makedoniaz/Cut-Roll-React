import Comment from "./Comment";

const CommentList = ({ comments, onUpdateComment, onDeleteComment, currentUserId }) => {
  return (
    <div className="max-h-96 overflow-y-auto overflow-x-hidden">
      {comments.map((comment) => (
        <Comment 
          key={comment.id} 
          comment={comment} 
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default CommentList;