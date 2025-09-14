import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user.id) {
      navigate(`/profile/${user.userName || user.username}`);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Get role label
  const getRoleLabel = (roleNumeric) => {
    switch (roleNumeric) {
      case 0:
        return 'Admin';
      case 1:
        return 'User';
      case 2:
        return 'Publisher';
      default:
        return 'User';
    }
  };

  return (
    <div 
      className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleUserClick}
    >
      {/* Main Content Container */}
      <div className="flex gap-4">
        {/* Left Side - Avatar */}
        <div className="flex-shrink-0">
          <Avatar 
            src={user.avatarPath} 
            alt={user.userName || user.username} 
            size="lg" 
          />
        </div>

        {/* Right Side - User Info */}
        <div className="flex-1 min-w-0">
          {/* Header Section */}
          <div className="mb-4">
            {/* Username */}
            <h3 className="text-xl font-bold text-white mb-2 leading-tight hover:text-green-400 transition-colors">
              {user.userName || user.username || 'Unknown User'}
            </h3>
            
            {/* Email */}
            {user.email && (
              <p className="text-gray-400 text-sm mb-2">
                {user.email}
              </p>
            )}
            
            {/* Role */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {/* Reviews Count */}
            <div className="flex flex-col">
              <span className="text-gray-400">Reviews</span>
              <span className="text-white font-semibold">{user.reviewCount || 0}</span>
            </div>
            
            {/* Watched Count */}
            <div className="flex flex-col">
              <span className="text-gray-400">Watched</span>
              <span className="text-white font-semibold">{user.watchedCount || 0}</span>
            </div>
            
            {/* Lists Count */}
            <div className="flex flex-col">
              <span className="text-gray-400">Lists</span>
              <span className="text-white font-semibold">{user.listCount || 0}</span>
            </div>
            
            {/* Average Rating */}
            <div className="flex flex-col">
              <span className="text-gray-400">Avg Rating</span>
              <span className="text-white font-semibold">
                {user.averageRating ? user.averageRating.toFixed(1) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Footer - Join Date */}
          {user.createdAt && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs">
                Joined {formatDate(user.createdAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
