import api from './api'

async function decodeErrorBlob(err) {
  try {
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text()
      try {
        const json = JSON.parse(text)
        return json.message || text
      } catch {
        return text
      }
    }
  } catch {
    // ignore decode errors
  }
  return err.message
}

export const documentApi = {
  upload: (proposalId, formData) =>
    api.post(`/documents/${proposalId}/documents`, formData).then((r) => r.data),

  getByProposal: (proposalId, params) =>
    api.get(`/documents/${proposalId}/documents`, { params }).then((r) => r.data),

  getById: (id) =>
    api.get(`/documents/${id}`).then((r) => r.data),

  getFile: (id) =>
    api.get(`/documents/${id}/file`, { responseType: 'blob' }).then((r) => r.data),

  delete: (id) =>
    api.delete(`/documents/${id}`).then((r) => r.data),

  verify: (id, remarks = '') =>
    api.post(`/documents/${id}/verify`, { remarks }).then((r) => r.data),

  reject: (id, remarks) =>
    api.post(`/documents/${id}/reject`, { remarks }).then((r) => r.data),
}

export async function getFileWithErrorMessage(id) {
  try {
    return await documentApi.getFile(id)
  } catch (err) {
    const message = await decodeErrorBlob(err)
    const friendly = message === 'File missing on server'
      ? 'Document file is not available on the server.'
      : message || 'Failed to open document.'
    throw Object.assign(new Error(friendly), { originalError: err })
  }
}
