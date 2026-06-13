import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { 
  LayoutGrid, 
  BookOpen, 
  Calendar, 
  X, 
  GraduationCap, 
  Library, 
  User, 
  LogOut, 
  Menu, 
  Bell 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Desktop Components
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/subjects',  icon: BookOpen,   label: 'Subjects'  },
  { to: '/calendar',  icon: Calendar,   label: 'Calendar'  },
  { to: '/materials', icon: Library,    label: 'Resources' },
]

const MOBILE_DRAWER_ITEMS = [
  { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/subjects',  icon: BookOpen,   label: 'Subjects'  },
  { to: '/calendar',  icon: Calendar,   label: 'Calendar'  },
  { to: '/materials', icon: Library,    label: 'Resources' },
  { to: '/profile',   icon: User,       label: 'Profile'   },
]

const AppLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { user, logout } = useAuth()

  const getDrawerLinkClass = ({ isActive }) => {
    const base = 'flex items-center gap-3 px-3 py-2.5 rounded-md text-label-md transition-all cursor-pointer'
    return isActive
      ? `${base} bg-[#dbe1ff] text-on-primary-fixed-variant font-semibold`
      : `${base} text-on-surface-variant hover:bg-surface-container hover:text-on-surface`
  }

  const getDrawerIconClass = ({ isActive }) =>
    isActive ? 'text-primary' : 'text-on-surface-variant'

  return (
    <div className="min-h-screen bg-background text-on-background font-inter">

      {/* ========================================== */}
      {/* DESKTOP LAYOUT                            */}
      {/* ========================================== */}
      <div className="hidden lg:flex min-h-screen">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Header />

          <main className="flex-1 overflow-y-auto bg-white p-8">
            <div className="max-w-[1600px] w-full mx-auto flex flex-col gap-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* ========================================== */}
      {/* MOBILE LAYOUT                             */}
      {/* ========================================== */}
      <div className="block lg:hidden min-h-screen bg-background pb-20 relative">
        
        {/* Mobile Header inline */}
        <header className="h-14 px-4 bg-white border-b border-[#E2E8F0] flex items-center justify-between sticky top-0 z-40 shadow-sm font-inter">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDrawerOpen(true)} 
              className="p-1 text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-geist font-bold text-lg text-on-surface tracking-tight">StudyHub</span>
          </div>
          <button className="p-1 text-on-surface-variant hover:text-on-surface relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full"></span>
          </button>
        </header>

        <main className="p-4 flex flex-col gap-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Nav inline */}
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2E8F0] flex justify-around items-center px-2 z-40 shadow-[0_-2px_10px_0_rgba(0,0,0,0.04)] font-inter">
          {MOBILE_NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}>
              {({ isActive }) => (
                <div className={`flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  isActive ? 'text-primary' : 'text-[#737686] hover:text-on-surface'
                }`}>
                  <div className={
                    isActive
                      ? 'bg-[#dbe1ff] text-[#004ac6] px-4 py-1 rounded-full flex items-center justify-center'
                      : 'px-4 py-1 flex items-center justify-center'
                  }>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Sidebar Navigation Drawer inline */}
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
              isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Drawer Sidebar Panel */}
          <aside
            className={`fixed top-0 bottom-0 left-0 w-[260px] bg-surface border-r border-[#E2E8F0] flex flex-col justify-between p-6 shadow-2xl z-50 transition-transform duration-300 transform font-inter ${
              isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary-container text-white flex items-center justify-center rounded-md bg-[#004ac6]">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-geist font-bold text-xl tracking-tight text-on-surface">StudyHub</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-on-surface-variant hover:text-on-surface focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {MOBILE_DRAWER_ITEMS.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsDrawerOpen(false)}
                    className={getDrawerLinkClass}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 ${getDrawerIconClass({ isActive })}`} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>

            {user && (
              <div className="flex flex-col gap-4">
                <div className="border-t border-[#E2E8F0]"></div>
                <div className="bg-[#F2F4F6] border border-[#E2E8F0] p-4 rounded-lg flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-white shadow-sm"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md text-on-surface font-semibold truncate leading-tight">{user.name}</span>
                      <span className="text-label-sm text-on-surface-variant truncate leading-none mt-0.5">{user.program}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-label-sm font-semibold pt-1 border-t border-slate-200">
                    <span className="text-slate-500">STAG Account</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-sm">Connected</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsDrawerOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-label-md transition-all cursor-pointer font-medium border border-red-200/50"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  Log Out
                </button>
              </div>
            )}
          </aside>
        </>

      </div>

    </div>
  )
}

export default AppLayout
