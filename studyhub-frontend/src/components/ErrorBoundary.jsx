import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 font-inter">
          <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-xl shadow-ambient p-8 text-center flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-headline-md font-semibold text-on-surface">Něco se pokazilo</h1>
              <p className="text-body-md text-on-surface-variant">
                Zkuste stránku načíst znovu. Aplikace zůstala zachycená v bezpečném stavu.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#004ac6] text-white text-label-md font-semibold hover:bg-[#003ea8] transition-colors"
            >
              Znovu načíst stránku
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
