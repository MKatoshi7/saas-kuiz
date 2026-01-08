'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
    audioSrc: string;
    playerStyle?: 'whatsapp' | 'mp3' | 'modern' | 'simple';
    avatarSrc?: string;
    senderName?: string;
    autoplay?: boolean;
}

export function AudioPlayer({ audioSrc, playerStyle = 'modern', avatarSrc, senderName, autoplay }: AudioPlayerProps) {
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
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(() => setIsPlaying(false));
            }
        }

        return () => {
            // Pause and cleanup before unmounting
            audio.pause();
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioSrc, autoplay]);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;
        const time = parseFloat(e.target.value);
        audio.currentTime = time;
        setCurrentTime(time);
    };

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Estilo WhatsApp
    if (playerStyle === 'whatsapp') {
        return (
            <div className="flex gap-3 items-start max-w-md">
                <audio ref={audioRef} src={audioSrc || undefined} />

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt={senderName || 'Avatar'} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-white">
                            {senderName?.charAt(0).toUpperCase() || '🎤'}
                        </span>
                    )}
                </div>

                {/* Mensagem de Áudio */}
                <div className="flex-1 bg-[#dcf8c6] rounded-lg rounded-tl-none p-3 shadow-sm">
                    {senderName && (
                        <div className="text-xs font-semibold text-teal-700 mb-1">{senderName}</div>
                    )}

                    <div className="flex items-center gap-2">
                        {/* Botão Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4 text-teal-700 fill-current" />
                            ) : (
                                <Play className="w-4 h-4 text-teal-700 fill-current ml-0.5" />
                            )}
                        </button>

                        {/* Waveform Visual */}
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                            {[...Array(40)].map((_, i) => {
                                const barHeight = Math.random() * 20 + 4;
                                const isActive = (i / 40) * 100 < progress;
                                return (
                                    <div
                                        key={i}
                                        className={`w-0.5 rounded-full transition-all ${isActive ? 'bg-teal-600' : 'bg-teal-600/30'
                                            }`}
                                        style={{ height: `${barHeight}px` }}
                                    />
                                );
                            })}
                        </div>

                        {/* Tempo */}
                        <div className="text-xs text-gray-600 font-mono flex-shrink-0">
                            {formatTime(currentTime)}
                        </div>
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
                    {/* Título */}
                    <div className="text-center mb-4">
                        <div className="text-sm font-semibold">{senderName || 'Áudio'}</div>
                        <div className="text-xs opacity-75">MP3 Player</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-xs mt-1 opacity-75">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={toggleMute}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-12 h-12 rounded-full bg-white text-purple-600 flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 fill-current" />
                            ) : (
                                <Play className="w-6 h-6 fill-current ml-0.5" />
                            )}
                        </button>

                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Volume2 className="w-5 h-5 opacity-50" />
                        </button>
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
                    {/* Wave Background */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path d="M0,20 Q25,5 50,20 T100,20 L100,40 L0,40 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="relative text-white text-center">
                            <div className="text-lg font-bold mb-1">{senderName || 'Áudio'}</div>
                            <div className="text-sm opacity-75">Player Moderno</div>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button
                                onClick={togglePlay}
                                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all"
                            >
                                {isPlaying ? (
                                    <Pause className="w-6 h-6 fill-current" />
                                ) : (
                                    <Play className="w-6 h-6 fill-current ml-0.5" />
                                )}
                            </button>

                            <div className="flex-1">
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 0}
                                    value={currentTime}
                                    onChange={handleSeek}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{formatTime(currentTime)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            <button
                                onClick={toggleMute}
                                className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>

                        {/* Progresso Visual */}
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                                style={{ width: `${progress}%` }}
                            />
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

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                        ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                    </button>

                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                            {senderName || 'Áudio'}
                        </div>
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600 flex-shrink-0"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
