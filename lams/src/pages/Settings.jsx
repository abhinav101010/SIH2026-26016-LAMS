import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Save,
  Camera,
  Download,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authApi } from '../services'
import { formatDate } from '../utils/formatters'
import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import ClayInput from '../components/ui/ClayInput'
import ClaySwitch from '../components/ui/ClaySwitch'
import ClayRadio from '../components/ui/ClayRadio'

const SettingsPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    proposals: true,
    compensation: true,
    deadlines: true,
    system: true,
  })

  const [settings, setSettings] = useState({
    theme: 'system',
    language: 'en',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'Asia/Kolkata',
    autoRefresh: true,
    auditTrail: true,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'audit', label: 'Audit & Logs', icon: Shield },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account and platform preferences</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200
                ${active
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-card border border-border text-text-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'}
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'profile' && (
          <ProfileSettings user={user} />
        )}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'notifications' && (
          <NotificationSettings notifications={notifications} setNotifications={setNotifications} />
        )}
        {activeTab === 'preferences' && (
          <PreferencesSettings settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'audit' && <AuditSettings />}
      </motion.div>
    </div>
  )
}

function ProfileSettings({ user }) {
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    employeeId: user?.employeeId || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await authApi.updateProfile(profile)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Profile Information</h2>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <User size={32} />
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-lg bg-info/10 text-info border border-border flex items-center justify-center hover:bg-info/20 transition">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="font-medium text-foreground">{profile.name}</p>
            <p className="text-sm text-text-secondary">{profile.employeeId}</p>
            <p className="text-xs text-text-tertiary mt-1">Joined: {user?.joinedDate ? formatDate(user.joinedDate) : '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClayInput
            label="Full Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
          <ClayInput
            label="Email Address"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
          <ClayInput
            label="Phone Number"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
          <ClayInput
            label="Department"
            value={profile.department}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
          />
          <div className="md:col-span-2">
            <ClayInput
              label="Employee ID"
              value={profile.employeeId}
              onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })}
            />
          </div>
        </div>
      </ClayCard>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-status-approved/10 text-status-approved border border-status-approved/30' : 'bg-status-rejected/10 text-status-rejected border border-status-rejected/30'}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <ClayButton variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </ClayButton>
      </div>
    </div>
  )
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Password & Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <Lock size={20} className="text-text-secondary" />
              <div>
                <p className="font-medium text-foreground">Change Password</p>
                <p className="text-xs text-text-tertiary">Update your account password</p>
              </div>
            </div>
            <ClayButton variant="outline" size="sm">
              Change
            </ClayButton>
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-text-secondary" />
              <div>
                <p className="font-medium text-foreground">Two-Factor Authentication</p>
                <p className="text-xs text-text-tertiary">Add an extra layer of security</p>
              </div>
            </div>
            <ClaySwitch label="" checked={true} onChange={() => {}} />
          </div>
          <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-text-secondary" />
              <div>
                <p className="font-medium text-foreground">Session Timeout</p>
                <p className="text-xs text-text-tertiary">Auto-logout after 30 minutes of inactivity</p>
              </div>
            </div>
            <ClayButton variant="outline" size="sm">
              Configure
            </ClayButton>
          </div>
        </div>
      </ClayCard>

      <div className="flex justify-end">
        <ClayButton variant="primary" icon={Save}>
          Save Changes
        </ClayButton>
      </div>
    </div>
  )
}

function NotificationSettings({ notifications, setNotifications }) {
  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Channels</h3>
            <div className="space-y-3">
              <ClaySwitch
                label="Email notifications"
                description="Receive notifications via email"
                checked={notifications.email}
                onChange={() => handleToggle('email')}
              />
              <ClaySwitch
                label="Push notifications"
                description="Receive push notifications on mobile"
                checked={notifications.push}
                onChange={() => handleToggle('push')}
              />
              <ClaySwitch
                label="Desktop notifications"
                description="Receive notifications on desktop"
                checked={notifications.desktop}
                onChange={() => handleToggle('desktop')}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Event Types</h3>
            <div className="space-y-3">
              <ClaySwitch
                label="Proposal updates"
                description="Status changes on proposals you manage"
                checked={notifications.proposals}
                onChange={() => handleToggle('proposals')}
              />
              <ClaySwitch
                label="Compensation updates"
                description="Compensation disbursement notifications"
                checked={notifications.compensation}
                onChange={() => handleToggle('compensation')}
              />
              <ClaySwitch
                label="Deadline reminders"
                description="Upcoming deadlines and due dates"
                checked={notifications.deadlines}
                onChange={() => handleToggle('deadlines')}
              />
              <ClaySwitch
                label="System notifications"
                description="Maintenance and system-wide updates"
                checked={notifications.system}
                onChange={() => handleToggle('system')}
              />
            </div>
          </div>
        </div>
      </ClayCard>

      <div className="flex justify-end">
        <ClayButton variant="primary" icon={Save}>
          Save Preferences
        </ClayButton>
      </div>
    </div>
  )
}

function PreferencesSettings({ settings, setSettings }) {
  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Application Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Theme</label>
            <div className="space-y-2">
              {[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' },
              ].map((opt) => (
                <ClayRadio
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                  checked={settings.theme === opt.value}
                  onChange={() => setSettings((s) => ({ ...s, theme: opt.value }))}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="bn">বাংলা (Bengali)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>

          <div>
            <ClayInput
              label="Date Format"
              value={settings.dateFormat}
              onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <ClaySwitch
            label="Auto-refresh dashboard"
            description="Automatically refresh data every 5 minutes"
            checked={settings.autoRefresh}
            onChange={() => setSettings((s) => ({ ...s, autoRefresh: !s.autoRefresh }))}
          />
        </div>
      </ClayCard>

      <div className="flex justify-end">
        <ClayButton variant="primary" icon={Save}>
          Save Preferences
        </ClayButton>
      </div>
    </div>
  )
}

function AuditSettings() {
  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Audit Trail & Logs</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-text-secondary" />
              <div>
                <p className="font-medium text-foreground">Audit Trail Enabled</p>
                <p className="text-xs text-text-tertiary">All actions are logged with timestamps</p>
              </div>
            </div>
            <ClaySwitch label="" checked={true} onChange={() => {}} />
          </div>

          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Download Audit Log</h3>
            <div className="flex gap-3">
              <ClayButton variant="outline" size="sm" icon={Download}>
                Download (CSV)
              </ClayButton>
              <ClayButton variant="outline" size="sm" icon={Download}>
                Download (PDF)
              </ClayButton>
            </div>
          </div>

          <div className="border border-border rounded-xl p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Recent Activity</h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-text-secondary">2026-08-31 14:32</span>
                <span className="text-foreground ml-2">Logged in as Administrator</span>
              </div>
              <div>
                <span className="text-text-secondary">2026-08-31 11:45</span>
                <span className="text-foreground ml-2">Viewed proposal Bharat Bhoomi-2026-00124</span>
              </div>
              <div>
                <span className="text-text-secondary">2026-08-31 09:15</span>
                <span className="text-foreground ml-2">Updated land parcel status</span>
              </div>
            </div>
          </div>
        </div>
      </ClayCard>

      <div className="flex justify-end">
        <ClayButton variant="primary" icon={Save}>
          Save Settings
        </ClayButton>
      </div>
    </div>
  )
}

export default SettingsPage
