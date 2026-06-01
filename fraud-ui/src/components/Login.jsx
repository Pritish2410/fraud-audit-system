import { Shield, User, Key, ArrowRight } from 'lucide-react'

export default function Login({ onLogin }) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
      {/* Glowing Box */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/40 border border-white/20 backdrop-blur-3xl shadow-[0_0_50px_rgba(59,130,246,0.25)] relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_70px_rgba(59,130,246,0.4)] hover:border-blue-500/50">
        
        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="p-4 bg-blue-500/20 border border-blue-400/50 rounded-2xl mb-5 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
            <Shield className="w-10 h-10 text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">Access Control</h2>
          <p className="text-sm text-blue-200 mt-2 font-medium">Select your authorization pathway</p>
        </div>

        <div className="space-y-5 relative z-10">
          <button
            onClick={() => onLogin('USER')}
            className="w-full flex items-center justify-between p-5 rounded-xl border border-white/10 bg-black/40 hover:bg-blue-900/30 hover:border-blue-400/60 group/btn transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-slate-300 group-hover/btn:text-blue-400 group-hover/btn:bg-blue-500/20 transition-all shadow-inner">
                <User className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-md">Corporate Node</div>
                <div className="text-xs text-slate-400 font-medium">Simulate transactions</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover/btn:text-blue-400 group-hover/btn:translate-x-2 transition-all" />
          </button>

          <button
            onClick={() => onLogin('ADMIN')}
            className="w-full flex items-center justify-between p-5 rounded-xl border border-white/10 bg-black/40 hover:bg-rose-900/30 hover:border-rose-400/60 group/btn transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-xl text-slate-300 group-hover/btn:text-rose-400 group-hover/btn:bg-rose-500/20 transition-all shadow-inner">
                <Key className="w-6 h-6" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white text-md">Security Command</div>
                <div className="text-xs text-slate-400 font-medium">Live forensic auditing</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover/btn:text-rose-400 group-hover/btn:translate-x-2 transition-all" />
          </button>
        </div>
      </div>
    </div>
  )
}