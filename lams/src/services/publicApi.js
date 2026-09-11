import api from './api'

export const publicApi = {
  getProposals: (params) =>
    api.get('/public/proposals', { params }).then((r) => r.data),

  getProposalById: (id) =>
    api.get(`/public/proposals/${id}`).then((r) => r.data),

  getFilters: () =>
    api.get('/public/filters').then((r) => r.data),
}
