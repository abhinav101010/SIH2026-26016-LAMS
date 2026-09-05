import { useState } from 'react'
import { Upload, X, File, FileText } from 'lucide-react'

const FileUpload = ({
  value = [],
  onChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.csv',
  multiple = true,
  label = 'Drop files here or click to upload',
  description = 'Max file size: 10MB',
  onUpload,
  allowRemove = true,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((c) => c + 1)
    if (dragCounter === 0) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter((c) => c - 1)
    if (dragCounter <= 1) setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setDragCounter(0)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const acceptedFiles = files.filter((f) =>
        accept.split(',').some((ext) => f.name.endsWith(ext.trim()))
      )
      if (acceptedFiles.length > 0) {
        const newFiles = multiple ? [...value, ...acceptedFiles] : [...acceptedFiles.slice(0, 1)]
        onChange?.(newFiles)
        onUpload?.(acceptedFiles)
      }
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newFiles = multiple ? [...value, ...files] : [...files.slice(0, 1)]
      onChange?.(newFiles)
      onUpload?.(files)
    }
    e.target.value = ''
  }

  const handleRemove = (fileToRemove) => {
    if (!allowRemove) return
    onChange?.(value.filter((f) => f !== fileToRemove))
  }

  const formatSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-6
          flex flex-col items-center justify-center text-center
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-border hover:border-primary/50 hover:bg-neutral-50/50'}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload').click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
          <Upload size={24} className="text-primary" />
        </div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-text-secondary mt-1">{description}</p>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <File size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-text-secondary">{formatSize(file.size)}</p>
              </div>
              {allowRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(file)
                  }}
                  className="text-text-tertiary hover:text-error-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const FileInfo = ({ file }) => (
  <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border">
    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
      <FileText size={20} className="text-primary" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
      <p className="text-xs text-text-secondary">{file.size}</p>
    </div>
  </div>
)

export default FileUpload
export { FileInfo }
