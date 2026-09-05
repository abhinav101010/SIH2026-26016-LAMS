import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {
  ChevronLeft,
  Download,
  ExternalLink,
  Share2,
  Activity,
  Landmark,
  FileText,
  Users,
  Map,
  Clock,
  CheckCircle,
  Package,
  Building,
  IndianRupee,
  AlertCircle,
  MapPin,
  Layers,
  Check,
  X,
  MessageSquare,
  Trash2,
  Edit3,
} from 'lucide-react'

import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import Timeline from '../components/common/Timeline'
import Modal from '../components/ui/Modal'

import { proposalApi, parcelApi } from '../services'
import { useAuth } from '../auth/AuthContext'
import { formatDate, formatCurrency, formatArea } from '../utils/formatters'

const TIMELINE_STAGES = [
  { id: 'submitted', label: 'Proposal Submitted', description: 'Initial proposal submitted with required documentation' },
  { id: 'verification', label: 'Document Verification', description: 'Verification of submitted documents and ownership records' },
  { id: 'review', label: 'Administrative Review', description: 'Review by district administration and concerned departments' },
  { id: 'approved', label: 'Approved', description: 'Proposal approved by competent authority' },
  { id: 'notification', label: 'Notification', description: 'Public notification issued in Official Gazette' },
  { id: 'award', label: 'Award Declared', description: 'Award of land issued to affected families' },
  { id: 'compensation', label: 'Compensation', description: 'Compensation amount disbursed to affected families' },
  { id: 'possession', label: 'Possession', description: 'Physical possession transferred to acquiring authority' },
]

const ProposalDetails = () => {
  const { id } = useParams()
  const { user, hasPermission } = useAuth()
  const [proposal, setProposal] = useState(null)
  const [parcels, setParcels] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [remarks, setRemarks] = useState('')
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchProposal = async () => {
    setLoading(true)
    try {
      const res = await proposalApi.getById(id)
      setProposal(res.data)
      const parcelsRes = await parcelApi.getByProposal(id)
      setParcels(parcelsRes.data || [])
      setDocuments(res.data.documents || [])
    } catch (err) {
      console.error('Failed to fetch proposal:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchProposal()
  }, [id])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async () => {
    if (!actionType || !remarks.trim()) {
      showToast('Please enter remarks', 'error')
      return
    }

    setActionLoading(true)
    try {
      let res
      if (actionType === 'approve') {
        res = await proposalApi.approve(id, remarks)
      } else if (actionType === 'reject') {
        res = await proposalApi.reject(id, remarks)
      } else if (actionType === 'request-changes') {
        res = await proposalApi.requestChanges(id, remarks)
      }

      showToast(`Proposal ${actionType}d successfully`)
      setShowActionModal(false)
      setRemarks('')
      setActionType('')
      await fetchProposal()
    } catch (err) {
      showToast(err.response?.data?.message || 'Action failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = () => {
    window.location.href = `/proposals/${id}/edit`
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const isSuperAdmin = user?.role === 'SUPER_ADMIN'
      const isDraft = proposal?.status === 'DRAFT'
      const needsConfirm = !isDraft && isSuperAdmin
      await proposalApi.delete(id, needsConfirm)
      showToast('Proposal deleted successfully')
      setShowDeleteModal(false)
      window.location.href = '/proposals'
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete proposal', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const openActionModal = (type) => {
    setActionType(type)
    setRemarks('')
    setShowActionModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse" />
        <div className="h-40 bg-neutral-200 dark:bg-neutral-700 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!proposal) {
    return (
      <ClayCard className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl opacity-20">📋</div>
          <h3 className="text-xl font-semibold text-foreground">Proposal Not Found</h3>
          <p className="text-foreground-secondary">The requested proposal could not be found.</p>
          <ClayButton variant="outline" onClick={() => window.history.back()}>
            Go Back
          </ClayButton>
        </div>
      </ClayCard>
    )
  }

  const currentPhase = proposal.currentStage || 'approved'
  const currentStageId = TIMELINE_STAGES.find((s) => s.label === currentPhase)?.id || 'approved'
  const progressPercent = proposal.progress || 0
  const acquiredArea = Math.round(proposal.totalLandRequired * (progressPercent / 100))
  const remainingArea = proposal.totalLandRequired - acquiredArea

  const statusConfig = {
    approved: { label: 'APPROVED', className: 'bg-status-approved/10 text-status-approved' },
    pending: { label: 'PENDING', className: 'bg-status-pending/10 text-status-pending' },
    review: { label: 'UNDER REVIEW', className: 'bg-status-review/10 text-status-review' },
    rejected: { label: 'REJECTED', className: 'bg-status-rejected/10 text-status-rejected' },
    acquired: { label: 'ACQUIRED', className: 'bg-status-approved/10 text-status-approved' },
    possession: { label: 'POSSESSION', className: 'bg-status-approved/10 text-status-approved' },
  }

  const currentStatus = statusConfig[proposal.status?.toLowerCase()] || statusConfig.pending
  const canApprove = proposal.status === 'UNDER_REVIEW' && user?.role === 'REVIEWING_AUTHORITY'
  const canReject = proposal.status === 'UNDER_REVIEW' && hasPermission('PROPOSALS_REJECT')
  const canRequestChanges = proposal.status === 'UNDER_REVIEW' && hasPermission('PROPOSALS_EDIT')
  const canEdit = proposal.status === 'DRAFT' && hasPermission('PROPOSALS_EDIT')
  const canDelete = (proposal.status === 'DRAFT' || user?.role === 'SUPER_ADMIN') && hasPermission('PROPOSALS_DELETE')

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground-secondary hover:text-foreground hover:bg-neutral-50 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Proposal {proposal.proposalNumber}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${currentStatus.className}`}>
                {currentStatus.label}
              </span>
            </div>
            <p className="text-foreground-secondary mt-1">{proposal.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(canEdit || canDelete) && (
            <>
              {canEdit && (
                <ClayButton variant="outline" size="sm" icon={Edit3} onClick={handleEdit}>
                  Edit
                </ClayButton>
              )}
              {canDelete && (
                <ClayButton variant="danger" size="sm" icon={Trash2} onClick={() => setShowDeleteModal(true)}>
                  Delete
                </ClayButton>
              )}
            </>
          )}
          {canApprove && (
            <>
              <ClayButton variant="outline" size="sm" icon={X} onClick={() => openActionModal('reject')}>
                Reject
              </ClayButton>
              <ClayButton variant="success" size="sm" icon={Check} onClick={() => openActionModal('approve')}>
                Approve
              </ClayButton>
            </>
          )}
          {canRequestChanges && (
            <ClayButton variant="outline" size="sm" icon={MessageSquare} onClick={() => openActionModal('request-changes')}>
              Request Changes
            </ClayButton>
          )}
          <ClayButton variant="outline" size="sm" icon={Download}>
            Export PDF
          </ClayButton>
          <ClayButton variant="secondary" size="sm" icon={Share2}>
            Share
          </ClayButton>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
        <ClayCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Acquisition Progress</h2>
              <p className="text-sm text-foreground-secondary mt-1">
                Current stage: {proposal.currentStage || '—'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-foreground">{progressPercent}%</span>
              <p className="text-xs text-foreground-tertiary">Complete</p>
            </div>
          </div>

          <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: progressPercent + '%',
                background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-foreground-tertiary mt-2">
            <span>Submitted: {formatDate(proposal.submittedDate)}</span>
            <span>Target: {formatDate(proposal.targetCompletion)}</span>
          </div>
        </ClayCard>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
        <ClayCard className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Acquisition Timeline
          </h2>
          <Timeline stages={TIMELINE_STAGES} currentStage={currentStageId} />
        </ClayCard>
      </motion.div>

      {/* Info Grid */}
      <motion.div
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Project Information */}
        <ClayCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Landmark size={16} className="text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Project Information</h3>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-xs text-foreground-secondary">Project Name</span>
              <p className="text-sm font-medium text-foreground">{proposal.projectName}</p>
            </div>
            <DetailItem label="Department" value={proposal.department} />
            <DetailItem label="Project Type" value={proposal.projectType} />
            <DetailItem label="State" value={proposal.state} />
            <DetailItem label="District" value={proposal.district} />
            <DetailItem label="Estimated Cost" value={formatCurrency(proposal.estimatedCost)} />
            <DetailItem label="Priority" value={proposal.priority} />
          </div>
        </ClayCard>

        {/* Land Information */}
        <ClayCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Map size={16} className="text-secondary" />
            </div>
            <h3 className="font-semibold text-foreground">Land Information</h3>
          </div>
          <div className="space-y-3">
            <DetailItem label="Total Area" value={formatArea(proposal.totalLandRequired)} />
            <DetailItem label="Parcels" value={parcels.length.toString()} />
            <DetailItem label="Land Type" value={proposal.landType} />
            <DetailItem label="Acquired Area" value={formatArea(acquiredArea)} />
            <DetailItem label="Remaining Area" value={formatArea(remainingArea)} />
          </div>
        </ClayCard>

        {/* Affected Families */}
        <ClayCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Users size={16} className="text-accent" />
            </div>
            <h3 className="font-semibold text-foreground">Affected Families</h3>
          </div>
          <div className="space-y-3">
            <DetailItem label="Affected Families" value={proposal.affectedFamilies?.toLocaleString('en-IN')} />
            <DetailItem label="Displaced Families" value={(Math.round(proposal.affectedFamilies * 0.85)).toLocaleString('en-IN')} />
            <DetailItem label="R&R Status" value={progressPercent >= 75 ? 'Completed' : 'In Progress'} />
            <DetailItem label="Compensation Status" value={progressPercent >= 60 ? 'Partial' : 'Pending'} />
          </div>
        </ClayCard>
      </motion.div>

      {/* Documents */}
      <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
        <ClayCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-info/10 flex items-center justify-center">
                <FileText size={16} className="text-info" />
              </div>
              <h3 className="font-semibold text-foreground">Documents</h3>
            </div>
            <span className="text-sm text-foreground-secondary">{documents.length} document{documents.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="clay-card-hover p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-foreground-secondary mt-1">
                    {doc.fileType?.toUpperCase()} · {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.verificationStatus === 'VERIFIED' ? 'bg-status-approved/10 text-status-approved' : 'bg-status-pending/10 text-status-pending'}`}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ClayCard>
      </motion.div>

      {/* GIS Section */}
      <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
        <ClayCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Map size={20} className="text-primary" />
              Land Parcels
            </h2>
            <ClayButton variant="outline" size="sm" icon={ExternalLink}>
              Open in Full GIS View
            </ClayButton>
          </div>

          <div className="h-[320px] w-full rounded-xl overflow-hidden mb-4">
            <MapContainer
              center={[28.4, 77.05]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {parcels.map((parcel) => {
                if (!parcel.geometry) return null
                try {
                  const geo = JSON.parse(parcel.geometry)
                  const positions = geo.type === 'Polygon' ? geo.coordinates[0].map((c) => [c[1], c[0]]) : []
                  if (positions.length < 3) return null
                  const statusColorMap = {
                    acquired: '#10B981',
                    pending: '#F59E0B',
                    disputed: '#EF4444',
                    notification: '#3B82F6',
                    award: '#D97706',
                    review: '#8B5CF6',
                  }
                  const color = statusColorMap[parcel.status] || '#6366F1'
                  return (
                    <Polygon
                      key={parcel.id}
                      positions={positions}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.25,
                        weight: 2,
                      }}
                    >
                      <Tooltip sticky direction="top">
                        <div className="text-xs">
                          <p className="font-medium">{parcel.parcelNumber}</p>
                          <p>{parcel.area} ha · {parcel.status}</p>
                          <p>Owner: {parcel.owner}</p>
                        </div>
                      </Tooltip>
                    </Polygon>
                  )
                } catch {
                  return null
                }
              })}
            </MapContainer>
          </div>

          {/* Parcel Legend */}
          <div className="flex flex-wrap gap-4 text-xs">
            <LegendDot color="#10B981" label="Acquired" count={parcels.filter((p) => p.status === 'acquired').length} />
            <LegendDot color="#F59E0B" label="Pending" count={parcels.filter((p) => p.status === 'pending').length} />
            <LegendDot color="#3B82F6" label="Notification" count={parcels.filter((p) => p.status === 'notification').length} />
            <LegendDot color="#EF4444" label="Disputed" count={parcels.filter((p) => p.status === 'disputed').length} />
          </div>
        </ClayCard>
      </motion.div>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={actionType === 'approve' ? 'Approve Proposal' : actionType === 'reject' ? 'Reject Proposal' : 'Request Changes'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {actionType === 'reject' ? 'Rejection Reason (required)' : 'Remarks (required)'}
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={actionType === 'reject' ? 'Enter rejection reason...' : 'Enter remarks...'}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </ClayButton>
            <ClayButton
              variant={actionType === 'approve' ? 'success' : actionType === 'reject' ? 'danger' : 'primary'}
              onClick={handleAction}
              loading={actionLoading}
            >
              {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Submit'}
            </ClayButton>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Proposal"
      >
        <div className="space-y-4">
          {(() => {
            const isDraft = proposal?.status === 'DRAFT'
            const isSuperAdmin = user?.role === 'SUPER_ADMIN'

            if (isDraft) {
              return (
                <p className="text-sm text-foreground-secondary">
                  This action will permanently delete this proposal and its associated records. This cannot be undone.
                </p>
              )
            }

            if (isSuperAdmin) {
              return (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Warning: You are about to delete a non-draft proposal. This action is irreversible.
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    This proposal and all its associated records will be permanently deleted. This cannot be undone.
                  </p>
                </div>
              )
            }

            return null
          })()}
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
              Cancel
            </ClayButton>
            <ClayButton variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete Proposal'}
            </ClayButton>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-xl shadow-clay-lg z-50 ${toast.type === 'error' ? 'bg-status-rejected text-white' : 'bg-status-approved text-white'}`}>
          {toast.message}
        </div>
      )}
    </motion.div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <span className="text-xs text-foreground-secondary">{label}</span>
        <p className="text-sm font-medium text-foreground">{value || '—'}</p>
      </div>
    </div>
  )
}

function LegendDot({ color, label, count }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-foreground-secondary">{label}</span>
      {count !== undefined && <span className="text-foreground font-medium">({count})</span>}
    </div>
  )
}

export default ProposalDetails
