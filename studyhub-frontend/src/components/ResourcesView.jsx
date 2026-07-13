import { useState, useMemo, useRef, useEffect } from 'react'
import { renderAsync } from 'docx-preview'
import { useTranslation } from 'react-i18next'
import {
  Download,
  ExternalLink,
  Eye,
  ArrowUpDown,
  ChevronDown,
  Search,
  Plus,
  X,
  Check,
  History,
} from "lucide-react"
import pdfIcon from '../assets/icons/pdf.png'
import bookIcon from '../assets/icons/book.png'
import imageIcon from '../assets/icons/image.png'
import fileIcon from '../assets/icons/file.png'
import folderIcon from '../assets/icons/folder.png'
import CustomIcon from './CustomIcon'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:80/api"

const MATERIAL_ICONS = {
  PDF: pdfIcon,
  NOTES: bookIcon,
  SLIDES: imageIcon,
  RECORDING: fileIcon,
  LINK: folderIcon,
  DOC: fileIcon,
}

const MaterialTypeIcon = ({ type, className = 'w-4.5 h-4.5' }) => (
  <img
    src={MATERIAL_ICONS[type] || fileIcon}
    alt=""
    aria-hidden="true"
    className={`${className} object-contain`}
  />
)

const resolveResourceUrl = (url) => {
  if (!url) return ""
  if (!import.meta.env.DEV) return url

  try {
    const parsed = new URL(url, window.location.origin)
    const backend = new URL(API_BASE_URL, window.location.origin)

    if (parsed.origin === backend.origin && parsed.pathname.startsWith("/storage/")) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  } catch {
    // Fall back to the original URL when parsing fails.
  }

  return url
}


// ─── Type Config ─────────────────────────────────────────────
const TYPE_CONFIG = {
  PDF:       { Icon: (props) => <MaterialTypeIcon type="PDF" {...props} />, iconBg: 'bg-surface-container-low', iconColor: 'text-primary', badgeBg: 'bg-surface-container-low', badgeText: 'text-primary' },
  NOTES:     { Icon: (props) => <MaterialTypeIcon type="NOTES" {...props} />, iconBg: 'bg-surface-container-low', iconColor: 'text-primary', badgeBg: 'bg-surface-container-low', badgeText: 'text-primary' },
  SLIDES:    { Icon: (props) => <MaterialTypeIcon type="SLIDES" {...props} />, iconBg: 'bg-surface-container-low', iconColor: 'text-primary', badgeBg: 'bg-surface-container-low', badgeText: 'text-primary' },
  RECORDING: { Icon: (props) => <MaterialTypeIcon type="RECORDING" {...props} />, iconBg: 'bg-surface-container-low', iconColor: 'text-success', badgeBg: 'bg-surface-container-low', badgeText: 'text-success' },
  LINK:      { Icon: (props) => <MaterialTypeIcon type="LINK" {...props} />, iconBg: 'bg-surface-container-low', iconColor: 'text-success', badgeBg: 'bg-surface-container-low', badgeText: 'text-success' },
  DOC:       { Icon: (props) => <MaterialTypeIcon type="DOC" {...props} />,  iconBg: 'bg-surface-container-low', iconColor: 'text-primary', badgeBg: 'bg-surface-container-low', badgeText: 'text-primary' },
}

const getTypeConfig = (type) => TYPE_CONFIG[type] ?? TYPE_CONFIG['DOC']

const getTypeFromFileName = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return 'PDF'
  if (['doc', 'docx', 'rtf', 'odt'].includes(ext)) return 'DOC'
  if (['ppt', 'pptx'].includes(ext)) return 'SLIDES'
  if (['txt', 'md'].includes(ext)) return 'NOTES'
  if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) return 'RECORDING'
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'].includes(ext)) return 'SLIDES'
  return 'DOC'
}

const getPreviewInfo = (resource) => {
  const rawUrl = resource.url || ""
  const source = resource.fileName || resource.file_name || rawUrl
  const ext = source.split(".").pop()?.toLowerCase() || ""
  const isRemote = /^https?:\/\//i.test(rawUrl)
  const isStorageUrl = rawUrl.includes("/storage/")
  if (['jpg','jpeg','png','gif','svg','webp'].includes(ext)) return { canPreview: true, type: 'image' }
  if (ext === 'pdf') return { canPreview: true, type: 'pdf' }
  if (['txt','md'].includes(ext)) return { canPreview: true, type: 'text' }
  if (['mp4','webm','mov'].includes(ext)) return { canPreview: true, type: 'video' }
  // .docx hosted locally: render with docx-preview
  if (ext === 'docx') return { canPreview: true, type: 'office-docx' }
  // Remote Office files (publicly accessible): use Office Live viewer
  if (['doc','ppt','pptx'].includes(ext) && isRemote && !isStorageUrl) return { canPreview: true, type: 'office-remote' }
  if (['docx','ppt','pptx'].includes(ext) && isRemote && !isStorageUrl) return { canPreview: true, type: 'office-remote' }
  // Local .doc / .ppt / .pptx: no browser renderer available
  if (['doc','ppt','pptx'].includes(ext)) return { canPreview: true, type: 'office-local' }
  return { canPreview: false, type: 'unsupported' }
}

const TagChip = ({ label }) => (
  <span className="text-[9px] font-extrabold tracking-widest uppercase px-1.5 py-0.5 rounded-sm bg-surface-container-low text-on-surface-variant border border-outline-variant">
    {label}
  </span>
)

// ─── Recent Resource Card (horizontal compact) ───────────────
const RecentCard = ({ resource, subjectName, t }) => {
  const cfg = getTypeConfig(resource.type)
  const { Icon } = cfg
  return (
    <div className="bg-surface border border-outline-variant rounded-lg shadow-ambient hover:shadow-md transition-shadow p-4 flex flex-col gap-3 flex-1 min-w-[220px] max-w-sm">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center rounded-md shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <span className={`text-label-sm font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm ${cfg.badgeBg} ${cfg.badgeText}`}>
          {t(`resources:typeShort.${resource.type}`, resource.type)}
        </span>
      </div>
      <div>
        <p className="text-label-md font-bold text-on-surface leading-snug truncate">{resource.title}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">{subjectName}</p>
      </div>
      <p className="text-[11px] text-on-surface-variant mt-auto font-medium">{resource.size || t('resources:defaults.attachment')} • {resource.uploadDate}</p>
    </div>
  )
}

// ─── Full Resource Card ───────────────────────────────────────
const ResourceCard = ({ resource, subjectName, onPreview, t }) => {
  const cfg = getTypeConfig(resource.type)
  const { Icon } = cfg
  const isLink = resource.type === "LINK"
  const previewInfo = getPreviewInfo(resource)
  const url = resolveResourceUrl(resource.url)

  const handleOpen = () => {
    if (isLink || !previewInfo.canPreview) {
      window.open(resource.url, '_blank', 'noopener,noreferrer')
    } else {
      onPreview(resource)
    }
  }

  const displayDate = resource.uploadDate || (resource.uploadedAt ? resource.uploadedAt.split('T')[0] : '')

  return (
    <div className="bg-surface border border-outline-variant rounded-lg shadow-ambient hover:shadow-md transition-shadow p-4 flex flex-col gap-3 font-inter">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className={`w-9 h-9 ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center rounded-md shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex flex-wrap gap-1 justify-end">
          <TagChip label={t(`resources:typeShort.${resource.type}`, resource.type)} />
          {subCode(subjectName) && <TagChip label={subCode(subjectName)} />}
        </div>
      </div>

      {/* Title + description */}
      <div className="flex flex-col gap-1">
        <h4 className="text-label-md font-bold text-on-surface leading-snug line-clamp-2">{resource.title}</h4>
        <p className="text-[12px] text-on-surface-variant leading-relaxed line-clamp-3">{resource.description}</p>
      </div>

      {/* Footer: meta + actions */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface-container">
        <span className="text-[11px] text-on-surface-variant font-medium truncate pr-2">{resource.size || t('resources:defaults.attachment')} • {displayDate}</span>
        <div className="flex items-center gap-3 shrink-0">
          {!isLink && (
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-label-sm font-bold text-primary hover:text-primary/90 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('resources:actions.download')}</span>
            </a>
          )}
          <button
            onClick={handleOpen}
            className="flex items-center gap-1 text-label-sm font-bold text-primary hover:text-primary/90 transition-colors cursor-pointer bg-transparent border-0"
          >
            {isLink || !previewInfo.canPreview ? <ExternalLink className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{t('resources:actions.open')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

const subCode = (subjName) => {
  if (subjName.includes('Database')) return 'DBS';
  if (subjName.includes('Web')) return 'WA';
  if (subjName.includes('Programming')) return 'PROG';
  if (subjName.includes('Operating')) return 'OS';
  if (subjName.includes('Software')) return 'SE';
  if (subjName.includes('Network')) return 'NET';
  return '';
};

// ─── Upload Modal ────────────────────────────────────────────
const UploadModal = ({ onClose, onSave, subjects }) => {
  const { t } = useTranslation('resources')
  const [form, setForm] = useState({
    title: '',
    subjectId: subjects[0]?.id || '',
    type: 'PDF',
    description: ''
  })
  const [sourceType, setSourceType] = useState('local')
  const [file, setFile] = useState(null)
  const [remoteUrl, setRemoteUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subjectId) return;
    const title = form.title.trim() || (file?.name ?? '')
    if (!title) return;

    const payload = {
      subjectId: Number(form.subjectId),
      title,
      type: sourceType === 'local' ? getTypeFromFileName(file.name) : form.type,
      description: form.description || (sourceType === 'local' ? t('resources:defaults.localDescription') : t('resources:defaults.urlDescription')),
    }

    if (sourceType === 'local') {
      if (!file) return;
      payload.file = file;
    } else {
      if (!remoteUrl.trim()) return;
      payload.url = remoteUrl.trim();
    }

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || t('resources:modal.errors.uploadFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-surface rounded-md border border-outline-variant text-body-md text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container transition-colors disabled:opacity-60'
  const labelCls = 'text-label-md font-bold text-on-surface-variant'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg shadow-2xl border border-outline-variant w-full max-w-md overflow-hidden font-inter">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface">
          <h2 className="text-headline-md font-bold text-on-surface">{t('resources:modal.title')}</h2>
          <button onClick={onClose} disabled={isSubmitting} className="p-1 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-0 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('resources:modal.fields.resourceTitle')}</label>
            <input required placeholder="e.g. SQL JOIN Cheat Sheet" value={form.title} onChange={set('title')} disabled={isSubmitting} className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('resources:modal.fields.subject')}</label>
              <select value={form.subjectId} onChange={set('subjectId')} disabled={isSubmitting} className={inputCls}>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('resources:modal.fields.documentType')}</label>
              <select value={form.type} onChange={set('type')} disabled={isSubmitting} className={inputCls}>
                {['PDF', 'NOTES', 'SLIDES', 'RECORDING', 'LINK', 'DOC'].map(type => (
                  <option key={type} value={type}>{t(`resources:typeLabels.${type}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>{t('resources:modal.fields.description')}</label>
            <textarea rows={2} placeholder={t('resources:modal.placeholders.description')} value={form.description} onChange={set('description')} disabled={isSubmitting} className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('resources:modal.fields.addFrom')}</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSourceType('local')}
                  className={`px-3 py-2 rounded-md border transition-colors ${sourceType === 'local' ? 'border-primary bg-primary-container text-primary' : 'border-outline-variant bg-surface text-on-surface'} disabled:opacity-50`}
                >
                  {t('resources:modal.sourceButtons.local')}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSourceType('url')}
                  className={`px-3 py-2 rounded-md border transition-colors ${sourceType === 'url' ? 'border-primary bg-primary-container text-primary' : 'border-outline-variant bg-surface text-on-surface'} disabled:opacity-50`}
                >
                  {t('resources:modal.sourceButtons.url')}
                </button>
              </div>
            </div>
          </div>

          {sourceType === 'local' ? (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('resources:modal.fields.chooseFile')}</label>
              <input
                type="file"
                disabled={isSubmitting}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.jpg,.jpeg,.png,.gif,.svg,.webp,.mp4,.webm,.mov"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className={inputCls}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>{t('resources:modal.fields.webUrl')}</label>
              <input
                type="url"
                disabled={isSubmitting}
                placeholder="https://example.com/resource.pdf"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
                className={inputCls}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2 border-t border-surface-container mt-1">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 border border-outline-variant rounded-md text-label-md font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer bg-transparent disabled:opacity-50">{t('resources:modal.actions.cancel')}</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-md text-label-md font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('resources:modal.actions.uploading')}</span>
                </>
              ) : (
                t('resources:modal.actions.upload')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Dropdown helper ─────────────────────────────────────────
const ResourcePreviewModal = ({ resource, onClose }) => {
  const { t } = useTranslation('resources')
  const [textContent, setTextContent] = useState('')
  const [loadingText, setLoadingText] = useState(false)
  const [textError, setTextError] = useState(null)
  const [loadingDocx, setLoadingDocx] = useState(false)
  const [docxError, setDocxError] = useState(null)
  const renderedDocxUrlRef = useRef(null)

  const previewInfo = resource ? getPreviewInfo(resource) : { canPreview: false, type: 'unsupported' }
  const url = resolveResourceUrl(resource?.url || "")

  useEffect(() => {
    if (previewInfo.type !== 'text' || !url) return

    let active = true
    const loadText = async () => {
      setLoadingText(true)
      setTextError(null)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to load text file.')
        const text = await res.text()
        if (!active) return
        setTextContent(text)
      } catch (err) {
        if (!active) return
        setTextError(err.message)
      } finally {
        if (active) setLoadingText(false)
      }
    }

    void loadText()
    return () => {
      active = false
    }
  }, [previewInfo.type, url])

  // Callback ref: fires as soon as the container div is mounted (avoids the
  // null-ref problem that happens when the div is conditionally rendered).
  const docxCallbackRef = (container) => {
    if (!container || previewInfo.type !== 'office-docx' || !url) return
    if (renderedDocxUrlRef.current === url) return

    renderedDocxUrlRef.current = url
    setLoadingDocx(true)
    setDocxError(null)
    container.innerHTML = ''
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load DOCX file.')
        return res.arrayBuffer()
      })
      .then((data) => renderAsync(data, container, undefined, {
        className: 'docx-preview-container',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        useBase64URL: true,
      }))
      .then(() => setLoadingDocx(false))
      .catch((err) => {
        renderedDocxUrlRef.current = null
        setDocxError(err.message)
        setLoadingDocx(false)
      })
  }

  if (!resource) return null

  const docPreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl border border-outline-variant w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden font-inter">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-headline-md font-bold text-on-surface truncate">{resource.title}</h2>
            <span className="text-[10px] font-extrabold tracking-widest uppercase px-2 py-0.5 rounded-sm bg-surface-container-low text-on-surface-variant border border-outline-variant">
              {resource.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant hover:bg-surface-container rounded-md text-label-sm font-semibold text-on-surface transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('resources:actions.download')}</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface cursor-pointer bg-transparent border-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface-container-low overflow-hidden p-6 flex flex-col">
          <div className="mb-4 shrink-0">
            <p className="text-label-md font-semibold text-on-surface">{resource.title}</p>
            <p className="text-sm text-on-surface-variant">{resource.description}</p>
          </div>

          <div className="flex-1 bg-surface rounded-xl overflow-hidden border border-outline-variant flex items-center justify-center relative">
            {previewInfo.type === 'image' && (
              <img src={url} alt={resource.title} className="w-full h-full object-contain" />
            )}
            
            {previewInfo.type === 'pdf' && (
              <iframe src={url} title={resource.title} className="w-full h-full border-0" />
            )}

            {previewInfo.type === 'video' && (
              <video controls src={url} className="max-w-full max-h-full" />
            )}

            {previewInfo.type === 'text' && (
              <div className="w-full h-full overflow-auto p-6 bg-surface self-stretch text-left">
                {loadingText ? (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-on-surface-variant font-medium">{t('resources:preview.loadingText')}</span>
                  </div>
                ) : textError ? (
                  <div className="flex items-center justify-center h-full text-error font-medium">
                    <span>Error: {textError}</span>
                  </div>
                ) : (
                  <pre className="text-sm font-mono whitespace-pre-wrap text-on-surface">
                    {textContent}
                  </pre>
                )}
              </div>
            )}

            {previewInfo.type === 'office-remote' && (
              <iframe src={docPreviewUrl} title={resource.title} className="w-full h-full border-0" />
            )}

            {previewInfo.type === 'office-docx' && (
              <div className="w-full h-full overflow-auto bg-surface-container-low relative">
                {loadingDocx && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface/90 z-10">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium text-on-surface-variant">{t('resources:preview.renderingDocument')}</span>
                    </div>
                  </div>
                )}
                {docxError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <File className="w-12 h-12 text-error-container text-error mb-3" />
                    <p className="text-body-md text-error font-semibold mb-1">{t('resources:preview.failedRenderDocument')}</p>
                    <p className="text-sm text-on-surface-variant mb-4">{docxError}</p>
                    <a href={url} download className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-md text-label-md font-semibold transition-colors flex items-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" />
                      <span>{t('resources:actions.downloadFile')}</span>
                    </a>
                  </div>
                )}
                <div
                  ref={docxCallbackRef}
                  className="w-full h-full"
                />
              </div>
            )}

            {previewInfo.type === 'office-local' && (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <File className="w-16 h-16 text-on-surface-variant mb-4" />
                <p className="text-body-md text-on-surface font-semibold mb-2">{t('resources:preview.directPreviewLocalOffice')}</p>
                <p className="text-sm text-on-surface-variant mb-4">{t('resources:preview.pleaseDownload')}</p>
                <a
                  href={url}
                  download
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-md text-label-md font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('resources:actions.downloadFile')}</span>
                </a>
              </div>
            )}

            {previewInfo.type === 'unsupported' && (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <File className="w-16 h-16 text-on-surface-variant mb-4" />
                <p className="text-body-md text-on-surface mb-4">{t('resources:preview.noPreview')}</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-md text-label-md font-semibold transition-colors shadow-sm"
                >
                  {t('resources:openInNewTab')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const Dropdown = ({ label, icon: Icon, options, value, onChange }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-outline-variant rounded-md text-label-md font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer shadow-ambient"
      >
        {Icon && <Icon className="w-3.5 h-3.5 text-on-surface-variant" />}
        {label}
        <ChevronDown className={`w-3 h-3 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 bg-surface border border-outline-variant rounded-lg shadow-lg min-w-[160px] py-1 overflow-hidden">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-label-md font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                value === opt.value ? 'text-primary bg-primary-container' : 'text-on-surface hover:bg-surface-container-low'
              }`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main ResourcesView Component ────────────────────────────
const ResourcesView = ({ resources, subjects, onUploadResource }) => {
  const { t } = useTranslation('resources')
  const [searchQuery, setSearchQuery]   = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [typeFilter, setTypeFilter]     = useState('all')
  const [sortKey, setSortKey]           = useState('recent')
  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [previewResource, setPreviewResource] = useState(null)

  const SUBJECT_OPTIONS = useMemo(() => [
    { value: 'all', label: t('resources:filters.allSubjects') },
    ...subjects.map(s => ({ value: String(s.id), label: s.name })),
  ], [subjects, t])

  const TYPE_OPTIONS = [
    { value: 'all',       label: t('resources:filters.allTypes') },
    { value: 'PDF',       label: t('resources:typeLabels.PDF') },
    { value: 'NOTES',     label: t('resources:typeLabels.NOTES') },
    { value: 'SLIDES',    label: t('resources:typeLabels.SLIDES') },
    { value: 'RECORDING', label: t('resources:typeLabels.RECORDING') },
    { value: 'LINK',      label: t('resources:typeLabels.LINK') },
    { value: 'DOC',       label: t('resources:typeLabels.DOC') },
  ]
  
  const SORT_OPTIONS = [
    { value: 'recent', label: t('resources:sorts.recent') },
    { value: 'name',   label: t('resources:sorts.name') },
    { value: 'type',   label: t('resources:sorts.type') },
  ]

  const filtered = useMemo(() => {
    let list = [...resources]
    if (subjectFilter !== 'all') {
      list = list.filter(r => String(r.subjectId) === subjectFilter)
    }
    if (typeFilter !== 'all') {
      list = list.filter(r => r.type === typeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      )
    }
    if (sortKey === 'name') list.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
    if (sortKey === 'type') list.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''))
    if (sortKey === 'recent') list.sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''))
    return list
  }, [resources, subjectFilter, typeFilter, searchQuery, sortKey])

  // Get recent 3 resources for horizontal layout
  const recentResources = useMemo(() => {
  return [...resources]
    .sort((a, b) => (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''))
    .slice(0, 3)
}, [resources])

  // Group filtered resources by subject
  const grouped = useMemo(() => {
    return subjects
      .map(subject => ({
        subject,
        items: filtered.filter(r => r.subjectId === subject.id),
      }))
      .filter(g => g.items.length > 0)
  }, [filtered, subjects])

  const isFiltering = subjectFilter !== 'all' || typeFilter !== 'all' || searchQuery.trim()
  const subjectLabel = SUBJECT_OPTIONS.find(o => o.value === subjectFilter)?.label ?? t('resources:filters.subjectFallback')
  const typeLabel    = TYPE_OPTIONS.find(o => o.value === typeFilter)?.label ?? t('resources:filters.typeFallback')
  const sortLabel    = SORT_OPTIONS.find(o => o.value === sortKey)?.label ?? t('resources:sorts.recent')

  return (
    <>
      <div className="w-full flex flex-col gap-8 font-inter pb-16">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-on-surface">{t('resources:page.title')}</h1>
            <p className="text-body-md text-on-surface-variant">{t('resources:page.subtitle')}</p>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
              <input
                type="text"
                placeholder={t('resources:searchPlaceholder')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded-md text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:bg-surface-container transition-colors w-44 shadow-ambient"
              />
            </div>
            <Dropdown label={subjectLabel} icon={null} options={SUBJECT_OPTIONS} value={subjectFilter} onChange={setSubjectFilter} />
            <Dropdown label={typeLabel}    icon={null} options={TYPE_OPTIONS}    value={typeFilter}    onChange={setTypeFilter} />
            <Dropdown label={sortLabel}    icon={ArrowUpDown} options={SORT_OPTIONS}   value={sortKey}       onChange={setSortKey} />
          </div>
        </div>

        {/* Recent Resources (hidden when searching/filtering) */}
        {!isFiltering && (
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-on-surface-variant" />
              <h2 className="text-headline-md font-bold text-on-surface">{t('resources:recentTitle')}</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              {recentResources.map(r => {
                const subObj = subjects.find(s => s.id === r.subjectId);
                return (
                  <RecentCard 
                    key={r.id} 
                    resource={r} 
                    subjectName={subObj ? subObj.name : t('resources:subjectFallback')} 
                    t={t}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Subject Folders */}
        {grouped.length === 0 ? (
          <div className="bg-surface border border-outline-variant rounded-lg p-16 text-center flex flex-col items-center gap-3 shadow-ambient">
            <div className="w-12 h-12 bg-surface-container-low text-primary rounded-full flex items-center justify-center">
              <CustomIcon name="book" className="w-6 h-6" />
            </div>
            <p className="text-headline-md font-semibold text-on-surface">{t('resources:emptyState.title')}</p>
            <p className="text-body-md text-on-surface-variant">{t('resources:emptyState.description')}</p>
          </div>
        ) : (
          <section className="flex flex-col gap-10">
            {!isFiltering && (
              <h2 className="text-headline-md font-bold text-on-surface -mb-6">{t('resources:librariesTitle')}</h2>
            )}

            {grouped.map(({ subject, items }) => (
              <div key={subject.id} className="flex flex-col gap-4">
                {/* Section header */}
                <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                  <h3 className="text-body-lg font-bold text-on-surface flex items-center gap-2">
                    <CustomIcon name="folder" className="w-4 h-4" />
                    {subject.name} <span className="text-label-sm text-on-surface-variant font-medium">({subject.code})</span>
                  </h3>
                </div>

                {/* Resource cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map(r => (
                    <ResourceCard 
                    key={r.id} 
                    resource={r} 
                    subjectName={subject.name}
                    t={t}
                    onPreview={(res) => setPreviewResource(res)}
                  />
                ))}
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        title={t('resources:modal.title')}
        className="fixed lg:bottom-8 bottom-20 right-8 w-14 h-14 bg-primary hover:bg-primary/90 active:scale-95 text-on-primary rounded-full shadow-xl flex items-center justify-center transition-all z-30 cursor-pointer"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Upload Modal */}
      {isModalOpen && (
        <UploadModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={onUploadResource}
          subjects={subjects}
        />
      )}

      {/* Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}
    </>
  )
}

export default ResourcesView
