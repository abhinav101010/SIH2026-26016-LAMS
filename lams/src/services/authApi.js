import api from './api'

export const authApi = {
  login: (email, password, remember) =>
    api.post('/auth/login', { email, password, remember }).then((r) => r.data),

  register: (data) =>
    api.post('/auth/register', data).then((r) => r.data),

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),

  updateProfile: (data) =>
    api.put('/auth/me', data).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
}
