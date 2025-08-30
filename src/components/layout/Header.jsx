import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Film, LogOut, Newspaper } from 'lucide-react';
import { useNavigation } from '../../hooks/useNavigation';
import { useAuth } from '../../hooks/useStores';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { goToSearch, goToNewsSearch } = useNavigation();
  const { isAuthenticated, user, logout } = useAuth();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleSearchClick = () => {
    goToSearch('');
  };

  const handleUserClick = () => {
    if (isAuthenticated && user) {
      // Navigate to user's profile
      navigate(`/profile/${user.username || user.email.split('@')[0]}`);
    } else {
      // Navigate to login
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Film className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold">CutRoll</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`hover:text-green-500 transition-colors ${
                isActiveRoute('/') ? 'text-green-500' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/movies" 
              className={`hover:text-green-500 transition-colors ${
                isActiveRoute('/movies') ? 'text-green-500' : ''
              }`}
            >
              Movies
            </Link>
            <Link 
              to="/lists" 
              className={`hover:text-green-500 transition-colors ${
                isActiveRoute('/lists') ? 'text-green-500' : ''
              }`}
            >
              Lists
            </Link>
            <Link 
              to="/reviews" 
              className={`hover:text-green-500 transition-colors ${
                isActiveRoute('/reviews') ? 'text-green-500' : ''
              }`}
            >
              Reviews
            </Link>
            <Link 
              to="/news" 
              className={`hover:text-green-500 transition-colors ${
                isActiveRoute('/news') ? 'text-green-500' : ''
              }`}
            >
              News
            </Link>
            {isAuthenticated && user?.role === 'Admin' && (
              <Link 
                to="/admin"
                className={`hover:text-green-500 transition-colors ${
                  isActiveRoute('/admin') ? 'text-green-500' : 'text-white-400'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Search & User */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleSearchClick}
              className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Search Movies"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => goToNewsSearch('')}
              className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Search News"
            >
              <Newspaper className="w-5 h-5" />
            </button>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={handleUserClick}
                  className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors group relative"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                  {/* Optional: Show username on hover */}
                  <span className="absolute top-full right-0 mt-2 px-2 py-1 text-xs bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-400 hover:text-red-300"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={handleUserClick}
                className="cursor-pointer p-2 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Login"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;