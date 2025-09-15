import { CheckCircle } from 'lucide-react';
import { THEME } from "../constants/index";
import { useNavigate } from 'react-router-dom';

const EmailConfirmed = () => {
    const navigate = useNavigate();

    const handleCloseTab = () => {
        // Close the current tab/window
        window.close();
    };

    const handleGoToLogin = () => {
        navigate("/login");
    };

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div 
                    className="bg-white rounded-2xl shadow-lg p-8 text-center"
                    style={{
                        background: THEME.COLORS.MAIN_GRAY
                    }}
                >
                    <div className="w-16 h-16 mx-auto mb-6 text-green-500"
                        style={{
                            background: THEME.COLORS.MAIN_GRAY,
                        }}
                    >
                        <CheckCircle size={64} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4 text-white">
                        Email Confirmed!
                    </h1>

                    <p className="text-white mb-8 max-w-md">
                        Your email has been successfully confirmed. You can now go to login page.
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={handleGoToLogin} 
                            className="w-full text-sm font-medium bg-gray-600 hover:bg-gray-700 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmed;
