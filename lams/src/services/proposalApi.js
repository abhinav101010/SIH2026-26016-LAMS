import api from './api'

export const proposalApi = {
  getAll: (params) =>
    api.get('/proposals', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/proposals/${id}`).then((r) => r.data),

  create: (data) =>
    api.post('/proposals', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/proposals/${id}`, data).then((r) => r.data),

  delete: (id, confirm = false) =>
    api.delete(`/proposals/${id}`, { params: confirm ? { confirm: 'true' } : {} }).then((r) => r.data),

  submit: (id) =>
    api.post(`/proposals/${id}/submit`).then((r) => r.data),

  approve: (id, remarks) =>
    api.post(`/proposals/${id}/approve`, { remarks }).then((r) => r.data),

  reject: (id, remarks) =>
    api.post(`/proposals/${id}/reject`, { remarks }).then((r) => r.data),

  requestChanges: (id, remarks) =>
    api.post(`/proposals/${id}/request-changes`, { remarks }).then((r) => r.data),

  drop: (id) =>
    api.post(`/proposals/${id}/drop`).then((r) => r.data),

  completeVerification: (id) =>
    api.post(`/proposals/${id}/complete-verification`).then((r) => r.data),

  startFieldVerification: (id) =>
    api.post(`/proposals/${id}/start-field-verification`).then((r) => r.data),

  calculateAffectedPopulation: (data) =>
    api.post('/proposals/affected-population', data).then((r) => r.data),
}
