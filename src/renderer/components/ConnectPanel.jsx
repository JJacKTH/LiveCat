import React, { useState } from 'react';
import { Play, Square, RefreshCcw, Trash2, Monitor, Pin } from 'lucide-react';

const ConnectPanel = ({ status, viewerCount, onConnect, onDisconnect, onClearChat, onToggleOverlay, onToggleAlwaysOnTop }) => {
    const [username, setUsername] = useState('');
    const [alwaysOnTop, setAlwaysOnTop] = useState(false);

    const handleConnect = () => {
        if (username.trim()) {
            onConnect(username);
        }
    };

    const handleToggleAlwaysOnTop = () => {
        const newValue = !alwaysOnTop;
        setAlwaysOnTop(newValue);
        onToggleAlwaysOnTop(newValue);
    };
    return (
        <div className="glass-card p-4 rounded-xl shadow-2xl mb-4">
            <div className="flex gap-2">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="TikTok Username"
                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-2 pl-9 pr-4 focus:ring-1 focus:ring-brand-purple outline-none transition-all text-sm text-white placeholder:text-slate-600"
                        disabled={status === 'connected'}
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">@</span>
                </div>

                <button 
                    onClick={status === 'connected' ? onDisconnect : handleConnect} 
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${
                        status === 'connected' 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-brand-purple text-white hover:bg-brand-purple/80 shadow-brand-purple/20'
                    }`}
                >
                    {status === 'connected' ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    {status === 'connected' ? 'Stop' : 'Go'}
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 ${
                        status === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                        {status === 'connected' ? 'Live' : 'Offline'}
                    </div>
                    {status === 'connected' && (
                        <span className="text-[10px] font-bold text-brand-blue flex items-center gap-1">
                            <Monitor size={10} /> {viewerCount || 0}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={onToggleOverlay} title="Overlay" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <Monitor size={16} />
                    </button>
                    <button onClick={handleToggleAlwaysOnTop} title="Pin" className={`p-2 rounded-lg transition-colors ${alwaysOnTop ? 'bg-brand-blue/20 text-brand-blue' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                        <Pin size={16} />
                    </button>
                    <button onClick={onClearChat} title="Clear" className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectPanel;
