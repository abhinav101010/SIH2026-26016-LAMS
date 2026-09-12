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

import ClayButton from '../components/ui/ClayButton'
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  Grid,
  alpha,
  useTheme,
} from '@mui/material'

const INDIA_CENTER = [20.5937, 78.9629]

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'default' },
  SUBMITTED: { label: 'Submitted', color: 'info' },
  FIELD_VERIFICATION: { label: 'Field Verification', color: 'warning' },
  UNDER_REVIEW: { label: 'Under Review', color: 'primary' },
  APPROVED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'secondary' },
  NOTIFICATION_ISSUED: { label: 'Notification Issued', color: 'info' },
  AWARD_DECLARED: { label: 'Award Declared', color: 'success' },
  COMPENSATION: { label: 'Compensation', color: 'secondary' },
  ACQUIRED: { label: 'Acquired', color: 'success' },
  POSSESSION: { label: 'Possession', color: 'info' },
}

const PublicProposalDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../services').then(({ publicApi }) => {
      publicApi.getProposalById(id).then((res) => {
        setProposal(res.data)
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
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

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const subtleBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)'

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ width: 48, height: 48, border: `4px solid ${theme.palette.primary.main}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <Typography variant="body2" color="text.secondary">Loading proposal...</Typography>
        </Box>
      </Box>
    )
  }

  if (!proposal) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Proposal Not Found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>The proposal you are looking for does not exist or is not public.</Typography>
          <ClayButton onClick={() => navigate('/')} icon={ArrowLeft}>Back to Explorer</ClayButton>
        </Box>
      </Box>
    )
  }

  const status = statusConfig[proposal.status] || { label: proposal.status, color: 'default' }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${borderColor}`, px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ClayButton variant="ghost" size="sm" onClick={() => navigate('/')} icon={ArrowLeft} />
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>Bharat Bhoomi</Typography>
            <Typography variant="caption" color="text.secondary">Public Proposal Explorer</Typography>
          </Box>
        </Box>
        <Button variant="outlined" size="small" onClick={() => navigate('/login')} sx={{ borderRadius: 2 }}>Admin Login</Button>
      </Box>

      <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)' }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>{proposal.projectName}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontFamily: 'mono', fontSize: '0.8125rem' }}>{proposal.proposalNumber}</Typography>
            </Box>
            <Chip label={status.label} color={status.color} size="small" sx={{ borderRadius: 2, fontWeight: 600 }} />
          </Box>

          <Box sx={{ p: 3, pt: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Building2 size={16} style={{ color: theme.palette.text.secondary }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Department</Typography>
                      <Typography variant="body2" fontWeight={500}>{proposal.department}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MapPin size={16} style={{ color: theme.palette.text.secondary }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Location</Typography>
                      <Typography variant="body2" fontWeight={500}>{proposal.district}, {proposal.state}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Globe size={16} style={{ color: theme.palette.text.secondary }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Project Type</Typography>
                      <Typography variant="body2" fontWeight={500}>{proposal.projectType}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FileText size={16} style={{ color: theme.palette.text.secondary }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Land Area</Typography>
                      <Typography variant="body2" fontWeight={500}>{proposal.totalLandRequired} acres</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Users size={16} style={{ color: theme.palette.text.secondary }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Affected Families</Typography>
                      <Typography variant="body2" fontWeight={500}>{proposal.affectedFamilies}</Typography>
                    </Box>
                  </Box>
                  {proposal.targetCompletion && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Calendar size={16} style={{ color: theme.palette.text.secondary }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Target Completion</Typography>
                        <Typography variant="body2" fontWeight={500}>{new Date(proposal.targetCompletion).toLocaleDateString()}</Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Purpose</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{proposal.purpose}</Typography>
                  </Box>
                  {proposal.description && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>Description</Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>{proposal.description}</Typography>
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(proposal.updatedAt).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {geo && (
          <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)', overflow: 'hidden' }}>
            <Box sx={{ p: 3, pb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700}>Location Map</Typography>
            </Box>
            <Box sx={{ height: 400, overflow: 'hidden' }}>
              <MapContainer center={INDIA_CENTER} zoom={5} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {geo.type === 'Polygon' && (
                  <Polygon positions={geo.coordinates[0].map((c) => [c[1], c[0]])} pathOptions={{ color: '#1e6fff', fillColor: '#60a5fa', fillOpacity: 0.3, weight: 3 }} />
                )}
                {geo.type === 'Point' && (
                  <Marker position={[geo.coordinates[1], geo.coordinates[0]]} />
                )}
              </MapContainer>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  )
}

export default PublicProposalDetail
