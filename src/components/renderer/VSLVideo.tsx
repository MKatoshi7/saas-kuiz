'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface VSLVideoProps {
    url: string;
    thumbnailUrl?: string;
    autoPlay?: boolean;
    loop?: boolean;
    showProgressBar?: boolean;
    progressBarColor?: string;
    playButtonText?: string;
    playButtonTextHtml?: string;
    playButtonColor?: string;
    restartOnClick?: boolean;
    unmuteOnClick?: boolean;
    fakeProgress?: boolean;
    fakeProgressDuration?: number;
    aspectRatio?: '16:9' | '9:16' | '4:3' | '1:1';
}

const ASPECT_MAP: Record<string, string> = {
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
};

export function VSLVideo({
    url,
    thumbnailUrl,
    autoPlay = true,
    loop = true,
    showProgressBar = true,
    progressBarColor = '#2563EB',
    playButtonText = 'CLIQUE PARA OUVIR',
    playButtonTextHtml,
    playButtonColor = '#2563EB',
    restartOnClick = true,
    unmuteOnClick = true,
    fakeProgress = true,
    fakeProgressDuration = 300,
    aspectRatio = '16:9',
}: VSLVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [hasInteracted, setHasInteracted] = useState(false);

    useEffect(() => {
        if (!fakeProgress || !isPlaying) return;
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 98) return prev;
                const increment = 100 / (fakeProgressDuration * 10);
                return prev + increment;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [fakeProgress, isPlaying, fakeProgressDuration]);

    const handleTimeUpdate = () => {
        if (fakeProgress || !videoRef.current) return;
        const current = videoRef.current.currentTime;
        const duration = videoRef.current.duration;
        if (duration) setProgress((current / duration) * 100);
    };

    const handleTogglePlay = () => {
        if (!videoRef.current) return;
        if (!hasInteracted) {
            if (unmuteOnClick) { videoRef.current.muted = false; setIsMuted(false); }
            if (restartOnClick) videoRef.current.currentTime = 0;
            videoRef.current.play();
            setIsPlaying(true);
            setHasInteracted(true);
            if (fakeProgress) setProgress(0);
        } else {
            if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
            else { videoRef.current.pause(); setIsPlaying(false); }
        }
    };

    const aspectClass = ASPECT_MAP[aspectRatio] || 'aspect-video';
    const isVertical = aspectRatio === '9:16';

    return (
        <div className={`relative w-full ${isVertical ? 'max-w-[360px] mx-auto' : ''} ${aspectClass} bg-black rounded-xl overflow-hidden shadow-2xl group cursor-pointer`} onClick={handleTogglePlay}>
            <video
                ref={videoRef}
                src={url}
                poster={thumbnailUrl}
                muted={isMuted}
                autoPlay={autoPlay}
                loop={loop}
                playsInline
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {!hasInteracted && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center transition-all group-hover:bg-black/60 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse"
                            style={{ backgroundColor: playButtonColor }}
                        >
                            <VolumeX className="w-10 h-10" />
                        </div>
                        <div
                            className="px-6 py-3 rounded-full text-white font-bold shadow-lg text-lg tracking-wide"
                            style={{ backgroundColor: playButtonColor }}
                        >
                            {playButtonTextHtml ? <span dangerouslySetInnerHTML={{ __html: playButtonTextHtml }} /> : playButtonText}
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-white text-xs font-bold border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        AO VIVO AGORA
                    </div>
                </div>
            )}

            {showProgressBar && (
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/20">
                    <div
                        className="h-full transition-all duration-300 ease-linear"
                        style={{ width: `${progress}%`, backgroundColor: progressBarColor, boxShadow: `0 0 10px ${progressBarColor}` }}
                    />
                </div>
            )}

            {hasInteracted && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                        {isPlaying ? (
                            <div className="w-8 h-8 flex items-center justify-center">
                                <div className="w-1.5 h-6 bg-white rounded-full mx-0.5" />
                                <div className="w-1.5 h-6 bg-white rounded-full mx-0.5" />
                            </div>
                        ) : (
                            <Play className="w-8 h-8 text-white fill-white" />
                        )}
                    </div>
                </div>
            )}

            {hasInteracted && (
                <button
                    className="absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all"
                    onClick={(e) => { e.stopPropagation(); if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(videoRef.current.muted); } }}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            )}
        </div>
    );
}
