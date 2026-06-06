import { useState, useEffect } from 'react'
import { CreditCard, Send, ShieldX } from 'lucide-react'

export default function UserDashboard() {
  const [accountState, setAccountState] = useState(() => localStorage.getItem('WAYNE_ENT_STATUS') || 'ACTIVE')
  const [csvFile, setCsvFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [batchResults, setBatchResults] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiReport, setAiReport] = useState("Awaiting velocity event triggers...")

  const [formData, setFormData] = useState({
    accountId: 'WAYNE_ENT_001',
    amount: 500,
    merchantCategory: 'ELECTRONICS',
    location: 'GOTHAM_CITY_IP'
  })

  useEffect(() => {
    const handleStorage = () => {
      setAccountState(localStorage.getItem('WAYNE_ENT_STATUS') || 'ACTIVE')
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const executeLockdown = () => {
    setAccountState('BLOCKED')
    localStorage.setItem('WAYNE_ENT_STATUS', 'BLOCKED')
    localStorage.setItem('WAYNE_ENT_REPORT', "Generating Gemini Forensic Report... (This takes about 8 seconds)")
  }

  const pollForReport = () => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/audit/report`)
        const json = await res.json()
        if (!json.report.includes("Awaiting") && !json.report.includes("analyzing threat vectors") && !json.report.includes("System locked")) {
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

  const triggerMockFraud = async (e) => {
    e.preventDefault() 
    executeLockdown() 
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/audit/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
    } catch (error) {
      console.error("Pipeline offline:", error)
    }
  }

  const handleBatchUpload = async (e) => {
    e.preventDefault()
    if (!csvFile) return
    
    setIsUploading(true)
    setBatchResults(null)
    
    const uploadData = new FormData()
    uploadData.append('file', csvFile)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/audit/batch`, {
        method: 'POST',
        body: uploadData 
      })
      
      const data = await response.json().catch(() => ({})) 

      if (response.ok && data.status === "SUCCESS") {
        setBatchResults(data)
        
        if (data.anomaliesDetected > 0) { 
          executeLockdown() 
          setAiLoading(true)
          pollForReport()
        }
      } else {
         setBatchResults({ 
            totalProcessed: "ERROR", 
            anomaliesDetected: data.message || "Check VS Code Console" 
         })
      }
    } catch (error) {
      setBatchResults({ 
          totalProcessed: "NETWORK", 
          anomaliesDetected: "DISCONNECTED" 
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      <div className={`p-6 rounded-2xl mb-8 flex items-center justify-between border backdrop-blur-2xl transition-all duration-500 ${
        accountState === 'ACTIVE' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
        'bg-rose-950/60 border-rose-500/70 text-rose-400 shadow-[0_0_50px_rgba(225,29,72,0.4)]'
      }`}>
        <div className="flex items-center gap-5 w-full">
          <div className={`p-4 rounded-xl shadow-inner ${accountState === 'BLOCKED' ? 'bg-rose-500/30' : 'bg-emerald-500/30'}`}>
            {accountState === 'BLOCKED' ? <ShieldX className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" /> : <CreditCard className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />}
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-white drop-shadow-md">Account Status: {accountState}</h3>
            <p className="text-sm font-medium mt-1">{accountState === 'BLOCKED' ? 'Security protocol fired: External transfers disabled. Contact Admin.' : 'Node network connection secure.'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h4 className="text-lg font-bold text-white mb-2">Dynamic Injection Pipeline</h4>
            <p className="text-sm text-slate-300 mb-6 font-medium">Inject custom payload parameters directly into the Redis streaming architecture.</p>
            
            <form onSubmit={triggerMockFraud} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Amount ($)</label>
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} disabled={accountState !== 'ACTIVE'} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Category</label>
                  <select value={formData.merchantCategory} onChange={(e) => setFormData({...formData, merchantCategory: e.target.value})} disabled={accountState !== 'ACTIVE'} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50">
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="GROCERIES">Groceries</option>
                    <option value="TRAVEL">Travel</option>
                    <option value="CRYPTO_EXCHANGE">Crypto Exchange</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Geolocation Origin</label>
                  <input type="text" required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} disabled={accountState !== 'ACTIVE'} className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors disabled:opacity-50" />
                </div>
              </div>
              <button type="submit" disabled={accountState !== 'ACTIVE'} className={`w-full py-4 px-6 mt-4 rounded-xl font-bold text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${accountState === 'ACTIVE' ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.6)]' : 'bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed'}`}>
                <Send className="w-5 h-5" />
                Inject Event Payload
              </button>
            </form>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)] h-[460px] flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Batch Heuristic Pipeline (CSV)</h3>
          <form onSubmit={handleBatchUpload} className="space-y-4 flex-grow flex flex-col justify-between">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 border-slate-700 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <p className="mb-2 text-sm text-slate-400">
                    <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-500">Kaggle Dataset (.CSV only)</p>
                </div>
                <input type="file" className="hidden" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} disabled={accountState !== 'ACTIVE'} />
              </label>
            </div>
            
            {csvFile && (
              <div className="text-sm font-medium text-emerald-400 text-center">
                Selected: {csvFile.name}
              </div>
            )}

            <button type="submit" disabled={!csvFile || isUploading || accountState !== 'ACTIVE'} className={`w-full py-3 px-4 font-bold rounded-xl transition-all duration-300 ${accountState === 'ACTIVE' && csvFile ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed'}`}>
              {isUploading ? 'Ingesting Dataset...' : 'Run Batch Analysis'}
            </button>
          </form>
          
          {batchResults && (
            <div className="mt-6 p-4 rounded-xl border border-white/10 bg-black/40 flex justify-between">
              <div><div className="text-xs font-bold text-slate-400 uppercase">Processed</div><div className="text-xl font-bold text-blue-400">{batchResults.totalProcessed} Rows</div></div>
              <div className="text-right"><div className="text-xs font-bold text-slate-400 uppercase">Anomalies Detected</div><div className="text-xl font-bold text-rose-500">{batchResults.anomaliesDetected} Isolated</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}