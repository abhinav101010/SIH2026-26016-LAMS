const prisma = require('../config/db')
const { successResponse, errorResponse } = require('../utils/response')

const getProposalScope = (req) => {
  if (req.user.role === 'SUPER_ADMIN') return {}
  return { departmentId: req.user.departmentId }
}

const getProjectScope = (req) => {
  if (req.user.role === 'SUPER_ADMIN') return {}
  return { department: req.user.department }
}

const getOverview = async (req, res) => {
  try {
    const proposalScope = getProposalScope(req)
    const projectScope = getProjectScope(req)

    const [
      totalProjects,
      totalProposals,
      landProposed,
      landAcquired,
      pendingProposals,
      compensationDisbursed,
      affectedFamilies,
      pendingDepartmentApprovals,
      approvedDepartmentApprovals,
      rejectedDepartmentApprovals,
    ] = await Promise.all([
      prisma.project.count({ where: projectScope }),
      prisma.proposal.count({ where: proposalScope }),
      prisma.proposal.aggregate({ _sum: { totalLandRequired: true }, where: proposalScope }),
      prisma.proposal.aggregate({
        _sum: { totalLandRequired: true },
        where: { ...proposalScope, status: { in: ['ACQUIRED', 'POSSESSION'] } },
      }),
      prisma.proposal.count({ where: { ...proposalScope, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'FIELD_VERIFICATION'] } } }),
      prisma.compensation.aggregate({
        _sum: { paidAmount: true },
        where: {
          proposal: proposalScope,
          status: { in: ['PAID', 'PARTIALLY_PAID'] },
        },
      }),
      prisma.proposal.aggregate({ _sum: { affectedFamilies: true }, where: proposalScope }),
      prisma.approval.count({ where: { action: 'PENDING' } }),
      prisma.approval.count({ where: { action: 'APPROVED' } }),
      prisma.approval.count({ where: { action: 'REJECTED' } }),
    ])

    return successResponse(res, {
      totalProjects,
      totalProposals,
      landProposed: landProposed._sum.totalLandRequired || 0,
      landAcquired: landAcquired._sum.totalLandRequired || 0,
      pendingProposals,
      compensationDisbursed: compensationDisbursed._sum.paidAmount || 0,
      affectedFamilies: affectedFamilies._sum.affectedFamilies || 0,
      pendingDepartmentApprovals,
      approvedDepartmentApprovals,
      rejectedDepartmentApprovals,
    })
  } catch (error) {
    return errorResponse(res, 'Failed to fetch dashboard overview', 500)
  }
}

const getStatusDistribution = async (req, res) => {
  try {
    const scope = getProposalScope(req)
    const statuses = await prisma.proposal.groupBy({
      by: ['status'],
      where: scope,
      _count: { status: true },
      _sum: { estimatedCost: true },
    })

    const colorMap = {
      DRAFT: 'pending',
      SUBMITTED: 'review',
      FIELD_VERIFICATION: 'review',
      UNDER_REVIEW: 'review',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      CHANGES_REQUESTED: 'review',
      NOTIFICATION_ISSUED: 'approved',
      AWARD_DECLARED: 'approved',
      COMPENSATION: 'approved',
      ACQUIRED: 'acquired',
      POSSESSION: 'acquired',
    }

    const data = statuses.map((s) => ({
      status: s.status.replace(/_/g, ' '),
      count: s._count.status,
      amount: s._sum.estimatedCost || 0,
      color: colorMap[s.status] || 'pending',
    }))

    return successResponse(res, data)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch status distribution', 500)
  }
}

const getStateProgress = async (req, res) => {
  try {
    const scope = getProposalScope(req)

    let result
    if (scope.departmentId) {
      result = await prisma.$queryRaw`
        SELECT 
          state,
          SUM(totalLandRequired) as proposed,
          SUM(CASE WHEN status IN ('ACQUIRED', 'POSSESSION') THEN totalLandRequired ELSE 0 END) as acquired
        FROM proposals
        WHERE departmentId = ${scope.departmentId}
        GROUP BY state
        ORDER BY proposed DESC
        LIMIT 10
      `
    } else {
      result = await prisma.$queryRaw`
        SELECT 
          state,
          SUM(totalLandRequired) as proposed,
          SUM(CASE WHEN status IN ('ACQUIRED', 'POSSESSION') THEN totalLandRequired ELSE 0 END) as acquired
        FROM proposals
        GROUP BY state
        ORDER BY proposed DESC
        LIMIT 10
      `
    }

    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch state progress', 500)
  }
}

const getAcquisitionTrends = async (req, res) => {
  try {
    const scope = getProposalScope(req)

    let result
    if (scope.departmentId) {
      result = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%b') as month,
          MONTH(createdAt) as month_num,
          SUM(CASE WHEN status IN ('ACQUIRED', 'POSSESSION') THEN totalLandRequired ELSE 0 END) as acquired,
          SUM(totalLandRequired) as proposed
        FROM proposals
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND departmentId = ${scope.departmentId}
        GROUP BY month, month_num
        ORDER BY month_num
      `
    } else {
      result = await prisma.$queryRaw`
        SELECT 
          DATE_FORMAT(createdAt, '%b') as month,
          MONTH(createdAt) as month_num,
          SUM(CASE WHEN status IN ('ACQUIRED', 'POSSESSION') THEN totalLandRequired ELSE 0 END) as acquired,
          SUM(totalLandRequired) as proposed
        FROM proposals
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY month, month_num
        ORDER BY month_num
      `
    }

    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch acquisition trends', 500)
  }
}

const getTimelineAdherence = async (req, res) => {
  try {
    const scope = getProposalScope(req)

    let result
    if (scope.departmentId) {
      result = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN progress >= 75 THEN 'On Track'
            WHEN progress >= 40 THEN 'At Risk'
            ELSE 'Delayed'
          END as category,
          COUNT(*) as count,
          ROUND(AVG(progress), 1) as percentage
        FROM proposals
        WHERE status NOT IN ('DRAFT', 'REJECTED') AND departmentId = ${scope.departmentId}
        GROUP BY CASE 
            WHEN progress >= 75 THEN 'On Track'
            WHEN progress >= 40 THEN 'At Risk'
            ELSE 'Delayed'
          END
      `
    } else {
      result = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN progress >= 75 THEN 'On Track'
            WHEN progress >= 40 THEN 'At Risk'
            ELSE 'Delayed'
          END as category,
          COUNT(*) as count,
          ROUND(AVG(progress), 1) as percentage
        FROM proposals
        WHERE status NOT IN ('DRAFT', 'REJECTED')
        GROUP BY CASE 
            WHEN progress >= 75 THEN 'On Track'
            WHEN progress >= 40 THEN 'At Risk'
            ELSE 'Delayed'
          END
      `
    }

    const normalized = (result || []).map((row) => ({
      category: row.category,
      count: Number(row.count),
      percentage: Number(row.percentage),
    }))

    return successResponse(res, normalized)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch timeline adherence', 500)
  }
}

const getRecentProposals = async (req, res) => {
  try {
    const scope = getProposalScope(req)
    const proposals = await prisma.proposal.findMany({
      take: 8,
      where: scope,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        proposalNumber: true,
        projectName: true,
        state: true,
        district: true,
        totalLandRequired: true,
        submittedDate: true,
        status: true,
        progress: true,
      },
    })

    return successResponse(res, proposals)
  } catch (error) {
    return errorResponse(res, 'Failed to fetch recent proposals', 500)
  }
}

module.exports = {
  getOverview,
  getStatusDistribution,
  getStateProgress,
  getAcquisitionTrends,
  getTimelineAdherence,
  getRecentProposals,
}
