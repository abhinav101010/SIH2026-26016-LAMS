import { useState, useCallback } from 'react'
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
import GISLocationStep from './steps/GISLocationStep'
import { proposalApi, documentApi } from '../services'
import 'leaflet/dist/leaflet.css'

const STEPS = [
  { id: 1, label: 'Project Details', description: 'Basic project information' },
  { id: 2, label: 'GIS Location', description: 'Land parcels and affected area' },
  { id: 3, label: 'Documents', description: 'Upload required documents' },
  { id: 4, label: 'Review & Submit', description: 'Review all information' },
]

const CreateProposal = () => {
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [createdProposalId, setCreatedProposalId] = useState(null)

   const [formData, setFormData] = useState({
      projectName: 'Delhi-Mumbai Expressway (Phase III)',
      projectType: 'Highway',
      department: 'NHAI',
      ministry: 'Ministry of Road Transport & Highways',
      state: 'Haryana',
      district: 'Gurgaon',
      purpose: 'Widening and 6-lane expressway to improve connectivity between Delhi and Mumbai',
      estimatedCost: 12500,
      totalLandRequired: 280,
      numberOfParcels: 12,
      landType: 'Agricultural',
      proposalNumber: '',
      priority: 'High',
      description: 'Expansion of existing 4-lane expressway to 6 lanes for enhanced traffic capacity',
      targetCompletion: '2027-12-31',
      displacedFamilies: 350,
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const handlePopulationDataChange = useCallback((payload) => {
    console.log('[Population] handlePopulationDataChange called', payload)
    const data = payload.data
    console.log('[Population] Extracted data', data)
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
        affectedFamilies: populationData?.affectedFamilies || formData.displacedFamilies,
        displacedFamilies: formData.displacedFamilies,
        priority: formData.priority,
        description: formData.description,
        targetCompletion: formData.targetCompletion ? new Date(formData.targetCompletion).toISOString() : null,
        parcels,
      }

      const _res = await proposalApi.create(payload)

      if (documents && documents.length > 0) {
        for (const doc of documents) {
          const formData = new FormData()
          formData.append('file', doc)
          formData.append('name', doc.name)
          formData.append('fileName', doc.name)
          formData.append('fileType', doc.type || 'application/pdf')
          formData.append('fileSize', String(doc.size))
          formData.append('storagePath', '')
          await documentApi.upload(_res.data.id, formData)
        }
      }

      toast.success({ title: 'Proposal saved', message: 'Your draft has been saved successfully.' })
      setSubmitted(true)
    } catch (err) {
      console.error('Failed to save proposal:', err)
      toast.error({
        title: 'Save failed',
        message: err.response?.data?.message || 'Unable to create proposal. Please try again.',
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
        affectedFamilies: populationData?.affectedFamilies || formData.displacedFamilies,
        displacedFamilies: formData.displacedFamilies,
        priority: formData.priority,
        description: formData.description,
        targetCompletion: formData.targetCompletion ? new Date(formData.targetCompletion).toISOString() : null,
        parcels,
      }

      const res = await proposalApi.create(payload)
      setCreatedProposalId(res.data.id)

      if (documents && documents.length > 0) {
        for (const doc of documents) {
          const formData = new FormData()
          formData.append('file', doc)
          formData.append('name', doc.name)
          formData.append('fileName', doc.name)
          formData.append('fileType', doc.type || 'application/pdf')
          formData.append('fileSize', String(doc.size))
          formData.append('storagePath', '')
          await documentApi.upload(res.data.id, formData)
        }
      }

      await proposalApi.submit(res.data.id)
      toast.success({ title: 'Proposal submitted', message: 'Your proposal has been submitted successfully.' })
      setSubmitted(true)
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
          <h2 className="text-2xl font-bold text-foreground mb-2">Proposal Submitted</h2>
          <p className="text-text-secondary mb-4">
            Your proposal <strong>{formData.proposalNumber}</strong> has been submitted successfully.
          </p>
          <p className="text-sm text-text-secondary mb-6">
            It will be reviewed by the competent authority. You can track its progress in the Proposals section.
          </p>
          <ClayButton
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => (window.location.href = '/proposals/' + createdProposalId)}
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

// Step 4: Documents
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

export default CreateProposal
