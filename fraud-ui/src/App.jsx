import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert, UserCircle, XCircle, Power } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Login from './components/Login'
import Register from './components/Register'
import UserDashboard from './components/UserDashboard'
import AdminDashboard from './components/AdminDashboard'
import { useState, useEffect } from 'react';

function Layout({ children }) {
  const location = useLocation()
  const isLoggedIn = !!localStorage.getItem('WAYNE_ENT_TOKEN');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ age: '', sex: '', dob: '', residence: '' });
  const [toast, setToast] = useState(null);

  // Global Error Listener & Auto-Signout Beacon
  useEffect(() => {
    window.showError = (msg) => window.dispatchEvent(new CustomEvent('SHOW_ERROR', { detail: msg }));
    
    const handleShowToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 5000);
    };
    
    const handleUnload = () => {
      const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL');
      if (email && email !== 'admin@wayne.ent') {
        navigator.sendBeacon(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout/${email}`);
      }
    };

    window.addEventListener('SHOW_ERROR', handleShowToast);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('SHOW_ERROR', handleShowToast);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  const handleSignOut = async () => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL')
    if (email && email !== 'admin@wayne.ent') {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/logout/${email}`, { method: 'POST' })
      } catch (err) {
        if(window.showError) window.showError("Logout ping failed");
      }
    }
    
    // BUG FIX: Only remove auth credentials, preserve the global network threat state!
    localStorage.removeItem('WAYNE_ENT_TOKEN');
    localStorage.removeItem('WAYNE_ENT_USER_EMAIL');
    window.location.href = '/login';
  }

  const handleRemoveAccount = async () => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL');
    if (email && window.confirm("WARNING: This will permanently wipe your account. Proceed?")) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/email/${email}`, { method: 'DELETE' });
        
        // BUG FIX: Only remove auth credentials, preserve the global network threat state!
        localStorage.removeItem('WAYNE_ENT_TOKEN');
        localStorage.removeItem('WAYNE_ENT_USER_EMAIL');
        window.location.href = '/login';
      } catch (err) {
        if(window.showError) window.showError("Failed to delete account");
      }
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/email/${email}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        setIsUpdateModalOpen(false);
        window.location.reload();
      } else {
        if(window.showError) window.showError("Failed to update profile data.");
      }
    } catch (err) {
      if(window.showError) window.showError("Failed to transmit intelligence telemetry.");
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-200 relative z-0 overflow-x-hidden selection:bg-purple-500/30">
      <Analytics />
      <SpeedInsights />
      
      {/* Global Error Toast HUD */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] bg-rose-950/95 border border-rose-500/50 px-6 py-4 rounded-2xl shadow-[0_15px_40px_rgba(225,29,72,0.4)] flex items-center gap-4 animate-in slide-in-from-top-10 fade-in duration-300">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
          <span className="font-bold tracking-wide text-rose-300 text-sm">{toast}</span>
          <button onClick={() => setToast(null)} className="text-rose-500 hover:text-white transition-colors ml-2">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Background */}
      <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-rose-600/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[20%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-purple-600/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
      </div>
      
      <nav className="border-b border-white/10 bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[5rem] py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <ShieldAlert className="text-blue-500 w-8 h-8 sm:w-10 sm:h-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] shrink-0" />
            <div className="w-[2px] sm:w-[3px] h-8 sm:h-10 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)] mx-2 shrink-0" />
            <span className="text-base sm:text-xl md:text-2xl font-bold tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex flex-wrap gap-x-2 leading-tight">
              <span>WAYNE</span>
              <span className="text-blue-500 drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]">ENTERPRISES</span>
              <span>AUDIT</span>
            </span>
          </div>
          
          {isLoggedIn && (
            <div className="relative">
              {location.pathname === '/admin' ? (
                /* ADMIN VIEW: Single Red Power Button */
                <button 
                  onClick={handleSignOut} 
                  className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors p-2 rounded-full flex items-center justify-center active:scale-90"
                  title="Sign Out"
                >
                  <Power className="w-7 h-7 drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                </button>
              ) : (
                /* OPERATIVE VIEW: Standard Dropdown Menu */
                <>
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                  </button>
                  
                  {isMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50">
                        <button onClick={() => { setIsMenuOpen(false); setIsUpdateModalOpen(true); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors border-b border-white/5">Update Info</button>
                        <button onClick={() => { setIsMenuOpen(false); handleRemoveAccount(); }} className="w-full text-left px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors border-b border-white/5">Remove Account</button>
                        <button onClick={() => { setIsMenuOpen(false); handleSignOut(); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors">Sign Out</button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-purple-500/30 p-6 rounded-2xl max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-white mb-4 tracking-wide border-b border-white/10 pb-2">Update Classified Intelligence</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-slate-300">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Current Age</label>
                <input required type="number" value={updateData.age} onChange={e => setUpdateData({...updateData, age: e.target.value})} className="w-full p-3 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-purple-500 transition-colors font-medium" placeholder="Specify age..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Gender Designation</label>
                <select required value={updateData.sex} onChange={e => setUpdateData({...updateData, sex: e.target.value})} className="w-full p-3 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-purple-500 transition-colors font-medium appearance-none">
                  <option value="" disabled>Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Classified">Classified</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Chronological Date of Birth</label>
                <input required type="date" value={updateData.dob} onChange={e => setUpdateData({...updateData, dob: e.target.value})} className="w-full p-3 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-purple-500 [color-scheme:dark] transition-colors font-medium" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Primary Node Residence Location</label>
                <input required type="text" value={updateData.residence} onChange={e => setUpdateData({...updateData, residence: e.target.value})} className="w-full p-3 bg-black/40 border border-white/10 rounded-lg outline-none focus:border-purple-500 transition-colors font-medium" placeholder="City, Country..." />
              </div>
              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="flex-1 p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition-colors uppercase text-xs tracking-wider">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold shadow-lg shadow-purple-500/20 transition-colors uppercase text-xs tracking-wider">Save Target Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}

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