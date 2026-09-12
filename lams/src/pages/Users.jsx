import { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  UserPlus,
  Edit3,
  Trash2,
  ShieldCheck,
  UserX,
  KeyRound,
  X,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  Building2,
  Briefcase,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import PermissionGate from '../auth/PermissionGate'
import { userApi, roleApi } from '../services'
import { departmentApi } from '../services'
import { useToast } from '../components/ui/Toast'
import ClayButton from '../components/ui/ClayButton'
import ClayInput from '../components/ui/ClayInput'
import ClaySelect from '../components/ui/ClaySelect'
import ClayBadge from '../components/ui/ClayBadge'
import ClaySwitch from '../components/ui/ClaySwitch'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/formatters'
import {
  Box,
  Card,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  PROPOSAL_OFFICER: 'Proposal Officer',
  REVIEWING_AUTHORITY: 'Reviewing Authority',
  FIELD_OFFICER: 'Field Officer',
}

const ROLE_COLORS = {
  SUPER_ADMIN: 'error',
  PROPOSAL_OFFICER: 'primary',
  REVIEWING_AUTHORITY: 'info',
  FIELD_OFFICER: 'success',
}

const STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
}

const PERMISSION_CATEGORIES = {
  dashboard: 'Dashboard',
  proposals: 'Proposals',
  users: 'Users & Roles',
  roles: 'Roles',
  gis: 'GIS Map',
  parcels: 'Land Parcels',
  documents: 'Documents',
  reports: 'Reports',
  notifications: 'Notifications',
  settings: 'Settings',
  audit: 'Audit Logs',
  compensation: 'Compensation',
  possession: 'Possession',
}

const ALL_PERMISSIONS = [
  { key: 'DASHBOARD_VIEW', label: 'View Dashboard', category: 'dashboard' },
  { key: 'DASHBOARD_STATS', label: 'View Statistics', category: 'dashboard' },
  { key: 'PROPOSALS_VIEW', label: 'View Proposals', category: 'proposals' },
  { key: 'PROPOSALS_CREATE', label: 'Create Proposal', category: 'proposals' },
  { key: 'PROPOSALS_EDIT', label: 'Edit Proposal', category: 'proposals' },
  { key: 'PROPOSALS_SUBMIT', label: 'Submit for Review', category: 'proposals' },
  { key: 'PROPOSALS_APPROVE', label: 'Approve Proposal', category: 'proposals' },
  { key: 'PROPOSALS_REJECT', label: 'Reject Proposal', category: 'proposals' },
  { key: 'PROPOSALS_DELETE', label: 'Delete Proposal', category: 'proposals' },
  { key: 'USERS_VIEW', label: 'View Users', category: 'users' },
  { key: 'USERS_CREATE', label: 'Create User', category: 'users' },
  { key: 'USERS_EDIT', label: 'Edit User', category: 'users' },
  { key: 'USERS_DELETE', label: 'Delete User', category: 'users' },
  { key: 'USERS_CHANGE_ROLE', label: 'Change Role', category: 'users' },
  { key: 'USERS_RESET_PASSWORD', label: 'Reset Password', category: 'users' },
  { key: 'ROLES_VIEW', label: 'View Roles', category: 'roles' },
  { key: 'ROLES_CREATE', label: 'Create Role', category: 'roles' },
  { key: 'ROLES_EDIT', label: 'Edit Role', category: 'roles' },
  { key: 'ROLES_DELETE', label: 'Delete Role', category: 'roles' },
  { key: 'GIS_VIEW', label: 'View Map', category: 'gis' },
  { key: 'GIS_EDIT', label: 'Edit Map Layers', category: 'gis' },
  { key: 'GIS_EXPORT', label: 'Export GIS Data', category: 'gis' },
  { key: 'UPDATE_PARCELS', label: 'Update Land Parcels', category: 'parcels' },
  { key: 'DOCUMENTS_VIEW', label: 'View Documents', category: 'documents' },
  { key: 'DOCUMENTS_UPLOAD', label: 'Upload Documents', category: 'documents' },
  { key: 'DOCUMENTS_VERIFY', label: 'Verify Documents', category: 'documents' },
  { key: 'REPORTS_VIEW', label: 'View Reports', category: 'reports' },
  { key: 'REPORTS_EXPORT', label: 'Export Reports', category: 'reports' },
  { key: 'NOTIFICATIONS_VIEW', label: 'View Notifications', category: 'notifications' },
  { key: 'NOTIFICATIONS_MANAGE', label: 'Manage Notifications', category: 'notifications' },
  { key: 'SETTINGS_VIEW', label: 'View Settings', category: 'settings' },
  { key: 'SETTINGS_EDIT', label: 'Edit Settings', category: 'settings' },
  { key: 'AUDIT_VIEW', label: 'View Audit Logs', category: 'audit' },
  { key: 'AUDIT_EXPORT', label: 'Export Audit Logs', category: 'audit' },
  { key: 'MANAGE_COMPENSATION', label: 'Manage Compensation', category: 'compensation' },
  { key: 'MANAGE_POSSESSION', label: 'Manage Possession', category: 'possession' },
]

function UserModal({ isOpen, onClose, user, roles, departments, onSave }) {
  const toast = useToast()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [form, setForm] = useState({
    name: '', email: '', phone: '', departmentId: '', department: '', employeeId: '', role: 'PROPOSAL_OFFICER', password: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '', email: user.email || '', phone: user.phone || '',
        departmentId: user.departmentId || '', department: user.department || '',
        employeeId: user.employeeId || '', role: user.role || 'PROPOSAL_OFFICER', password: '',
      })
    } else {
      setForm({ name: '', email: '', phone: '', departmentId: '', department: '', employeeId: '', role: 'PROPOSAL_OFFICER', password: '' })
    }
  }, [user, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = { ...form }
      if (user) delete data.password
      if (!user && !data.password) { toast.error({ title: 'Password required', message: 'Please enter a password for new user' }); setSaving(false); return }
      if (!data.password && !user) { setSaving(false); return }
      await onSave(data)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Edit User' : 'Add New User'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <ClayInput label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <ClayInput label="Email Address *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <ClayInput label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={500}>Department</Typography>
            </Box>
            <FormControl fullWidth size="small">
              <Select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              >
                <MenuItem value="">Select Department</MenuItem>
                {departments.map((d) => (
                  <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ maxWidth: 480 }}>
          <ClayInput label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
        </Box>
        <Box sx={{ maxWidth: 480 }}>
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={500}>Role *</Typography>
          </Box>
          <FormControl fullWidth size="small">
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roles.map((r) => (
                <MenuItem key={r.id} value={r.name}>{ROLE_LABELS[r.name] || r.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {!user && (
          <Box sx={{ maxWidth: 480 }}>
            <ClayInput label="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
          <ClayButton variant="outline" onClick={onClose}>Cancel</ClayButton>
          <ClayButton variant="primary" type="submit" loading={saving}>{user ? 'Update User' : 'Create User'}</ClayButton>
        </Box>
      </form>
    </Modal>
  )
}

function RoleModal({ isOpen, onClose, role, onSave }) {
  const [form, setForm] = useState({ name: '', description: '', permissions: [] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (role) {
      setForm({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions?.map((p) => p.name) || [],
      })
    } else {
      setForm({ name: '', description: '', permissions: [] })
    }
  }, [role, isOpen])

  const togglePermission = (permKey) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permKey) ? prev.permissions.filter((p) => p !== permKey) : [...prev.permissions, permKey],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={role ? 'Edit Role' : 'Create New Role'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <ClayInput label="Role Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Box>
          <Box sx={{ flex: 1, minWidth: 240 }}>
            <ClayInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Box>
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={500} sx={{ mb: 2 }}>Permissions</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 320, overflowY: 'auto', pr: 1 }}>
            {Object.entries(PERMISSION_CATEGORIES).map(([catKey, catLabel]) => {
              const perms = ALL_PERMISSIONS.filter((p) => p.category === catKey)
              return (
                <Box key={catKey}>
                  <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', display: 'block', mb: 1 }}>{catLabel}</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                    {perms.map((perm) => (
                      <Box key={perm.key} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={() => togglePermission(perm.key)}>
                        <Switch size="small" checked={form.permissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} />
                        <Typography variant="body2">{perm.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
          <ClayButton variant="outline" onClick={onClose}>Cancel</ClayButton>
          <ClayButton variant="primary" type="submit" loading={saving}>{role ? 'Update Role' : 'Create Role'}</ClayButton>
        </Box>
      </form>
    </Modal>
  )
}

function UserDetailDrawer({ isOpen, onClose, user, onStatusChange, onRoleChange, onResetPassword }) {
  if (!user) return null
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: isOpen ? 'flex' : 'none' }}>
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} onClick={onClose} />
      <Box sx={{ position: 'absolute', right: 0, top: 0, height: '100%', width: { xs: '100%', sm: 420 }, bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflowY: 'auto' }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>User Details</Typography>
            <IconButton onClick={onClose} sx={{ borderRadius: 2 }}><X size={18} /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText', fontSize: '1.25rem', fontWeight: 700 }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={600}>{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">{user.email}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <ClayBadge color={ROLE_COLORS[user.role] || 'secondary'} size="sm">{ROLE_LABELS[user.role] || user.role}</ClayBadge>
                <ClayBadge color={user.isActive ? 'success' : 'error'} size="sm">{user.isActive ? 'Active' : 'Inactive'}</ClayBadge>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 4 }}>
            {[
              { icon: Mail, label: 'Email', value: user.email },
              { icon: Phone, label: 'Phone', value: user.phone || '-' },
              { icon: Building2, label: 'Department', value: user.departmentRef?.name || user.department || '-' },
              { icon: Briefcase, label: 'Employee ID', value: user.employeeId || '-' },
              { icon: CalendarDays, label: 'Joined', value: user.joinedDate ? formatDate(user.joinedDate) : '-' },
              { icon: Clock, label: 'Last Login', value: user.lastLogin ? formatDate(user.lastLogin) : 'Never' },
            ].map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ color: 'text.secondary', display: 'flex' }}><item.icon size={16} /></Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Quick Actions</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <PermissionGate permission="USERS_CHANGE_ROLE" fallback={<div />}>
                <ClayButton variant="outline" size="sm" icon={Edit3} onClick={() => onRoleChange(user)}>Change Role</ClayButton>
              </PermissionGate>
              <PermissionGate permission="USERS_RESET_PASSWORD" fallback={<div />}>
                <ClayButton variant="outline" size="sm" icon={KeyRound} onClick={() => onResetPassword(user)}>Reset Password</ClayButton>
              </PermissionGate>
              <PermissionGate permission="USERS_EDIT" fallback={<div />}>
                <ClayButton variant={user.isActive ? 'danger' : 'success'} size="sm" icon={user.isActive ? UserX : CheckCircle2} onClick={() => onStatusChange(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</ClayButton>
              </PermissionGate>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function RoleDetailDrawer({ isOpen, onClose, role, users, onEdit, onDelete }) {
  if (!role) return null
  const roleUsers = users.filter((u) => u.role === role.name)
  const permissionCount = role.permissions?.length || 0
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, display: isOpen ? 'flex' : 'none' }}>
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.3)' }} onClick={onClose} />
      <Box sx={{ position: 'absolute', right: 0, top: 0, height: '100%', width: { xs: '100%', sm: 420 }, bgcolor: 'background.paper', borderLeft: '1px solid', borderColor: 'divider', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflowY: 'auto' }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Role Details</Typography>
            <IconButton onClick={onClose} sx={{ borderRadius: 2 }}><X size={18} /></IconButton>
          </Box>
          <Box sx={{ mb: 4 }}>
            <ClayBadge color={ROLE_COLORS[role.name] || 'secondary'} size="lg">{ROLE_LABELS[role.name] || role.name}</ClayBadge>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{role.description || 'No description provided'}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><ShieldCheck size={14} /> {permissionCount} permissions</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Users size={14} /> {roleUsers.length} users</Typography>
            </Box>
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Assigned Permissions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {role.permissions?.length > 0 ? role.permissions.map((p) => { const perm = ALL_PERMISSIONS.find((ap) => ap.key === p.name); return <ClayBadge key={p.id} color="info" size="sm">{perm?.label || p.name}</ClayBadge> }) : <Typography variant="caption" color="text.secondary">No permissions assigned</Typography>}
            </Box>
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>Assigned Users ({roleUsers.length})</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 240, overflowY: 'auto' }}>
              {roleUsers.length > 0 ? roleUsers.map((u) => (
                <Box key={u.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText', fontSize: '0.875rem', fontWeight: 600 }}>
                    {u.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{u.email}</Typography>
                  </Box>
                  <ClayBadge color={u.isActive ? 'success' : 'error'} size="sm">{u.isActive ? 'Active' : 'Inactive'}</ClayBadge>
                </Box>
              )) : <Typography variant="caption" color="text.secondary">No users assigned to this role</Typography>}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <PermissionGate permission="ROLES_EDIT" fallback={<div />}>
              <ClayButton variant="outline" size="sm" icon={Edit3} onClick={() => onEdit(role)}>Edit Role</ClayButton>
            </PermissionGate>
            <PermissionGate permission="ROLES_DELETE" fallback={<div />}>
              <ClayButton variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(role)}>Delete Role</ClayButton>
            </PermissionGate>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const UsersPage = () => {
  const { user } = useAuth()
  const toast = useToast()
  const { hasPermission } = useAuth()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editingRole, setEditingRole] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmDeleteRole, setConfirmDeleteRole] = useState(null)

  const canCreateUser = hasPermission('USERS_CREATE')
  const canEditUser = hasPermission('USERS_EDIT')
  const canDeleteUser = hasPermission('USERS_DELETE')
  const canChangeRole = hasPermission('USERS_CHANGE_ROLE')
  const canResetPassword = hasPermission('USERS_RESET_PASSWORD')
  const canCreateRole = hasPermission('ROLES_CREATE')
  const canEditRole = hasPermission('ROLES_EDIT')
  const canDeleteRole = hasPermission('ROLES_DELETE')

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes, deptsRes] = await Promise.all([userApi.getUsers(), roleApi.getRoles(), departmentApi.getDepartments()])
      setUsers(usersRes.data || usersRes || [])
      setRoles(rolesRes.data || rolesRes || [])
      setDepartments(deptsRes.data || deptsRes || [])
    } catch (err) {
      toast.error({ title: 'Failed to load data', message: err.response?.data?.message || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSaveUser = async (data) => {
    setSubmitting(true)
    try {
      if (editingUser) {
        const updated = await userApi.updateUser(editingUser.id, data)
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? updated.data || updated : u)))
        toast.success({ title: 'User updated', message: `${data.name} has been updated successfully` })
      } else {
        const created = await userApi.createUser(data)
        setUsers((prev) => [...prev, created.data || created])
        toast.success({ title: 'User created', message: `${data.name} has been added successfully` })
      }
      setEditingUser(null)
    } catch (err) {
      toast.error({ title: editingUser ? 'Update failed' : 'Creation failed', message: err.response?.data?.message || 'Something went wrong' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      await userApi.deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success({ title: 'User deleted', message: 'User has been removed successfully' })
      setSelectedUser(null)
    } catch (err) {
      toast.error({ title: 'Delete failed', message: err.response?.data?.message || 'Something went wrong' })
    }
  }

  const handleStatusChange = async (userObj) => {
    try {
      const updated = await userApi.updateUserStatus(userObj.id, !userObj.isActive)
      setUsers((prev) => prev.map((u) => (u.id === userObj.id ? updated.data || updated : u)))
      toast.success({ title: 'Status updated', message: `${userObj.name} is now ${!userObj.isActive ? 'active' : 'inactive'}` })
      setSelectedUser(null)
    } catch (err) {
      toast.error({ title: 'Status update failed', message: err.response?.data?.message || 'Something went wrong' })
    }
  }

  const handleRoleChange = async (userObj) => {
    try {
      const updated = await userApi.updateUserRole(userObj.id, userObj.role)
      setUsers((prev) => prev.map((u) => (u.id === userObj.id ? updated.data || updated : u)))
      toast.success({ title: 'Role updated', message: `${userObj.name}'s role has been changed` })
      setSelectedUser(null)
    } catch (err) {
      toast.error({ title: 'Role update failed', message: err.response?.data?.message || 'Something went wrong' })
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast.error({ title: 'Invalid password', message: 'Password must be at least 6 characters' }); return }
    try {
      await userApi.resetUserPassword(selectedUser.id, newPassword)
      toast.success({ title: 'Password reset', message: `Password has been reset for ${selectedUser.name}` })
      setResetPasswordOpen(false)
      setNewPassword('')
      setSelectedUser(null)
    } catch (err) {
      toast.error({ title: 'Reset failed', message: err.response?.data?.message || 'Something went wrong' })
    }
  }

  const handleSaveRole = async (data) => {
    setSubmitting(true)
    try {
      if (editingRole) {
        await roleApi.updateRole(editingRole.id, data)
        toast.success({ title: 'Role updated', message: 'Role has been updated successfully' })
      } else {
        await roleApi.createRole(data)
        toast.success({ title: 'Role created', message: 'New role has been created successfully' })
      }
      setEditingRole(null)
      await fetchData()
    } catch (err) {
      toast.error({ title: editingRole ? 'Update failed' : 'Creation failed', message: err.response?.data?.message || 'Something went wrong' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleObj) => {
    setSubmitting(true)
    try {
      await roleApi.deleteRole(roleObj.id)
      toast.success({ title: 'Role deleted', message: 'Role and its assigned users have been removed successfully' })
      setConfirmDeleteRole(null)
      await fetchData()
    } catch (err) {
      toast.error({ title: 'Delete failed', message: err.response?.data?.message || 'Something went wrong' })
    } finally {
      setSubmitting(false)
    }
  }

  const userColumns = [
    { field: 'name', headerName: 'User', sortable: true, flex: 2, minWidth: 240, renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>
          {params.value?.charAt(0)?.toUpperCase() || 'U'}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={500} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{params.value}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{params.row.email}</Typography>
        </Box>
      </Box>
    )},
    { field: 'role', headerName: 'Role', sortable: true, flex: 1, minWidth: 140, renderCell: (params) => <ClayBadge color={ROLE_COLORS[params.value] || 'secondary'} size="sm">{ROLE_LABELS[params.value] || params.value}</ClayBadge> },
    { field: 'department', headerName: 'Department', sortable: true, flex: 1, minWidth: 160, renderCell: (params) => <Typography variant="body2" color="text.secondary">{params.row.departmentRef?.name || params.row.department || '-'}</Typography> },
    { field: 'isActive', headerName: 'Status', sortable: true, flex: 1, minWidth: 100, renderCell: (params) => <ClayBadge color={params.value ? 'success' : 'error'} size="sm">{params.value ? 'Active' : 'Inactive'}</ClayBadge> },
    { field: 'lastLogin', headerName: 'Last Login', sortable: true, flex: 1, minWidth: 140, renderCell: (params) => <Typography variant="body2" color="text.secondary">{params.value ? formatDate(params.value) : 'Never'}</Typography> },
    { field: 'actions', headerName: 'Actions', flex: 1, minWidth: 140, sortable: false, renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="View"><IconButton size="small" onClick={() => setSelectedUser(params.row)} sx={{ color: 'primary.main' }}><Eye size={15} /></IconButton></Tooltip>
        {canEditUser && (
          <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingUser(params.row); setUserModalOpen(true) }}><Edit3 size={15} /></IconButton></Tooltip>
        )}
        {canDeleteUser && (
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteUser(params.row.id)} sx={{ color: 'error.main' }}><Trash2 size={15} /></IconButton></Tooltip>
        )}
      </Box>
    )},
  ]

  const roleColumns = [
    { field: 'name', headerName: 'Role', sortable: true, flex: 2, minWidth: 180, renderCell: (params) => <ClayBadge color={ROLE_COLORS[params.value] || 'secondary'} size="md">{ROLE_LABELS[params.value] || params.value}</ClayBadge> },
    { field: 'description', headerName: 'Description', sortable: false, flex: 2, minWidth: 220, renderCell: (params) => <Typography variant="body2" color="text.secondary">{params.value || '-'}</Typography> },
    { field: 'permissions', headerName: 'Permissions', sortable: false, flex: 1, minWidth: 140, renderCell: (params) => <ClayBadge color="info" size="sm">{params.value?.length || 0} permissions</ClayBadge> },
    { field: 'userCount', headerName: 'Users', sortable: false, flex: 1, minWidth: 100, renderCell: (params) => {
      const count = users.filter((u) => u.role === params.row.name).length
      return <Typography variant="body2" color="text.secondary">{count}</Typography>
    }},
    { field: 'actions', headerName: 'Actions', flex: 1, minWidth: 140, sortable: false, renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title="View"><IconButton size="small" onClick={() => setSelectedRole(params.row)}><Eye size={15} /></IconButton></Tooltip>
        {canEditRole && (
          <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingRole(params.row); setRoleModalOpen(true) }}><Edit3 size={15} /></IconButton></Tooltip>
        )}
        {canDeleteRole && (
          <Tooltip title="Delete"><IconButton size="small" onClick={() => setConfirmDeleteRole(params.row)} sx={{ color: 'error.main' }}><Trash2 size={15} /></IconButton></Tooltip>
        )}
      </Box>
    )},
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText' }}>
          <Users size={20} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>Users & Roles</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage users, roles, and permissions</Typography>
        </Box>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <Box sx={{ width: 40, height: 40, border: '3px solid', borderColor: 'primary.main', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </Box>
      )}

      {!loading && (
        <>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              borderBottom: `1px solid ${borderColor}`,
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, gap: 1, minHeight: 44 },
              '& .Mui-selected': { fontWeight: 600, color: 'primary.main' },
              '& .MuiTabs-indicator': { height: 3, borderRadius: 3 },
            }}
          >
            <Tab icon={<Users size={16} />} label="Users" value="users" />
            <Tab icon={<Shield size={16} />} label="Roles & Permissions" value="roles" />
          </Tabs>

          {activeTab === 'users' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {canCreateUser && (
                  <ClayButton variant="primary" icon={UserPlus} onClick={() => { setEditingUser(null); setUserModalOpen(true) }}>Add User</ClayButton>
                )}
              </Box>

              <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)', overflow: 'hidden' }}>
                <Box sx={{ p: 0 }}>
                  <DataGrid
                    rows={users.map((u) => ({ ...u, id: u.id }))}
                    columns={userColumns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    sx={{
                      border: 'none',
                      borderRadius: 0,
                      '& .MuiDataGrid-cell': { borderColor: borderColor },
                      '& .MuiDataGrid-columnHeaders': { borderColor: borderColor, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                      '& .MuiDataGrid-footerContainer': { borderColor: borderColor },
                    }}
                  />
                </Box>
              </Card>
            </Box>
          )}

          {activeTab === 'roles' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                {canCreateRole && (
                  <ClayButton variant="primary" icon={Shield} onClick={() => { setEditingRole(null); setRoleModalOpen(true) }}>Create Role</ClayButton>
                )}
              </Box>

              <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)', overflow: 'hidden' }}>
                <Box sx={{ p: 0 }}>
                  <DataGrid
                    rows={roles.map((r) => ({ ...r, id: r.id }))}
                    columns={roleColumns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    sx={{
                      border: 'none',
                      borderRadius: 0,
                      '& .MuiDataGrid-cell': { borderColor: borderColor },
                      '& .MuiDataGrid-columnHeaders': { borderColor: borderColor, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                      '& .MuiDataGrid-footerContainer': { borderColor: borderColor },
                    }}
                  />
                </Box>
              </Card>
            </Box>
          )}

          <UserModal isOpen={userModalOpen} onClose={() => { setUserModalOpen(false); setEditingUser(null) }} user={editingUser} roles={roles} departments={departments} onSave={handleSaveUser} />
          <RoleModal isOpen={roleModalOpen} onClose={() => { setRoleModalOpen(false); setEditingRole(null) }} role={editingRole} onSave={handleSaveRole} />
          <UserDetailDrawer isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setResetPasswordOpen(false); setNewPassword('') }} user={selectedUser} roles={roles} onStatusChange={handleStatusChange} onRoleChange={handleRoleChange} onResetPassword={(u) => { setSelectedUser(u); setResetPasswordOpen(true) }} />
          <RoleDetailDrawer isOpen={!!selectedRole} onClose={() => setSelectedRole(null)} role={selectedRole} users={users} onEdit={(r) => { setSelectedRole(null); setEditingRole(r); setRoleModalOpen(true) }} onDelete={(r) => setConfirmDeleteRole(r)} />

          <Modal isOpen={resetPasswordOpen} onClose={() => { setResetPasswordOpen(false); setNewPassword(''); setSelectedUser(null) }} title="Reset Password" size="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="body2" color="text.secondary">Set a new password for <strong>{selectedUser?.name}</strong></Typography>
              <ClayInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <ClayButton variant="outline" onClick={() => { setResetPasswordOpen(false); setNewPassword('') }}>Cancel</ClayButton>
                <ClayButton variant="primary" onClick={handleResetPassword}>Reset Password</ClayButton>
              </Box>
            </Box>
          </Modal>

          <Modal isOpen={!!confirmDeleteRole} onClose={() => setConfirmDeleteRole(null)} title="Delete Role" size="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 2, bgcolor: 'error.main', color: 'error.contrastText' }}>
                <AlertTriangle size={20} sx={{ flexShrink: 0 }} />
                <Typography variant="body2">
                  Are you sure you want to delete the role <strong>{confirmDeleteRole?.name}</strong>?
                  All users assigned to this role will be permanently deleted, and the role&apos;s permissions will be removed.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
                <ClayButton variant="outline" onClick={() => setConfirmDeleteRole(null)} disabled={submitting}>Cancel</ClayButton>
                <ClayButton variant="danger" onClick={async () => { await handleDeleteRole(confirmDeleteRole) }} loading={submitting}>Delete Role</ClayButton>
              </Box>
            </Box>
          </Modal>
        </>
      )}
    </Box>
  )
}

export default UsersPage
