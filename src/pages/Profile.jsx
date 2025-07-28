import { useState } from 'react';
import { useAuth } from '../hooks/useStores';
import { AuthService } from '../services/authService.js';
import ProfileTabNavigation from '../components/profile/ProfileTabNavigation';
import ProfileInfoTab from '../components/profile/tabs/ProfileInfoTab';
import ProfileSecurityTab from '../components/profile/tabs/ProfileSecurityTab';
import ProfilePreferencesTab from '../components/profile/tabs/ProfilePreferencesTab';
import ProfileNotificationsTab from '../components/profile/tabs/ProfileNotificationsTab';
import { PROFILE_TABS } from '../constants/profile';

const Profile = () => {
  const { user, refreshToken, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
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

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <ProfileInfoTab
            user={user}
            isEditingUsername={isEditingUsername}
            isEditingEmail={isEditingEmail}
            formData={formData}
            isLoading={isLoading}
            localLoading={localLoading}
            setIsEditingUsername={setIsEditingUsername}
            setIsEditingEmail={setIsEditingEmail}
            handleInputChange={handleInputChange}
            handleUsernameUpdate={handleUsernameUpdate}
            handleEmailUpdate={handleEmailUpdate}
            cancelEdit={cancelEdit}
          />
        );
      case 'security':
        return (
          <ProfileSecurityTab
            isEditingPassword={isEditingPassword}
            formData={formData}
            isLoading={isLoading}
            localLoading={localLoading}
            setIsEditingPassword={setIsEditingPassword}
            handleInputChange={handleInputChange}
            handlePasswordUpdate={handlePasswordUpdate}
            cancelEdit={cancelEdit}
          />
        );
      case 'preferences':
        return <ProfilePreferencesTab />;
      case 'notifications':
        return <ProfileNotificationsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {(successMessage || errorMessage) && (
          <div className={`mb-6 p-4 rounded-md ${successMessage ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
            <p className={`text-sm ${successMessage ? 'text-green-300' : 'text-red-300'}`}>
              {successMessage || errorMessage}
            </p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <ProfileTabNavigation 
            tabs={PROFILE_TABS}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Main Content Area */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;