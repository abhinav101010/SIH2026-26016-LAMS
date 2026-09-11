const { z } = require('zod')

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().optional(),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
})

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
})

const parcelItemSchema = z.object({
  parcelNumber: z.string().optional(),
  area: z.number().positive().optional(),
  landType: z.string().optional(),
  status: z.string().optional(),
  surveyNo: z.string().optional(),
  village: z.string().optional(),
  owner: z.string().optional(),
  geometry: z.string().optional(),
})

const proposalBaseFields = {
  proposalNumber: z.string().optional(),
  projectName: z.string().min(1, 'Project name is required'),
  projectType: z.string().min(1, 'Project type is required'),
  department: z.string().min(1, 'Department is required'),
  ministry: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  estimatedCost: z.number().positive('Estimated cost must be positive'),
  totalLandRequired: z.number().positive('Total land required must be positive'),
  numberOfParcels: z.number().int().positive('Number of parcels must be positive'),
  landType: z.string().min(1, 'Land type is required'),
  affectedFamilies: z.number().int().nonnegative().nullable().optional(),
  affectedArea: z.string().nullable().optional(),
  affectedAreaType: z.string().nullable().optional(),
  affectedAreaKm2: z.number().positive().nullable().optional(),
  estimatedPopulation: z.number().int().nonnegative().nullable().optional(),
  populationDensity: z.number().positive().nullable().optional(),
  populationDataSource: z.string().nullable().optional(),
  displacedFamilies: z.number().int().nonnegative().nullable().optional(),
  priority: z.string().optional(),
  description: z.string().optional(),
  targetCompletion: z.string().optional(),
}

const proposalSchema = z.object({
  ...proposalBaseFields,
  parcels: z.array(parcelItemSchema).optional(),
}).refine(
  (data) => {
    const parcels = data.parcels || []
    return parcels.some((p) => p.geometry && p.geometry.trim().length > 0)
  },
  { message: 'Please draw at least one land parcel on the map before submitting.', path: ['parcels'] }
)

const proposalUpdateSchema = z.object({
  ...proposalBaseFields,
  parcels: z.array(parcelItemSchema).optional(),
}).partial()

const approvalSchema = z.object({
  action: z.enum(['APPROVED', 'REJECTED', 'CHANGES_REQUESTED']).optional(),
  remarks: z.string().optional(),
})

const documentSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.coerce.number().positive('File size must be positive'),
  storagePath: z.string().optional(),
})

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().default('PROPOSAL_OFFICER'),
  departmentId: z.string().uuid().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  employeeId: z.string().optional(),
  isActive: z.boolean().default(true),
})

const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  department: z.string().optional(),
  employeeId: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
})

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
})

const updateUserRoleSchema = z.object({
  role: z.string(),
})

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const createRoleSchema = z.object({
  name: z.string().min(2, 'Role name is required'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

const updateRoleSchema = z.object({
  name: z.string().min(2, 'Role name is required').optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

module.exports = {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  updateUserRoleSchema,
  resetPasswordSchema,
  createRoleSchema,
  updateRoleSchema,
  proposalSchema,
  proposalUpdateSchema,
  approvalSchema,
  documentSchema,
  paginationSchema,
}
