// Author info component
const AuthorInfo = ({ author }) => {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs">
        {author.avatar}
      </div>
      <span className="text-sm text-gray-300">{author.name}</span>
    </div>
  );
};

export default AuthorInfo