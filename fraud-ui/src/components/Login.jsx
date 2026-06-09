import { useState } from 'react'
import { Shield, Mail, Lock, ArrowRight, Activity, KeyRound, CheckCircle2 } from 'lucide-react'

export default function Login() {
  const [step, setStep] = useState(1) // 1: Credentials, 2: OTP
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' })
  const [status, setStatus] = useState({ loading: false, error: null, success: false })

  const handleLogin = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: null, success: false })

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStatus({ loading: false, error: null, success: false })
        setStep(2) // Move to OTP step
      } else {
        setStatus({ loading: false, error: data.error || "Authentication Failed.", success: false })
      }
    } catch (err) {
      setStatus({ loading: false, error: "Network uplink failed.", success: false })
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: null, success: false })

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setStatus({ loading: false, error: null, success: true })
        
        // Save the VIP Wristband (JWT) and the user's email
        localStorage.setItem('WAYNE_ENT_TOKEN', data.token)
        localStorage.setItem('WAYNE_ENT_USER_EMAIL', formData.email)
        
        // Redirect to dashboard after a brief success animation
        setTimeout(() => {
          window.location.href = '/user' // Or '/admin' depending on your routing setup
        }, 1500)
      } else {
        setStatus({ loading: false, error: data.error || "Invalid OTP.", success: false })
      }
    } catch (err) {
      setStatus({ loading: false, error: "Network uplink failed.", success: false })
    }
  }

  if (status.success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0,transparent_50%)] animate-pulse" />
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-blue-500/30 backdrop-blur-3xl shadow-[0_0_50px_rgba(59,130,246,0.2)] text-center relative z-10 max-w-md w-full">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <CheckCircle2 className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 tracking-wider">ACCESS GRANTED</h2>
          <p className="text-slate-400 font-medium">Cryptographic token secured. Routing to your isolated dashboard node...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="p-8 md:p-10 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">Secure Login</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                {step === 1 ? 'CREDENTIAL VERIFICATION' : '2FA OTP REQUIRED'}
              </p>
            </div>
          </div>

          {status.error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm font-bold animate-pulse">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              {status.error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Comm Link</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="operative@wayne.ent" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Encryption Key</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={status.loading} className="w-full group py-4 px-6 mt-4 rounded-xl font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50">
                {status.loading ? <Activity className="w-5 h-5 animate-spin" /> : (
                  <>Request OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm text-blue-200 mb-6 text-center">
                A 6-digit security code has been transmitted to <br/><span className="font-bold text-white">{formData.email}</span>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">One-Time Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input required type="text" maxLength="6" value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '')})} className="w-full pl-11 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-bold tracking-[0.5em] text-center" placeholder="000000" />
                </div>
              </div>

              <button type="submit" disabled={status.loading || formData.otp.length !== 6} className="w-full group py-4 px-6 mt-4 rounded-xl font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50">
                {status.loading ? <Activity className="w-5 h-5 animate-spin" /> : (
                  <>Verify Identity <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          )}

          <p className="text-center mt-8 text-sm text-slate-500">
            Need a clearance code? <a href="/register" className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors">Register Here</a>
          </p>
        </div>
      </div>
    </div>
  )
}