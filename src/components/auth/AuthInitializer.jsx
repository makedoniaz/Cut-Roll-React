import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';

const AuthInitializer = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const verifyToken = useAuthStore((state) => state.verifyToken);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in StrictMode
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const initAuth = async () => {
      try {
        await verifyToken();
        setIsInitialized(true);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsInitialized(true); // Still initialize to avoid infinite loading
      }
    };

    initAuth();
  }, [verifyToken]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Initializing...</div>
      </div>
    );
  }

  return children;
};

export default AuthInitializer;