import React, { useState } from 'react';
import { Play, Square, RefreshCcw, Trash2, Monitor, Pin } from 'lucide-react';

const ConnectPanel = ({ status, viewerCount, onConnect, onDisconnect, onClearChat, onToggleOverlay, onToggleAlwaysOnTop, autoReconnect, setAutoReconnect }) => {
    const [username, setUsername] = useState(localStorage.getItem('livecat_username') || '');
    const [alwaysOnTop, setAlwaysOnTop] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    React.useEffect(() => {
        localStorage.setItem('livecat_username', username);
    }, [username]);

    React.useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const handleConnect = () => {
        if (username.trim() && cooldown === 0) {
            setCooldown(60); // 1 minute cooldown after connecting
            onConnect(username);
        }
    };

    const handleDisconnect = () => {
        if (cooldown === 0) {
            setCooldown(60); // 1 minute cooldown after disconnecting
            onDisconnect();
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
                    onClick={status === 'connected' ? handleDisconnect : handleConnect} 
                    disabled={cooldown > 0}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg min-w-[100px] justify-center ${
                        status === 'connected' 
                        ? (cooldown > 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30')
                        : (cooldown > 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-70' : 'bg-brand-purple text-white hover:bg-brand-purple/80 shadow-brand-purple/20')
                    }`}
                >
                    {cooldown > 0 ? (
                        <RefreshCcw size={14} className="animate-spin" />
                    ) : status === 'connected' ? (
                        <Square size={14} fill="currentColor" />
                    ) : (
                        <Play size={14} fill="currentColor" />
                    )}
                    {status === 'connected' ? (cooldown > 0 ? `${cooldown}s` : 'Stop') : (cooldown > 0 ? `${cooldown}s` : 'Go')}
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
                    <button 
                        onClick={() => setAutoReconnect(!autoReconnect)}
                        className={`ml-2 px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${autoReconnect ? 'bg-brand-purple/20 text-brand-purple' : 'bg-slate-800 text-slate-600'}`}
                        title="Auto Reconnect when disconnected"
                    >
                        Auto: {autoReconnect ? 'ON' : 'OFF'}
                    </button>
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
