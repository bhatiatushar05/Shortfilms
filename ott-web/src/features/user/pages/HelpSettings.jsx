import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Settings,
  HelpCircle,
  Shield,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  User,
  Lock,
  CreditCard,
  Mail,
  Phone,
  MessageCircle,
  Book,
  ChevronRight,
  Check
} from 'lucide-react'
import { useSession } from '../../../hooks/useSession'

const HelpSettings = () => {
  const navigate = useNavigate()
  const { user } = useSession()
  const [theme, setTheme] = useState('system')
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('en')

  const handleDemo = (action) => {
    alert(`Demo: ${action} feature would work in production!`)
  }

  const settingsGroups = [
    {
      title: 'Account',
      icon: User,
      items: [
        { label: 'Edit Profile', action: () => handleDemo('Edit Profile') },
        { label: 'Privacy Settings', action: () => handleDemo('Privacy Settings') },
        { label: 'Security', action: () => handleDemo('Security Settings') },
        { label: 'Linked Accounts', action: () => handleDemo('Linked Accounts') },
      ]
    },
    {
      title: 'Preferences',
      icon: Settings,
      items: [
        { 
          label: 'Theme', 
          action: () => {},
          component: (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'light' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'system' ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          )
        },
        { 
          label: 'Notifications', 
          action: () => {},
          component: (
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications ? 'bg-red-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          )
        },
        { 
          label: 'Language', 
          action: () => {},
          component: (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिंदी</option>
            </select>
          )
        },
        { label: 'Playback Quality', action: () => handleDemo('Playback Quality') },
      ]
    },
    {
      title: 'Subscription',
      icon: CreditCard,
      items: [
        { label: 'Billing History', action: () => handleDemo('Billing History') },
        { label: 'Payment Methods', action: () => handleDemo('Payment Methods') },
        { label: 'Cancel Subscription', action: () => handleDemo('Cancel Subscription') },
        { label: 'Download Invoices', action: () => handleDemo('Download Invoices') },
      ]
    }
  ]

  const helpItems = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      action: () => handleDemo('Live Chat')
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: () => handleDemo('Email Support')
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Call us for urgent issues',
      action: () => handleDemo('Phone Support')
    },
    {
      icon: Book,
      title: 'Help Center',
      description: 'Browse our knowledge base',
      action: () => handleDemo('Help Center')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-slate-100 ml-20">
      {/* Header */}
      <div className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-600/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/my-space')}
              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">Help & Settings</h1>
                <p className="text-slate-300">Manage your preferences and get support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-red-600" />
              Settings
            </h2>
            
            <div className="space-y-6">
              {settingsGroups.map((group, groupIndex) => (
                <motion.div
                  key={group.title}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/30 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-600/50">
                    <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                      <group.icon className="w-4 h-4 text-red-400" />
                      {group.title}
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-600/30">
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="p-4 flex items-center justify-between hover:bg-slate-600/30 transition-colors">
                        <span className="text-slate-200">{item.label}</span>
                        {item.component ? (
                          item.component
                        ) : (
                          <button
                            onClick={item.action}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-red-600" />
              Help & Support
            </h2>
            
            <div className="space-y-4 mb-8">
              {helpItems.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={item.action}
                  className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md hover:border-red-200 transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Quick Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white"
            >
              <h3 className="font-semibold mb-2">Need immediate help?</h3>
              <p className="text-red-100 text-sm mb-4">
                Our support team is available 24/7 to assist you with any issues or questions.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs">Live Chat</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs">Email</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs">Phone</span>
              </div>
            </motion.div>

            {/* Account Info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="text-gray-800 font-mono">{user?.id?.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="text-gray-800">August 16, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">App Version:</span>
                  <span className="text-gray-800">2.1.0</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpSettings
