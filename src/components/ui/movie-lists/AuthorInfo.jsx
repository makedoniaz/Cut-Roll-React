// Author info component
const AuthorInfo = ({ author }) => {
  const isUrl = author.avatar && (author.avatar.startsWith('http') || author.avatar.startsWith('/'));
  
  return (
    <div className="flex items-center gap-2 mb-2 group/author">
      <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs overflow-hidden">
        {isUrl ? (
          <img 
            src={author.avatar} 
            alt={`${author.name} avatar`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
        ) : (
          <span>{author.avatar}</span>
        )}
        {isUrl && (
          <span style={{ display: 'none' }}>👤</span>
        )}
      </div>
      <span className="text-sm text-gray-300 group-hover/author:text-green-400 transition-colors">{author.name}</span>
    </div>
  );
};

export default AuthorInfo