import { useState } from 'react'
import { Shield, Mail, Lock, User, ArrowRight, Fingerprint, Activity, Terminal, MapPin } from 'lucide-react'

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', age: '', sex: '', dob: '', residence: '' })
  const [status, setStatus] = useState({ loading: false, error: null, success: false })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: null, success: false })

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStatus({ loading: false, error: null, success: true })
      } else {
        setStatus({ loading: false, error: data.error || "Clearance Denied.", success: false })
      }
    } catch (err) {
      setStatus({ loading: false, error: "Network uplink failed.", success: false })
    }
  }

  if (status.success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0,transparent_50%)] animate-pulse" />
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center relative z-10 max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            <Fingerprint className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-wider">CLEARANCE GRANTED</h2>
          <p className="text-slate-400 font-medium mb-8">Identity registered in the master node. Proceed to the authentication terminal to receive your security OTP.</p>
          <button onClick={() => window.location.href='/login'} className="w-full py-4 bg-emerald-600/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 rounded-xl font-bold tracking-widest transition-all">
            INITIALIZE LOGIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Cyberpunk Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Side: The Lore / Visuals */}
        <div className="hidden md:flex flex-col justify-center p-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest mb-6 w-max">
            <Activity className="w-4 h-4 animate-pulse" /> SECURE UPLINK ESTABLISHED
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            System <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Authorization</span> <br/>Protocol
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-md">
            Enter your credentials to request an isolated node in the enterprise network. All biometric and text data is end-to-end encrypted via quantum-resistant algorithms.
          </p>
          <div className="mt-12 flex items-center gap-4 text-slate-500 text-sm font-mono">
            <Terminal className="w-5 h-5" /> 
            <span>SYS.REQ.REGISTER // WAITING FOR INPUT...</span>
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="p-8 md:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">New Identity</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">LEVEL 1 CLEARANCE REQUEST</p>
            </div>
          </div>

          {status.error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-bold animate-pulse">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              {status.error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Operative Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium" placeholder="Bruce Wayne" />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="space-y-1.5 w-1/3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                <input required type="number" min="1" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium" placeholder="Age" />
              </div>
              <div className="space-y-1.5 w-2/3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sex</label>
                <select required value={formData.sex} onChange={(e) => setFormData({...formData, sex: e.target.value})} className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium appearance-none">
                  <option value="" disabled className="text-slate-600">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Classified">Classified</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
              <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium [color-scheme:dark]" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Primary Residence</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-500" />
                </div>
                <input required type="text" value={formData.residence} onChange={(e) => setFormData({...formData, residence: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium" placeholder="City, Country" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Comm Link (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium" placeholder="operative@wayne.ent" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Encryption Key (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={status.loading} className="w-full group py-4 px-6 mt-4 rounded-xl font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] disabled:opacity-50">
              {status.loading ? <Activity className="w-5 h-5 animate-spin" /> : (
                <>Transmit Request <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-slate-500">
            Already have a clearance code? <a href="/login" className="text-purple-400 hover:text-purple-300 font-bold ml-1 transition-colors">Authenticate Here</a>
          </p>
        </div>
      </div>
    </div>
  )
}