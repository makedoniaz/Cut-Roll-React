import { getAvatarUrl } from '../../../utils/avatarUtils.js';

const Avatar = ({ src, alt, size = "md", userId = null }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 bg-gray-700 flex items-center justify-center`}>
      {src ? (
        <img
          src={getAvatarUrl(src, userId)}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div className={`w-full h-full flex items-center justify-center text-white font-semibold ${src ? 'hidden' : 'flex'}`}>
        {(alt || 'U').charAt(0).toUpperCase()}
      </div>
    </div>
  );
};

export default Avatar;