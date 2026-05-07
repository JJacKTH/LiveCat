import React, { useState, useEffect, useRef } from 'react';

const Overlay = () => {
    const [events, setEvents] = useState([]);
    const [useGreenScreen, setUseGreenScreen] = useState(true);
    const feedRef = useRef(null);

    useEffect(() => {
        window.electronAPI.onNewEvent((event, data) => {
            setEvents(prev => [...prev.slice(-19), data]); // Keep last 20 events
        });

        window.electronAPI.onStatusChanged((event, status) => {
            if (status === 'disconnected') {
                setEvents([]);
            }
        });
    }, []);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <div 
            className={`h-screen w-screen flex flex-col p-4 transition-colors duration-500 ${useGreenScreen ? 'bg-[#00FF00]' : 'bg-transparent'}`}
            style={{ WebkitAppRegion: 'drag' }}
        >
            <div className="flex justify-between items-center mb-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-2xl">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">LiveCat Overlay (Drag to move)</span>
                </div>
                <button 
                    onClick={() => setUseGreenScreen(!useGreenScreen)}
                    className="text-[8px] font-bold text-white/50 hover:text-white uppercase transition-colors px-2 py-1 bg-white/5 rounded"
                    style={{ WebkitAppRegion: 'no-drag' }}
                >
                    {useGreenScreen ? 'Disable Green' : 'Enable Green'}
                </button>
            </div>

            <div 
                ref={feedRef}
                className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-2"
                style={{ WebkitAppRegion: 'no-drag' }}
            >
                {events.map((event, index) => (
                    <div 
                        key={`${event.timestamp}-${index}`}
                        className="animation-fade-in flex items-start gap-2 bg-black/60 backdrop-blur-sm p-2 rounded-lg border border-white/5 shadow-xl"
                    >
                        {event.avatar && (
                            <img src={event.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="" />
                        )}
                        <div className="flex-grow min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black uppercase tracking-tight ${event.type === 'gift' ? 'text-brand-pink' : 'text-brand-blue'}`}>
                                    {event.nickname || event.username}
                                </span>
                                {event.type === 'gift' && (
                                    <span className="text-[8px] bg-brand-pink text-white px-1 rounded font-black">GIFT</span>
                                )}
                            </div>
                            <p className="text-xs text-white leading-tight font-medium">
                                {event.message} {event.count > 1 ? `x${event.count}` : ''}
                            </p>
                        </div>
                    </div>
                ))}

                {events.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-30">
                        <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] -rotate-90">Waiting for Stream</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Overlay;
