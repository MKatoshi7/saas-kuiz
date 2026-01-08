import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppAudioProps {
    audioSrc: string;
    avatarSrc?: string;
    senderName?: string;
}

export function WhatsAppAudioPlayer({ audioSrc, avatarSrc, senderName }: WhatsAppAudioProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    const formatTime = (seconds: number) => {
        if (!seconds) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            const total = audioRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    return (
        <div className="flex items-start gap-3 max-w-sm w-full font-sans mx-auto my-4">
            {/* Avatar */}
            <div className="relative shrink-0">
                <img
                    src={avatarSrc || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                    <Mic className="w-3 h-3 text-white" />
                </div>
            </div>

            {/* Message Bubble */}
            <div className="flex-1 bg-white rounded-tr-xl rounded-bl-xl rounded-br-xl shadow-sm border border-gray-100 p-3 relative">
                <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>

                {senderName && <div className="text-xs text-gray-500 mb-1 font-medium">{senderName}</div>}

                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlay}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {isPlaying ? <Pause size={28} fill="#9ca3af" /> : <Play size={28} fill="#9ca3af" />}
                    </button>

                    <div className="flex flex-col w-full gap-1">
                        <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow"
                                style={{ left: `${progress}%` }}
                            />
                        </div>

                        <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                            <span>{formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}</span>
                            <span className="text-blue-400 font-bold text-[10px]">VV</span>
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src={audioSrc}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                />
            </div>
        </div>
    );
}
