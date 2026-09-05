import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Map,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  FileImage,
  MapPin,
  Trash2,
  Edit3,
  Navigation,
  Ruler,
  Square,
} from 'lucide-react'

import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import ClayInput from '../components/ui/ClayInput'
import ClayTextarea from '../components/ui/ClayTextarea'
import ClaySelect from '../components/ui/ClaySelect'
import FileUpload from '../components/ui/FileUpload'
import Stepper from '../components/ui/Stepper'
import StatusBadge from '../components/ui/StatusBadge'
import { useToast } from '../components/ui/Toast'

import { STATES, DEPARTMENTS, PROJECT_TYPES, LAND_TYPES } from '../data'
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup } from 'react-leaflet'
import MapClickHandler from '../components/gis/MapClickHandler'
import { proposalApi, parcelApi } from '../services'
import { useParams, useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

const STEPS = [
  { id: 1, label: 'Project Details', description: 'Basic project information' },
  { id: 2, label: 'Land Details', description: 'Land area and affected families' },
  { id: 3, label: 'Documents', description: 'Upload required documents' },
  { id: 4, label: 'GIS Location', description: 'Draw and verify land parcels' },
  { id: 5, label: 'Review & Submit', description: 'Review all information' },
]

const EditProposal = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    projectName: '',
    projectType: '',
    department: '',
    ministry: '',
    state: '',
    district: '',
    purpose: '',
    estimatedCost: 0,
    totalLandRequired: 0,
    numberOfParcels: 0,
    landType: '',
    affectedFamilies: 0,
    proposalNumber: '',
    priority: '',
    description: '',
    targetCompletion: '',
    displacedFamilies: undefined,
  })

  const [documents, setDocuments] = useState([])
  const [drawnPolygons, setDrawnPolygons] = useState([])

  useEffect(() => {
    const fetchProposal = async () => {
      setLoading(true)
      try {
        const res = await proposalApi.getById(id)
        const p = res.data
        setFormData({
          projectName: p.projectName || '',
          projectType: p.projectType || '',
          department: p.department || '',
          ministry: p.ministry || '',
          state: p.state || '',
          district: p.district || '',
          purpose: p.purpose || '',
          estimatedCost: p.estimatedCost || 0,
          totalLandRequired: p.totalLandRequired || 0,
          numberOfParcels: p.numberOfParcels || 0,
          landType: p.landType || '',
          affectedFamilies: p.affectedFamilies || 0,
          proposalNumber: p.proposalNumber || '',
          priority: p.priority || '',
          description: p.description || '',
          targetCompletion: p.targetCompletion ? p.targetCompletion.split('T')[0] : '',
        })
        setDocuments(p.documents || [])
        if (p.parcels && p.parcels.length > 0) {
          const polygons = p.parcels.map((parcel) => {
            let geometry = null
            try {
              geometry = JSON.parse(parcel.geometry)
            } catch {
              geometry = null
            }
            const coordinates = geometry?.type === 'Polygon'
              ? geometry.coordinates[0].map((c) => [c[1], c[0]])
              : geometry?.type === 'LineString'
                ? geometry.coordinates.map((c) => [c[1], c[0]])
                : geometry?.type === 'Point'
                  ? [geometry.coordinates[1], geometry.coordinates[0]]
                  : []
            return {
              type: geometry?.type || 'Polygon',
              coordinates,
              geometry: parcel.geometry,
              area: parcel.area || 0,
              length: 0,
            }
          })
          setDrawnPolygons(polygons)
        }
      } catch (err) {
        toast.error({ title: 'Failed to load proposal', message: err.response?.data?.message || 'Something went wrong' })
        navigate('/proposals')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchProposal()
  }, [id])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    try {
      const parcels = drawnPolygons.map((shape, idx) => ({
        parcelNumber: `PARC-${String(idx + 1).padStart(3, '0')}`,
        area: shape.area || 0,
        landType: formData.landType,
        status: 'pending',
        geometry: typeof shape.geometry === 'string' ? shape.geometry : JSON.stringify(shape.geometry),
      }))

      if (parcels.length === 0) {
        toast.error({ title: 'GIS Required', message: 'Please draw at least one land parcel on the map before saving.' })
        return
      }

      const payload = {
        proposalNumber: formData.proposalNumber,
        projectName: formData.projectName,
        projectType: formData.projectType,
        department: formData.department,
        ministry: formData.ministry,
        state: formData.state,
        district: formData.district,
        purpose: formData.purpose,
        estimatedCost: formData.estimatedCost,
        totalLandRequired: formData.totalLandRequired,
        numberOfParcels: formData.numberOfParcels,
        landType: formData.landType,
        affectedFamilies: formData.affectedFamilies,
        displacedFamilies: formData.displacedFamilies,
        priority: formData.priority,
        description: formData.description,
        targetCompletion: formData.targetCompletion,
        parcels,
      }

      await proposalApi.update(id, payload)
      toast.success({ title: 'Proposal saved', message: 'Your draft has been saved successfully.' })
      navigate(`/proposals/${id}`)
    } catch (err) {
      console.error('Failed to save proposal:', err)
      toast.error({
        title: 'Save failed',
        message: err.response?.data?.message || 'Unable to save proposal. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitProposal = async () => {
    setIsSubmitting(true)
    try {
      const parcels = drawnPolygons.map((shape, idx) => ({
        parcelNumber: `PARC-${String(idx + 1).padStart(3, '0')}`,
        area: shape.area || 0,
        landType: formData.landType,
        status: 'pending',
        geometry: typeof shape.geometry === 'string' ? shape.geometry : JSON.stringify(shape.geometry),
      }))

      if (parcels.length === 0) {
        toast.error({ title: 'GIS Required', message: 'Please draw at least one land parcel on the map before submitting.' })
        return
      }

      const payload = {
        proposalNumber: formData.proposalNumber,
        projectName: formData.projectName,
        projectType: formData.projectType,
        department: formData.department,
        ministry: formData.ministry,
        state: formData.state,
        district: formData.district,
        purpose: formData.purpose,
        estimatedCost: formData.estimatedCost,
        totalLandRequired: formData.totalLandRequired,
        numberOfParcels: formData.numberOfParcels,
        landType: formData.landType,
        affectedFamilies: formData.affectedFamilies,
        displacedFamilies: formData.displacedFamilies,
        priority: formData.priority,
        description: formData.description,
        targetCompletion: formData.targetCompletion,
        parcels,
      }

      await proposalApi.update(id, payload)
      await proposalApi.submit(id)
      toast.success({ title: 'Proposal submitted', message: 'Your proposal has been submitted successfully.' })
      navigate(`/proposals/${id}`)
    } catch (err) {
      console.error('Failed to submit proposal:', err)
      toast.error({
        title: 'Submission failed',
        message: err.response?.data?.message || 'Unable to submit proposal. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStepChange = (stepNum) => {
    if (stepNum <= currentStep + 1) {
      setCurrentStep(stepNum)
    }
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

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center min-h-[600px]"
      >
        <ClayCard className="p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Proposal Updated</h2>
          <p className="text-text-secondary mb-4">
            Your proposal <strong>{formData.proposalNumber}</strong> has been updated successfully.
          </p>
          <ClayButton
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => navigate(`/proposals/${id}`)}
          >
            View Proposal Details
          </ClayButton>
        </ClayCard>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => currentStep > 1 ? prevStep() : (window.location.href = '/dashboard')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Proposal</h1>
            <p className="text-text-secondary text-sm mt-1">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1]?.label}
            </p>
          </div>
        </div>
        <StatusBadge status="pending" size="sm" dot={false}>
          Draft
        </StatusBadge>
      </div>

      {/* Stepper */}
      <ClayCard className="p-6">
        <Stepper steps={STEPS} currentStep={currentStep} onChange={handleStepChange} />
      </ClayCard>

      {/* Form Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 1 && (
            <ProjectDetailsStep
              formData={formData}
              onChange={handleInputChange}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <LandDetailsStep
              formData={formData}
              onChange={handleInputChange}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <DocumentsStep
              documents={documents}
              onDocumentsChange={setDocuments}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 4 && (
            <GISLocationStep
              formData={formData}
              drawnPolygons={drawnPolygons}
              onPolygonsChange={setDrawnPolygons}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 5 && (
            <ReviewStep
              formData={formData}
              documents={documents}
              drawnPolygons={drawnPolygons}
              onSubmit={handleSubmitProposal}
              onSaveDraft={handleSaveDraft}
              isSubmitting={isSubmitting}
              onBack={prevStep}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// Step 1: Project Details
const ProjectDetailsStep = ({ formData, onChange, onNext }) => {
  const stateOptions = STATES.map((s) => ({ value: s.name, label: s.name }))
  const departmentOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }))
  const projectTypeOptions = PROJECT_TYPES.map((t) => ({ value: t, label: t }))

  const isComplete = formData.projectName && formData.projectType && formData.department && formData.state && formData.district && formData.purpose && formData.estimatedCost

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Project Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <ClayInput
              label="Proposal ID"
              value={formData.proposalNumber}
              onChange={(e) => onChange('proposalNumber', e.target.value)}
              placeholder="NLAMS-YYYY-XXXX"
              required
            />
          </div>

          <div className="md:col-span-2">
            <ClayInput
              label="Project Name"
              value={formData.projectName}
              onChange={(e) => onChange('projectName', e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <ClaySelect
            label="Project Type"
            value={formData.projectType}
            onChange={(e) => onChange('projectType', e.target.value)}
            options={projectTypeOptions}
            required
          />

          <ClaySelect
            label="Department"
            value={formData.department}
            onChange={(e) => onChange('department', e.target.value)}
            options={departmentOptions}
            required
          />

          <ClaySelect
            label="State"
            value={formData.state}
            onChange={(e) => { onChange('state', e.target.value); onChange('district', '') }}
            options={stateOptions}
            required
          />

          <ClayInput
            label="District"
            value={formData.district}
            onChange={(e) => onChange('district', e.target.value)}
            placeholder="Enter district"
            required
          />

          <div className="md:col-span-2">
            <ClayTextarea
              label="Purpose"
              value={formData.purpose}
              onChange={(e) => onChange('purpose', e.target.value)}
              placeholder="Brief description of the project purpose"
              rows={3}
              required
            />
          </div>

          <div className="md:col-span-2">
            <ClayInput
              label="Estimated Cost (₹ Crores)"
              type="number"
              value={formData.estimatedCost}
              onChange={(e) => onChange('estimatedCost', Number(e.target.value))}
              placeholder="0"
              required
            />
          </div>
        </div>
      </ClayCard>

      <div className="flex justify-end">
        <ClayButton
          variant="primary"
          icon={ChevronRight}
          iconPosition="right"
          disabled={!isComplete}
          onClick={onNext}
        >
          Continue
        </ClayButton>
      </div>
    </div>
  )
}

// Step 2: Land Details
const LandDetailsStep = ({ formData, onChange, onNext, onBack }) => {
  const landTypeOptions = LAND_TYPES.map((t) => ({ value: t, label: t }))
  const isComplete = formData.totalLandRequired && formData.numberOfParcels && formData.landType && formData.affectedFamilies

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Map size={18} className="text-secondary" />
          Land Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClayInput
            label="Total Land Required (ha)"
            type="number"
            value={formData.totalLandRequired}
            onChange={(e) => onChange('totalLandRequired', Number(e.target.value))}
            placeholder="0"
            required
          />

          <ClayInput
            label="Number of Parcels"
            type="number"
            value={formData.numberOfParcels}
            onChange={(e) => onChange('numberOfParcels', Number(e.target.value))}
            placeholder="0"
            required
          />

          <ClaySelect
            label="Land Type"
            value={formData.landType}
            onChange={(e) => onChange('landType', e.target.value)}
            options={landTypeOptions}
            required
          />

          <ClayInput
            label="Affected Families"
            type="number"
            value={formData.affectedFamilies}
            onChange={(e) => onChange('affectedFamilies', Number(e.target.value))}
            placeholder="0"
            required
          />

          <div className="md:col-span-2 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl p-4">
            <h4 className="text-sm font-medium text-foreground mb-2">Land Distribution</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-primary">{formData.numberOfParcels}</div>
                <div className="text-xs text-text-tertiary">Parcels</div>
              </div>
              <div>
                <div className="text-lg font-bold text-secondary">{formData.landType || '—'}</div>
                <div className="text-xs text-text-tertiary">Land Type</div>
              </div>
              <div>
                <div className="text-lg font-bold text-accent">{formData.affectedFamilies}</div>
                <div className="text-xs text-text-tertiary">Families</div>
              </div>
              <div>
                <div className="text-lg font-bold text-emerald-600">
                  {formData.totalLandRequired ? Math.round(formData.totalLandRequired / formData.numberOfParcels || 0) : 0}
                </div>
                <div className="text-xs text-text-tertiary">Avg/parcel (ha)</div>
              </div>
            </div>
          </div>
        </div>
      </ClayCard>

      <div className="flex justify-between">
        <ClayButton variant="outline" onClick={onBack}>
          Back
        </ClayButton>
        <ClayButton
          variant="primary"
          icon={ChevronRight}
          iconPosition="right"
          disabled={!isComplete}
          onClick={onNext}
        >
          Continue
        </ClayButton>
      </div>
    </div>
  )
}

// Step 3: Documents
const DocumentsStep = ({ documents, onDocumentsChange, onNext, onBack }) => {
  const requiredDocs = [
    { type: 'Proposal Document', required: true },
    { type: 'Land Ownership Records', required: true },
    { type: 'Survey Report', required: true },
    { type: 'Environmental Clearance', required: true },
    { type: 'Notification Gazette', required: false },
    { type: 'R&R Plan', required: false },
  ]

  const uploadedCount = documents.length

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileImage size={18} className="text-info" />
          Documents
        </h3>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            Upload required documents ({uploadedCount}/{requiredDocs.length} uploaded)
          </p>
        </div>

        <FileUpload
          value={documents}
          onChange={onDocumentsChange}
          label="Drop documents here or click to upload"
          description="PDF, DOC, DOCX, JPG, PNG — max 10MB each"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-foreground">Required Documents Checklist</h4>
          {requiredDocs.map((doc, idx) => {
            const isUploaded = documents.some((d) => d.name.includes(doc.type.replace(/ /g, '').substring(0, 4)))
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isUploaded ? 'bg-success-500/10 text-success-600' : 'bg-neutral-200 dark:bg-neutral-700 text-text-tertiary'}`}>
                    <FileText size={12} />
                  </div>
                  <span className="text-sm text-foreground">{doc.type}</span>
                  {doc.required && <span className="text-xs text-error-500">*</span>}
                </div>
                <span className={`text-xs font-medium ${isUploaded ? 'text-success-600' : 'text-text-tertiary'}`}>
                  {isUploaded ? 'Uploaded' : 'Pending'}
                </span>
              </div>
            )
          })}
        </div>
      </ClayCard>

      <div className="flex justify-between">
        <ClayButton variant="outline" onClick={onBack}>
          Back
        </ClayButton>
        <ClayButton
          variant="primary"
          icon={ChevronRight}
          iconPosition="right"
          disabled={documents.length < 3}
          onClick={onNext}
        >
          Continue
        </ClayButton>
      </div>
    </div>
  )
}

// Step 4: GIS Location
const GISLocationStep = ({ formData, drawnPolygons, onPolygonsChange, onNext, onBack }) => {
  const [drawingMode, setDrawingMode] = useState(null)
  const [tempPoints, setTempPoints] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null)
  const [editingShapeIndex, setEditingShapeIndex] = useState(null)
  const [editPoints, setEditPoints] = useState([])
  const [mapCenter, setMapCenter] = useState([formData.state === 'Haryana' ? 28.4 : 19.07, 77.1])
  const [mapZoom, setMapZoom] = useState(10)
  const [error, setError] = useState(null)
  const searchDebounceRef = useRef(null)

  const isComplete = drawnPolygons.length > 0

  const toGeoJSON = useCallback((type, coordinates) => {
    if (type === 'Polygon' || type === 'polygon') {
      const ring = coordinates.map(([lat, lng]) => [lng, lat])
      if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push(ring[0])
      }
      return JSON.stringify({ type: 'Polygon', coordinates: [ring] })
    }
    if (type === 'LineString' || type === 'polyline') {
      const coords = coordinates.map(([lat, lng]) => [lng, lat])
      return JSON.stringify({ type: 'LineString', coordinates: coords })
    }
    if (type === 'Point' || type === 'marker') {
      const [lat, lng] = coordinates[0] || [0, 0]
      return JSON.stringify({ type: 'Point', coordinates: [lng, lat] })
    }
    return null
  }, [])

  const calculatePolygonArea = useCallback((coords) => {
    if (coords.length < 3) return 0
    let area = 0
    const R = 6371000
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length
      const [lat1, lng1] = coords[i]
      const [lat2, lng2] = coords[j]
      area += (lng2 - lng1) * (2 * R * Math.PI / 360) * (lat1 + lat2)
    }
    return Math.abs(area / 10000)
  }, [])

  const calculatePolylineLength = useCallback((coords) => {
    if (coords.length < 2) return 0
    const R = 6371000
    let length = 0
    for (let i = 0; i < coords.length - 1; i++) {
      const [lat1, lng1] = coords[i]
      const [lat2, lng2] = coords[i + 1]
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      length += R * c
    }
    return length / 1000
  }, [])

  const handleMapClick = useCallback((e) => {
    setError(null)
    if (!drawingMode) return
    const { lat, lng } = e.latlng

    if (drawingMode === 'marker') {
      const geometry = toGeoJSON('Point', [[lat, lng]])
      onPolygonsChange([...drawnPolygons, { type: 'Point', coordinates: [[lat, lng]], geometry, area: 0, length: 0 }])
      setDrawingMode(null)
      return
    }

    if (editingShapeIndex !== null) {
      setEditPoints((prev) => [...prev, [lat, lng]])
      return
    }

    setTempPoints((prev) => [...prev, [lat, lng]])
  }, [drawingMode, editingShapeIndex, drawnPolygons, onPolygonsChange, toGeoJSON])

  const finishPolygon = useCallback(() => {
    if (tempPoints.length >= 3) {
      const area = calculatePolygonArea(tempPoints)
      const geometry = toGeoJSON('Polygon', tempPoints)
      onPolygonsChange([...drawnPolygons, { type: 'Polygon', coordinates: tempPoints, geometry, area, length: 0 }])
      setTempPoints([])
      setDrawingMode(null)
    }
  }, [tempPoints, drawnPolygons, onPolygonsChange, toGeoJSON, calculatePolygonArea])

  const finishPolyline = useCallback(() => {
    if (tempPoints.length >= 2) {
      const length = calculatePolylineLength(tempPoints)
      const geometry = toGeoJSON('LineString', tempPoints)
      onPolygonsChange([...drawnPolygons, { type: 'LineString', coordinates: tempPoints, geometry, area: 0, length }])
      setTempPoints([])
      setDrawingMode(null)
    }
  }, [tempPoints, drawnPolygons, onPolygonsChange, toGeoJSON, calculatePolylineLength])

  const deleteShape = useCallback((index) => {
    const updated = drawnPolygons.filter((_, i) => i !== index)
    onPolygonsChange(updated)
    if (selectedShapeIndex === index) setSelectedShapeIndex(null)
    if (editingShapeIndex === index) setEditingShapeIndex(null)
  }, [drawnPolygons, onPolygonsChange, selectedShapeIndex, editingShapeIndex])

  const startEdit = useCallback((index) => {
    setEditingShapeIndex(index)
    setEditPoints([...drawnPolygons[index].coordinates])
    setSelectedShapeIndex(null)
    setDrawingMode(null)
  }, [drawnPolygons])

  const saveEdit = useCallback(() => {
    if (editingShapeIndex === null || editPoints.length < (drawnPolygons[editingShapeIndex].type === 'Polygon' ? 3 : 2)) return
    const shape = drawnPolygons[editingShapeIndex]
    const geometry = toGeoJSON(shape.type, editPoints)
    const area = shape.type === 'Polygon' ? calculatePolygonArea(editPoints) : 0
    const length = shape.type === 'LineString' ? calculatePolylineLength(editPoints) : 0
    const updated = [...drawnPolygons]
    updated[editingShapeIndex] = { ...shape, coordinates: editPoints, geometry, area, length }
    onPolygonsChange(updated)
    setEditingShapeIndex(null)
    setEditPoints([])
  }, [editingShapeIndex, editPoints, drawnPolygons, onPolygonsChange, toGeoJSON, calculatePolygonArea, calculatePolylineLength])

  const cancelEdit = useCallback(() => {
    setEditingShapeIndex(null)
    setEditPoints([])
  }, [])

  const clearAll = useCallback(() => {
    onPolygonsChange([])
    setTempPoints([])
    setSelectedShapeIndex(null)
    setEditingShapeIndex(null)
    setEditPoints([])
    setDrawingMode(null)
  }, [onPolygonsChange])

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query)
    setSearchResults([])
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    if (!query || query.trim().length < 2) return

    setSearchLoading(true)
    setError(null)
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const isCoords = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(query.trim())
        let results = []
        if (isCoords) {
          const [lat, lng] = query.trim().split(',').map(Number)
          if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            results = [{ lat, lng, display_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }]
          }
        } else {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`)
          if (!res.ok) throw new Error('Geocoding failed')
          results = await res.json()
        }
        setSearchResults(results)
      } catch {
        setError('Search failed. Please try again.')
      } finally {
        setSearchLoading(false)
      }
    }, 400)
  }, [])

  const selectSearchResult = useCallback((result) => {
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    setMapCenter([lat, lng])
    setMapZoom(14)
    setSearchQuery(result.display_name)
    setSearchResults([])
  }, [])

  const totalArea = drawnPolygons.reduce((sum, p) => sum + (p.area || 0), 0)
  const totalLength = drawnPolygons.reduce((sum, p) => sum + (p.length || 0), 0)

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-primary" />
          GIS Location
        </h3>
        <p className="text-sm text-text-secondary mb-4">Draw and verify land parcels</p>

        {error && (
          <div className="mb-4 p-3 bg-error-500/10 border border-error-500/30 rounded-xl text-sm text-error-600">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Navigation size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search location (e.g. Gurugram, Delhi, 77.0266, 28.4595)"
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-surface border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {searchResults.length > 0 && (
              <div className="absolute z-[1000] mt-1 w-full bg-card border border-border rounded-xl shadow-clay-lg overflow-hidden">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSearchResult(result)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface transition-colors border-b border-border last:border-b-0"
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 bg-surface rounded-xl p-1 border border-border">
            <button
              onClick={() => { setDrawingMode(drawingMode === 'polygon' ? null : 'polygon'); setTempPoints([]); setSelectedShapeIndex(null); setEditingShapeIndex(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${drawingMode === 'polygon' ? 'bg-primary text-white shadow-clay-btn' : 'text-text-secondary hover:text-foreground'}`}
            >
              <Square size={14} className="inline mr-1" />Polygon
            </button>
            <button
              onClick={() => { setDrawingMode(drawingMode === 'polyline' ? null : 'polyline'); setTempPoints([]); setSelectedShapeIndex(null); setEditingShapeIndex(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${drawingMode === 'polyline' ? 'bg-primary text-white shadow-clay-btn' : 'text-text-secondary hover:text-foreground'}`}
            >
              <Ruler size={14} className="inline mr-1" />Polyline
            </button>
            <button
              onClick={() => { setDrawingMode(drawingMode === 'marker' ? null : 'marker'); setTempPoints([]); setSelectedShapeIndex(null); setEditingShapeIndex(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${drawingMode === 'marker' ? 'bg-primary text-white shadow-clay-btn' : 'text-text-secondary hover:text-foreground'}`}
            >
              <MapPin size={14} className="inline mr-1" />Marker
            </button>
          </div>

          <ClayButton variant="outline" size="sm" onClick={clearAll} disabled={drawnPolygons.length === 0 && tempPoints.length === 0}>
            Clear
          </ClayButton>
        </div>

        {drawingMode === 'polygon' && (
          <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-text-secondary">
            <strong className="text-foreground">Polygon:</strong> Click points on the map to draw. Click the first point or press <strong>Finish Polygon</strong> to close the parcel.
            {tempPoints.length > 0 && <span className="ml-2">({tempPoints.length} points)</span>}
          </div>
        )}
        {drawingMode === 'polyline' && (
          <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-text-secondary">
            <strong className="text-foreground">Polyline:</strong> Click points along the route. Double-click or press <strong>Finish Polyline</strong> to complete.
            {tempPoints.length > 0 && <span className="ml-2">({tempPoints.length} points)</span>}
          </div>
        )}
        {drawingMode === 'marker' && (
          <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-text-secondary">
            <strong className="text-foreground">Marker:</strong> Click on the map to place a point marker.
          </div>
        )}
        {editingShapeIndex !== null && (
          <div className="mb-3 p-3 bg-accent/5 border border-accent/20 rounded-xl text-xs text-text-secondary flex items-center justify-between">
            <span><strong className="text-foreground">Editing:</strong> Click map to add points. ({editPoints.length} points)</span>
            <div className="flex gap-2">
              <button onClick={saveEdit} className="px-2 py-1 bg-success-600 text-white rounded-lg text-xs">Save</button>
              <button onClick={cancelEdit} className="px-2 py-1 bg-surface border border-border rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        )}

        <div className="h-[360px] w-full rounded-xl overflow-hidden relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', background: 'hsl(var(--color-surface))' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler onClick={handleMapClick} enabled={!!drawingMode || editingShapeIndex !== null} />

            {drawnPolygons.map((shape, idx) => {
              if (shape.type === 'Polygon') {
                return (
                  <Polygon
                    key={idx}
                    positions={shape.coordinates}
                    pathOptions={{
                      color: selectedShapeIndex === idx ? '#EF4444' : '#4F46E5',
                      fillColor: selectedShapeIndex === idx ? '#EF4444' : '#4F46E5',
                      fillOpacity: selectedShapeIndex === idx ? 0.4 : 0.2,
                      weight: selectedShapeIndex === idx ? 3 : 2,
                    }}
                    eventHandlers={{
                      click: () => { if (editingShapeIndex === null) setSelectedShapeIndex(selectedShapeIndex === idx ? null : idx) },
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>{shape.type}</strong><br />
                        Area: {shape.area?.toFixed(2) || 0} ha
                      </div>
                    </Popup>
                  </Polygon>
                )
              }
              if (shape.type === 'LineString') {
                return (
                  <Polyline
                    key={idx}
                    positions={shape.coordinates}
                    pathOptions={{
                      color: selectedShapeIndex === idx ? '#EF4444' : '#10B981',
                      weight: selectedShapeIndex === idx ? 4 : 3,
                    }}
                    eventHandlers={{
                      click: () => { if (editingShapeIndex === null) setSelectedShapeIndex(selectedShapeIndex === idx ? null : idx) },
                    }}
                  >
                    <Popup>
                      <div className="text-xs">
                        <strong>{shape.type}</strong><br />
                        Length: {shape.length?.toFixed(2) || 0} km
                      </div>
                    </Popup>
                  </Polyline>
                )
              }
              if (shape.type === 'Point') {
                return (
                  <Marker
                    key={idx}
                    position={shape.coordinates[0]}
                    eventHandlers={{
                      click: () => { if (editingShapeIndex === null) setSelectedShapeIndex(selectedShapeIndex === idx ? null : idx) },
                    }}
                  >
                    <Popup>
                      <div className="text-xs"><strong>Marker</strong></div>
                    </Popup>
                  </Marker>
                )
              }
              return null
            })}

            {(tempPoints.length > 0 || (editingShapeIndex !== null && editPoints.length > 0)) && (
              drawingMode === 'polyline' || (editingShapeIndex !== null && drawnPolygons[editingShapeIndex]?.type === 'LineString') ? (
                <Polyline
                  positions={tempPoints.length > 0 ? tempPoints : editPoints}
                  pathOptions={{
                    color: '#F59E0B',
                    weight: 3,
                    dashArray: '5, 5',
                  }}
                />
              ) : (
                <Polygon
                  positions={tempPoints.length > 0 ? tempPoints : editPoints}
                  pathOptions={{
                    color: '#F59E0B',
                    fillColor: '#F59E0B',
                    fillOpacity: 0.3,
                    weight: 2,
                    dashArray: '5, 5',
                  }}
                />
              )
            )}
          </MapContainer>
        </div>

        {drawnPolygons.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-center">
              <div className="text-xl font-bold text-foreground">{drawnPolygons.length}</div>
              <div className="text-xs text-text-tertiary">Shapes Drawn</div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-center">
              <div className="text-xl font-bold text-foreground">{totalArea.toFixed(1)} ha</div>
              <div className="text-xs text-text-tertiary">Total Area</div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-center">
              <div className="text-xl font-bold text-secondary">{totalLength.toFixed(1)} km</div>
              <div className="text-xs text-text-tertiary">Total Length</div>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-center">
              <div className="text-xl font-bold text-accent">{formData.affectedFamilies}</div>
              <div className="text-xs text-text-tertiary">Affected Families</div>
            </div>
          </div>
        )}

        {selectedShapeIndex !== null && editingShapeIndex === null && (
          <div className="mt-4 p-4 bg-surface border border-border rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                Selected: <span className="text-primary">{drawnPolygons[selectedShapeIndex]?.type}</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {drawnPolygons[selectedShapeIndex]?.type === 'Polygon' && `Area: ${drawnPolygons[selectedShapeIndex]?.area?.toFixed(2) || 0} ha`}
                {drawnPolygons[selectedShapeIndex]?.type === 'LineString' && `Length: ${drawnPolygons[selectedShapeIndex]?.length?.toFixed(2) || 0} km`}
                {drawnPolygons[selectedShapeIndex]?.type === 'Point' && 'Single point marker'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(selectedShapeIndex)}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors"
              >
                <Edit3 size={12} className="inline mr-1" />Edit
              </button>
              <button
                onClick={() => deleteShape(selectedShapeIndex)}
                className="px-3 py-1.5 bg-error-500/10 text-error-600 rounded-lg text-xs font-medium hover:bg-error-500/20 transition-colors"
              >
                <Trash2 size={12} className="inline mr-1" />Delete
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {drawingMode === 'polygon' && tempPoints.length >= 3 && (
            <ClayButton variant="success" size="sm" onClick={finishPolygon}>Finish Polygon</ClayButton>
          )}
          {drawingMode === 'polyline' && tempPoints.length >= 2 && (
            <ClayButton variant="success" size="sm" onClick={finishPolyline}>Finish Polyline</ClayButton>
          )}
          {drawingMode && (
            <ClayButton variant="outline" size="sm" onClick={() => { setDrawingMode(null); setTempPoints([]); }}>Cancel Drawing</ClayButton>
          )}
        </div>
      </ClayCard>

      <div className="flex justify-between">
        <ClayButton variant="outline" onClick={onBack}>
          Back
        </ClayButton>
        <ClayButton
          variant="primary"
          icon={ChevronRight}
          iconPosition="right"
          disabled={!isComplete}
          onClick={onNext}
        >
          Continue
        </ClayButton>
      </div>
    </div>
  )
}

// Step 5: Review & Submit
const ReviewStep = ({ formData, documents, drawnPolygons, onSubmit, onSaveDraft, isSubmitting, onBack }) => {
  const sections = [
    {
      title: 'Project Details',
      icon: FileText,
      fields: [
        { label: 'Proposal ID', value: formData.proposalNumber },
        { label: 'Project Name', value: formData.projectName },
        { label: 'Project Type', value: formData.projectType },
        { label: 'Department', value: formData.department },
        { label: 'State', value: formData.state },
        { label: 'District', value: formData.district },
        { label: 'Purpose', value: formData.purpose },
        { label: 'Estimated Cost', value: '₹' + formData.estimatedCost + ' Cr' },
      ],
    },
    {
      title: 'Land Details',
      icon: Map,
      fields: [
        { label: 'Total Land Required', value: formData.totalLandRequired + ' ha' },
        { label: 'Number of Parcels', value: formData.numberOfParcels },
        { label: 'Land Type', value: formData.landType },
        { label: 'Affected Families', value: formData.affectedFamilies.toLocaleString('en-IN') },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <ClayCard className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-success-600" />
          Review & Submit
        </h3>

        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title} className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <section.icon size={16} className="text-primary" />
                <h4 className="font-medium text-foreground">{section.title}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.fields.map((field) => (
                  <div key={field.label}>
                    <span className="text-xs text-text-secondary">{field.label}</span>
                    <p className="text-sm font-medium text-foreground">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Documents Summary */}
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileImage size={16} className="text-info" />
              <h4 className="font-medium text-foreground">Documents</h4>
            </div>
            <p className="text-sm text-text-secondary mb-3">{documents.length} document{documents.length !== 1 ? 's' : ''} uploaded</p>
            <div className="flex flex-wrap gap-2">
              {documents.slice(0, 5).map((doc, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-surface rounded-lg border border-border">
                  {doc.name}
                </span>
              ))}
              {documents.length > 5 && (
                <span className="text-xs px-2 py-1 bg-surface rounded-lg border border-border">
                  +{documents.length - 5} more
                </span>
              )}
            </div>
          </div>

          {/* GIS Summary */}
          <div className="border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-secondary" />
              <h4 className="font-medium text-foreground">GIS Location</h4>
            </div>
            <p className="text-sm text-text-secondary mb-3">
              {drawnPolygons.length} parcel{drawnPolygons.length !== 1 ? 's' : ''} mapped
            </p>
            {drawnPolygons.length > 0 && (
              <div className="text-xs text-text-secondary">
                Total area: {drawnPolygons.reduce((sum, p) => sum + (p.area || 0), 0)} ha
              </div>
            )}
          </div>
        </div>
      </ClayCard>

      <div className="flex justify-between">
        <ClayButton variant="outline" onClick={onBack}>
          Back
        </ClayButton>
        <div className="flex gap-3">
          <ClayButton variant="outline" icon={Save} className="text-black" onClick={onSaveDraft} disabled={isSubmitting}>
            Save Draft
          </ClayButton>
          <ClayButton
            variant="success"
            icon={Send}
            loading={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
          </ClayButton>
        </div>
      </div>
    </div>
  )
}

export default EditProposal
