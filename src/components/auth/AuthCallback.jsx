import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useStores';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loginGoogle } = useAuth(); // You should expose a method to save tokens

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const jwt = params.get('jwt');
  const refresh = params.get('refresh');

  useEffect(() => {
    const params = new URLSearchParams(location.search);


    if (jwt && refresh) {
      loginGoogle({ jwt, refresh }); // Save tokens in auth store
      navigate('/');
    } else {
      console.log(params)
      // navigate('/login'); // fallback
    }
  }, [location, loginGoogle, navigate]);

  return <p className="text-white text-center mt-10">{(jwt && refresh) ? "GOOD" : "BAD"}</p>;
};

export default AuthCallback;
