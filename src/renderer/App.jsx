import React, { useState, useEffect, useCallback } from 'react';
import ConnectPanel from './components/ConnectPanel';
import ChatFeed from './components/ChatFeed';
import TTSPanel from './components/TTSPanel';

const App = () => {
    const [status, setStatus] = useState('offline');
    const [viewerCount, setViewerCount] = useState(0);
    const [events, setEvents] = useState([]);
    const [latestEvent, setLatestEvent] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        // Listen for events from Main process
        window.electronAPI.onStatusChanged((event, newStatus, error) => {
            setStatus(newStatus);
            if (newStatus === 'connected') {
                showToast('Connected to TikTok Successfully!', 'success');
            } else if (newStatus === 'error') {
                showToast(`Error: ${error || 'Connection Failed'}`, 'error');
                console.error('TikTok Connection Error:', error);
            } else if (newStatus === 'disconnected') {
                showToast('Disconnected from TikTok', 'info');
            }
        });

        window.electronAPI.onViewerCount((event, count) => {
            setViewerCount(count);
        });

        window.electronAPI.onNewEvent((event, data) => {
            setEvents(prev => [...prev.slice(-99), data]); // Keep last 100 events
            setLatestEvent(data);
        });

        // Cleanup listeners
        return () => {
            // Note: In a real app, we should properly remove listeners if electronAPI supports it
        };
    }, []);

    const handleConnect = useCallback((username) => {
        window.electronAPI.connect(username);
    }, []);

    const handleDisconnect = useCallback(() => {
        window.electronAPI.disconnect();
    }, []);

    const handleClearChat = useCallback(() => {
        setEvents([]);
        setLatestEvent(null);
    }, []);

    const handleToggleOverlay = useCallback(() => {
        window.electronAPI.toggleOverlay();
    }, []);

    const handleToggleAlwaysOnTop = useCallback((value) => {
        window.electronAPI.setAlwaysOnTop(value);
    }, []);

    return (
        <div className="h-screen p-3 flex flex-col w-full">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-brand-purple/20 rounded-lg">
                        <div className="w-6 h-6 flex items-center justify-center text-brand-purple">
                            <span className="font-black text-sm">LC</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">LIVECAT</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">TikTok Live Assistant</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">System Status</p>
                        <p className="text-xs text-brand-blue font-mono">ALL SYSTEMS NOMINAL</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-700 p-1">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">JD</div>
                    </div>
                </div>
            </header>

            <div className="flex-grow flex flex-col overflow-hidden">
                <ConnectPanel 
                    status={status} 
                    viewerCount={viewerCount}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onClearChat={handleClearChat}
                    onToggleOverlay={handleToggleOverlay}
                    onToggleAlwaysOnTop={handleToggleAlwaysOnTop}
                />
                
                <TTSPanel latestEvent={latestEvent} />

                <ChatFeed events={events} />
            </div>

            <footer className="mt-2 flex justify-between items-center text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                <span>© 2026 LiveCat</span>
                <span className="text-slate-700">v1.0.0</span>
            </footer>

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl animation-fade-in flex items-center gap-3 border backdrop-blur-md ${
                    toast.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 
                    toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 
                    'bg-slate-800/80 border-slate-700 text-white'
                }`}>
                    <div className={`w-2 h-2 rounded-full ${
                        toast.type === 'success' ? 'bg-green-500 animate-pulse' : 
                        toast.type === 'error' ? 'bg-red-500' : 'bg-brand-blue'
                    }`} />
                    <span className="text-sm font-bold">{toast.message}</span>
                </div>
            )}
        </div>
    );
};

export default App;
