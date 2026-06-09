import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert, UserCircle } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Login from './components/Login'
import Register from './components/Register'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import { useState } from 'react';

// We create a Layout wrapper so the Navbar knows which page it is on
function Layout({ children }) {
  const location = useLocation()
  const isLoggedIn = !!localStorage.getItem('WAYNE_ENT_TOKEN');
  
  // Only show the Sign Out button if we are on one of the dashboards
  const showSignOut = location.pathname === '/user' || location.pathname === '/admin'

  const handleSignOut = async () => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL')
    if (email) {
      try {
        // Tell Spring Boot to set status to OFFLINE
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout/${email}`, {
          method: 'POST'
        })
      } catch (err) {
        console.error("Logout ping failed")
      }
    }
    localStorage.removeItem('WAYNE_ENT_TOKEN')
    localStorage.removeItem('WAYNE_ENT_USER_EMAIL')
    window.location.href = '/login'
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRemoveAccount = async () => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL');
    if (email && window.confirm("WARNING: This will permanently wipe your account. Proceed?")) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/email/${email}`, {
          method: 'DELETE'
        });
        localStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        console.error("Failed to delete account");
      }
    }
  };

  const handleUpdateInfo = () => {
    alert("Update Info module coming in Phase 1, Step 3!"); // We will build this next
  };

  return (
    <div className="min-h-screen font-sans text-slate-200 relative z-0 overflow-x-hidden selection:bg-purple-500/30">
      <Analytics />
      <SpeedInsights />
      
      {/* Intense Rainbow Mesh Background */}
      <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-600/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[20%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      </div>
      
      {/* Navbar */}
      <nav className="border-b border-white/10 bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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
          
          {/* Only show the User Icon and Dropdown if the user is actually logged in */}
          {isLoggedIn && (
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 flex items-center justify-center"
              >
                <UserCircle className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
              </button>
              
              {isMenuOpen && (
                <>
                  {/* Invisible overlay that catches outside clicks to close the menu properly */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                  
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
                    <button 
                      onClick={() => { setIsMenuOpen(false); handleUpdateInfo(); }} 
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5"
                    >
                      Update Info
                    </button>
                    <button 
                      onClick={() => { setIsMenuOpen(false); handleRemoveAccount(); }} 
                      className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors border-b border-white/5"
                    >
                      Remove Account
                    </button>
                    <button 
                      onClick={() => { setIsMenuOpen(false); handleSignOut(); }} 
                      className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}

// The master router that stitches everything together
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/user" element={<UserDashboard />} />
        </Routes>
      </Layout>
    </Router>
  )
}