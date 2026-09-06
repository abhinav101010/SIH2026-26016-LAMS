import api from './api'

export const documentApi = {
  upload: (proposalId, formData) =>
    api.post(`/documents/${proposalId}/documents`, formData).then((r) => r.data),

  getByProposal: (proposalId, params) =>
    api.get(`/documents/${proposalId}/documents`, { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/documents/${id}`).then((r) => r.data),

  delete: (id) =>
    api.delete(`/documents/${id}`).then((r) => r.data),

  verify: (id, remarks = '') =>
    api.post(`/documents/${id}/verify`, { remarks }).then((r) => r.data),

  reject: (id, remarks) =>
    api.post(`/documents/${id}/reject`, { remarks }).then((r) => r.data),
}
