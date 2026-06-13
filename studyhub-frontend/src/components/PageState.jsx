import { AlertCircle, Inbox, Loader2 } from 'lucide-react'

const VARIANTS = {
  loading: {
    icon: Loader2,
    iconClassName: 'animate-spin text-[#004ac6]',
  },
  error: {
    icon: AlertCircle,
    iconClassName: 'text-[#ba1a1a]',
  },
  empty: {
    icon: Inbox,
    iconClassName: 'text-[#737686]',
  },
}

const PageState = ({ variant = 'loading', title, description, actionLabel, onAction }) => {
  const state = VARIANTS[variant] || VARIANTS.loading
  const Icon = state.icon

  return (
    <div className="min-h-[320px] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-xl shadow-ambient p-8 text-center flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#eeefff] flex items-center justify-center">
          <Icon className={`w-6 h-6 ${state.iconClassName}`} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-headline-md font-semibold text-on-surface">{title}</h1>
          {description ? (
            <p className="text-body-md text-on-surface-variant">{description}</p>
          ) : null}
        </div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#004ac6] text-white text-label-md font-semibold hover:bg-[#003ea8] transition-colors"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default PageState
