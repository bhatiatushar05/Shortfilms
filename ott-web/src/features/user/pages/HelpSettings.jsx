import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Settings,
  User,
  Crown,
  Monitor,
  HelpCircle,
  Eye,
  Calendar,
  Shield,
  CreditCard,
  Edit3,
  Smartphone,
  Laptop,
  Tablet,
  Mail,
  Phone,
  MessageCircle,
  Check,
  X
} from 'lucide-react'
import { useSession } from '../../../hooks/useSession'
import { useUserProfile } from '../../../hooks/useUserProfile'
import ProfileAvatars from '../../../components/profile/ProfileAvatars'

const HelpSettings = () => {
  const navigate = useNavigate()
  const { user } = useSession()
  const { profile, updateProfile, loading: profileLoading } = useUserProfile()
  const [activeSection, setActiveSection] = useState('overview')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    avatar: null
  })

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'membership', label: 'Membership', icon: Crown },
    { id: 'devices', label: 'Linked Devices', icon: Monitor },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'support', label: 'Support', icon: HelpCircle }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Account Info</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="text-gray-900">{profile?.display_name || user?.name || 'User'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="text-gray-900">August 16, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="w-6 h-6 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Current Plan</h3>
          </div>
          <div className="space-y-3">
            <div className="text-2xl font-bold text-gray-900">Basic Plan</div>
            <div className="text-gray-600">$9.99/month</div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => setActiveSection('profile')} className="flex flex-col items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <Edit3 className="w-5 h-5 text-blue-600 mb-2" />
            <span className="text-sm text-gray-700">Edit Profile</span>
          </button>
          <button onClick={() => setActiveSection('devices')} className="flex flex-col items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <Monitor className="w-5 h-5 text-green-600 mb-2" />
            <span className="text-sm text-gray-700">Devices</span>
          </button>
          <button onClick={() => setActiveSection('membership')} className="flex flex-col items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <Crown className="w-5 h-5 text-amber-600 mb-2" />
            <span className="text-sm text-gray-700">Membership</span>
          </button>
          <button onClick={() => setActiveSection('support')} className="flex flex-col items-center p-3 bg-white rounded-lg hover:bg-gray-50 transition-colors">
            <HelpCircle className="w-5 h-5 text-purple-600 mb-2" />
            <span className="text-sm text-gray-700">Support</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderMembership = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Subscription Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Plan</span>
            <span className="font-medium text-gray-900">Basic Plan</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Price</span>
            <span className="font-medium text-gray-900">$9.99/month</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Next Billing</span>
            <span className="font-medium text-gray-900">September 16, 2025</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Billing Information</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                <div className="text-sm text-gray-500">Expires 12/27</div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Edit</button>
          </div>
          <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
            View Billing History
              </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Upgrade to Premium</h3>
        <p className="text-gray-600 mb-4">Get 4K streaming, download for offline viewing, and more</p>
        <button className="bg-amber-600 text-white py-2 px-6 rounded-lg hover:bg-amber-700 transition-colors">
          Upgrade Now - $19.99/month
              </button>
      </div>
    </div>
  )

  const renderDevices = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Active Devices</h3>
        <div className="space-y-4">
          {[
            { name: 'MacBook Pro', type: 'laptop', lastUsed: 'Currently active', icon: Laptop },
            { name: 'iPhone 15', type: 'mobile', lastUsed: '2 hours ago', icon: Smartphone },
            { name: 'iPad Pro', type: 'tablet', lastUsed: '1 day ago', icon: Tablet }
          ].map((device, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <device.icon className="w-6 h-6 text-gray-500" />
                <div>
                  <div className="font-medium text-gray-900">{device.name}</div>
                  <div className="text-sm text-gray-500">{device.lastUsed}</div>
                </div>
              </div>
              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Device Limits</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Devices used:</span>
            <span className="text-gray-900">3 of 2</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            You've reached your device limit. Upgrade to Premium for unlimited devices.
          </p>
        </div>
      </div>
            </div>
          )

    const handleProfileSave = async () => {
    const success = await updateProfile({
      display_name: profileForm.displayName,
      avatar_id: profileForm.avatar?.id,
      avatar_image: profileForm.avatar?.image,
      avatar_gradient: profileForm.avatar?.gradient
    })
    
    if (success) {
      setEditingProfile(false)
    }
  }

  const startEditingProfile = () => {
    setProfileForm({
      displayName: profile?.display_name || user?.name || '',
      avatar: profile ? {
        id: profile.avatar_id,
        image: profile.avatar_image,
        gradient: profile.avatar_gradient,
        name: 'Current'
      } : null
    })
    setEditingProfile(true)
  }

  const renderProfile = () => (
    <div className="space-y-6">
      {/* Profile Picture & Display Name */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Profile</h3>
          {!editingProfile && (
              <button
              onClick={startEditingProfile}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Edit
              </button>
          )}
        </div>

        {editingProfile ? (
          <div className="space-y-6">
            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
              <ProfileAvatars
                selectedAvatar={profileForm.avatar}
                onSelect={(avatar) => setProfileForm({ ...profileForm, avatar })}
                size="small"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <input
                type="text"
                value={profileForm.displayName}
                onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">{profileForm.displayName.length}/20 characters</p>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={handleProfileSave}
                disabled={profileLoading || !profileForm.displayName.trim()}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            {/* Current Avatar */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
              {profile?.avatar_image ? (
                <>
                  <div className={`absolute inset-0 bg-gradient-to-br ${profile.avatar_gradient || 'from-blue-400 to-blue-600'}`} />
                  <img
                    src={profile.avatar_image}
                    alt="Profile"
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            
            {/* Profile Info */}
            <div>
              <div className="font-medium text-gray-900">{profile?.display_name || user?.name || 'User'}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Profile Visibility</div>
              <div className="text-sm text-gray-500">Who can see your profile</div>
            </div>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>Friends only</option>
              <option>Everyone</option>
              <option>Private</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Activity Status</div>
              <div className="text-sm text-gray-500">Show when you're watching</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSupport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: MessageCircle, title: 'Live Chat', desc: 'Get instant help', color: 'blue' },
          { icon: Mail, title: 'Email Support', desc: 'Send us a message', color: 'green' },
          { icon: Phone, title: 'Phone Support', desc: 'Call us directly', color: 'purple' },
          { icon: HelpCircle, title: 'Help Center', desc: 'Browse FAQs', color: 'amber' }
        ].map((item, index) => (
          <button key={index} className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 bg-${item.color}-100 rounded-lg flex items-center justify-center mb-4`}>
              <item.icon className={`w-6 h-6 text-${item.color}-600`} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Support Email:</span>
            <span className="text-blue-600">support@shortcinema.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="text-blue-600">+1 (800) 123-4567</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hours:</span>
            <span className="text-gray-900">24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview()
      case 'membership': return renderMembership()
      case 'devices': return renderDevices()
      case 'profile': return renderProfile()
      case 'support': return renderSupport()
      default: return renderOverview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 ml-20">
      {/* Light Theme Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/my-space')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account and preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                          <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                      activeSection === item.id 
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-r-blue-600' 
                        : 'text-gray-700'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                          </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
                    <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderSection()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpSettings
