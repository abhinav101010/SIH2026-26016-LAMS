import api from './api'

export const departmentApi = {
  getDepartments: (params = {}) =>
    api.get('/departments', { params }).then((r) => r.data),

  getDepartmentById: (id) =>
    api.get(`/departments/${id}`).then((r) => r.data),

  createDepartment: (data) =>
    api.post('/departments', data).then((r) => r.data),

  updateDepartment: (id, data) =>
    api.put(`/departments/${id}`, data).then((r) => r.data),

  deleteDepartment: (id) =>
    api.delete(`/departments/${id}`).then((r) => r.data),
}
