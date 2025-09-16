import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Cut-N-Roll</h3>
            <p className="text-gray-400 text-sm">
              Discover, rate, and review movies. Keep track of what you've watched and create lists of your favorites.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/movies" className="text-gray-400 hover:text-white">Movies</Link></li>
              <li><Link to="/news" className="text-gray-400 hover:text-white">News</Link></li>
              <li><Link to="/search" className="text-gray-400 hover:text-white">Search</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/lists" className="text-gray-400 hover:text-white">Lists</Link></li>
              <li><Link to="/search/reviews" className="text-gray-400 hover:text-white">Reviews</Link></li>
              <li><Link to="/search/users" className="text-gray-400 hover:text-white">Users</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
              <li><Link to="/register" className="text-gray-400 hover:text-white">Register</Link></li>
              <li><Link to="/settings" className="text-gray-400 hover:text-white">Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Cut-N-Roll. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;