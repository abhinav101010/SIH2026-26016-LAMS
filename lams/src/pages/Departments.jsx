import { useState, useEffect } from 'react'
import { Search, Plus, Edit3, Trash2, X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import PermissionGate from '../auth/PermissionGate'
import { departmentApi } from '../services'
import { useToast } from '../components/ui/Toast'
import ClayButton from '../components/ui/ClayButton'
import ClayInput from '../components/ui/ClayInput'
import ClayBadge from '../components/ui/ClayBadge'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/formatters'
import { Box, Card, Typography, IconButton, FormControl, InputLabel, Select, MenuItem, alpha, useTheme } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

const Departments = () => {
  const { hasPermission } = useAuth()
  const toast = useToast()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', code: '', description: '', isActive: true })

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

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
    { field: 'name', headerName: 'Department', flex: 2, minWidth: 180 },
    { field: 'code', headerName: 'Code', flex: 1, minWidth: 100 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 220,
      renderCell: (params) => <Typography variant="body2" color="text.secondary">{params.value || '-'}</Typography>,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <ClayBadge status={params.value ? 'success' : 'rejected'} size="sm">
          {params.value ? 'Active' : 'Inactive'}
        </ClayBadge>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => <Typography variant="body2" color="text.secondary">{formatDate(params.value)}</Typography>,
      sortable: true,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 100,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PermissionGate permission="USERS_EDIT" fallback={<div />}>
            <IconButton size="small" onClick={() => openEdit(params.row)} sx={{ color: 'primary.main' }}>
              <Edit3 size={15} />
            </IconButton>
          </PermissionGate>
          <PermissionGate permission="USERS_DELETE" fallback={<div />}>
            <IconButton size="small" onClick={() => handleDelete(params.row)} sx={{ color: 'error.main' }}>
              <Trash2 size={15} />
            </IconButton>
          </PermissionGate>
        </Box>
      ),
    },
  ]

  if (!hasPermission('USERS_VIEW')) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>403</Typography>
          <Typography variant="body2" color="text.secondary">Access Denied</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>You do not have permission to view departments.</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>Departments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage departments</Typography>
        </Box>
        <PermissionGate permission="USERS_CREATE" fallback={<div />}>
          <ClayButton variant="primary" size="sm" icon={Plus} onClick={openCreate}>
            Add Department
          </ClayButton>
        </PermissionGate>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)', overflow: 'hidden' }}>
        <Box sx={{ p: 0 }}>
          <Box sx={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={departments}
              columns={columns}
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
        </Box>
      </Card>

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
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={form.isActive ? 'true' : 'false'}
              label="Status"
              onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1 }}>
            <ClayButton variant="outline" onClick={() => setShowModal(false)}>Cancel</ClayButton>
            <ClayButton type="submit" loading={saving}>{editingDept ? 'Update' : 'Create'}</ClayButton>
          </Box>
        </form>
      </Modal>
    </Box>
  )
}

export default Departments
