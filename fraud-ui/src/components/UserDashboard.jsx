import { useState } from 'react'
import { CreditCard, Send, ShieldX, Loader2, Sparkles, FileText } from 'lucide-react'

export default function UserDashboard() {
  const [accountState, setAccountState] = useState('ACTIVE')
  const [aiLoading, setAiLoading] = useState(false)

  const triggerMockFraud = async () => {
    setAccountState('TRIGGERED')
    
    try {
      // Hit the new POST endpoint on your Spring Boot server
      await fetch('http://localhost:8080/api/v1/audit/trigger', {
        method: 'POST'
      })
      
      // Instantly block the UI while Kafka and Gemini work in the background
      setAccountState('BLOCKED')
      setAiLoading(true)

      // Simulate the wait time for the AI report to generate
      setTimeout(() => {
        setAiLoading(false)
      }, 4500)
      
    } catch (error) {
      console.error("Pipeline offline:", error)
      setAccountState('ACTIVE') // Reset if the server is down
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <div className={`p-6 rounded-2xl mb-8 flex items-center justify-between border backdrop-blur-2xl transition-all duration-500 ${
        accountState === 'ACTIVE' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
        accountState === 'TRIGGERED' ? 'bg-amber-950/40 border-amber-500/50 text-amber-400 scale-95 shadow-[0_0_30px_rgba(245,158,11,0.2)]' :
        'bg-rose-950/60 border-rose-500/70 text-rose-400 animate-shake shadow-[0_0_50px_rgba(225,29,72,0.4)]'
      }`}>
        <div className="flex items-center gap-5">
          <div className={`p-4 rounded-xl shadow-inner ${accountState === 'BLOCKED' ? 'bg-rose-500/30' : 'bg-emerald-500/30'}`}>
            {accountState === 'BLOCKED' ? <ShieldX className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" /> : <CreditCard className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white drop-shadow-md">Account Status: {accountState}</h3>
            <p className="text-sm font-medium mt-1">{accountState === 'BLOCKED' ? 'Security protocol fired: External transfers disabled.' : 'Node network connection secure.'}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold tracking-widest shadow-[0_0_15px_currentColor] ${
          accountState === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400' : 'bg-rose-600/30 text-rose-200 border border-rose-400'
        }`}>
          {accountState === 'ACTIVE' ? 'ONLINE' : 'LOCKED'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h4 className="text-lg font-bold text-white mb-2">Pipeline Automation Sandbox</h4>
            <p className="text-sm text-slate-300 mb-8 font-medium">Fire a mock velocity transaction array into the system to test endpoint responses.</p>
            
            <button
              onClick={triggerMockFraud}
              disabled={accountState !== 'ACTIVE'}
              className={`w-full py-5 px-6 rounded-xl font-bold text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                accountState === 'ACTIVE' 
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.6)] border border-blue-400' 
                  : 'bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
              Execute High-Velocity Transaction Bundle ($100 → $500)
            </button>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] h-fit">
          <h4 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
            <Sparkles className="w-5 h-5 text-blue-400" /> Async Forensics
          </h4>
          
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
              <div className="text-sm font-bold text-white">Gemini 2.5 compiling report...</div>
            </div>
          ) : accountState === 'BLOCKED' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-100 font-medium shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                <span className="font-bold text-white">Pipeline Log:</span> Account isolation finished before AI initialization.
              </div>
              <div className="flex gap-3 p-4 bg-blue-900/40 border border-blue-500/40 rounded-xl items-start shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <FileText className="w-6 h-6 text-blue-400 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-white">Report Available</div>
                  <div className="text-xs text-blue-200 mt-1 font-medium">Intelligence injected into Security Core.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-bold text-center py-10">Awaiting velocity event triggers...</div>
          )}
        </div>
      </div>
    </div>
  )
}