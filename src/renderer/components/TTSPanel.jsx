import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, MessageSquare, Gift } from 'lucide-react';

const TTSPanel = ({ latestEvent }) => {
    const [enabled, setEnabled] = useState(localStorage.getItem('livecat_tts_enabled') === 'true');
    const [readChat, setReadChat] = useState(localStorage.getItem('livecat_read_chat') !== 'false'); // Default to true
    const [readGift, setReadGift] = useState(localStorage.getItem('livecat_read_gift') !== 'false'); // Default to true
    const [chatMode, setChatMode] = useState(localStorage.getItem('livecat_chat_mode') || 'full'); // 'full' or 'msg'
    const [giftMode, setGiftMode] = useState(localStorage.getItem('livecat_gift_mode') || 'full'); // 'full' or 'gift'
    const [minGiftCoins, setMinGiftCoins] = useState(parseInt(localStorage.getItem('livecat_min_gift_coins')) || 0);
    const [volume, setVolume] = useState(parseFloat(localStorage.getItem('livecat_volume')) || 0.8);
    const [sfxEnabled, setSfxEnabled] = useState(localStorage.getItem('livecat_sfx_enabled') !== 'false');
    const [sfxVolume, setSfxVolume] = useState(parseFloat(localStorage.getItem('livecat_sfx_volume')) || 0.5);

    const SOUNDS = {
        follow: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
        share: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'
    };

    useEffect(() => {
        localStorage.setItem('livecat_tts_enabled', enabled);
    }, [enabled]);

    useEffect(() => {
        localStorage.setItem('livecat_read_chat', readChat);
    }, [readChat]);

    useEffect(() => {
        localStorage.setItem('livecat_read_gift', readGift);
    }, [readGift]);

    useEffect(() => {
        localStorage.setItem('livecat_min_gift_coins', minGiftCoins);
    }, [minGiftCoins]);

    useEffect(() => {
        localStorage.setItem('livecat_chat_mode', chatMode);
    }, [chatMode]);

    useEffect(() => {
        localStorage.setItem('livecat_gift_mode', giftMode);
    }, [giftMode]);

    useEffect(() => {
        localStorage.setItem('livecat_volume', volume);
    }, [volume]);

    useEffect(() => {
        localStorage.setItem('livecat_sfx_enabled', sfxEnabled);
    }, [sfxEnabled]);

    useEffect(() => {
        localStorage.setItem('livecat_sfx_volume', sfxVolume);
    }, [sfxVolume]);
    const queueRef = useRef([]);
    const speakingRef = useRef(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            
            // Auto-select Thai voice if not already selected
            if (!selectedVoice) {
                const thaiVoice = availableVoices.find(v => v.lang.includes('th') || v.name.includes('Thai'));
                if (thaiVoice) setSelectedVoice(thaiVoice.name);
            }
        };

        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [selectedVoice]);

    useEffect(() => {
        if (!latestEvent) return;

        // Handle Sound Effects (SFX)
        if (sfxEnabled && (latestEvent.type === 'follow' || latestEvent.type === 'share')) {
            const audio = new Audio(SOUNDS[latestEvent.type]);
            audio.volume = sfxVolume;
            audio.play().catch(e => console.error('SFX Playback error:', e));
        }

        if (!enabled) return;

        const shouldSpeak =
            (latestEvent.type === 'chat' && readChat) ||
            (latestEvent.type === 'gift' && readGift);

        if (shouldSpeak) {
            // Gift Filter
            if (latestEvent.type === 'gift' && latestEvent.diamondCount < minGiftCoins) {
                return;
            }

            // Special handling for gift streaks: only speak when the streak is finished
            if (latestEvent.type === 'gift' && latestEvent.repeatEnd === false) {
                return;
            }

            let text = '';
            if (latestEvent.type === 'chat') {
                text = chatMode === 'full' 
                    ? `${latestEvent.nickname} บอกว่า ${latestEvent.message}`
                    : `${latestEvent.message}`;
            } else if (latestEvent.type === 'gift') {
                const countText = latestEvent.count > 1 ? ` ${latestEvent.count} ชิ้น` : '';
                text = giftMode === 'full'
                    ? `ขอบคุณ ${latestEvent.nickname} สำหรับ ${latestEvent.giftName}${countText}`
                    : `${latestEvent.giftName}${countText}`;
            }

            queueRef.current.push(text);
            processQueue();
        }
    }, [latestEvent, enabled, readChat, readGift, minGiftCoins, sfxEnabled, sfxVolume]);

    const processQueue = () => {
        if (speakingRef.current || queueRef.current.length === 0) {
            if (queueRef.current.length === 0) setIsSpeaking(false);
            return;
        }

        speakingRef.current = true;
        setIsSpeaking(true);
        const text = queueRef.current.shift();
        
        // Use the Main-process TTS proxy which is much more robust
        window.electronAPI.getTTSAudio(text)
            .then(audioData => {
                const audio = new Audio(audioData);
                audio.volume = volume;
                
                audio.onended = () => {
                    speakingRef.current = false;
                    processQueue();
                };

                audio.onerror = (e) => {
                    console.error('Audio playback error:', e);
                    speakingRef.current = false;
                    processQueue();
                };

                return audio.play();
            })
            .catch(err => {
                console.error('TTS IPC error, trying system fallback:', err);
                
                // Final fallback to system TTS if even IPC fails
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.volume = volume;
                const availableVoices = window.speechSynthesis.getVoices();
                const voice = availableVoices.find(v => v.name === selectedVoice) || 
                            availableVoices.find(v => v.lang.includes('th') || v.name.includes('Thai'));
                
                if (voice) {
                    utterance.voice = voice;
                    utterance.lang = voice.lang;
                } else {
                    utterance.lang = 'th-TH';
                }
                
                utterance.onend = () => {
                    speakingRef.current = false;
                    processQueue();
                };
                utterance.onerror = () => {
                    speakingRef.current = false;
                    processQueue();
                };
                window.speechSynthesis.speak(utterance);
            });
    };

    return (
        <div className={`glass-card px-4 py-3 rounded-lg flex flex-col gap-3 mb-4 border-l-2 transition-all duration-300 ${isSpeaking ? 'border-brand-blue shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-brand-purple'}`}>
            <div className="flex items-start gap-4">
                {/* Power Toggle Button */}
                <div className="relative mt-1">
                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                            enabled 
                            ? 'bg-gradient-to-br from-brand-purple to-brand-blue text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] rotate-0' 
                            : 'bg-slate-800 text-slate-600 grayscale rotate-12 opacity-50'
                        } hover:scale-110 active:scale-95 group`}
                        title={enabled ? "Disable TTS" : "Enable TTS"}
                    >
                        {enabled ? <Volume2 size={24} className="group-hover:animate-bounce" /> : <VolumeX size={24} />}
                    </button>
                    {enabled && isSpeaking && (
                        <span className="absolute -inset-1 rounded-2xl bg-brand-blue animate-ping opacity-20 pointer-events-none" />
                    )}
                </div>

                {/* Main Controls Area */}
                <div className="flex-grow space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-black text-sm tracking-tighter transition-colors ${isSpeaking ? 'text-brand-blue' : 'text-white'}`}>
                                        {isSpeaking ? 'SPEAKING...' : 'TTS READER'}
                                    </h3>
                                    {enabled && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />}
                                </div>
                                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Google Translate AI</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                queueRef.current.push("ทดสอบระบบเสียงอ่านภาษาไทยครับ");
                                processQueue();
                            }}
                            className="group relative overflow-hidden px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700/50 active:scale-95"
                        >
                            <span className="relative z-10 text-[10px] font-black text-slate-400 group-hover:text-white transition-colors">TEST SOUND</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 to-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    <div className="relative group/vol">
                        <div className="absolute inset-0 bg-brand-purple/5 blur-xl rounded-full opacity-0 group-hover/vol:opacity-100 transition-opacity" />
                        <div className="relative flex items-center gap-3 bg-slate-900/60 p-2 px-4 rounded-xl border border-slate-700/50 shadow-inner backdrop-blur-sm">
                            <Volume2 size={16} className={`transition-colors ${volume > 0.5 ? 'text-brand-purple' : 'text-slate-500'}`} />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="flex-grow h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                            />
                            <div className="min-w-[40px] text-right">
                                <span className="text-xs font-black text-brand-purple drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                    {Math.round(volume * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-700/30 pt-2 mt-1">
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 flex-grow">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={readChat}
                                onChange={() => setReadChat(!readChat)}
                                className="hidden"
                            />
                            <div className={`p-1 px-2 rounded-md transition-colors flex items-center gap-2 ${readChat ? 'bg-brand-blue/20 text-brand-blue' : 'bg-slate-800 text-slate-600'}`}>
                                <MessageSquare size={12} />
                                <span className="text-[10px] font-bold">Chat</span>
                            </div>
                        </label>
                        {readChat && (
                            <select 
                                value={chatMode} 
                                onChange={(e) => setChatMode(e.target.value)}
                                className="appearance-none bg-slate-800/50 text-[10px] text-slate-400 border-none rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-800 transition-colors text-center"
                            >
                                <option value="full">ชื่อ + ข้อความ</option>
                                <option value="msg">ข้อความอย่างเดียว</option>
                            </select>
                        )}
                    </div>

                    <div className="flex items-center gap-2 flex-grow">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={readGift}
                                onChange={() => setReadGift(!readGift)}
                                className="hidden"
                            />
                            <div className={`p-1 px-2 rounded-md transition-colors flex items-center gap-2 ${readGift ? 'bg-brand-pink/20 text-brand-pink' : 'bg-slate-800 text-slate-600'}`}>
                                <Gift size={12} />
                                <span className="text-[10px] font-bold">Gift</span>
                            </div>
                        </label>
                        {readGift && (
                            <div className="flex items-center gap-1">
                                <select 
                                    value={giftMode} 
                                    onChange={(e) => setGiftMode(e.target.value)}
                                    className="appearance-none bg-slate-800/50 text-[10px] text-slate-400 border-none rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-800 transition-colors text-center"
                                >
                                    <option value="full">ชื่อ+ของ</option>
                                    <option value="gift">ของอย่างเดียว</option>
                                </select>
                                <div className="flex items-center gap-1 bg-slate-800/50 rounded px-1.5 py-0.5 border border-slate-700/50">
                                    <span className="text-[9px] text-slate-500 font-bold">Min</span>
                                    <input 
                                        type="number" 
                                        value={minGiftCoins} 
                                        onChange={(e) => setMinGiftCoins(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-8 bg-transparent text-[10px] text-brand-pink font-bold border-none outline-none p-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-slate-900/40 p-1.5 px-3 rounded-lg border border-slate-700/30">
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={sfxEnabled}
                                onChange={() => setSfxEnabled(!sfxEnabled)}
                                className="hidden"
                            />
                            <div className={`flex items-center gap-2 ${sfxEnabled ? 'text-brand-purple' : 'text-slate-600'}`}>
                                <Volume2 size={12} className={sfxEnabled ? 'animate-pulse' : ''} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Sound Alerts (SFX)</span>
                            </div>
                        </label>
                    </div>
                    
                    {sfxEnabled && (
                        <div className="flex items-center gap-3 flex-grow max-w-[150px]">
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={sfxVolume} 
                                onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                                title="SFX Volume"
                            />
                            <span className="text-[9px] font-bold text-slate-500 min-w-[24px]">{Math.round(sfxVolume * 100)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TTSPanel;
