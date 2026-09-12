import { useState, useEffect, useCallback } from 'react'
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
  Users,
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

import { STATES, DEPARTMENTS, PROJECT_TYPES } from '../data'
import { proposalApi, documentApi } from '../services'
import GISLocationStep from './steps/GISLocationStep'
import { useParams, useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

const STEPS = [
  { id: 1, label: 'Project Details', description: 'Basic project information' },
  { id: 2, label: 'GIS Location', description: 'Land parcels and affected area' },
  { id: 3, label: 'Documents', description: 'Upload required documents' },
  { id: 4, label: 'Review & Submit', description: 'Review all information' },
]

const EditProposal = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

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
    proposalNumber: '',
    priority: '',
    description: '',
    targetCompletion: '',
    affectedArea: null,
    affectedAreaType: null,
    affectedAreaKm2: null,
    estimatedPopulation: null,
    populationDensity: null,
    populationDataSource: null,
  })

  const [documents, setDocuments] = useState([])
  const [drawnPolygons, setDrawnPolygons] = useState([])
  const [affectedArea, setAffectedArea] = useState(null)
  const [populationData, setPopulationData] = useState(null)
  const [approvingDepartments, setApprovingDepartments] = useState([])
  const [departments, setDepartments] = useState([])

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
          proposalNumber: p.proposalNumber || '',
          priority: p.priority || '',
          description: p.description || '',
          targetCompletion: p.targetCompletion ? p.targetCompletion.split('T')[0] : '',
          affectedArea: p.affectedArea || null,
          affectedAreaType: p.affectedAreaType || null,
          affectedAreaKm2: p.affectedAreaKm2 || null,
          estimatedPopulation: p.estimatedPopulation || null,
          populationDensity: p.populationDensity || null,
          populationDataSource: p.populationDataSource || null,
        })
        setAffectedArea(p.affectedArea ? (typeof p.affectedArea === 'string' ? JSON.parse(p.affectedArea) : p.affectedArea) : null)
        setPopulationData(p.affectedArea ? {
          areaKm2: p.affectedAreaKm2,
          population: p.estimatedPopulation,
          populationDensity: p.populationDensity,
          affectedFamilies: p.affectedFamilies,
          dataSource: p.populationDataSource || 'estimated',
        } : null)
        setDocuments((p.documents || []).map((doc) => ({
          ...doc,
          size: doc.fileSize,
        })))
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
        if (p.approvingDepartments && Array.isArray(p.approvingDepartments)) {
          setApprovingDepartments(p.approvingDepartments)
        }
      } catch (err) {
        toast.error({ title: 'Failed to load proposal', message: err.response?.data?.message || 'Something went wrong' })
        navigate('/proposals')
      } finally {
        setLoading(false)
      }
    }

    const fetchDepartments = async () => {
      try {
        const { departmentApi } = await import('../services')
        const res = await departmentApi.getDepartments()
        setDepartments(res.data || [])
      } catch (err) {
        console.error('Failed to fetch departments:', err)
      }
    }

    if (id) {
      fetchProposal()
      fetchDepartments()
    }
  }, [id])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handlePopulationDataChange = useCallback((payload) => {
    const data = payload.data
    setPopulationData(data)
    if (data) {
      setFormData((prev) => ({
        ...prev,
        affectedAreaType: data.dataSource === 'estimated' ? (affectedArea?.type || null) : null,
        affectedAreaKm2: data.areaKm2 || null,
        estimatedPopulation: data.population || null,
        populationDensity: data.populationDensity || null,
        populationDataSource: data.dataSource || null,
      }))
    }
  }, [affectedArea])

  const handleSaveDraft = async () => {
    setIsSubmitting(true)
    try {
      let parcels = drawnPolygons.map((shape, idx) => ({
        parcelNumber: `PARC-${String(idx + 1).padStart(3, '0')}`,
        area: shape.area || 0,
        landType: formData.landType,
        status: 'pending',
        geometry: typeof shape.geometry === 'string' ? shape.geometry : JSON.stringify(shape.geometry),
      }))

      if (parcels.length === 0 && affectedArea) {
        parcels = [{
          parcelNumber: `PARC-001`,
          area: affectedArea.area || 0,
          landType: formData.landType,
          status: 'pending',
          geometry: typeof affectedArea.geometry === 'string' ? affectedArea.geometry : JSON.stringify(affectedArea.geometry),
        }]
      }

      const hasLandParcels = parcels.length > 0
      const hasAffectedArea = !!affectedArea

      if (!hasLandParcels && !hasAffectedArea) {
        toast.error({ title: 'GIS Required', message: 'Please draw at least one land parcel or affected area on the map before saving.' })
        return
      }

      if (!affectedArea) {
        toast.error({ title: 'Affected Area Required', message: 'Please draw the affected area on the map before saving.' })
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
        affectedArea: affectedArea ? JSON.stringify(affectedArea) : null,
        affectedAreaType: formData.affectedAreaType,
        affectedAreaKm2: formData.affectedAreaKm2,
        estimatedPopulation: formData.estimatedPopulation,
        populationDensity: formData.populationDensity,
        populationDataSource: formData.populationDataSource,
        affectedFamilies: populationData?.affectedFamilies,
        priority: formData.priority,
        description: formData.description,
        targetCompletion: formData.targetCompletion,
        approvingDepartments,
      }

      if (parcels.length > 0) {
        payload.parcels = parcels
      }

      await proposalApi.update(id, payload)

      const newDocuments = documents.filter((doc) => !doc.id && doc instanceof File)
      for (const doc of newDocuments) {
        const formData = new FormData()
        formData.append('file', doc)
        formData.append('name', doc.name)
        formData.append('fileName', doc.name)
        formData.append('fileType', doc.type || 'application/pdf')
        formData.append('fileSize', String(doc.size))
        formData.append('storagePath', '')
        await documentApi.upload(id, formData)
      }

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
      let parcels = drawnPolygons.map((shape, idx) => ({
        parcelNumber: `PARC-${String(idx + 1).padStart(3, '0')}`,
        area: shape.area || 0,
        landType: formData.landType,
        status: 'pending',
        geometry: typeof shape.geometry === 'string' ? shape.geometry : JSON.stringify(shape.geometry),
      }))

      if (parcels.length === 0 && affectedArea) {
        parcels = [{
          parcelNumber: `PARC-001`,
          area: affectedArea.area || 0,
          landType: formData.landType,
          status: 'pending',
          geometry: typeof affectedArea.geometry === 'string' ? affectedArea.geometry : JSON.stringify(affectedArea.geometry),
        }]
      }

      const hasLandParcels = parcels.length > 0
      const hasAffectedArea = !!affectedArea

      if (!hasLandParcels && !hasAffectedArea) {
        toast.error({ title: 'GIS Required', message: 'Please draw at least one land parcel or affected area on the map before saving.' })
        return
      }

      if (!affectedArea) {
        toast.error({ title: 'Affected Area Required', message: 'Please draw the affected area on the map before submitting.' })
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
        affectedArea: affectedArea ? JSON.stringify(affectedArea) : null,
        affectedAreaType: formData.affectedAreaType,
        affectedAreaKm2: formData.affectedAreaKm2,
        estimatedPopulation: formData.estimatedPopulation,
        populationDensity: formData.populationDensity,
        populationDataSource: formData.populationDataSource,
        affectedFamilies: populationData?.affectedFamilies,
        priority: formData.priority,
        description: formData.description,
        targetCompletion: formData.targetCompletion,
        approvingDepartments,
      }

      if (parcels.length > 0) {
        payload.parcels = parcels
      }

      await proposalApi.update(id, payload)

      const newDocuments = documents.filter((doc) => !doc.id && doc instanceof File)
      for (const doc of newDocuments) {
        const formData = new FormData()
        formData.append('file', doc)
        formData.append('name', doc.name)
        formData.append('fileName', doc.name)
        formData.append('fileType', doc.type || 'application/pdf')
        formData.append('fileSize', String(doc.size))
        formData.append('storagePath', '')
        await documentApi.upload(id, formData)
      }

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
            <GISLocationStep
              formData={formData}
              onChange={handleInputChange}
              drawnPolygons={drawnPolygons}
              onPolygonsChange={setDrawnPolygons}
              affectedArea={affectedArea}
              onAreaChange={setAffectedArea}
              populationData={populationData}
              onPopulationDataChange={handlePopulationDataChange}
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
            <ReviewStep
              formData={formData}
              documents={documents}
              drawnPolygons={drawnPolygons}
              affectedArea={affectedArea}
              populationData={populationData}
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

  const isComplete = formData.projectName && formData.projectType && formData.department && formData.state && formData.district && formData.purpose && formData.estimatedCost && approvingDepartments.length > 0

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
              placeholder="Bharat Bhoomi-YYYY-XXXX"
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

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">Approving Departments <span className="text-error-500">*</span></label>
            <div className="border border-border rounded-xl p-3 bg-surface max-h-48 overflow-y-auto">
              {departments.length === 0 ? (
                <p className="text-xs text-foreground-secondary">Loading departments...</p>
              ) : (
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <label key={dept.id} className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={approvingDepartments.includes(dept.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setApprovingDepartments([...approvingDepartments, dept.id])
                          } else {
                            setApprovingDepartments(approvingDepartments.filter((id) => id !== dept.id))
                          }
                        }}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{dept.name}</p>
                        <p className="text-xs text-foreground-secondary">{dept.code}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-foreground-secondary mt-1">Select at least one department that must approve this proposal</p>
          </div>

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

// Step 4: Review & Submit
const ReviewStep = ({ formData, documents, drawnPolygons, affectedArea, populationData, onSubmit, onSaveDraft, isSubmitting, onBack }) => {
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
      title: 'GIS Location',
      icon: Map,
      fields: [
        { label: 'Total Land Required', value: formData.totalLandRequired + ' ha' },
        { label: 'Number of Parcels', value: formData.numberOfParcels },
        { label: 'Land Type', value: formData.landType },
        { label: 'Parcels Mapped', value: drawnPolygons.length > 0 ? drawnPolygons.length : (affectedArea ? 1 : 0) },
        { label: 'Land Area Drawn', value: (drawnPolygons.length > 0 ? drawnPolygons.reduce((sum, p) => sum + (p.area || 0), 0) : (affectedArea?.area || 0)).toFixed(2) + ' ha' },
        { label: 'Affected Area Type', value: affectedArea?.type === 'Polygon' ? 'Polygon' : affectedArea?.type === 'Circle' ? 'Circle' : 'Not defined' },
        { label: 'Affected Area', value: affectedArea
            ? `${(affectedArea.area || 0).toFixed(2)} ha`
            : 'Not defined' },
        ...(affectedArea?.type === 'Circle'
          ? [{ label: 'Radius', value: Math.round(affectedArea.radius || 0) + ' m' }]
          : []),
        { label: 'Estimated Population', value: populationData?.population ? '≈ ' + populationData.population.toLocaleString('en-IN') : 'Not calculated' },
        { label: 'Estimated Families', value: populationData?.affectedFamilies ? '≈ ' + populationData.affectedFamilies.toLocaleString('en-IN') : 'Not calculated' },
        { label: 'Population Density', value: populationData?.populationDensity ? populationData.populationDensity.toLocaleString('en-IN') + ' people/km²' : 'Not calculated' },
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

          {/* Approving Departments */}
          {approvingDepartments.length > 0 && (
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-primary" />
                <h4 className="font-medium text-foreground">Approving Departments</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {approvingDepartments.map((deptId) => {
                  const dept = departments.find((d) => d.id === deptId)
                  return (
                    <span key={deptId} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                      {dept?.name || deptId}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
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
