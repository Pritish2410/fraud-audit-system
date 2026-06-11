import React from 'react';
import { ShieldX } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }

  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }

  componentDidCatch(error, errorInfo) { 
    if(window.showError) window.showError("Critical UI Fault: " + error.message);
    console.error("Caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
          <ShieldX className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-white mb-2">Network Terminal Crashed</h2>
          <p className="text-slate-400 mb-6">{this.state.error?.message || "Unknown Cloudflare R2 fault."}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-rose-600/20 text-rose-400 rounded-lg font-bold border border-rose-500/50 hover:bg-rose-600/30 transition-all">
            Reboot Terminal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}