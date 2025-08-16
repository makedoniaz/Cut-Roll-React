import { useLocation, Navigate } from "react-router-dom";


const RegistrationProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  if (!location.state?.fromRegistration) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default RegistrationProtectedRoute;