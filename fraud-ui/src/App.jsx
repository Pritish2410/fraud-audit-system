import { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Login from './components/Login'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'

export default function App() {
  const [activeRole, setActiveRole] = useState(null)

  const renderScreen = () => {
    if (activeRole === null) return <Login onLogin={setActiveRole} />
    if (activeRole === 'USER') return <UserDashboard onLogout={() => setActiveRole(null)} />
    if (activeRole === 'ADMIN') return <AdminDashboard onLogout={() => setActiveRole(null)} />
  }

  return (
    <div className="min-h-screen font-sans text-slate-200 relative z-0 overflow-x-hidden">
      <Analytics />
      <SpeedInsights />
      
      {/* Intense Rainbow Mesh Background */}
      <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-600/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[20%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      </div>
      
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-darker/40 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[5rem] py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <ShieldAlert className="text-blue-500 w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] shrink-0" />
            
            {/* THICK Luxury Greyish Separator */}
            <div className="w-[2px] sm:w-[3px] h-8 sm:h-10 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)] mx-2 shrink-0" />

            <span className="text-base sm:text-xl md:text-2xl font-bold tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex flex-wrap gap-x-2 leading-tight">
              <span>WAYNE</span>
              <span className="text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]">ENTERPRISES</span>
              <span>AUDIT</span>
            </span>
          </div>
          
          {activeRole && (
            <button 
              onClick={() => setActiveRole(null)}
              className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all shrink-0 ml-2"
            >
              Sign Out
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        {renderScreen()}
      </main>
    </div>
  )
}