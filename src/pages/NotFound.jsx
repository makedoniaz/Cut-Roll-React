import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="w-full min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Film className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-300 mb-8">Page not found</p>
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;