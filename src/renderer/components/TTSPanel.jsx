import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, MessageSquare, Gift } from 'lucide-react';

const TTSPanel = ({ latestEvent }) => {
    const [enabled, setEnabled] = useState(false);
    const [readChat, setReadChat] = useState(true);
    const [readGift, setReadGift] = useState(true);
    const [chatMode, setChatMode] = useState('full'); // 'full' or 'msg'
    const [giftMode, setGiftMode] = useState('full'); // 'full' or 'gift'
    const [volume, setVolume] = useState(0.8);
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
        if (!enabled || !latestEvent) return;

        const shouldSpeak =
            (latestEvent.type === 'chat' && readChat) ||
            (latestEvent.type === 'gift' && readGift);

        if (shouldSpeak) {
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
    }, [latestEvent, enabled, readChat, readGift]);

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
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <button
                            onClick={() => setEnabled(!enabled)}
                            className={`p-2 rounded-full transition-all ${enabled ? 'bg-brand-purple text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}
                        >
                            {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                        {isSpeaking && (
                            <span className="absolute inset-0 rounded-full bg-brand-blue animate-ping opacity-25" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className={`font-bold text-xs transition-colors ${isSpeaking ? 'text-brand-blue' : 'text-white'}`}>
                                {isSpeaking ? 'Speaking...' : 'TTS Reader'}
                            </h3>
                            <button
                                onClick={() => {
                                    queueRef.current.push("ทดสอบระบบเสียงอ่านภาษาไทยครับ");
                                    processQueue();
                                }}
                                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-2 py-0.5 rounded transition-colors"
                            >
                                Test Sound
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <select 
                                value={selectedVoice || ''} 
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="bg-transparent text-[9px] text-slate-500 border-none p-0 cursor-pointer focus:ring-0 outline-none hover:text-slate-300 max-w-[120px] truncate"
                            >
                                {voices.filter(v => v.lang.includes('th') || v.name.includes('Thai')).map(v => (
                                    <option key={v.name} value={v.name} className="bg-slate-900 text-white">{v.name}</option>
                                ))}
                                <optgroup label="All Voices">
                                    {voices.map(v => (
                                        <option key={v.name} value={v.name} className="bg-slate-900 text-white">{v.name} ({v.lang})</option>
                                    ))}
                                </optgroup>
                            </select>
                            
                            <div className="flex items-center gap-2 group/vol flex-grow ml-2">
                                <Volume2 size={10} className="text-slate-500 group-hover/vol:text-slate-300" />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.1" 
                                    value={volume} 
                                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                                    className="flex-grow h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-purple"
                                />
                                <span className="text-[9px] text-slate-500 font-mono w-6 text-right">{Math.round(volume * 100)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 border-t border-slate-700/30 pt-2 mt-1">
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
                            className="bg-slate-800/50 text-[10px] text-slate-400 border-none rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
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
                        <select 
                            value={giftMode} 
                            onChange={(e) => setGiftMode(e.target.value)}
                            className="bg-slate-800/50 text-[10px] text-slate-400 border-none rounded px-2 py-1 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                            <option value="full">ชื่อ + ของขวัญ</option>
                            <option value="gift">ของขวัญอย่างเดียว</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TTSPanel;
