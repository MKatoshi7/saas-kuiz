'use client';

import React from 'react';
import { Play, Volume2 } from 'lucide-react';

interface AudioPlayerPreviewProps {
    audioSrc: string;
    playerStyle?: 'whatsapp' | 'mp3' | 'modern' | 'simple';
    avatarSrc?: string;
    senderName?: string;
}

export function AudioPlayerPreview({ audioSrc, playerStyle = 'modern', avatarSrc, senderName }: AudioPlayerPreviewProps) {
    // Estilo WhatsApp
    if (playerStyle === 'whatsapp') {
        return (
            <div className="flex gap-3 items-start max-w-md">
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
                        {/* Botão Play */}
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                            <Play className="w-4 h-4 text-teal-700 fill-current ml-0.5" />
                        </div>

                        {/* Waveform Visual */}
                        <div className="flex-1 flex items-center gap-0.5 h-8">
                            {[...Array(40)].map((_, i) => {
                                const barHeight = Math.random() * 20 + 4;
                                return (
                                    <div
                                        key={i}
                                        className="w-0.5 rounded-full bg-teal-600/30"
                                        style={{ height: `${barHeight}px` }}
                                    />
                                );
                            })}
                        </div>

                        {/* Tempo */}
                        <div className="text-xs text-gray-600 font-mono flex-shrink-0">
                            0:00
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
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-5 shadow-xl text-white">
                    {/* Título */}
                    <div className="text-center mb-4">
                        <div className="text-lg font-bold">{senderName || 'Áudio'}</div>
                        <div className="text-xs opacity-75">MP3 Player</div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="w-full h-1.5 bg-white/30 rounded-full mb-2">
                            <div className="h-full w-0 bg-white rounded-full"></div>
                        </div>
                        <div className="flex justify-between text-xs opacity-75">
                            <span>0:00</span>
                            <span>3:45</span>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center justify-center gap-6">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Volume2 className="w-5 h-5" />
                        </button>

                        <button className="w-14 h-14 rounded-full bg-white text-purple-600 flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                            <Play className="w-7 h-7 fill-current ml-0.5" />
                        </button>

                        <button className="p-2 opacity-50">
                            <Volume2 className="w-5 h-5" />
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
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Wave Background */}
                    <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path d="M0,20 Q25,5 50,20 T100,20 L100,40 L0,40 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <div className="relative text-white text-center">
                            <div className="text-xl font-bold mb-1">{senderName || 'Áudio'}</div>
                            <div className="text-sm opacity-90">Player Moderno</div>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <button className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition-all">
                                <Play className="w-6 h-6 fill-current ml-0.5" />
                            </button>

                            <div className="flex-1">
                                <div className="w-full h-2 bg-gray-200 rounded-lg mb-2">
                                    <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>0:00</span>
                                    <span>3:45</span>
                                </div>
                            </div>

                            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                                <Volume2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Progresso Visual */}
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Estilo Simples (padrão)
    return (
        <div className="max-w-md">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>

                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 mb-1">
                            {senderName || 'Áudio'}
                        </div>
                        <div className="w-full h-1 bg-gray-300 rounded-lg mb-1">
                            <div className="h-full w-0 bg-blue-600 rounded-lg"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>0:00</span>
                            <span>3:45</span>
                        </div>
                    </div>

                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600 flex-shrink-0">
                        <Volume2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
