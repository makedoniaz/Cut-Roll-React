import { Mail } from 'lucide-react';
import { THEME } from "../constants/index";
import { useLocation, useNavigate } from 'react-router-dom';

const ConfirmEmail = ({email}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoogleAuth = (e) => {
        e.preventDefault();
        navigate("/login")
    };

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div 
                    className="bg-white rounded-2xl shadow-lg p-8 text-center"
                    style={{
                        background:THEME.COLORS.MAIN_GRAY
                    }}
                >
                    <div className="w-16 h-16 mx-auto mb-6 text-green-500"
                        style={{
                            background:THEME.COLORS.MAIN_GRAY,
                        }}
                    >
                        <Mail size={64} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4 text-white">
                        Confirm Your Email
                    </h1>

                    <p className="text-white mb-2 max-w-md">
                        We've sent a confirmation link to:
                    </p>

                    <p className="text-green-500 font-medium mb-8">
                        {location.state?.email}
                    </p>

                    <p className="text-gray-400 mb-8 max-w-md">
                    Click the link in your email to verify your account. If you don't see it, check your spam folder.
                    </p>
                    
                    <button onClick={handleGoogleAuth} className="text-sm font-medium bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
  );
}

export default ConfirmEmail;