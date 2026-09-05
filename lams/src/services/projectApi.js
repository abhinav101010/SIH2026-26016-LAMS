import api from './api'

export const projectApi = {
  getAll: (params) =>
    api.get('/projects', { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/projects/${id}`).then((r) => r.data),

  create: (data) =>
    api.post('/projects', data).then((r) => r.data),

  update: (id, data) =>
    api.put(`/projects/${id}`, data).then((r) => r.data),
}
