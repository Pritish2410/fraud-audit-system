import { useState, useEffect } from 'react'
import { CreditCard, Send, ShieldX, Flame } from 'lucide-react'

export default function UserDashboard() {
  const [accountState, setAccountState] = useState('ACTIVE')
  const [csvFile, setCsvFile] = useState(null)
  const [realCsvData, setRealCsvData] = useState([]) 
  
  const [colMap, setColMap] = useState({ type: 1, origin: 3, amount: 2, fraud: -1 })
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [batchResults, setBatchResults] = useState(null)
  
  const [streamRows, setStreamRows] = useState(() => Array(5).fill({ id: Math.random(), text: '', isThreat: false }))
  const [anomalyHit, setAnomalyHit] = useState(false)

  const [formData, setFormData] = useState({
    accountId: 'WAYNE_ENT_001', amount: 500, merchantCategory: 'ELECTRONICS', location: 'GOTHAM_CITY_IP'
  })

  const [firstName, setFirstName] = useState('');

  // INSTANT ONLINE STATUS PING
  useEffect(() => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL');
    if (email) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/email/${email}/status?status=ONLINE`, { 
        method: 'PUT' 
      }).catch(console.error);
    }
  }, []);
  
  // LIVE DATABASE HEARTBEAT: LocalStorage strictly removed to prevent dual-tab festival lights conflict
  useEffect(() => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL')
    if (!email) return

    const fetchUserAndCheckHeartbeat = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/email/${email}`)
        if (!res.ok) { 
          localStorage.clear()
          window.location.href = '/login'
          return
        }
        const data = await res.json()
        setFirstName(data.name ? data.name.split(' ')[0] : 'Operative')
        
        // GLOBAL SYNC: Only trust the database response
        if (data.status === 'BLOCKED') {
          setAccountState('BLOCKED')
        } else {
          setAccountState('ACTIVE')
        }
      } catch (err) {
        console.error("Heartbeat sync link degraded:", err)
      }
    }

    fetchUserAndCheckHeartbeat() 
    const heartbeat = setInterval(fetchUserAndCheckHeartbeat, 3000)

    return () => clearInterval(heartbeat)
  }, [])

  const handleFileSelection = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    
    if (file) {
      if (file.name.endsWith('.xlsx')) {
        setRealCsvData([
          "SYSTEM,INFO,0.00,0",
          "EXCEL_FILE,LOADED,0.00,0",
          "READY,FOR,BATCH,0"
        ]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const lines = evt.target.result.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 1) {
           const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
           const sampleData = lines[1].split(',').map(d => d.trim().replace(/"/g, ''));
           
           let discoveredMap = { type: -1, origin: -1, amount: -1, fraud: -1 };

           headers.forEach((h, i) => {
              if (h.includes('type') || h.includes('category')) discoveredMap.type = i;
              if (h.includes('nameorig') || h.includes('merchant') || h.includes('location')) discoveredMap.origin = i;
              if (h.includes('amount') || h.includes('amt')) discoveredMap.amount = i;
              if (h.includes('fraud') || h.includes('class') || h.includes('anomaly')) discoveredMap.fraud = i;
           });

           sampleData.forEach((val, i) => {
               const num = Number(val);
               if (discoveredMap.amount === -1 && !isNaN(num) && val !== '0' && val !== '1' && val.includes('.')) {
                   discoveredMap.amount = i;
               }
               if (discoveredMap.fraud === -1 && (val === '0' || val === '1') && i > discoveredMap.amount) {
                   discoveredMap.fraud = i;
               }
           });

           setColMap({
               type: discoveredMap.type !== -1 ? discoveredMap.type : 1, 
               origin: discoveredMap.origin !== -1 ? discoveredMap.origin : Math.max(3, discoveredMap.type + 1), 
               amount: discoveredMap.amount !== -1 ? discoveredMap.amount : 2, 
               fraud: discoveredMap.fraud 
           });

           setRealCsvData(lines.slice(1, 1000));
        }
      };
      reader.readAsText(file.slice(0, 100000)); 
    }
  }

  useEffect(() => {
    if (!isUploading || realCsvData.length === 0) {
      setStreamRows(Array(5).fill({ id: Math.random(), text: '', isThreat: false }))
      setAnomalyHit(false)
      return
    }

    let currentIndex = 0;
    const interval = setInterval(() => {
      const rawRow = realCsvData[currentIndex % realCsvData.length];
      const cols = rawRow ? rawRow.split(',') : [];
      
      const txType = cols[colMap.type] ? cols[colMap.type].replace(/"/g, '') : 'TX';
      const origin = cols[colMap.origin] ? cols[colMap.origin].replace(/"/g, '') : 'UNKNOWN';
      const amountRaw = cols[colMap.amount] ? parseFloat(cols[colMap.amount]) : 0;
      
      let isThreat = false;
      if (colMap.fraud !== -1 && cols[colMap.fraud]) {
          const rawFlag = cols[colMap.fraud].trim().replace(/"/g, '');
          isThreat = rawFlag === '1' || rawFlag.toLowerCase() === 'true';
      }
      
      const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amountRaw);
      
      const newRow = {
        id: currentIndex,
        text: `${txType}  |  ${origin}  |  ${formattedAmount} ${isThreat ? '  ::  ANOMALY DETECTED' : ''}`,
        isThreat: isThreat
      }

      if (isThreat) {
        setAnomalyHit(true)
        clearInterval(interval)
        setTimeout(() => setAnomalyHit(false), 800) 
      }

      setStreamRows(prev => {
        const next = [...prev, newRow]
        return next.slice(-5) 
      })
      
      currentIndex++;
    }, anomalyHit ? 800 : 150) 

    return () => clearInterval(interval)
  }, [isUploading, anomalyHit, realCsvData, colMap])

  const executeLockdown = async () => {
    setAccountState('BLOCKED')
    
    // We still keep the report storage locally so the dashboard knows to show Gemini loading
    localStorage.setItem('WAYNE_ENT_REPORT', "Generating Gemini Forensic Report...")
    localStorage.setItem('WAYNE_ENT_BLOCKED_USER', localStorage.getItem('WAYNE_ENT_USER_EMAIL'))

    // JSON BODY BROADCAST: Guarantees Render doesn't drop the network request
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL')
    const fileName = csvFile ? csvFile.name : 'unknown_evidence.csv';
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/lockdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, evidence: fileName })
      })
    } catch (err) {
      console.error("Failed to broadcast system isolation:", err)
    }
  }

  const handleBatchUpload = async (e) => {
    e.preventDefault()
    if (!csvFile) return
    
    setIsUploading(true)
    setBatchResults(null)
    setUploadProgress(0)

    const uploadData = new FormData()
    uploadData.append('file', csvFile)

    const xhr = new XMLHttpRequest()
    
    xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL}/api/v1/datasets/upload`, true)
    xhr.timeout = 300000; 

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100))
      }
    }

    xhr.onload = () => {
      setIsUploading(false)
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          setBatchResults(data)
          
          if (data.anomaliesDetected > 0) {
              executeLockdown()
          }
        } catch (err) {
           setBatchResults({ totalProcessed: "SUCCESS", anomaliesDetected: "RAW RESPONSE" })
        }
      } else {
        let errorReason = "SERVER REJECTED"
        try {
           const errData = JSON.parse(xhr.responseText)
           if ((errData.message && errData.message.toLowerCase().includes('gemini')) || errData.message.toLowerCase().includes('quota')) {
               errorReason = "GEMINI UNAVAILABLE"
           }
        } catch (e) {
           if (xhr.status === 500 || xhr.status === 503) errorReason = "SERVER UNAVAILABLE"
           else if (xhr.status === 429) errorReason = "API LIMIT EXHAUSTED"
        }
        
        setBatchResults({ totalProcessed: `ERROR ${xhr.status}`, anomaliesDetected: errorReason })
      }
    }

    xhr.onerror = () => {
      setIsUploading(false)
      setBatchResults({ totalProcessed: "NETWORK ERROR", anomaliesDetected: "CONNECTION DROPPED" })
    }

    xhr.ontimeout = () => {
      setIsUploading(false)
      setBatchResults({ totalProcessed: "TIMEOUT 504", anomaliesDetected: "UPLOAD TOOK TOO LONG" })
    }

    try {
      xhr.send(uploadData)
    } catch (err) {
      setIsUploading(false)
      setBatchResults({ totalProcessed: "FATAL", anomaliesDetected: "REQUEST FAILED" })
    }
  }

  const handleSignOut = async () => {
    const email = localStorage.getItem('WAYNE_ENT_USER_EMAIL');
    if (email) {
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/email/${email}/status?status=OFFLINE`, { 
          method: 'PUT' 
        });
      } catch(e) {}
    }
    localStorage.removeItem('WAYNE_ENT_TOKEN');
    localStorage.removeItem('WAYNE_ENT_USER_EMAIL');
    window.location.href = '/login';
  };

  const isErrorState = batchResults && batchResults.totalProcessed.toString().includes('ERROR');

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
      
      <div className={`p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border backdrop-blur-2xl transition-all duration-500 ${
        accountState === 'ACTIVE' ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' :
        'bg-rose-950/60 border-rose-500/70 text-rose-400 shadow-[0_0_50px_rgba(225,29,72,0.4)]'
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

        <div className="flex items-center w-full sm:w-auto sm:pr-4 justify-center sm:justify-end border-t border-slate-800/60 pt-4 sm:border-t-0 sm:pt-0">
            <span className="text-2xl sm:text-3xl text-white/90 drop-shadow-md flex items-center gap-2">
              <svg className="w-16 h-8 sm:w-24 sm:h-12 transform translate-y-1" viewBox="-109 -9 2504 746" xmlns="http://www.w3.org/2000/svg">
                <g transform="scale(1, -1) translate(0, -728)">
                  <path d="M-109.06069946289062,95.92639923095703 C1.9544999599456787,157.6403045654297 103.11389923095703,236.9969940185547 217.881103515625,372.07550048828125 C296,464.2846984863281 337.9999084472656,569.5725708007812 340,642.1939697265625 C341,696.1920166015625 314.6702880859375,737.156005859375 266,737.156005859375 C212,737.156005859375 178,696.1920166015625 157,602.1610107421875 C134,498.82000732421875 117,380.239990234375 74,0 " fill="none" stroke="#ffffff" strokeWidth="60" strokeLinecap="round"/>
                  <path d="M78.21453094482422,37.160953521728516 C100.22924041748047,230.68260192871094 184,372 291,372 C355,372 395.6745910644531,321 384.1253967285156,248 C377.6238098144531,205 370.0873107910156,161 361.3063049316406,110 C351.0714111328125,46 380.3254089355469,-4 468.96173095703125,-4 C598.2246704101562,-4 739.2435302734375,67.83381652832031 811.4124145507812,179.0941619873047 C836,217 846,251 847,284 C848,344 814,389 754,389 C678,389 620,303 620,193 C620,75 684,-8 819.9180908203125,-8 C1004.7244873046875,-8 1209.4246826171875,213.84754943847656 1303.4808349609375,461.42327880859375 C1330.037353515625,531.3258056640625 1340,596.2349243164062 1340,641.593994140625 C1340,695.3764038085938 1323,736.673583984375 1275,736.673583984375 C1228,736.673583984375 1197,700.1784057617188 1169,642.5543823242188 C1136.1939697265625,575.7216186523438 1111.927734375,479.32598876953125 1102,370.3599853515625 C1077,96.94000244140625 1133,-4 1266.152099609375,-4 C1427.6083984375,-4 1607.1151123046875,220.92921447753906 1698.771728515625,462.18878173828125 C1725.037353515625,531.3258056640625 1735,596.2349243164062 1735,641.593994140625 C1735,695.3764038085938 1718,736.673583984375 1670,736.673583984375 C1623,736.673583984375 1592,700.1784057617188 1564,642.5543823242188 C1531.1939697265625,575.7216186523438 1506.927734375,479.32598876953125 1497,370.3599853515625 C1472,96.94000244140625 1528,-4 1646.906005859375,-4 C1765.623779296875,-4 1830.114990234375,99.48485565185547 1868.77880859375,209.3712158203125 C1907,318 1954,385 2052,385 C2133,385 2197,325 2197,212 C2197,87 2115.90087890625,-7 2013.41845703125,-8 C1923.234130859375,-9 1864,64 1870,174 C1877,296 1951,385 2048,385 C2104,385 2151.03564453125,360.1071472167969 2188,333 C2288.21435546875,259.8928527832031 2365.4287109375,305.0714416503906 2395,377.3571472167969 " fill="none" stroke="#ffffff" strokeWidth="60" strokeLinecap="round"/>
                </g>
              </svg>
              <span className="font-medium tracking-tight">, {firstName}</span>
              <span className="ml-1 inline-block origin-bottom-right hover:animate-pulse cursor-default text-xl sm:text-2xl">👋</span>
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/20 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <h4 className="text-lg font-bold text-white mb-2">Dynamic Injection Pipeline</h4>
            <p className="text-sm text-slate-300 mb-6 font-medium">Inject custom payload parameters directly into the Redis streaming architecture.</p>
            
            <form className="space-y-4 mb-6">
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
              <button type="button" disabled={accountState !== 'ACTIVE'} className={`w-full py-4 px-6 mt-4 rounded-xl font-bold text-lg tracking-wide flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${accountState === 'ACTIVE' ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.6)]' : 'bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed'}`}>
                <Send className="w-5 h-5" />
                Inject Event Payload
              </button>
            </form>
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.5)] min-h-[460px] flex flex-col relative overflow-visible">
          <h3 className="text-lg font-bold text-white mb-4 z-10 relative">Batch Heuristic Pipeline (CSV/XLSX)</h3>
          
          <form onSubmit={handleBatchUpload} className="space-y-4 flex-grow flex flex-col justify-between z-10 relative">
            
            {!isUploading && (
              <div className="flex items-center justify-center w-full relative">
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/50 border-slate-700 transition-all relative">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <p className="mb-2 text-sm text-slate-400">
                      <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">Spreadsheet Matrix (.CSV, .XLSX)</p>
                  </div>
                  <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    accept=".csv, .xlsx, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
                    onChange={handleFileSelection} 
                    disabled={accountState !== 'ACTIVE'} 
                  />
                </label>
              </div>
            )}

            {isUploading && (
              <div className="relative h-44 w-full">
                <div className="absolute inset-y-0 -left-16 -right-16 flex flex-col justify-center items-center font-mono [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] pointer-events-none">
                  <div className="w-full h-full flex flex-col justify-center items-center [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
                    
                    {streamRows.map((row, index) => {
                      let textStyle = "text-xs opacity-20 scale-90";
                      let colorStyle = "text-slate-500";
                      
                      if (index === 1 || index === 3) {
                        textStyle = "text-sm opacity-50 scale-100";
                        colorStyle = "text-slate-400";
                      } else if (index === 2) {
                        textStyle = "text-lg opacity-100 scale-110 font-bold tracking-widest";
                        colorStyle = row.isThreat ? "text-rose-500 drop-shadow-[0_0_15px_rgba(225,29,72,0.9)]" : "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]";
                      } else if (row.isThreat) {
                         colorStyle = "text-rose-500/40";
                      }

                      return (
                        <div 
                          key={`${row.id}-${index}`} 
                          className={`h-9 flex items-center justify-center whitespace-nowrap transition-all duration-300 ease-out ${textStyle} ${colorStyle}`}
                        >
                          {row.text || '\u00A0'}
                        </div>
                      );
                    })}

                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center min-h-[24px]">
              {csvFile && (
                <p className="text-sm font-medium text-emerald-400 truncate px-4">
                  Selected: <span className="font-bold">{csvFile.name}</span>
                  {isUploading && <span className="ml-2 text-white">({uploadProgress}%)</span>}
                </p>
              )}
            </div>

            <button type="submit" disabled={!csvFile || isUploading || accountState !== 'ACTIVE'} className={`w-full py-3 px-4 font-bold rounded-xl transition-all duration-300 shadow-lg ${
                isUploading 
                  ? "bg-gradient-to-r from-purple-700 via-pink-500 to-purple-700 animate-sweep cursor-not-allowed text-white" 
                  : (!csvFile || accountState !== 'ACTIVE') ? "bg-slate-800/50 text-slate-600 border border-slate-700 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              }`}>
              {isUploading ? 'INGESTING DATASET...' : 'Run Batch Analysis'}
            </button>
          </form>
          
          {batchResults && (
            <div className={`mt-6 p-4 rounded-xl border flex justify-between z-10 relative transition-colors ${isErrorState ? 'bg-rose-950/40 border-rose-500/40 shadow-[0_0_15px_rgba(225,29,72,0.2)]' : 'border-white/10 bg-black/40'}`}>
              <div><div className="text-xs font-bold text-slate-400 uppercase">Status</div><div className={`text-xl font-bold ${isErrorState ? 'text-rose-400' : 'text-blue-400'}`}>{batchResults.totalProcessed}</div></div>
              <div className="text-right"><div className="text-xs font-bold text-slate-400 uppercase">Detection Result</div><div className={`text-xl font-bold ${isErrorState ? 'text-amber-500' : 'text-rose-500'}`}>{batchResults.anomaliesDetected}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}