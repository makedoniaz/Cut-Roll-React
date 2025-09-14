import { useState } from 'react';
import { useAuth } from '../hooks/useStores';
import { AuthService } from '../services/authService.js';

const Settings = () => {
  const { user, refreshToken, isLoading } = useAuth();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showMessage = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 6000);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUsernameUpdate = async () => {
    if (formData.username.trim() === user.username) {
      showMessage('Username is the same as current username', true);
      return;
    }
    
    if (!formData.username.trim()) {
      showMessage('Username cannot be empty', true);
      return;
    }
    
    setLocalLoading(true);
    
    try {
      const profileData = {
        userName: formData.username.trim(),
        email: null,
        refresh: refreshToken || null
      };

      const result = await AuthService.updateProfile(profileData);
      console.log("Updating token")
      await AuthService.refreshToken(refreshToken)
      console.log("token updated")
      
      if (result.success) {
        setIsEditingUsername(false);
        showMessage('Username updated successfully!');
      } else {
        showMessage(result.error || 'Failed to update username', true);
      }
    } catch (error) {
      showMessage('An error occurred while updating username', true);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEmailUpdate = async () => {
    if (formData.email.trim().toLowerCase() === user.email.toLowerCase()) {
      showMessage('Email is the same as current email', true);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      showMessage('Please enter a valid email address', true);
      return;
    }
    
    setLocalLoading(true);
    
    try {
      const profileData = {
        userName: null,
        email: formData.email.trim().toLowerCase(),
        refresh: refreshToken || null
      };

      const result = await AuthService.updateProfile(profileData);
      
      if (result.success) {
        setIsEditingEmail(false);
        showMessage('Email updated successfully!');
      } else {
        showMessage(result.error || 'Failed to update email', true);
      }
    } catch (error) {
      showMessage('An error occurred while updating email', true);
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      showMessage('New passwords do not match', true);
      return;
    }
    if (formData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', true);
      return;
    }
    
    setLocalLoading(true);
    try {
      // Note: Password change might need a different endpoint
      // For now, this is a placeholder - you may need to create a separate password change method
      console.log('Password change would be implemented here');
      showMessage('Password functionality needs to be implemented in your backend', true);
      
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditingPassword(false);
    } catch (error) {
      showMessage('An error occurred while updating password', true);
    } finally {
      setLocalLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditingEmail(false);
    setIsEditingUsername(false);
    setIsEditingPassword(false);
    setFormData({
      username: user.username,
      email: user.email,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-400">Manage your account information and security</p>
        </div>

        {/* Success/Error Messages */}
        {(successMessage || errorMessage) && (
          <div className={`mb-6 p-4 rounded-md ${successMessage ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
            <p className={`text-sm ${successMessage ? 'text-green-300' : 'text-red-300'}`}>
              {successMessage || errorMessage}
            </p>
          </div>
        )}

        <div className="space-y-6">
          {/* Username Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Username
            </h2>
            
            {!isEditingUsername ? (
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-gray-600">
                <span className="text-white">{user.username}</span>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new username"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleUsernameUpdate}
                    disabled={isLoading || localLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {(isLoading || localLoading) ? 'Updating...' : 'Update Username'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Address
            </h2>

            {!isEditingEmail ? (
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-gray-600">
                <span className="text-white">{user.email}</span>
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new email address"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleEmailUpdate}
                    disabled={isLoading || localLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {(isLoading || localLoading) ? 'Updating...' : 'Update Email'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Password
            </h2>

            {!isEditingPassword ? (
              <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md border border-gray-600">
                <span className="text-gray-400">••••••••</span>
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handlePasswordUpdate}
                    disabled={isLoading || localLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {(isLoading || localLoading) ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
