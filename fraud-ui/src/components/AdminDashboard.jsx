import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Users, Terminal, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const [selectedIncident, setSelectedIncident] = useState(true)
  const [metrics, setMetrics] = useState({
    throughput: '0 ops/sec',
    latency: '42ms',
    sync: '100.0% Sync'
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const isActive = Math.random() > 0.3
      const ops = isActive ? Math.floor(Math.random() * 12) + 1 : 0
      const lat = Math.floor(Math.random() * 15) + 35
      const jitter = (99.8 + Math.random() * 0.2).toFixed(1)
      
      setMetrics({
        throughput: `${ops} ops/sec`,
        latency: `${lat}ms`,
        sync: `${jitter}% Sync`
      })
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Upstash Throughput', value: metrics.throughput, icon: Activity, color: 'text-blue-400 bg-blue-500/20 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.3)]' },
          { label: 'Cloud Latency', value: metrics.latency, icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/20 border-rose-500/50 shadow-[0_0_25px_rgba(225,29,72,0.3)]' },
          { label: 'Authorized Agents', value: '1 Active', icon: Users, color: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]' },
          { label: 'Pub/Sub Pipeline', value: metrics.sync, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-2xl flex items-center justify-between hover:-translate-y-2 transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{stat.label}</span>
              <h3 className="text-2xl font-black text-white mt-2 drop-shadow-lg">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl border ${stat.color}`}>
              <stat.icon className="w-6 h-6 drop-shadow-[0_0_8px_currentColor]" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3 drop-shadow-md">
            <Terminal className="w-5 h-5 text-blue-400" /> Active Threat Queue
          </h3>
          
          <div 
            onClick={() => setSelectedIncident(true)}
            className={`p-5 rounded-2xl border backdrop-blur-md cursor-pointer transition-all duration-300 ${
              selectedIncident 
                ? 'border-rose-500/70 bg-rose-950/40 shadow-[0_0_35px_rgba(225,29,72,0.25)]' 
                : 'border-white/10 bg-slate-900/40 hover:bg-slate-800/60 shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold shadow-[0_0_10px_rgba(225,29,72,0.4)]">BLOCKED</span>
              <span className="text-xs font-bold text-slate-400">2026-06-01</span>
            </div>
            <h4 className="text-md font-bold text-white drop-shadow-md">Wayne Enterprises (ID: 1)</h4>
            <div className="text-sm font-medium text-slate-300 mt-2">Velocity Trigger: $100.00 → $500.00</div>
            <div className="text-xs text-blue-400 font-bold mt-4 tracking-wide drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">Gemini Audit Embedded ↓</div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/20 backdrop-blur-3xl h-full min-h-[500px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
            <h3 className="text-xl font-bold text-white border-b border-white/20 pb-5 mb-6 flex items-center justify-between">
              <span>Forensic Audit Core Intelligence</span>
              <span className="text-xs font-bold text-blue-300 bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]">Engine: v2.5-Flash</span>
            </h3>

            {selectedIncident ? (
              <div className="space-y-6 text-slate-200 text-sm leading-relaxed max-h-[600px] overflow-y-auto pr-4">
                <div className="p-5 bg-black/40 border border-rose-500/40 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.1)]">
                  <h5 className="text-sm font-mono uppercase text-rose-400 tracking-widest mb-3 font-bold drop-shadow-sm">Executive Risk Vector Analysis</h5>
                  <p className="text-sm font-medium text-slate-300">
                    High-velocity sequence pattern isolated inside high-risk ELECTRONICS merchant category. Automated firewall completely blocked client account transactions within 600ms of event matching via safe Upstash Redis Pub/Sub pipes.
                  </p>
                </div>
                
                <h4 className="text-white font-bold text-lg mt-8 drop-shadow-md">Potential Vector: Carding & Account Takeover (ATO)</h4>
                <p className="text-slate-300 text-sm font-medium">
                  The progression from a micro-baseline checkout verification threshold ($100.00) straight to an expanded high-liquidation tier acquisition layer ($500.00) within 120 seconds perfectly matches system signatures for automated credential stuffing and immediate exploitation vectors.
                </p>

                <h4 className="text-white font-bold text-lg mt-6 drop-shadow-md">Enforced Protocols</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm font-medium pl-2">
                  <li>Token session keys revoked globally.</li>
                  <li>Inbound Clearinghouse ACH networks isolated.</li>
                  <li>Merchant point-of-sale verification flagged for direct manual challenge.</li>
                </ul>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-32 text-md font-bold tracking-wide">Select an isolated node stream from the queue to view forensic metadata.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}