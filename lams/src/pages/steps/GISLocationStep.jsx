import { useState, useCallback, useRef, useEffect } from 'react'
import {
  Map,
  MapPin,
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'

import ClayCard from '../../components/ui/ClayCard'
import ClayButton from '../../components/ui/ClayButton'
import ClayInput from '../../components/ui/ClayInput'
import ClaySelect from '../../components/ui/ClaySelect'
import AffectedAreaMap from '../../components/gis/AffectedAreaMap'
import { LAND_TYPES } from '../../data'
import { proposalApi } from '../../services'

const getGeometryKey = (geometry) => {
  if (!geometry) return null
  if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates
    if (!coords || coords.length < 3) return null
    return `polygon:${JSON.stringify(coords.map(([lat, lng]) => [lng.toFixed(6), lat.toFixed(6)]))}`
  }
  if (geometry.type === 'Circle') {
    if (!geometry.center || !geometry.radius) return null
    const { lat, lng } = geometry.center
    return `circle:${lat.toFixed(6)},${lng.toFixed(6)},${geometry.radius.toFixed(2)}`
  }
  return null
}

const GISLocationStep = ({ formData, onChange, _drawnPolygons, _onPolygonsChange, affectedArea, onAreaChange, populationData, onPopulationDataChange, onNext, onBack }) => {
  const [calculatingPopulation, setCalculatingPopulation] = useState(false)
  const [populationError, setPopulationError] = useState(null)
  const abortControllerRef = useRef(null)
  const lastGeometryKeyRef = useRef(null)
  const onPopulationDataChangeRef = useRef(onPopulationDataChange)

  useEffect(() => {
    onPopulationDataChangeRef.current = onPopulationDataChange
  }, [onPopulationDataChange])

  const landTypeOptions = LAND_TYPES.map((t) => ({ value: t, label: t }))

  const isLandComplete = formData.totalLandRequired && formData.numberOfParcels && formData.landType
  const isAffectedComplete = !!affectedArea
  const isStepComplete = isLandComplete && isAffectedComplete

  const calculatePopulation = useCallback(async (geometry) => {
    const geometryKey = getGeometryKey(geometry)
    console.log('[Population] calculatePopulation called', { geometryKey, hasGeometry: !!geometry })
    if (!geometry || !geometryKey || !onPopulationDataChangeRef.current) {
      console.log('[Population] Early return - missing prerequisites')
      return
    }

    if (lastGeometryKeyRef.current === geometryKey) {
      console.log('[Population] Skipping duplicate geometry', geometryKey)
      return
    }
    lastGeometryKeyRef.current = geometryKey

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    setCalculatingPopulation(true)
    setPopulationError(null)
    try {
      console.log('[Population] Request started for', geometryKey)
      const res = await proposalApi.calculateAffectedPopulation({ geometry })
      console.log('[Population] Request completed', { aborted: controller.signal.aborted, hasRes: !!res, success: res?.success })
      if (!controller.signal.aborted && res) {
        console.log('[Population] Calling onPopulationDataChange with', res)
        onPopulationDataChangeRef.current(res)
      } else {
        console.log('[Population] Response ignored - aborted or empty')
      }
    } catch (err) {
      console.log('[Population] Request failed', err)
      if (!controller.signal.aborted) {
        setPopulationError('Unable to calculate affected population. Please try again.')
      }
    } finally {
      if (!controller.signal.aborted) {
        setCalculatingPopulation(false)
      }
    }
  }, [])

  useEffect(() => {
    console.log('[Population] Effect triggered', { hasAffectedArea: !!affectedArea, affectedAreaType: affectedArea?.type })
    if (affectedArea) {
      calculatePopulation(affectedArea)
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [affectedArea, calculatePopulation])

  const handleRetryPopulation = () => {
    if (affectedArea) {
      lastGeometryKeyRef.current = null
      calculatePopulation(affectedArea)
    }
  }

  const affectedAreaDisplay = affectedArea?.type === 'Polygon' || affectedArea?.type === 'Circle'
    ? `${(affectedArea.area || 0).toFixed(2)} ha`
    : 'Not defined'

  return (
    <div className="space-y-6">
      {/* Land Details Section */}
      <ClayCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Map size={18} className="text-secondary" />
          <h3 className="text-lg font-semibold text-foreground">Land Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>

        {isLandComplete && (
          <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
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
                <div className="text-lg font-bold text-emerald-600">
                  {formData.totalLandRequired ? Math.round(formData.totalLandRequired / formData.numberOfParcels || 0) : 0}
                </div>
                <div className="text-xs text-text-tertiary">Avg/parcel (ha)</div>
              </div>
            </div>
          </div>
        )}
      </ClayCard>

      {/* Affected Area Section - Single Map */}
      <ClayCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Affected Area</h3>
        </div>
        <p className="text-sm text-text-secondary mb-4">Define the area affected by the proposal. Draw a polygon or circle on the map.</p>

        <AffectedAreaMap affectedArea={affectedArea} onAreaChange={onAreaChange} />

        {!isAffectedComplete && (
          <div className="mt-4 p-3 bg-warning-500/10 border border-warning-500/30 rounded-xl text-sm text-warning-700">
            Please draw the affected area on the map before continuing.
          </div>
        )}

        {isAffectedComplete && (
          <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl text-xs text-text-secondary">
            <span className="font-medium text-foreground">Affected Area: </span>
            {affectedAreaDisplay}
          </div>
        )}
      </ClayCard>

      {/* Impact Estimation Section */}
      {isAffectedComplete && (
        <ClayCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-accent" />
            <h3 className="text-lg font-semibold text-foreground">Impact Estimation</h3>
          </div>

          {calculatingPopulation && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 size={16} className="animate-spin" />
              Calculating affected population...
            </div>
          )}

          {populationError && (
            <div className="p-3 bg-error-500/10 border border-error-500/30 rounded-xl text-sm text-error-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {populationError}
              <button
                onClick={handleRetryPopulation}
                className="ml-auto flex items-center gap-1 px-2 py-1 bg-error-500/10 hover:bg-error-500/20 rounded-lg text-xs font-medium"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          )}

          {populationData && !calculatingPopulation && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                <div className="text-xs text-text-tertiary mb-1">Affected Area</div>
                <div className="text-lg font-bold text-foreground">{populationData.areaKm2?.toFixed(2) || '—'} km²</div>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                <div className="text-xs text-text-tertiary mb-1">Estimated Population</div>
                <div className="text-lg font-bold text-foreground">
                  {populationData.population ? `≈ ${populationData.population.toLocaleString('en-IN')}` : '—'}
                </div>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                <div className="text-xs text-text-tertiary mb-1">Estimated Families</div>
                <div className="text-lg font-bold text-foreground">
                  {populationData.affectedFamilies ? `≈ ${populationData.affectedFamilies.toLocaleString('en-IN')}` : '—'}
                </div>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
                <div className="text-xs text-text-tertiary mb-1">Population Density</div>
                <div className="text-lg font-bold text-foreground">
                  {populationData.populationDensity ? `${populationData.populationDensity.toLocaleString('en-IN')}` : '—'} people/km²
                </div>
              </div>
            </div>
          )}
        </ClayCard>
      )}

      <div className="flex justify-between">
        <ClayButton variant="outline" onClick={onBack}>
          Back
        </ClayButton>
        <ClayButton
          variant="primary"
          iconPosition="right"
          disabled={!isStepComplete}
          onClick={onNext}
        >
          Continue
        </ClayButton>
      </div>
    </div>
  )
}

export default GISLocationStep
