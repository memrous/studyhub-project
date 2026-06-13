import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user } = useAuth()

  return (
    <header className="h-16 px-8 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-10 shadow-sm font-inter">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search subjects, tasks, or notes..."
          className="w-full pl-9 pr-4 py-2 bg-surface rounded-md border border-[#E2E8F0] text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-outline focus:bg-white transition-colors"
        />
      </div>

      {/* Quick Actions & User Info */}
      <div className="flex items-center gap-5">
        <div className="border-l border-[#E2E8F0] h-6"></div>

        {/* Profile link */}
        <Link
          to="/profile"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img
            src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-[#E2E8F0]"
          />
          <span className="text-body-md text-on-surface">{user.name}</span>
        </Link>
      </div>
    </header>
  )
}

export default Header