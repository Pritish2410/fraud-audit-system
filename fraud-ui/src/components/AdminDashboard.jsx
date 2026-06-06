import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Users, Terminal, CheckCircle, CreditCard, ShieldX, FileText, Loader2, Lock } from 'lucide-react'
import { jsPDF } from 'jspdf'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    throughput: '0 ops/sec',
    latency: '42ms',
    sync: '100.0% Sync'
  })

  // Persistent State
  const [accountState, setAccountState] = useState(() => localStorage.getItem('WAYNE_ENT_STATUS') || 'ACTIVE')
  const [aiReport, setAiReport] = useState(() => localStorage.getItem('WAYNE_ENT_REPORT') || "Awaiting velocity event triggers...")
  const [aiLoading, setAiLoading] = useState(false)

  // Helper to check if the AI is still typing based on all possible backend placeholders
  const isStillBrewing = (text) => text.includes("Awaiting") || text.includes("Generating") || text.includes("System locked") || text.includes("analyzing");

  // Sync state across tabs
  useEffect(() => {
    const handleStorage = () => {
      setAccountState(localStorage.getItem('WAYNE_ENT_STATUS') || 'ACTIVE')
      setAiReport(localStorage.getItem('WAYNE_ENT_REPORT') || "Awaiting velocity event triggers...")
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    localStorage.setItem('WAYNE_ENT_STATUS', accountState)
  }, [accountState])

  useEffect(() => {
    localStorage.setItem('WAYNE_ENT_REPORT', aiReport)
  }, [aiReport])

  // Mock metrics
  useEffect(() => {
    const interval = setInterval(() => {
      const isActive = Math.random() > 0.3
      const ops = isActive ? Math.floor(Math.random() * 12) + 1 : 0
      const lat = Math.floor(Math.random() * 15) + 35
      const jitter = (99.8 + Math.random() * 0.2).toFixed(1)
      setMetrics({ throughput: `${ops} ops/sec`, latency: `${lat}ms`, sync: `${jitter}% Sync` })
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  // Async Polling
  // Async Polling
  const pollForReport = () => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/audit/report`)
        const json = await res.json()
        
        // THE FIX: Check against our bulletproof helper function
        if (!isStillBrewing(json.report)) {
          setAiReport(json.report)
          clearInterval(pollInterval) 
          setAiLoading(false)
        }
      } catch (err) {}
    }, 2000) 

    setTimeout(() => {
      clearInterval(pollInterval)
      setAiLoading(false)
    }, 20000)
  }

  useEffect(() => {
    if (accountState === 'BLOCKED' && isStillBrewing(aiReport)) {
      setAiLoading(true)
      pollForReport()
    }
  }, [])

  const handleAdminOverride = () => {
    setAccountState('ACTIVE')
    setAiReport("Awaiting velocity event triggers...")
    localStorage.setItem('WAYNE_ENT_STATUS', 'ACTIVE')
    localStorage.setItem('WAYNE_ENT_REPORT', "Awaiting velocity event triggers...")
  }

  const downloadPremiumPDF = () => {
    if (isStillBrewing(aiReport)) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxLineWidth = pageWidth - margin * 2;
    let cursorY = 30;

    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const drawPremiumTheme = () => {
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(225, 29, 72); 
      doc.rect(0, 0, pageWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`WAYNE ENTERPRISES - FORENSIC REPORT (${currentDate})`, 10, 14);
    };

    drawPremiumTheme();
    let cleanText = aiReport.replace(/\*\*/g, ''); 
    const lines = cleanText.split('\n');

    lines.forEach(line => {
      if (line.trim() === '') { cursorY += 4; return; }
      if (cursorY > pageHeight - 20) { doc.addPage(); drawPremiumTheme(); cursorY = 30; }
      
      if (line.startsWith('# ') || line.startsWith('## ')) {
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold"); doc.setFontSize(13);
        doc.text(line.replace(/#/g, '').trim(), margin, cursorY);
        cursorY += 8; 
      } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        doc.setTextColor(226, 232, 240);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        const splitBullet = doc.splitTextToSize(line.replace(/^[\s*-]+/, '\u2022  '), maxLineWidth - 5);
        doc.text(splitBullet, margin + 5, cursorY);
        cursorY += (splitBullet.length * 5) + 3;
      } else {
        doc.setTextColor(226, 232, 240);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10);
        const splitText = doc.splitTextToSize(line, maxLineWidth);
        doc.text(splitText, margin, cursorY, { align: 'justify', maxWidth: maxLineWidth });
        cursorY += (splitText.length * 5) + 4;
      }
    });
    doc.save(`Forensic_Report_WAYNE_ENT_001.pdf`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      
      {/* GLOBAL ACCOUNT STATUS & ISSUES COUNTER */}
      <div className={`p-6 rounded-2xl mb-8 flex items-center justify-between border backdrop-blur-2xl transition-all duration-500 ${
        accountState === 'ACTIVE' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
        'bg-rose-950/60 border-rose-500/70 text-rose-400 shadow-[0_0_50px_rgba(225,29,72,0.4)]'
      }`}>
        <div className="flex items-center gap-5 w-full">
          <div className={`p-4 rounded-xl shadow-inner ${accountState === 'BLOCKED' ? 'bg-rose-500/30' : 'bg-emerald-500/30'}`}>
            {accountState === 'BLOCKED' ? <ShieldX className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" /> : <CreditCard className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white drop-shadow-md">Global Network Status: {accountState}</h3>
            <p className="text-sm font-medium mt-1">{accountState === 'BLOCKED' ? 'CRITICAL: Threat detected. Awaiting Admin manual review.' : 'All nodes secure. Monitoring active.'}</p>
          </div>
          
          <div className={`px-5 py-2 font-bold rounded-lg border transition-all uppercase tracking-widest ${
            accountState === 'BLOCKED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-emerald-500/10 text-emerald-500/50 border-emerald-500/20'
          }`}>
            Active Issues: {accountState === 'BLOCKED' ? '1' : '0'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Upstash Throughput', value: metrics.throughput, icon: Activity, color: 'text-blue-400 bg-blue-500/20 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.3)]' },
          { label: 'Cloud Latency', value: metrics.latency, icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/20 border-rose-500/50 shadow-[0_0_25px_rgba(225,29,72,0.3)]' },
          { label: 'Authorized Agents', value: '1 Active', icon: Users, color: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]' },
          { label: 'Pub/Sub Pipeline', value: metrics.sync, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-2xl flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3 drop-shadow-md">
            <Terminal className="w-5 h-5 text-blue-400" /> Active Threat Queue
          </h3>
          
          {accountState === 'BLOCKED' ? (
            <div className="p-5 rounded-2xl border border-rose-500/70 bg-rose-950/40 shadow-[0_0_35px_rgba(225,29,72,0.25)] transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold shadow-[0_0_10px_rgba(225,29,72,0.4)] animate-pulse">BLOCKED</span>
                <span className="text-xs font-bold text-slate-400">JUST NOW</span>
              </div>
              <h4 className="text-md font-bold text-white drop-shadow-md">Wayne Enterprises</h4>
              <div className="text-sm font-medium text-slate-300 mt-2">Anomaly threshold exceeded via pub/sub pipeline.</div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 text-center py-10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <div className="text-slate-500 text-sm font-bold tracking-wide">Queue Clear</div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/20 backdrop-blur-3xl h-full shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <h3 className="text-xl font-bold text-white border-b border-white/20 pb-5 mb-6 flex items-center justify-between">
              <span>Isolated Node Directory</span>
              <span className="text-xs font-bold text-rose-300 bg-rose-900/40 px-3 py-1.5 rounded-lg border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]">Admin Override Required</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 font-bold">User ID</th>
                    <th className="pb-4 font-bold">Account Name</th>
                    <th className="pb-4 font-bold">Email</th>
                    <th className="pb-4 font-bold text-center">AI Report</th>
                    <th className="pb-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accountState === 'BLOCKED' ? (
                    <tr className="border-b border-white/5 bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-mono text-sm text-slate-300">WAYNE_ENT_001</td>
                      <td className="py-4 px-2 font-medium text-white">Wayne Enterprises</td>
                      <td className="py-4 px-2 text-sm text-slate-400">admin@wayneenterprises.com</td>
                      
                      <td className="py-4 text-center">
                        {aiLoading ? (
                          <div className="flex justify-center items-center text-rose-400" title="Generating AI Report...">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : (
                          <button 
                          onClick={downloadPremiumPDF}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all duration-200 active:scale-90 mx-auto block"
                          title="Download AI Forensic Report">
                          <FileText className="w-6 h-6" />
                        </button>
                        )}
                      </td>
                      
                      {/* THE FIX: Red Lock icon and UNLOCK text */}
                      <td className="py-4 text-right pr-2">
                        <button 
                          onClick={handleAdminOverride}
                          disabled={aiLoading}
                          className="flex items-center justify-end gap-2 px-4 py-2 ml-auto bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                          <Lock className="w-4 h-4" /> UNLOCK
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-slate-500 text-sm font-bold tracking-widest uppercase">
                        No active network threats
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}