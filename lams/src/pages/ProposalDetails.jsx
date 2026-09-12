import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, Popup } from 'react-leaflet'
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
  ShieldCheck,
} from 'lucide-react'

import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import StatusBadge from '../components/ui/StatusBadge'
import Timeline from '../components/common/Timeline'
import Modal from '../components/ui/Modal'

import { proposalApi, parcelApi, documentApi } from '../services'
import { useAuth } from '../auth/AuthContext'
import { formatDate, formatCurrency, formatArea } from '../utils/formatters'

const TIMELINE_STAGES = [
  { id: 'submitted', label: 'Proposal Submitted', description: 'Initial proposal submitted with required documentation' },
  { id: 'field_verification', label: 'Field Verification', description: 'Verification of documents and field data by Field Officer' },
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
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [remarks, setRemarks] = useState('')
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [verifyingDocId, setVerifyingDocId] = useState(null)
  const [rejectingDocId, setRejectingDocId] = useState(null)
  const [docRemarks, setDocRemarks] = useState('')
  const [docActionLoading, setDocActionLoading] = useState(false)

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

  const handleVerifyDocument = async () => {
    if (!verifyingDocId) return
    setDocActionLoading(true)
    try {
      await documentApi.verify(verifyingDocId, docRemarks)
      showToast('Document verified successfully')
      setShowVerifyModal(false)
      setVerifyingDocId(null)
      setDocRemarks('')
      await fetchProposal()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to verify document', 'error')
    } finally {
      setDocActionLoading(false)
    }
  }

  const handleRejectDocument = async () => {
    if (!rejectingDocId || !docRemarks.trim()) {
      showToast('Rejection reason is required', 'error')
      return
    }
    setDocActionLoading(true)
    try {
      await documentApi.reject(rejectingDocId, docRemarks)
      showToast('Document rejected')
      setShowRejectModal(false)
      setRejectingDocId(null)
      setDocRemarks('')
      await fetchProposal()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject document', 'error')
    } finally {
      setDocActionLoading(false)
    }
  }

  const handleUploadDocument = async () => {
    if (!uploadFile) return
    setUploadingDoc(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('name', uploadFile.name)
      formData.append('fileName', uploadFile.name)
      formData.append('fileType', uploadFile.type.split('/')[1] || 'pdf')
      formData.append('fileSize', String(uploadFile.size))
      formData.append('storagePath', '')
      await documentApi.upload(id, formData)
      showToast('Document uploaded successfully')
      setUploadFile(null)
      await fetchProposal()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload document', 'error')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleCompleteVerification = async () => {
    setActionLoading(true)
    try {
      await proposalApi.completeVerification(id)
      showToast('Field verification completed')
      await fetchProposal()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete verification', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartFieldVerification = async () => {
    setActionLoading(true)
    try {
      await proposalApi.startFieldVerification(id)
      showToast('Field verification started')
      await fetchProposal()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to start field verification', 'error')
    } finally {
      setActionLoading(false)
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
  const currentStageId = (() => {
    if (proposal.status === 'FIELD_VERIFICATION') return 'field_verification'
    return TIMELINE_STAGES.find((s) => s.label === currentPhase)?.id || 'approved'
  })()
  const approvalProgress = proposal.approvalProgress || 0
  const approvalCount = proposal.approvals?.length || 0
  const approvedCount = proposal.approvals?.filter((a) => a.action === 'APPROVED').length || 0
  const rejectedCount = proposal.approvals?.filter((a) => a.action === 'REJECTED').length || 0
  const pendingCount = proposal.approvals?.filter((a) => a.action === 'PENDING').length || 0

  const statusConfig = {
    DRAFT: { label: 'DRAFT', className: 'bg-status-pending/10 text-status-pending' },
    SUBMITTED: { label: 'SUBMITTED', className: 'bg-status-review/10 text-status-review' },
    UNDER_REVIEW: { label: 'UNDER REVIEW', className: 'bg-status-review/10 text-status-review' },
    FIELD_VERIFICATION: { label: 'FIELD VERIFICATION', className: 'bg-status-review/10 text-status-review' },
    APPROVED: { label: 'APPROVED', className: 'bg-status-approved/10 text-status-approved' },
    REJECTED: { label: 'REJECTED', className: 'bg-status-rejected/10 text-status-rejected' },
    CHANGES_REQUESTED: { label: 'CHANGES REQUESTED', className: 'bg-status-pending/10 text-status-pending' },
    NOTIFICATION_ISSUED: { label: 'NOTIFICATION ISSUED', className: 'bg-status-approved/10 text-status-approved' },
    AWARD_DECLARED: { label: 'AWARD DECLARED', className: 'bg-status-approved/10 text-status-approved' },
    COMPENSATION: { label: 'COMPENSATION', className: 'bg-status-approved/10 text-status-approved' },
    ACQUIRED: { label: 'ACQUIRED', className: 'bg-status-approved/10 text-status-approved' },
    POSSESSION: { label: 'POSSESSION', className: 'bg-status-approved/10 text-status-approved' },
  }
  const currentStatus = proposal ? (statusConfig[proposal.status] || { label: proposal.status || 'PENDING', className: 'bg-status-pending/10 text-status-pending' }) : { label: 'LOADING', className: 'bg-status-pending/10 text-status-pending' }

  const userDepartmentApproval = proposal?.approvals?.find(
    (a) => a.department?.id === user?.departmentId && a.round === proposal?.approvalRound
  )
  const canApprove = proposal?.status === 'UNDER_REVIEW' && user?.role === 'REVIEWING_AUTHORITY' && userDepartmentApproval?.action === 'PENDING'
  const canReject = proposal?.status === 'UNDER_REVIEW' && hasPermission('PROPOSALS_REJECT') && userDepartmentApproval?.action === 'PENDING'
  const canRequestChanges = proposal?.status === 'UNDER_REVIEW' && hasPermission('PROPOSALS_EDIT')
  const canEdit = proposal?.status === 'DRAFT' && hasPermission('PROPOSALS_EDIT')
  const canDelete = ((proposal?.status === 'DRAFT' || proposal?.status === 'REJECTED') && proposal?.createdBy?.id === user?.id) || (user?.role === 'SUPER_ADMIN' && hasPermission('PROPOSALS_DELETE'))
  const isFieldOfficer = user?.role === 'FIELD_OFFICER'
  const canVerifyDocuments = isFieldOfficer && hasPermission('DOCUMENTS_VERIFY')
  const canCompleteVerification = isFieldOfficer && proposal?.status === 'FIELD_VERIFICATION'
  const canStartFieldVerification = isFieldOfficer && proposal?.status === 'SUBMITTED'

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
                  {proposal?.status === 'REJECTED' ? 'Drop Proposal' : 'Delete'}
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
          {canCompleteVerification && (
            <ClayButton variant="success" size="sm" icon={CheckCircle} onClick={handleCompleteVerification} loading={actionLoading}>
              Complete Verification
            </ClayButton>
          )}
          {canStartFieldVerification && (
            <ClayButton variant="primary" size="sm" icon={CheckCircle} onClick={handleStartFieldVerification} loading={actionLoading}>
              Start Field Verification
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
              <h2 className="text-xl font-semibold text-foreground">
                {proposal.status === 'REJECTED' ? 'Approval Status' : 'Department Approval Progress'}
              </h2>
              <p className="text-sm text-foreground-secondary mt-1">
                {proposal.status === 'REJECTED'
                  ? `Rejected by ${rejectedCount} of ${approvalCount} departments`
                  : `${approvedCount} of ${approvalCount} departments approved`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-foreground">{approvalProgress}%</span>
              <p className="text-xs text-foreground-tertiary">
                {proposal.status === 'REJECTED' ? 'Rejected' : 'Complete'}
              </p>
            </div>
          </div>

          <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: approvalProgress + '%',
                background: proposal.status === 'REJECTED'
                  ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                  : 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-foreground-tertiary mt-2">
            <span>Submitted: {formatDate(proposal.submittedDate)}</span>
            <span>Target: {formatDate(proposal.targetCompletion)}</span>
          </div>
        </ClayCard>
      </motion.div>

      {/* Department Approvals */}
      {(user?.role === 'REVIEWING_AUTHORITY' || user?.role === 'PROPOSAL_OFFICER' || user?.role === 'SUPER_ADMIN') && (
        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
          <ClayCard className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Department Approvals
            </h2>
            <div className="space-y-3">
              {proposal.approvals?.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      approval.action === 'APPROVED' ? 'bg-status-approved/10 text-status-approved' :
                      approval.action === 'REJECTED' ? 'bg-status-rejected/10 text-status-rejected' :
                      'bg-status-pending/10 text-status-pending'
                    }`}>
                      {approval.action === 'APPROVED' ? <Check size={16} /> :
                       approval.action === 'REJECTED' ? <X size={16} /> :
                       <Clock size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{approval.department?.name || 'Unknown Department'}</p>
                      <p className="text-xs text-foreground-secondary">
                        {approval.action === 'APPROVED' && `Approved by ${approval.reviewer?.name || 'Unknown'} on ${formatDate(approval.updatedAt)}`}
                        {approval.action === 'REJECTED' && `Rejected by ${approval.reviewer?.name || 'Unknown'} on ${formatDate(approval.updatedAt)}`}
                        {approval.action === 'PENDING' && 'Pending review'}
                        {approval.action === 'CHANGES_REQUESTED' && `Changes requested by ${approval.reviewer?.name || 'Unknown'}`}
                      </p>
                      {approval.remarks && (
                        <p className="text-xs text-foreground-secondary mt-1 italic">"{approval.remarks}"</p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={(approval.action || 'pending').toLowerCase()} size="sm" />
                </div>
              ))}
              {(!proposal.approvals || proposal.approvals.length === 0) && (
                <p className="text-sm text-foreground-secondary text-center py-4">No department approvals yet</p>
              )}
            </div>
          </ClayCard>
        </motion.div>
      )}

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
            <DetailItem label="Approval Progress" value={`${approvalProgress}%`} />
            <DetailItem label="Approvals" value={`${approvedCount} / ${approvalCount} approved`} />
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
            <DetailItem label="Affected Families" value={proposal.affectedFamilies?.toLocaleString('en-IN') || (proposal.estimatedPopulation ? `≈ ${(proposal.estimatedPopulation / 4.2).toFixed(0).toLocaleString('en-IN')}` : '—')} />
            <DetailItem label="Estimated Population" value={proposal.estimatedPopulation ? `≈ ${proposal.estimatedPopulation.toLocaleString('en-IN')}` : '—'} />
            <DetailItem label="Population Density" value={proposal.populationDensity ? `${proposal.populationDensity.toLocaleString('en-IN')} people/km²` : '—'} />
            <DetailItem label="Affected Area" value={proposal.affectedArea ? (() => { try { const area = typeof proposal.affectedArea === 'string' ? JSON.parse(proposal.affectedArea) : proposal.affectedArea; if (area.type === 'Polygon' || area.type === 'Circle') return `${(area.area || 0).toFixed(2)} ha`; return 'Defined' } catch { return 'Defined' } })() : '—'} />
            <DetailItem label="Displaced Families" value={(Math.round(proposal.affectedFamilies * 0.85) || 0).toLocaleString('en-IN')} />
            <DetailItem label="Approval Status" value={proposal.status === 'APPROVED' ? 'Completed' : proposal.status === 'REJECTED' ? 'Rejected' : 'In Progress'} />
            <DetailItem label="Departments Approved" value={`${approvedCount} of ${approvalCount}`} />
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

          {hasPermission('DOCUMENTS_UPLOAD') && (
            <div className="mb-4 p-4 border-2 border-dashed border-border rounded-xl">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="doc-upload"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files[0] || null)}
                />
                <label htmlFor="doc-upload" className="cursor-pointer flex-1">
                  <p className="text-sm font-medium text-foreground">{uploadFile ? uploadFile.name : 'Choose a file to upload'}</p>
                  <p className="text-xs text-foreground-secondary mt-1">PDF, DOC, DOCX, JPG, PNG — max 10MB</p>
                </label>
                <ClayButton
                  variant="primary"
                  size="sm"
                  onClick={handleUploadDocument}
                  loading={uploadingDoc}
                  disabled={!uploadFile}
                >
                  Upload
                </ClayButton>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {documents.map((doc) => {
              const statusClass = doc.verificationStatus === 'VERIFIED'
                ? 'bg-status-approved/10 text-status-approved'
                : doc.verificationStatus === 'REJECTED'
                  ? 'bg-status-rejected/10 text-status-rejected'
                  : 'bg-status-pending/10 text-status-pending'

              return (
                <div key={doc.id} className="clay-card-hover p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{doc.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusClass}`}>
                        {doc.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-1">
                      {doc.fileType?.toUpperCase()} · {(doc.fileSize / 1024 / 1024).toFixed(1)} MB · Uploaded by {doc.uploadedBy?.name || 'Unknown'}
                    </p>
                    {doc.verifiedBy && (
                      <p className="text-xs text-foreground-secondary mt-1">
                        Verified by {doc.verifiedBy?.name || 'Unknown'} on {doc.verifiedAt ? formatDate(doc.verifiedAt) : ''}
                      </p>
                    )}
                    {doc.verificationRemarks && (
                      <p className="text-xs text-foreground-secondary mt-1">
                        Remarks: {doc.verificationRemarks}
                      </p>
                    )}
                    {canVerifyDocuments && doc.verificationStatus === 'PENDING' && (
                      <div className="flex items-center gap-2 mt-2">
                        <ClayButton variant="outline" size="xs" onClick={() => { setVerifyingDocId(doc.id); setDocRemarks(''); setShowVerifyModal(true) }}>
                          Verify
                        </ClayButton>
                        <ClayButton variant="danger" size="xs" onClick={() => { setRejectingDocId(doc.id); setDocRemarks(''); setShowRejectModal(true) }}>
                          Reject
                        </ClayButton>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ClayCard>
      </motion.div>

      {/* Verify Document Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => { setShowVerifyModal(false); setVerifyingDocId(null); setDocRemarks('') }} title="Verify Document">
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Document: {documents.find((d) => d.id === verifyingDocId)?.name}
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Verification Remarks</label>
            <textarea
              value={docRemarks}
              onChange={(e) => setDocRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Optional remarks..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => { setShowVerifyModal(false); setVerifyingDocId(null); setDocRemarks('') }} disabled={docActionLoading}>
              Cancel
            </ClayButton>
            <ClayButton variant="success" onClick={handleVerifyDocument} loading={docActionLoading}>
              Verify Document
            </ClayButton>
          </div>
        </div>
      </Modal>

      {/* Reject Document Modal */}
      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectingDocId(null); setDocRemarks('') }} title="Reject Document">
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Document: {documents.find((d) => d.id === rejectingDocId)?.name}
          </p>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Reason for rejection *</label>
            <textarea
              value={docRemarks}
              onChange={(e) => setDocRemarks(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Provide a reason for rejection..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => { setShowRejectModal(false); setRejectingDocId(null); setDocRemarks('') }} disabled={docActionLoading}>
              Cancel
            </ClayButton>
            <ClayButton variant="danger" onClick={handleRejectDocument} loading={docActionLoading}>
              Reject Document
            </ClayButton>
          </div>
        </div>
      </Modal>

      {(hasPermission('PROPOSALS_VIEW') && (user?.role === 'PROPOSAL_OFFICER' || user?.role === 'REVIEWING_AUTHORITY' || user?.role === 'SUPER_ADMIN')) && documents.length > 0 && (
        <motion.div variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
          <ClayCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
                <ShieldCheck size={16} className="text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Field Verification</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground-secondary">Status</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${proposal.status === 'FIELD_VERIFICATION' || proposal.status === 'UNDER_REVIEW' || proposal.status === 'APPROVED' ? 'bg-status-approved/10 text-status-approved' : 'bg-status-pending/10 text-status-pending'}`}>
                  {proposal.status === 'FIELD_VERIFICATION' ? 'IN_PROGRESS' : proposal.status === 'UNDER_REVIEW' || proposal.status === 'APPROVED' ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{doc.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.verificationStatus === 'VERIFIED' ? 'bg-status-approved/10 text-status-approved' : doc.verificationStatus === 'REJECTED' ? 'bg-status-rejected/10 text-status-rejected' : 'bg-status-pending/10 text-status-pending'}`}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-foreground-secondary">
                {documents.filter((d) => d.verificationStatus === 'VERIFIED').length} / {documents.length} documents verified
              </div>
            </div>
          </ClayCard>
        </motion.div>
      )}

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
              {proposal?.affectedArea && (() => {
                try {
                  const area = typeof proposal.affectedArea === 'string' ? JSON.parse(proposal.affectedArea) : proposal.affectedArea
                  if (area.type === 'Polygon' && area.coordinates) {
                    const positions = area.coordinates
                    return (
                      <Polygon
                        positions={positions}
                        pathOptions={{
                          color: '#6366F1',
                          fillColor: '#6366F1',
                          fillOpacity: 0.2,
                          weight: 2,
                          dashArray: '5, 5',
                        }}
                      >
                        <Tooltip sticky direction="top">
                          <div className="text-xs">
                            <p className="font-medium">Affected Area</p>
                            <p>Type: Polygon</p>
                            <p>Area: {area.area?.toFixed(2) || 0} ha</p>
                          </div>
                        </Tooltip>
                      </Polygon>
                    )
                  }
                  if (area.type === 'Circle' && area.center) {
                    return (
                      <Marker position={[area.center.lat, area.center.lng]}>
                        <Popup>
                          <div className="text-xs">
                            <p className="font-medium">Affected Area</p>
                            <p>Type: Circle</p>
                            <p>Radius: {Math.round(area.radius || 0)} m</p>
                             <p>Area: {(area.area || 0).toFixed(2)} ha</p>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  }
                  return null
                } catch {
                  return null
                }
              })()}
            </MapContainer>
          </div>

          {proposal?.affectedArea && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-text-secondary">
              <strong className="text-foreground">Affected Area: </strong>
              {(() => {
                try {
                  const area = typeof proposal.affectedArea === 'string' ? JSON.parse(proposal.affectedArea) : proposal.affectedArea
                  if (area.type === 'Polygon') return `${area.area?.toFixed(2) || 0} ha`
                   if (area.type === 'Circle') return `${(area.area || 0).toFixed(2)} ha (Radius: ${Math.round(area.radius || 0)} m)`
                  return 'Defined'
                } catch {
                  return 'Defined'
                }
              })()}
            </div>
          )}

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
