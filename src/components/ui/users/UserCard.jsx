import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const UserCard = ({ user }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (user.id) {
      navigate(`/profile/${user.username}`);
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
            alt={user.username} 
            size="lg"
            userId={user.id}
          />
        </div>

        {/* Right Side - User Info */}
        <div className="flex-1 min-w-0">
          {/* Username */}
          <h3 className="text-xl font-bold text-white mb-2 leading-tight hover:text-green-400 transition-colors">
            {user.username || 'Unknown User'}
          </h3>
          
          {/* Email */}
          {user.email && (
            <p className="text-gray-400 text-sm">
              {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
