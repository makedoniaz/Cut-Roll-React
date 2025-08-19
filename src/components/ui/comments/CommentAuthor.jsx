// CommentHeader внутри Comment
const CommentAuthor = ({ author }) => {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span className="font-medium text-white">
        {author.name}
      </span>
      <span className="text-sm text-gray-400">
        {author.timeAgo}
      </span>
    </div>
  );
};

export default CommentAuthor;