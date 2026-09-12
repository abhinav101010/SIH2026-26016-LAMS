import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Building2,
  FileText,
  Globe,
  Calendar,
  Users,
} from 'lucide-react'
import { MapContainer, TileLayer, Polygon, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import { publicApi } from '../services'

const INDIA_CENTER = [20.5937, 78.9629]

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  FIELD_VERIFICATION: { label: 'Field Verification', color: 'bg-yellow-100 text-yellow-700' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-orange-100 text-orange-700' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'bg-purple-100 text-purple-700' },
  NOTIFICATION_ISSUED: { label: 'Notification Issued', color: 'bg-indigo-100 text-indigo-700' },
  AWARD_DECLARED: { label: 'Award Declared', color: 'bg-teal-100 text-teal-700' },
  COMPENSATION: { label: 'Compensation', color: 'bg-pink-100 text-pink-700' },
  ACQUIRED: { label: 'Acquired', color: 'bg-emerald-100 text-emerald-700' },
  POSSESSION: { label: 'Possession', color: 'bg-cyan-100 text-cyan-700' },
}

const PublicProposalDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    publicApi.getProposalById(id).then((res) => {
      setProposal(res.data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  const getGeometry = (proposal) => {
    const parcel = proposal?.parcels?.[0]
    if (!parcel?.geometry) return null
    try {
      const raw = typeof parcel.geometry === 'string' ? parcel.geometry : JSON.stringify(parcel.geometry)
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const geo = proposal ? getGeometry(proposal) : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-secondary">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Proposal Not Found</p>
          <p className="text-sm text-text-secondary mb-4">The proposal you are looking for does not exist or is not public.</p>
          <ClayButton onClick={() => navigate('/')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Explorer
          </ClayButton>
        </div>
      </div>
    )
  }

  const status = statusConfig[proposal.status] || { label: proposal.status, color: 'bg-gray-100 text-gray-700' }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClayButton variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft size={16} />
          </ClayButton>
          <div>
            <h1 className="text-lg font-bold text-foreground">Bharat Bhoomi</h1>
            <p className="text-xs text-text-secondary">Public Proposal Explorer</p>
          </div>
        </div>
        <ClayButton variant="outline" size="sm" onClick={() => navigate('/login')}>
          Admin Login
        </ClayButton>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <ClayCard className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{proposal.projectName}</h2>
              <p className="text-sm text-text-secondary">{proposal.proposalNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Department</p>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 size={14} className="text-text-secondary" />
                  <span className="text-sm text-foreground">{proposal.department}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Location</p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin size={14} className="text-text-secondary" />
                  <span className="text-sm text-foreground">{proposal.district}, {proposal.state}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Project Type</p>
                <div className="flex items-center gap-2 mt-1">
                  <Globe size={14} className="text-text-secondary" />
                  <span className="text-sm text-foreground">{proposal.projectType}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Land Area</p>
                <div className="flex items-center gap-2 mt-1">
                  <FileText size={14} className="text-text-secondary" />
                  <span className="text-sm text-foreground">{proposal.totalLandRequired} acres</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-tertiary uppercase tracking-wide">Affected Families</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users size={14} className="text-text-secondary" />
                  <span className="text-sm text-foreground">{proposal.affectedFamilies}</span>
                </div>
              </div>

              {proposal.targetCompletion && (
                <div>
                  <p className="text-xs text-text-tertiary uppercase tracking-wide">Target Completion</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-text-secondary" />
                    <span className="text-sm text-foreground">{new Date(proposal.targetCompletion).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wide mb-2">Purpose</p>
              <p className="text-sm text-foreground leading-relaxed">{proposal.purpose}</p>

              {proposal.description && (
                <>
                  <p className="text-xs text-text-tertiary uppercase tracking-wide mt-4 mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{proposal.description}</p>
                </>
              )}

              <p className="text-xs text-text-tertiary mt-4">
                Last updated: {new Date(proposal.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </ClayCard>

        {geo && (
          <ClayCard className="p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Location Map</h3>
            <div className="rounded-xl overflow-hidden border border-border" style={{ height: '400px' }}>
              <MapContainer
                center={INDIA_CENTER}
                zoom={5}
                className="w-full h-full"
                scrollWheelZoom
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                {geo.type === 'Polygon' && (
                  <Polygon
                    positions={geo.coordinates[0].map((c) => [c[1], c[0]])}
                    pathOptions={{
                      color: '#2563eb',
                      fillColor: '#3b82f6',
                      fillOpacity: 0.3,
                      weight: 3,
                    }}
                  />
                )}
                {geo.type === 'Point' && (
                  <Marker position={[geo.coordinates[1], geo.coordinates[0]]} />
                )}
              </MapContainer>
            </div>
          </ClayCard>
        )}
      </main>
    </div>
  )
}

export default PublicProposalDetail
