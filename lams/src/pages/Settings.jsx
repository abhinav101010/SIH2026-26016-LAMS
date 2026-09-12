import { useState } from 'react'
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
import ClayButton from '../components/ui/ClayButton'
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Button,
  IconButton,
  alpha,
  useTheme,
} from '@mui/material'

const SettingsPage = () => {
  const { user } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
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

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '1200px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText' }}>
          <Shield size={20} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>Settings</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage your account and platform preferences</Typography>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: `1px solid ${borderColor}`,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, gap: 1, minHeight: 48 },
          '& .Mui-selected': { fontWeight: 600, color: 'primary.main' },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 3 },
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Tab key={tab.id} value={tab.id} icon={<Icon size={16} />} label={tab.label} />
          )
        })}
      </Tabs>

      <Box>
        {activeTab === 'profile' && <ProfileSettings user={user} borderColor={borderColor} isDark={isDark} />}
        {activeTab === 'security' && <SecuritySettings borderColor={borderColor} isDark={isDark} />}
        {activeTab === 'notifications' && (
          <NotificationSettings notifications={notifications} setNotifications={setNotifications} borderColor={borderColor} isDark={isDark} />
        )}
        {activeTab === 'preferences' && (
          <PreferencesSettings settings={settings} setSettings={setSettings} borderColor={borderColor} isDark={isDark} />
        )}
        {activeTab === 'audit' && <AuditSettings borderColor={borderColor} isDark={isDark} />}
      </Box>
    </Box>
  )
}

function ProfileSettings({ user, borderColor, isDark }) {
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
      await authApi.updateProfile(profile)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Profile Information</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ width: 80, height: 80, borderRadius: 4, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText' }}>
                <User size={32} />
              </Box>
              <IconButton size="small" sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: 'background.paper', border: `1px solid ${borderColor}`, '&:hover': { bgcolor: 'action.hover' } }}>
                <Camera size={14} />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={600}>{profile.name}</Typography>
              <Typography variant="body2" color="text.secondary">{profile.employeeId}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>Joined: {user?.joinedDate ? formatDate(user.joinedDate) : '-'}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <TextField label="Full Name" fullWidth size="small" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <TextField label="Email Address" type="email" fullWidth size="small" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <TextField label="Phone Number" fullWidth size="small" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <TextField label="Department" fullWidth size="small" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} />
              </Box>
            </Box>
            <Box sx={{ maxWidth: 480 }}>
              <TextField label="Employee ID" fullWidth size="small" value={profile.employeeId} onChange={(e) => setProfile({ ...profile, employeeId: e.target.value })} />
            </Box>
          </Box>
        </Box>
      </Card>

      {message && (
        <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${message.type === 'success' ? theme.palette.success.main : theme.palette.error.main}33`, bgcolor: message.type === 'success' ? alpha(theme.palette.success.main, 0.06) : alpha(theme.palette.error.main, 0.06) }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {message.type === 'success' ? <CheckCircle size={18} style={{ color: theme.palette.success.main }} /> : <AlertCircle size={18} style={{ color: theme.palette.error.main }} />}
            <Typography variant="body2" sx={{ color: message.type === 'success' ? 'success.main' : 'error.main' }}>{message.text}</Typography>
          </Box>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ClayButton variant="primary" icon={Save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </ClayButton>
      </Box>
    </Box>
  )
}

function SecuritySettings({ borderColor, isDark }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Password & Security</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              { icon: Lock, title: 'Change Password', desc: 'Update your account password', action: 'Change' },
              { icon: Shield, title: 'Two-Factor Authentication', desc: 'Add an extra layer of security', action: null, switch: true },
              { icon: Bell, title: 'Session Timeout', desc: 'Auto-logout after 30 minutes of inactivity', action: 'Configure' },
            ].map((item) => (
              <Box key={item.title} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 3, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', border: `1px solid ${borderColor}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <item.icon size={20} />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                </Box>
                {item.switch ? (
                  <Switch size="small" defaultChecked />
                ) : (
                  <Button variant="outlined" size="small" sx={{ borderRadius: 2 }}>{item.action}</Button>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ClayButton variant="primary" icon={Save}>Save Changes</ClayButton>
      </Box>
    </Box>
  )
}

function NotificationSettings({ notifications, setNotifications, borderColor, isDark }) {
  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Notification Preferences</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Channels</Typography>
              {[
                { key: 'email', label: 'Email notifications', desc: 'Receive notifications via email' },
                { key: 'push', label: 'Push notifications', desc: 'Receive push notifications on mobile' },
                { key: 'desktop', label: 'Desktop notifications', desc: 'Receive notifications on desktop' },
              ].map((item) => (
                <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                  <Switch size="small" checked={notifications[item.key]} onChange={() => handleToggle(item.key)} />
                </Box>
              ))}
            </Box>

            <Box sx={{ borderTop: `1px solid ${borderColor}`, pt: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Event Types</Typography>
              {[
                { key: 'proposals', label: 'Proposal updates', desc: 'Status changes on proposals you manage' },
                { key: 'compensation', label: 'Compensation updates', desc: 'Compensation disbursement notifications' },
                { key: 'deadlines', label: 'Deadline reminders', desc: 'Upcoming deadlines and due dates' },
                { key: 'system', label: 'System notifications', desc: 'Maintenance and system-wide updates' },
              ].map((item) => (
                <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                  </Box>
                  <Switch size="small" checked={notifications[item.key]} onChange={() => handleToggle(item.key)} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ClayButton variant="primary" icon={Save}>Save Preferences</ClayButton>
      </Box>
    </Box>
  )
}

function PreferencesSettings({ settings, setSettings, borderColor, isDark }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Application Preferences</Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Theme</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Theme</InputLabel>
                  <Select value={settings.theme} label="Theme" onChange={(e) => setSettings((s) => ({ ...s, theme: e.target.value }))}>
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Language</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Language</InputLabel>
                  <Select value={settings.language} label="Language" onChange={(e) => setSettings((s) => ({ ...s, language: e.target.value }))}>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                    <MenuItem value="ta">தமிழ் (Tamil)</MenuItem>
                    <MenuItem value="te">తెలుగు (Telugu)</MenuItem>
                    <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                    <MenuItem value="mr">मराठी (Marathi)</MenuItem>
                    <MenuItem value="gu">ગુજરાતી (Gujarati)</MenuItem>
                    <MenuItem value="kn">ಕನ್ನಡ (Kannada)</MenuItem>
                    <MenuItem value="ml">മലയാളം (Malayalam)</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <TextField label="Date Format" fullWidth size="small" value={settings.dateFormat} onChange={(e) => setSettings((s) => ({ ...s, dateFormat: e.target.value }))} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 240 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Timezone</InputLabel>
                  <Select value={settings.timezone} label="Timezone" onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}>
                    <MenuItem value="Asia/Kolkata">Asia/Kolkata (IST)</MenuItem>
                    <MenuItem value="Asia/Dubai">Asia/Dubai (GST)</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ borderTop: `1px solid ${borderColor}`, pt: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>Auto-refresh dashboard</Typography>
                  <Typography variant="caption" color="text.secondary">Automatically refresh data every 5 minutes</Typography>
                </Box>
                <Switch size="small" checked={settings.autoRefresh} onChange={() => setSettings((s) => ({ ...s, autoRefresh: !s.autoRefresh }))} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ClayButton variant="primary" icon={Save}>Save Preferences</ClayButton>
      </Box>
    </Box>
  )
}

function AuditSettings({ borderColor, isDark }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Audit Trail & Logs</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, borderRadius: 3, border: `1px solid ${borderColor}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Shield size={20} />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={600}>Audit Trail Enabled</Typography>
                  <Typography variant="caption" color="text.secondary">All actions are logged with timestamps</Typography>
                </Box>
              </Box>
              <Switch size="small" defaultChecked />
            </Box>

            <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Download Audit Log</Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <ClayButton variant="outline" size="sm" icon={Download}>Download (CSV)</ClayButton>
                <ClayButton variant="outline" size="sm" icon={Download}>Download (PDF)</ClayButton>
              </Box>
            </Box>

            <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: 3, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Recent Activity</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { time: '2026-08-31 14:32', text: 'Logged in as Administrator' },
                  { time: '2026-08-31 11:45', text: 'Viewed proposal Bharat Bhoomi-2026-00124' },
                  { time: '2026-08-31 09:15', text: 'Updated land parcel status' },
                ].map((item) => (
                  <Box key={item.text} sx={{ display: 'flex', gap: 1.5, alignItems: 'baseline' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{item.time}</Typography>
                    <Typography variant="caption">{item.text}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ClayButton variant="primary" icon={Save}>Save Settings</ClayButton>
      </Box>
    </Box>
  )
}

export default SettingsPage
