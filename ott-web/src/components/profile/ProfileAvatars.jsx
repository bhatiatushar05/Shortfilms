import React from 'react'
import { motion } from 'framer-motion'

const ProfileAvatars = ({ selectedAvatar, onSelect, size = 'medium' }) => {
  // Netflix-style profile avatars
  const avatars = [
    {
      id: 'avatar-1',
      name: 'Casual',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-blue-400 to-blue-600'
    },
    {
      id: 'avatar-2', 
      name: 'Professional',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b09e7d10?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-pink-400 to-pink-600'
    },
    {
      id: 'avatar-3',
      name: 'Creative',
      image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-green-400 to-green-600'
    },
    {
      id: 'avatar-4',
      name: 'Cool',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-purple-400 to-purple-600'
    },
    {
      id: 'avatar-5',
      name: 'Friendly',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-amber-400 to-amber-600'
    },
    {
      id: 'avatar-6',
      name: 'Modern',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-red-400 to-red-600'
    },
    {
      id: 'avatar-7',
      name: 'Elegant',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-teal-400 to-teal-600'
    },
    {
      id: 'avatar-8',
      name: 'Dynamic',
      image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face&auto=format',
      gradient: 'from-orange-400 to-orange-600'
    }
  ]

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20'
  }

  const gridClasses = {
    small: 'grid-cols-4',
    medium: 'grid-cols-4', 
    large: 'grid-cols-3'
  }

  return (
    <div className={`grid ${gridClasses[size]} gap-4`}>
      {avatars.map((avatar, index) => (
        <motion.button
          key={avatar.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(avatar)}
          className={`relative ${sizeClasses[size]} rounded-full overflow-hidden border-3 transition-all duration-200 ${
            selectedAvatar?.id === avatar.id
              ? 'border-blue-500 ring-4 ring-blue-500/30'
              : 'border-transparent hover:border-gray-300'
          }`}
        >
          {/* Fallback gradient background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${avatar.gradient}`} />
          
          {/* Profile image */}
          <img
            src={avatar.image}
            alt={avatar.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error, show gradient background
              e.target.style.display = 'none'
            }}
          />
          
          {/* Selection indicator */}
          {selectedAvatar?.id === avatar.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 bg-blue-500/20 flex items-center justify-center"
            >
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  )
}

export default ProfileAvatars

