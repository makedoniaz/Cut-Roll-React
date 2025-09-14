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

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">Popular Movies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Top Rated</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Now Playing</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">Reviews</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Lists</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Forums</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
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