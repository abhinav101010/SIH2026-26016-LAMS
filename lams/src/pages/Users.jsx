import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Shield,
  UserPlus,
  Search,
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
import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import ClayInput from '../components/ui/ClayInput'
import ClaySelect from '../components/ui/ClaySelect'
import ClayBadge from '../components/ui/ClayBadge'
import ClaySwitch from '../components/ui/ClaySwitch'
import Modal from '../components/ui/Modal'
import DataTable from '../components/ui/DataTable'
import { formatDate } from '../utils/formatters'

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClayInput label="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <ClayInput label="Email Address *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <ClayInput label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <ClayInput label="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1.5">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.name}>{ROLE_LABELS[r.name] || r.name}</option>
              ))}
            </select>
          </div>
          {!user && (
            <div className="md:col-span-2">
              <ClayInput label="Password *" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <ClayButton variant="outline" onClick={onClose}>Cancel</ClayButton>
          <ClayButton variant="primary" type="submit" loading={saving}>{user ? 'Update User' : 'Create User'}</ClayButton>
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClayInput label="Role Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <ClayInput label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Permissions</label>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {Object.entries(PERMISSION_CATEGORIES).map(([catKey, catLabel]) => {
              const perms = ALL_PERMISSIONS.filter((p) => p.category === catKey)
              return (
                <div key={catKey} className="space-y-2">
                  <h4 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{catLabel}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <label key={perm.key} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-surface border border-border cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition">
                        <input type="checkbox" checked={form.permissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30" />
                        <span className="text-sm text-foreground">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <ClayButton variant="outline" onClick={onClose}>Cancel</ClayButton>
          <ClayButton variant="primary" type="submit" loading={saving}>{role ? 'Update Role' : 'Create Role'}</ClayButton>
        </div>
      </form>
    </Modal>
  )
}

function UserDetailDrawer({ isOpen, onClose, user, onStatusChange, onRoleChange, onResetPassword }) {
  if (!user) return null
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-clay-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">User Details</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition"><X size={18} /></button>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-text-secondary">{user.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClayBadge color={ROLE_COLORS[user.role] || 'secondary'} size="sm">{ROLE_LABELS[user.role] || user.role}</ClayBadge>
                    <ClayBadge color={user.isActive ? 'success' : 'error'} size="sm">{user.isActive ? 'Active' : 'Inactive'}</ClayBadge>
                  </div>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"><Mail size={16} className="text-text-tertiary flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs text-text-tertiary">Email</p><p className="text-sm text-foreground truncate">{user.email}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"><Phone size={16} className="text-text-tertiary flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs text-text-tertiary">Phone</p><p className="text-sm text-foreground truncate">{user.phone || '-'}</p></div></div>
                 <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"><Building2 size={16} className="text-text-tertiary flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs text-text-tertiary">Department</p><p className="text-sm text-foreground truncate">{user.departmentRef?.name || user.department || '-'}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"><Briefcase size={16} className="text-text-tertiary flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs text-text-tertiary">Employee ID</p><p className="text-sm text-foreground truncate">{user.employeeId || '-'}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"><CalendarDays size={16} className="text-text-tertiary flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs text-text-tertiary">Joined</p><p className="text-sm text-foreground truncate">{user.joinedDate ? formatDate(user.joinedDate) : '-'}</p></div></div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border"><Clock size={16} className="text-text-tertiary flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-xs text-text-tertiary">Last Login</p><p className="text-sm text-foreground truncate">{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</p></div></div>
              </div>
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <PermissionGate permission="USERS_CHANGE_ROLE" fallback={<div />}>
                    <ClayButton variant="outline" size="sm" icon={Edit3} onClick={() => onRoleChange(user)}>Change Role</ClayButton>
                  </PermissionGate>
                  <PermissionGate permission="USERS_RESET_PASSWORD" fallback={<div />}>
                    <ClayButton variant="outline" size="sm" icon={KeyRound} onClick={() => onResetPassword(user)}>Reset Password</ClayButton>
                  </PermissionGate>
                  <PermissionGate permission="USERS_EDIT" fallback={<div />}>
                    <ClayButton variant={user.isActive ? 'danger' : 'success'} size="sm" icon={user.isActive ? UserX : CheckCircle2} onClick={() => onStatusChange(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</ClayButton>
                  </PermissionGate>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function RoleDetailDrawer({ isOpen, onClose, role, users, onEdit, onDelete }) {
  if (!role) return null
  const roleUsers = users.filter((u) => u.role === role.name)
  const permissionCount = role.permissions?.length || 0
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border shadow-clay-lg overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Role Details</h2>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface transition"><X size={18} /></button>
              </div>
              <div className="mb-6">
                <ClayBadge color={ROLE_COLORS[role.name] || 'secondary'} size="lg">{ROLE_LABELS[role.name] || role.name}</ClayBadge>
                <p className="text-sm text-text-secondary mt-2">{role.description || 'No description provided'}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1"><ShieldCheck size={14} /> {permissionCount} permissions</span>
                  <span className="flex items-center gap-1"><Users size={14} /> {roleUsers.length} users</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Assigned Permissions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions?.length > 0 ? role.permissions.map((p) => { const perm = ALL_PERMISSIONS.find((ap) => ap.key === p.name); return <ClayBadge key={p.id} color="info" size="sm">{perm?.label || p.name}</ClayBadge> }) : <p className="text-xs text-text-tertiary">No permissions assigned</p>}
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <h4 className="text-sm font-medium text-foreground mb-3">Assigned Users ({roleUsers.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {roleUsers.length > 0 ? roleUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">{u.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-foreground truncate">{u.name}</p><p className="text-xs text-text-tertiary truncate">{u.email}</p></div>
                      <ClayBadge color={u.isActive ? 'success' : 'error'} size="sm">{u.isActive ? 'Active' : 'Inactive'}</ClayBadge>
                    </div>
                  )) : <p className="text-xs text-text-tertiary">No users assigned to this role</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <PermissionGate permission="ROLES_EDIT" fallback={<div />}>
                  <ClayButton variant="outline" size="sm" icon={Edit3} onClick={() => onEdit(role)}>Edit Role</ClayButton>
                </PermissionGate>
                <PermissionGate permission="ROLES_DELETE" fallback={<div />}>
                  <ClayButton variant="danger" size="sm" icon={Trash2} onClick={() => onDelete(role)}>Delete Role</ClayButton>
                </PermissionGate>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const UsersPage = () => {
  const { user } = useAuth()
  const toast = useToast()
  const { hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
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

  const filteredUsers = useMemo(() => {
    let result = users
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.employeeId?.toLowerCase().includes(q))
    }
    if (roleFilter) result = result.filter((u) => u.role === roleFilter)
    if (statusFilter) result = result.filter((u) => (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive))
    return result
  }, [users, searchQuery, roleFilter, statusFilter])

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
    { key: 'name', header: 'User', sortable: true, render: (val, row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold flex-shrink-0">{val?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{val}</p>
          <p className="text-xs text-text-tertiary truncate">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'role', header: 'Role', sortable: true, render: (val) => <ClayBadge color={ROLE_COLORS[val] || 'secondary'} size="sm">{ROLE_LABELS[val] || val}</ClayBadge> },
    { key: 'department', header: 'Department', sortable: true, render: (val, row) => <span className="text-sm text-text-secondary">{row.departmentRef?.name || row.department || '-'}</span> },
    { key: 'isActive', header: 'Status', sortable: true, render: (val) => <ClayBadge color={val ? 'success' : 'error'} size="sm">{val ? 'Active' : 'Inactive'}</ClayBadge> },
    { key: 'lastLogin', header: 'Last Login', sortable: true, render: (val) => <span className="text-sm text-text-secondary">{val ? formatDate(val) : 'Never'}</span> },
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setSelectedUser(row)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"><Eye size={15} /></button>
        {canEditUser && (
          <button onClick={() => { setEditingUser(row); setUserModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"><Edit3 size={15} /></button>
        )}
        {canDeleteUser && (
          <button onClick={() => handleDeleteUser(row.id)} className="p-1.5 rounded-lg hover:bg-error-500/10 text-text-secondary hover:text-error-600 transition"><Trash2 size={15} /></button>
        )}
      </div>
    )},
  ]

  const roleColumns = [
    { key: 'name', header: 'Role', sortable: true, render: (val) => <ClayBadge color={ROLE_COLORS[val] || 'secondary'} size="md">{ROLE_LABELS[val] || val}</ClayBadge> },
    { key: 'description', header: 'Description', sortable: false, render: (val) => <span className="text-sm text-text-secondary">{val || '-'}</span> },
    { key: 'permissions', header: 'Permissions', sortable: false, render: (val) => <ClayBadge color="info" size="sm">{val?.length || 0} permissions</ClayBadge> },
    { key: 'userCount', header: 'Users', sortable: false, render: (_, row) => {
      const count = users.filter((u) => u.role === row.name).length
      return <span className="text-sm text-text-secondary">{count}</span>
    }},
    { key: 'actions', header: 'Actions', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={() => setSelectedRole(row)} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"><Eye size={15} /></button>
        {canEditRole && (
          <button onClick={() => { setEditingRole(row); setRoleModalOpen(true) }} className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"><Edit3 size={15} /></button>
        )}
        {canDeleteRole && (
          <button onClick={() => setConfirmDeleteRole(row)} className="p-1.5 rounded-lg hover:bg-error-500/10 text-text-secondary hover:text-error-600 transition"><Trash2 size={15} /></button>
        )}
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Users size={20} className="text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users & Roles</h1>
            <p className="text-text-secondary text-sm mt-1">Manage users, roles, and permissions</p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
      <>
      <div className="flex flex-col sm:flex-row gap-2">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'roles', label: 'Roles & Permissions', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-card border border-border text-text-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800'}
            `}>
              <Icon size={16} />{tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <ClayInput placeholder="Search users by name, email, or employee ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <ClaySelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} options={[{value: '', label: 'All Roles'}, ...roles.map((r) => ({value: r.name, label: ROLE_LABELS[r.name] || r.name}))]} className="w-full sm:w-48" />
            <ClaySelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={[{value: '', label: 'All Status'}, {value: 'ACTIVE', label: 'Active'}, {value: 'INACTIVE', label: 'Inactive'}]} className="w-full sm:w-40" />
            {canCreateUser && (
              <ClayButton variant="primary" icon={UserPlus} onClick={() => { setEditingUser(null); setUserModalOpen(true) }}>Add User</ClayButton>
            )}
          </div>

          <ClayCard padding="none">
            <DataTable columns={userColumns} data={filteredUsers} loading={loading} emptyMessage="No users found" />
          </ClayCard>
        </motion.div>
      )}

      {activeTab === 'roles' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex justify-end">
            {canCreateRole && (
              <ClayButton variant="primary" icon={Shield} onClick={() => { setEditingRole(null); setRoleModalOpen(true) }}>Create Role</ClayButton>
            )}
          </div>

          <ClayCard padding="none">
            <DataTable columns={roleColumns} data={roles} loading={loading} emptyMessage="No roles found" />
          </ClayCard>
        </motion.div>
      )}

      <UserModal isOpen={userModalOpen} onClose={() => { setUserModalOpen(false); setEditingUser(null) }} user={editingUser} roles={roles} departments={departments} onSave={handleSaveUser} />
      <RoleModal isOpen={roleModalOpen} onClose={() => { setRoleModalOpen(false); setEditingRole(null) }} role={editingRole} onSave={handleSaveRole} />
      <UserDetailDrawer isOpen={!!selectedUser} onClose={() => { setSelectedUser(null); setResetPasswordOpen(false); setNewPassword('') }} user={selectedUser} roles={roles} onStatusChange={handleStatusChange} onRoleChange={handleRoleChange} onResetPassword={(u) => { setSelectedUser(u); setResetPasswordOpen(true) }} />
      <RoleDetailDrawer isOpen={!!selectedRole} onClose={() => setSelectedRole(null)} role={selectedRole} users={users} onEdit={(r) => { setSelectedRole(null); setEditingRole(r); setRoleModalOpen(true) }} onDelete={(r) => setConfirmDeleteRole(r)} />

      <Modal isOpen={resetPasswordOpen} onClose={() => { setResetPasswordOpen(false); setNewPassword(''); setSelectedUser(null) }} title="Reset Password" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">Set a new password for <strong>{selectedUser?.name}</strong></p>
          <ClayInput label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => { setResetPasswordOpen(false); setNewPassword('') }}>Cancel</ClayButton>
            <ClayButton variant="primary" onClick={handleResetPassword}>Reset Password</ClayButton>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!confirmDeleteRole} onClose={() => setConfirmDeleteRole(null)} title="Delete Role" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-error-500/10 border border-error-500/30 rounded-xl">
            <AlertTriangle size={20} className="text-error-600 flex-shrink-0" />
            <p className="text-sm text-foreground">
              Are you sure you want to delete the role <strong>{confirmDeleteRole?.name}</strong>?
              All users assigned to this role will be permanently deleted, and the role&apos;s permissions will be removed.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => setConfirmDeleteRole(null)} disabled={submitting}>Cancel</ClayButton>
            <ClayButton variant="danger" onClick={async () => { await handleDeleteRole(confirmDeleteRole) }} loading={submitting}>Delete Role</ClayButton>
          </div>
        </div>
      </Modal>
      </>
      )}
    </div>
  )
}

export default UsersPage


