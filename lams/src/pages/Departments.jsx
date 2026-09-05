import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Edit3, Trash2, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import PermissionGate from '../auth/PermissionGate'
import { departmentApi } from '../services'
import { useToast } from '../components/ui/Toast'
import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import ClayInput from '../components/ui/ClayInput'
import ClaySelect from '../components/ui/ClaySelect'
import ClayBadge from '../components/ui/ClayBadge'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/formatters'

const Departments = () => {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '', isActive: true })
  const [search, setSearch] = useState('')

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const response = await departmentApi.getDepartments()
      setDepartments(response.data || [])
    } catch (err) {
      toast.error({ title: 'Failed to load departments', message: err.response?.data?.message || 'Please try again' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchDepartments, 400)
    return () => clearTimeout(timer)
  }, [search])

  const openCreate = () => {
    setEditingDept(null)
    setForm({ name: '', code: '', description: '', isActive: true })
    setShowModal(true)
  }

  const openEdit = (dept) => {
    setEditingDept(dept)
    setForm({ name: dept.name, code: dept.code, description: dept.description || '', isActive: dept.isActive })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingDept) {
        await departmentApi.updateDepartment(editingDept.id, form)
        toast.success({ title: 'Department updated', message: 'Department has been updated successfully.' })
      } else {
        await departmentApi.createDepartment(form)
        toast.success({ title: 'Department created', message: 'Department has been created successfully.' })
      }
      setShowModal(false)
      fetchDepartments()
    } catch (err) {
      toast.error({ title: editingDept ? 'Update failed' : 'Create failed', message: err.response?.data?.message || 'Please try again' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dept) => {
    if (!window.confirm(`Are you sure you want to delete "${dept.name}"?`)) return
    try {
      await departmentApi.deleteDepartment(dept.id)
      toast.success({ title: 'Department deleted', message: 'Department has been deleted successfully.' })
      fetchDepartments()
    } catch (err) {
      toast.error({ title: 'Delete failed', message: err.response?.data?.message || 'Please try again' })
    }
  }

  const columns = [
    { key: 'name', header: 'Department', sortable: true },
    { key: 'code', header: 'Code', sortable: true },
    { key: 'description', header: 'Description', render: (v) => v || '-' },
    {
      key: 'isActive',
      header: 'Status',
      render: (v) => (
        <ClayBadge status={v ? 'success' : 'rejected'} size="sm">
          {v ? 'Active' : 'Inactive'}
        </ClayBadge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (v) => formatDate(v),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <PermissionGate permission="USERS_EDIT" fallback={<div />}>
            <button
              onClick={() => openEdit(row)}
              className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"
            >
              <Edit3 size={15} />
            </button>
          </PermissionGate>
          <PermissionGate permission="USERS_DELETE" fallback={<div />}>
            <button
              onClick={() => handleDelete(row)}
              className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-status-rejected transition"
            >
              <Trash2 size={15} />
            </button>
          </PermissionGate>
        </div>
      ),
    },
  ]

  if (!hasPermission('USERS_VIEW')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">403</h1>
          <p className="text-foreground-secondary">Access Denied</p>
          <p className="text-sm text-foreground-secondary mt-2">You do not have permission to view departments.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-text-secondary mt-1">Manage departments</p>
        </div>
        <PermissionGate permission="USERS_CREATE" fallback={<div />}>
          <ClayButton variant="primary" size="sm" icon={Plus} onClick={openCreate}>
            Add Department
          </ClayButton>
        </PermissionGate>
      </div>

      <ClayCard>
        <div className="mb-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={departments}
          searchable={false}
          pagination={false}
          emptyMessage={loading ? 'Loading...' : 'No departments found'}
        />
      </ClayCard>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingDept ? 'Edit Department' : 'Add Department'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClayInput
            label="Department Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter department name"
            required
          />
          <ClayInput
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="Enter department code"
            required
          />
          <ClayInput
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Enter description (optional)"
          />
          <ClaySelect
            label="Status"
            value={form.isActive ? 'true' : 'false'}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </ClaySelect>
          <div className="flex justify-end gap-3 pt-4">
            <ClayButton variant="outline" type="button" onClick={() => setShowModal(false)}>
              Cancel
            </ClayButton>
            <ClayButton type="submit" loading={saving}>
              {editingDept ? 'Update' : 'Create'}
            </ClayButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Departments
