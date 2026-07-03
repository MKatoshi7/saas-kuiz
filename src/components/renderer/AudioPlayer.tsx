'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
    audioSrc: string;
    playerStyle?: 'whatsapp' | 'mp3' | 'modern' | 'simple' | 'whatsapp2' | 'streaming' | 'simple2';
    avatarSrc?: string;
    senderName?: string;
    audioName?: string;
    autoplay?: boolean;
}

export function AudioPlayer({ audioSrc, playerStyle = 'modern', avatarSrc, senderName, audioName, autoplay }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !audioSrc) return;
        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);
        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);
        if (autoplay) {
            const playPromise = audio.play();
            if (playPromise !== undefined) playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
        return () => { audio.pause(); audio.removeEventListener('timeupdate', updateTime); audio.removeEventListener('loadedmetadata', updateDuration); audio.removeEventListener('ended', handleEnded); };
    }, [audioSrc, autoplay]);

    const togglePlay = () => { const a = audioRef.current; if (!a) return; if (isPlaying) a.pause(); else a.play(); setIsPlaying(!isPlaying); };
    const toggleMute = () => { const a = audioRef.current; if (!a) return; a.muted = !isMuted; setIsMuted(!isMuted); };
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { const a = audioRef.current; if (!a) return; const t = parseFloat(e.target.value); a.currentTime = t; setCurrentTime(t); };
    const formatTime = (s: number) => { if (isNaN(s)) return '0:00'; return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`; };
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // WhatsApp 2 - Mais realista
    if (playerStyle === 'whatsapp2') {
        const waveBars = 35;
        return (
            <div className="flex gap-3 items-end max-w-sm">
                <audio ref={audioRef} src={audioSrc || undefined} />
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : <span className="text-base">🎤</span>}
                </div>
                <div className="flex-1 bg-[#DCF8C6] rounded-xl rounded-bl-sm p-3 shadow-sm relative">
                    <div className="absolute -left-2 bottom-0 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#DCF8C6]" />
                    {senderName && <div className="text-[11px] font-semibold text-emerald-700 mb-1.5">{senderName}</div>}
                    <div className="flex items-center gap-2.5">
                        <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white transition flex-shrink-0">
                            {isPlaying ? <Pause className="w-4 h-4 text-emerald-700 fill-emerald-700" /> : <Play className="w-4 h-4 text-emerald-700 fill-emerald-700 ml-0.5" />}
                        </button>
                        <div className="flex-1 flex items-center gap-[3px] h-7">
                            {Array.from({ length: waveBars }).map((_, i) => {
                                const h = Math.sin(i * 0.5) * 10 + Math.random() * 6 + 4;
                                const active = (i / waveBars) * 100 < progress;
                                return <div key={i} className={`w-[2.5px] rounded-full transition-colors duration-150 ${active ? 'bg-emerald-600' : 'bg-emerald-400/40'}`} style={{ height: `${h}px` }} />;
                            })}
                        </div>
                        <span className="text-[11px] text-emerald-700/70 font-mono flex-shrink-0 tabular-nums">{formatTime(currentTime)}</span>
                    </div>
                    {audioName && <div className="text-[10px] text-emerald-600/60 mt-1.5 truncate">{audioName}</div>}
                </div>
            </div>
        );
    }

    // Streaming (estilo Spotify)
    if (playerStyle === 'streaming') {
        return (
            <div className="max-w-md">
                <audio ref={audioRef} src={audioSrc || undefined} />
                <div className="bg-gradient-to-br from-[#1DB954] to-[#191414] rounded-2xl p-5 shadow-xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center overflow-hidden shadow-lg flex-shrink-0">
                            {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🎵</span>}
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{audioName || senderName || 'Áudio'}</div>
                            <div className="text-xs text-white/60 truncate">{senderName || 'Reproduzindo...'}</div>
                        </div>
                    </div>
                    <div className="mb-3">
                        <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek}
                            className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md" />
                        <div className="flex justify-between text-[10px] text-white/50 mt-1 tabular-nums">
                            <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition text-white/70">
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                        </button>
                        <div className="w-8" />
                    </div>
                </div>
            </div>
        );
    }

    // Simple 2 (estilo Telegram)
    if (playerStyle === 'simple2') {
        return (
            <div className="max-w-md">
                <audio ref={audioRef} src={audioSrc || undefined} />
                <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="w-11 h-11 rounded-full bg-[#2AABEE] text-white flex items-center justify-center hover:bg-[#229ED9] transition shadow-sm flex-shrink-0">
                            {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                            {(audioName || senderName) && <div className="text-xs font-medium text-gray-900 mb-1 truncate">{audioName || senderName}</div>}
                            <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek}
                                className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#2AABEE]" />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1 tabular-nums">
                                <span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Estilo WhatsApp (original)
    if (playerStyle === 'whatsapp') {
        return (
            <div className="flex gap-3 items-start max-w-md">
                <audio ref={audioRef} src={audioSrc || undefined} />
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarSrc ? <img src={avatarSrc} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-white">{senderName?.charAt(0).toUpperCase() || '🎤'}</span>}
                </div>
                <div className="flex-1 bg-[#dcf8c6] rounded-lg rounded-tl-none p-3 shadow-sm">
                    {senderName && <div className="text-xs font-semibold text-teal-700 mb-1">{senderName}</div>}
                    <div className="flex items-center gap-2">
                        <button onClick={togglePlay} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition flex-shrink-0">
                            {isPlaying ? <Pause className="w-4 h-4 text-teal-700 fill-current" /> : <Play className="w-4 h-4 text-teal-700 fill-current ml-0.5" />}
                        </button>
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                            {Array.from({ length: 40 }).map((_, i) => {
                                const h = Math.random() * 20 + 4;
                                return <div key={i} className={`w-0.5 rounded-full transition-all ${(i / 40) * 100 < progress ? 'bg-teal-600' : 'bg-teal-600/30'}`} style={{ height: `${h}px` }} />;
                            })}
                        </div>
                        <div className="text-xs text-gray-600 font-mono flex-shrink-0">{formatTime(currentTime)}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Estilo MP3 Player
    if (playerStyle === 'mp3') {
        return (
            <div className="max-w-md">
                <audio ref={audioRef} src={audioSrc || undefined} />
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-4 shadow-lg text-white">
                    <div className="text-center mb-4">
                        <div className="text-sm font-semibold">{audioName || senderName || 'Áudio'}</div>
                        <div className="text-xs opacity-75">MP3 Player</div>
                    </div>
                    <div className="mb-3">
                        <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white" />
                        <div className="flex justify-between text-xs mt-1 opacity-75"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded-full transition">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
                        <button onClick={togglePlay} className="w-12 h-12 rounded-full bg-white text-purple-600 flex items-center justify-center hover:scale-105 transition shadow-lg">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                        </button>
                        <div className="w-8" />
                    </div>
                </div>
            </div>
        );
    }

    // Estilo Moderno
    if (playerStyle === 'modern') {
        return (
            <div className="max-w-md">
                <audio ref={audioRef} src={audioSrc || undefined} />
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20"><svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M0,20 Q25,5 50,20 T100,20 L100,40 L0,40 Z" fill="currentColor" /></svg></div>
                        <div className="relative text-white text-center">
                            <div className="text-lg font-bold mb-0.5">{audioName || senderName || 'Áudio'}</div>
                            {senderName && <div className="text-xs opacity-75">{senderName}</div>}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center gap-4 mb-3">
                            <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                            </button>
                            <div className="flex-1">
                                <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1 tabular-nums"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                            </div>
                            <button onClick={toggleMute} className="p-3 hover:bg-gray-100 rounded-full transition text-gray-600">
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Estilo Simples (padrão)
    return (
        <div className="max-w-md">
            <audio ref={audioRef} src={audioSrc || undefined} />
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition flex-shrink-0">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 mb-1 truncate">{audioName || senderName || 'Áudio'}</div>
                        <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek} className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer accent-blue-600" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1 tabular-nums"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
                    </div>
                    <button onClick={toggleMute} className="p-2 hover:bg-gray-200 rounded-full transition text-gray-600 flex-shrink-0">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
