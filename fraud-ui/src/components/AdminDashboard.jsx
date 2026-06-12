import { useState, useEffect } from 'react'
import { Activity, ShieldAlert, Users, Terminal, CheckCircle, CreditCard, ShieldX, FileText, Loader2, Lock, Database, Trash2 } from 'lucide-react'
import { jsPDF } from 'jspdf'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    throughput: '0 ops/sec',
    latency: '42ms',
    sync: '100.0% Sync'
  })

  const [accountState, setAccountState] = useState('ACTIVE')
  const [aiReport, setAiReport] = useState(() => localStorage.getItem('WAYNE_ENT_REPORT') || "Awaiting velocity event triggers...")
  const [aiLoading, setAiLoading] = useState(false)

  const [usersList, setUsersList] = useState([])

  const activeOperativesCount = usersList.filter(user => user.status === 'ONLINE').length;
  
  // DYNAMIC EVIDENCE FETCHING: Instead of reading localStorage, we pull the exact file linked to the blocked user from the server
  const blockedUser = usersList.find(user => user.status === 'BLOCKED');
  const dynamicEvidenceFile = blockedUser?.evidence || null;

  const isStillBrewing = (text) => text.includes("Awaiting") || text.includes("Generating") || text.includes("System locked") || text.includes("analyzing");

  // TRUE GLOBAL SYNC: Admin Dashboard derives its lock state entirely from the Database stream
  useEffect(() => {
    if (usersList.some(user => user.status === 'BLOCKED')) {
      setAccountState('BLOCKED');
    } else {
      setAccountState('ACTIVE');
    }
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('WAYNE_ENT_REPORT', aiReport)
  }, [aiReport])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users`)
        if (usersRes.ok) setUsersList(await usersRes.json())
      } catch (err) {
        if(window.showError) window.showError("Data sync failed. Check database connection.");
      }
    }
    
    fetchData() 
    const syncInterval = setInterval(fetchData, 3000) 
    return () => clearInterval(syncInterval)
  }, [])

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

  useEffect(() => {
    let pollInterval;
    
    if (accountState === 'BLOCKED' && isStillBrewing(aiReport)) {
      setAiLoading(true);
      
      const executePoll = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/audit/report`);
          const rawText = await res.text();
          let finalReport = rawText;
          
          try { 
            finalReport = JSON.parse(rawText).report || rawText; 
          } catch (e) {}

          if (!isStillBrewing(finalReport)) {
            setAiReport(finalReport);
            setAiLoading(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling sync error:", err);
        }
      };

      executePoll(); 
      pollInterval = setInterval(executePoll, 2000);
    }

    return () => clearInterval(pollInterval);
  }, [accountState, aiReport]);

  const handleAdminOverride = async () => {
    setAccountState('ACTIVE')
    setAiReport("Awaiting velocity event triggers...")
    localStorage.setItem('WAYNE_ENT_REPORT', "Awaiting velocity event triggers...")

    // Global Central Release Broadcast
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/global-unlock`, {
        method: 'POST'
      })
    } catch (err) {
      if(window.showError) window.showError("Global unlock broadcast failed.");
    }
  }

  const handleDeregisterUser = async (id) => {
    if (!window.confirm("CRITICAL WARNING: This will permanently wipe the operative from the system. Proceed?")) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsersList(usersList.filter(user => user.id !== id));
      }
    } catch (err) {
      if(window.showError) window.showError("Wipe command failed.");
    }
  }

  const handleApproveUser = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/${id}/approve`, { method: 'PUT' });
      if (res.ok) {
        setUsersList(usersList.map(user => user.id === id ? { ...user, status: 'OFFLINE' } : user));
      }
    } catch (err) {
      if(window.showError) window.showError("Operative approval ping failed.");
    }
  }

  const downloadIndividualPDF = (user) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(147, 51, 234); 
    doc.rect(0, 0, pageWidth, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("WAYNE ENTERPRISES - INDIVIDUAL DOSSIER", 10, 16);
    doc.setFontSize(12);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${currentDate}`, 10, 35);
    doc.setTextColor(255, 255, 255);
    doc.text(`System ID: OP-${user.id.toString().padStart(4, '0')}`, 10, 50);
    doc.text(`Operative Name: ${user.name}`, 10, 60);
    doc.text(`Secure Comm Link: ${user.email}`, 10, 70);
    doc.text(`Age: ${user.age}`, 10, 85);
    doc.text(`Sex: ${user.sex}`, 10, 95);
    doc.text(`Date of Birth: ${user.dob}`, 10, 105);
    doc.text(`Primary Residence: ${user.residence}`, 10, 115);
    doc.setTextColor(225, 29, 72); 
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("*** LEVEL 1 EYES ONLY - DESTROY AFTER REVIEW ***", pageWidth / 2, pageHeight - 10, { align: 'center' });

    doc.save(`Operative_${user.name.replace(/\s+/g, '_')}_Details.pdf`);
  }

  const downloadPremiumPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const drawPremiumTheme = (pageNumber) => {
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(59, 130, 246); 
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("WAYNE ENTERPRISES - FORENSIC AI REPORT", 10, 16);
      doc.setTextColor(225, 29, 72);
      doc.setFontSize(10);
      doc.text(`*** LEVEL 1 EYES ONLY - PAGE ${pageNumber} ***`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    let currentPage = 1;
    drawPremiumTheme(currentPage);
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184); 
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(aiReport || "No active threat report available.", pageWidth - 20);
    
    let cursorY = 40; 
    const lineHeight = 6; 

    splitText.forEach(line => {
      if (cursorY + lineHeight > pageHeight - 20) { 
        doc.addPage();
        currentPage++;
        drawPremiumTheme(currentPage);
        doc.setFontSize(11);
        doc.setTextColor(148, 163, 184); 
        doc.setFont("helvetica", "normal");
        cursorY = 40; 
      }
      doc.text(line, 10, cursorY);
      cursorY += lineHeight;
    });

    doc.save(`AI_Forensics_${new Date().getTime()}.pdf`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
      
      {/* GLOBAL STATUS BANNER */}
      <div className={`p-6 rounded-2xl mb-8 flex items-center justify-between border backdrop-blur-2xl transition-all duration-500 ${
        accountState === 'ACTIVE' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
        'bg-rose-950/60 border-rose-500/70 text-rose-400 shadow-[0_0_50px_rgba(225,29,72,0.4)]'
      }`}>
        <div className="flex items-center gap-4 sm:gap-5 w-full">
          <div className={`p-3 sm:p-4 rounded-xl shadow-inner ${accountState === 'BLOCKED' ? 'bg-rose-500/30' : 'bg-emerald-500/30'}`}>
            {accountState === 'BLOCKED' ? <ShieldX className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" /> : <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
          </div>
          <div className="flex-grow">
            <h3 className="text-sm sm:text-xl font-bold text-white drop-shadow-md">Global Network Status: {accountState}</h3>
            <p className="text-[10px] sm:text-sm font-medium mt-1">{accountState === 'BLOCKED' ? 'CRITICAL: Threat detected. Awaiting Admin manual review.' : 'All nodes secure. Monitoring active.'}</p>
          </div>
        </div>
      </div>

      {/* METRICS GRID - SLEEK SQUARE ON MOBILE, CLASSIC ROW ON DESKTOP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {[
          { label: 'Upstash Throughput', value: metrics.throughput, icon: Activity, color: 'text-blue-400 bg-blue-500/20 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.3)]' },
          { label: 'Cloud Latency', value: metrics.latency, icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/20 border-rose-500/50 shadow-[0_0_25px_rgba(225,29,72,0.3)]' },
          { label: 'Active Operatives', value: `${activeOperativesCount} Online`, icon: Users, color: 'text-purple-400 bg-purple-500/20 border-purple-500/50 shadow-[0_0_25px_rgba(168,85,247,0.3)]' },
          { label: 'Pub/Sub Pipeline', value: metrics.sync, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]' },
        ].map((stat, i) => (
          <div key={i} className="p-4 sm:p-6 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-2xl flex flex-col sm:flex-row justify-between sm:items-center aspect-square sm:aspect-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest block truncate">{stat.label}</span>
              <h3 className="text-lg sm:text-2xl font-black text-white mt-1 sm:mt-2 drop-shadow-lg tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-2 sm:p-4 rounded-xl border w-max self-end sm:self-auto mt-auto sm:mt-0 ${stat.color}`}>
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_0_8px_currentColor]" />
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

        <div className="lg:col-span-3 space-y-8">
          
          {/* ISOLATED NODE DIRECTORY */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/20 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <h3 className="text-xl font-bold text-white border-b border-white/20 pb-5 mb-6 flex items-center justify-between">
              <span>Isolated Node Directory</span>
              {accountState === 'BLOCKED' && (
                <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  Admin Override Required
                </div>
              )}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 font-bold min-w-[80px]">User ID</th>
                    <th className="pb-4 font-bold min-w-[120px]">Account Name</th>
                    <th className="pb-4 font-bold min-w-[150px]">Email</th>
                    <th className="pb-4 font-bold text-center">Evidence</th>
                    <th className="pb-4 font-bold text-center">AI Report</th>
                    <th className="pb-4 font-bold text-right min-w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accountState === 'BLOCKED' ? (
                    <tr className="border-b border-white/5 bg-white/5 transition-colors">
                      <td className="py-4 px-2 font-mono text-sm text-slate-300">
                        OP-{blockedUser?.id?.toString().padStart(4, '0') || '0000'}
                      </td>
                      <td className="py-4 px-2 font-medium text-white">
                        {blockedUser?.name || 'Unknown Operative'}
                      </td>
                      <td className="py-4 px-2 text-sm text-slate-400 truncate max-w-[200px]">
                        {blockedUser?.email || 'unknown@operative.com'}
                      </td>

                      <td className="py-4 text-center">
                        {dynamicEvidenceFile ? (
                          <a 
                            href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/datasets/download/${dynamicEvidenceFile}`}
                            download
                            className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all duration-200 active:scale-90 mx-auto block w-max"
                            title={`Download dataset: ${dynamicEvidenceFile}`}
                          >
                            <Database className="w-5 h-5 mx-auto" />
                            <span className="text-[10px] font-bold block mt-1 uppercase tracking-wider text-slate-400">File</span>
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500">N/A</span>
                        )}
                      </td>
                      
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
                      <td colSpan="6" className="py-16 text-center text-slate-500 text-sm font-bold tracking-widest uppercase">
                        No active network threats
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* GLOBAL OPERATIVE DIRECTORY */}
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/20 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/20 pb-5 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-400" />
                Global Operative Directory
              </h3>
            </div>

            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 font-bold min-w-[80px]">Sys ID</th>
                    <th className="pb-4 font-bold min-w-[120px]">Operative Name</th>
                    <th className="pb-4 font-bold min-w-[150px]">Comm Link</th>
                    <th className="pb-4 font-bold text-center">Status</th>
                    <th className="pb-4 font-bold text-center">User Details</th>
                    <th className="pb-4 font-bold text-right min-w-[80px]">Sanitize</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.length > 0 ? usersList.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-2 font-mono text-xs text-slate-500 group-hover:text-slate-300">OP-{user.id.toString().padStart(4, '0')}</td>
                      <td className="py-4 px-2 font-bold text-white">{user.name}</td>
                      <td className="py-4 px-2 text-sm text-slate-400 truncate max-w-[200px]">{user.email}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 
                          user.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' :
                          user.status === 'OFFLINE' ? 'bg-slate-500/20 text-slate-500 border border-slate-500/50' : 
                          'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                        }`}>
                          {user.status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button 
                          onClick={() => downloadIndividualPDF(user)}
                          className="px-3 py-1 bg-purple-600/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/50 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all mx-auto block active:scale-95"
                          title="Download User Details"
                        >
                          User Details
                        </button>
                      </td>
                      <td className="py-4 text-right pr-2 flex items-center justify-end gap-2">
                        {user.status === 'PENDING' && (
                          <button 
                            onClick={() => handleApproveUser(user.id)}
                            className="p-2 rounded-lg text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-90"
                            title="Approve Clearance"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeregisterUser(user.id)}
                          className="p-2 rounded-lg text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all active:scale-90"
                          title="Wipe Operative Data"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="py-10 text-center text-slate-500 text-sm font-bold tracking-widest uppercase">
                        No operatives detected in database
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