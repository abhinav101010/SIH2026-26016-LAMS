import api from './api'

export const auditApi = {
  getAuditLogs: (params = {}) =>
    api.get('/audit-logs', { params }).then((r) => r.data),

  delete: (id) =>
    api.delete(`/audit-logs/${id}`).then((r) => r.data),

  deleteAll: () =>
    api.delete('/audit-logs').then((r) => r.data),
}
