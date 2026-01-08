import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

interface WhatsAppAudioPlayerProps {
    url: string;
    avatarUrl?: string;
    senderName?: string;
    duration?: number; // Optional duration in seconds
}

export function WhatsAppAudioPlayer({ url, avatarUrl, senderName = 'Áudio', duration }: WhatsAppAudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [audioDuration, setAudioDuration] = useState(duration || 0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.src = url;
        }
    }, [url]);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setCurrentTime(current);
            if (total) {
                setAudioDuration(total);
                setProgress((current / total) * 100);
            }
        }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-start gap-2 max-w-[300px]">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={senderName} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
                        <Mic className="w-5 h-5" />
                    </div>
                )}
            </div>

            {/* Player Bubble */}
            <div className="flex-1 bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 p-2 relative">
                {/* Triangle for bubble */}
                <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent transform rotate-90"></div>

                {/* Sender Name (Optional) */}
                {senderName && <div className="text-xs text-gray-500 mb-1 ml-1 font-medium">{senderName}</div>}

                <div className="flex items-center gap-3">
                    {/* Play/Pause Button */}
                    <button
                        onClick={togglePlay}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                    </button>

                    {/* Progress Bar */}
                    <div className="flex-1 flex flex-col justify-center gap-1">
                        <div className="h-1 bg-gray-200 rounded-full w-full relative overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(audioDuration)}</span>
                        </div>
                    </div>

                    {/* Mic Icon / Speed (Static for now) */}
                    <div className="flex flex-col items-center justify-between h-full pl-1">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Mic className="w-3 h-3 text-white" />
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleEnded}
                    onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
                    className="hidden"
                />
            </div>
        </div>
    );
}
