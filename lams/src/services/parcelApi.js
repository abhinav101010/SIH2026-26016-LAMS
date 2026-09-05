import api from './api'

export const parcelApi = {
  getAll: (params) =>
    api.get('/parcels', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/parcels/${id}`).then((r) => r.data),

  getByProposal: (proposalId) =>
    api.get(`/parcels/proposal/${proposalId}`).then((r) => r.data),

  getMapParcels: (params) =>
    api.get('/map/parcels', { params }).then((r) => r.data),
}
