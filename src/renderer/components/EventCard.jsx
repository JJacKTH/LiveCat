import React from 'react';
import { MessageSquare, Gift, LogIn, Heart, Share2, UserPlus } from 'lucide-react';

const EventCard = ({ event }) => {
    const { type, username, nickname, avatar, message, giftName, count, timestamp } = event;
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getIcon = () => {
        switch (type) {
            case 'chat': return <MessageSquare size={14} className="text-brand-blue" />;
            case 'gift': return <Gift size={14} className="text-brand-pink" />;
            case 'join': return <LogIn size={14} className="text-green-400" />;
            case 'like': return <Heart size={14} className="text-red-400" />;
            case 'share': return <Share2 size={14} className="text-orange-400" />;
            case 'follow': return <UserPlus size={14} className="text-brand-purple" />;
            default: return null;
        }
    };

    const getBadgeClass = () => {
        switch (type) {
            case 'chat': return 'bg-brand-blue/20 text-brand-blue border-brand-blue/30';
            case 'gift': return 'bg-brand-pink/20 text-brand-pink border-brand-pink/30 animate-pulse';
            case 'join': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'like': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
        }
    };

    const playTTS = (e) => {
        e.stopPropagation();
        const textToRead = type === 'chat' 
            ? `${nickname} บอกว่า ${message}` 
            : `ขอบคุณ ${nickname} สำหรับ ${giftName || message} ${count > 1 ? count + ' ชิ้น' : ''}`;
        
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textToRead)}&tl=th&client=tw-ob`;
        const audio = new Audio(url);
        audio.play().catch(err => console.error('Manual TTS failed:', err));
    };

    return (
        <div className="animation-fade-in group flex items-start gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border border-transparent hover:border-slate-700/50 transition-all relative">
            <div className="relative">
                {avatar ? (
                    <img src={avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt={username} />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-500">
                        {username?.[0]?.toUpperCase()}
                    </div>
                )}
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-800`}>
                    {getIcon()}
                </div>
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-200 truncate text-sm">
                            {nickname || username}
                        </span>
                        <button 
                            onClick={playTTS}
                            className="p-1 rounded bg-slate-700/50 hover:bg-brand-purple text-slate-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            title="Read aloud"
                        >
                            <Gift size={10} className="rotate-0" /> {/* Reusing an icon for play or MessageSquare */}
                        </button>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{time}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getBadgeClass()}`}>
                        {type}
                    </span>
                    <p className={`text-sm flex flex-wrap items-center gap-2 ${type === 'gift' ? 'text-brand-pink font-bold' : 'text-slate-400'} break-words`}>
                        {message} {count > 1 ? `x${count}` : ''}
                        {event.giftIcon && (
                            <img src={event.giftIcon} className="w-8 h-8 object-contain animate-bounce" alt={giftName} />
                        )}
                        {event.emojis && event.emojis.map((emoji, idx) => (
                            <img key={idx} src={emoji.imageUrl} className="w-6 h-6 object-contain" alt="emoji" />
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
