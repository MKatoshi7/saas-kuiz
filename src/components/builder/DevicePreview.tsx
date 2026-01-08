import { ReactNode } from "react";

interface DevicePreviewProps {
    children: ReactNode;
    device?: "mobile" | "desktop";
}

export function DevicePreview({ children, device = "mobile" }: DevicePreviewProps) {
    return (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center overflow-hidden relative">
            {/* Preview Container - Largura padrão InLead (md = 448px) */}
            <div className={`relative w-full h-full mx-auto transition-all duration-300 ease-in-out transform-gpu ${device === 'mobile' ? 'max-w-md' : 'max-w-5xl'}`}>
                {/* Viewport */}
                <div className="w-full h-full overflow-y-auto overflow-x-hidden">
                    {/* Content */}
                    {children}
                </div>
            </div>
        </div>
    );
}
