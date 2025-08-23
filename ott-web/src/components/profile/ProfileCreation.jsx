import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, User } from 'lucide-react'
import ProfileAvatars from './ProfileAvatars'

const ProfileCreation = ({ onComplete, onBack, initialData = {}, loading = false }) => {
  const [profileData, setProfileData] = useState({
    displayName: initialData.displayName || '',
    avatar: initialData.avatar || null
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('ProfileCreation: Form submitted!')
    console.log('ProfileCreation: profileData:', profileData)
    console.log('ProfileCreation: onComplete function:', onComplete)
    
    if (profileData.displayName.trim() && profileData.avatar) {
      console.log('ProfileCreation: Calling onComplete with:', profileData)
      onComplete(profileData)
    } else {
      console.log('ProfileCreation: Form validation failed')
      console.log('ProfileCreation: displayName valid:', profileData.displayName.trim().length > 0)
      console.log('ProfileCreation: avatar selected:', !!profileData.avatar)
    }
  }

  const isValid = profileData.displayName.trim().length > 0 && profileData.avatar

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-700"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={onBack}
                className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-400" />
              </button>
              <h1 className="text-2xl font-bold text-white">Create Your Profile</h1>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
            <p className="text-gray-400">Choose your profile picture and display name</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose Profile Picture
              </label>
              <ProfileAvatars
                selectedAvatar={profileData.avatar}
                onSelect={(avatar) => setProfileData({ ...profileData, avatar })}
                size="medium"
              />
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="displayName"
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  required
                  maxLength={20}
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your display name"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {profileData.displayName.length}/20 characters
              </p>
            </div>

            {/* Preview */}
            {profileData.avatar && profileData.displayName && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-dark-700/50 rounded-lg p-4 border border-dark-600"
              >
                <p className="text-sm text-gray-400 mb-3">Preview:</p>
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${profileData.avatar.gradient}`} />
                    <img
                      src={profileData.avatar.image}
                      alt={profileData.avatar.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white">{profileData.displayName}</p>
                    <p className="text-sm text-gray-400">{profileData.avatar.name} Avatar</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: isValid && !loading ? 0.98 : 1 }}
              type="submit"
              disabled={!isValid || loading}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 ${
                isValid && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-dark-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating profile...
                </div>
              ) : (
                'Complete Profile'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              You can change your profile picture and name anytime in settings
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ProfileCreation
