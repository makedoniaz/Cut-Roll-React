import Comment from "./Comment";

const CommentList = ({ comments }) => {
  return (
    <div className="max-h-96 overflow-y-auto">
      {comments.map((comment) => (
        <Comment key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentList;