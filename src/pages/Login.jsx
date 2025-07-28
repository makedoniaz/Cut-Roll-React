import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useStores';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

const Login = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, loginGoogle } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    const result = await login({
      loginIdentifier: formData.loginIdentifier,
      password: formData.password
    });
    
    if (!result.success) {
      setLocalError(result.error || 'Login failed. Please try again.');
    } else {
      navigate('/');
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    window.location.href = 'http://localhost:5000/api/Authentication/ExternalLogin';
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Film className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Sign in to CutRoll
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {localError && (
            <div className="bg-red-500/10 border border-red-500 rounded-md p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-500 text-sm">{localError}</span>
            </div>
          )}
          
          {/* Google Authentication Button */}
          <GoogleAuthButton 
            text="Continue with Google"
            disabled={isLoading}
            onClick={handleGoogleAuth}
          />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with email</span>
            </div>
          </div>
          
          <div>
            <label htmlFor="loginIdentifier" className="block text-sm font-medium text-gray-300">
              Email or Username
            </label>
            <input
              id="loginIdentifier"
              type="text"
              required
              value={formData.loginIdentifier}
              onChange={(e) => setFormData({...formData, loginIdentifier: e.target.value})}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-green-500"
              placeholder="Enter email or username"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-green-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          
          <div className="text-center">
            <Link to="/register" className="text-green-500 hover:text-green-400">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;