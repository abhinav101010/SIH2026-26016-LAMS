import api from './api'

export const roleApi = {
  getRoles: () =>
    api.get('/roles').then((r) => r.data),

  getRole: (id) =>
    api.get(`/roles/${id}`).then((r) => r.data),

  createRole: (data) =>
    api.post('/roles', data).then((r) => r.data),

  updateRole: (id, data) =>
    api.put(`/roles/${id}`, data).then((r) => r.data),

  deleteRole: (id) =>
    api.delete(`/roles/${id}`).then((r) => r.data),
}
