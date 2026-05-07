import React, { useEffect, useRef } from 'react';
import EventCard from './EventCard';
import { RefreshCcw } from 'lucide-react';

const ChatFeed = ({ events }) => {
    const feedRef = useRef(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [events]);

    return (
        <div className="flex-grow glass-card rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                <h2 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Live Chat Feed</h2>
                <span className="text-[10px] text-slate-600 bg-slate-800 px-2 py-0.5 rounded uppercase font-mono">Realtime v1.0</span>
            </div>
            <div 
                ref={feedRef}
                className="flex-grow overflow-y-auto custom-scrollbar p-4 space-y-2"
            >
                {events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                        <div className="w-16 h-16 border-2 border-dashed border-slate-700 rounded-full mb-4 flex items-center justify-center">
                             <RefreshCcw className="animate-spin-slow" />
                        </div>
                        <p className="text-sm italic">Waiting for connection...</p>
                    </div>
                ) : (
                    events.map((event, index) => (
                        <EventCard key={`${event.timestamp}-${index}`} event={event} />
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatFeed;
