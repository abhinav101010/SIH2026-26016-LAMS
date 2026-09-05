import api from './api'

export const userApi = {
  getUsers: (params) =>
    api.get('/users', { params }).then((r) => r.data),

  getUser: (id) =>
    api.get(`/users/${id}`).then((r) => r.data),

  createUser: (data) =>
    api.post('/users', data).then((r) => r.data),

  updateUser: (id, data) =>
    api.put(`/users/${id}`, data).then((r) => r.data),

  deleteUser: (id) =>
    api.delete(`/users/${id}`).then((r) => r.data),

  updateUserStatus: (id, isActive) =>
    api.patch(`/users/${id}/status`, { isActive }).then((r) => r.data),

  updateUserRole: (id, role) =>
    api.patch(`/users/${id}/role`, { role }).then((r) => r.data),

  resetUserPassword: (id, password) =>
    api.post(`/users/${id}/reset-password`, { password }).then((r) => r.data),
}
