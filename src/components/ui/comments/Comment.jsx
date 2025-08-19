import Avatar from "../users/Avatar"
import CommentAuthor from "./CommentAuthor"
import CommentText from "./CommentText";

const Comment = ({ comment }) => {
  return (
    <div className="flex gap-3 p-4 border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
      <Avatar 
        src={comment.author.avatar} 
        alt={comment.author.name}
        size="sm"
      />
      
      <div className="flex-1 min-w-0">
        <CommentAuthor author={comment.author} />
        <CommentText text={comment.text} />
      </div>
    </div>
  );
};

export default Comment;
