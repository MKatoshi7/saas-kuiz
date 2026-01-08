import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Mail, Link2, Check } from 'lucide-react';

export interface SocialShareData {
    title?: string;
    description?: string;
    url?: string;
    hashtags?: string[];
    showCounts?: boolean;
    platforms?: ('facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'email' | 'copy')[];
    layout?: 'horizontal' | 'vertical' | 'grid';
    buttonStyle?: 'solid' | 'outline' | 'minimal';
    size?: 'sm' | 'md' | 'lg';
}

interface SocialShareRendererProps {
    data: SocialShareData;
    className?: string;
}

export function SocialShareRenderer({ data, className = '' }: SocialShareRendererProps) {
    const [copied, setCopied] = React.useState(false);
    const [shareCounts, setShareCounts] = React.useState<Record<string, number>>({});

    const {
        title = 'Confira este quiz incrível!',
        description = 'Faça este quiz e descubra resultados surpreendentes',
        url = typeof window !== 'undefined' ? window.location.href : '',
        hashtags = [],
        showCounts = false,
        platforms = ['facebook', 'twitter', 'linkedin', 'whatsapp', 'email', 'copy'],
        layout = 'horizontal',
        buttonStyle = 'solid',
        size = 'md'
    } = data;

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const hashtagString = hashtags.map(tag => tag.replace('#', '')).join(',');

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}${hashtagString ? `&hashtags=${hashtagString}` : ''}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };

    const platformConfig = {
        facebook: {
            icon: Facebook,
            label: 'Facebook',
            color: 'bg-[#1877F2] hover:bg-[#0C63D4]',
            outlineColor: 'border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white'
        },
        twitter: {
            icon: Twitter,
            label: 'Twitter',
            color: 'bg-[#1DA1F2] hover:bg-[#0C8BD9]',
            outlineColor: 'border-[#1DA1F2] text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white'
        },
        linkedin: {
            icon: Linkedin,
            label: 'LinkedIn',
            color: 'bg-[#0A66C2] hover:bg-[#004182]',
            outlineColor: 'border-[#0A66C2] text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white'
        },
        whatsapp: {
            icon: MessageCircle,
            label: 'WhatsApp',
            color: 'bg-[#25D366] hover:bg-[#1DA851]',
            outlineColor: 'border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white'
        },
        email: {
            icon: Mail,
            label: 'Email',
            color: 'bg-gray-600 hover:bg-gray-700',
            outlineColor: 'border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white'
        },
        copy: {
            icon: copied ? Check : Link2,
            label: copied ? 'Copiado!' : 'Copiar Link',
            color: 'bg-slate-600 hover:bg-slate-700',
            outlineColor: 'border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white'
        }
    };

    const handleShare = async (platform: string) => {
        if (platform === 'copy') {
            try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);

                // Track copy event
                if (typeof window !== 'undefined' && (window as any).trackEvent) {
                    (window as any).trackEvent('share', { platform: 'copy', url });
                }
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        } else {
            const link = shareLinks[platform as keyof typeof shareLinks];
            if (link) {
                window.open(link, '_blank', 'width=600,height=400');

                // Track share event
                if (typeof window !== 'undefined' && (window as any).trackEvent) {
                    (window as any).trackEvent('share', { platform, url });
                }

                // Increment share count (simulated - in production, this would be from API)
                if (showCounts) {
                    setShareCounts(prev => ({
                        ...prev,
                        [platform]: (prev[platform] || 0) + 1
                    }));
                }
            }
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'p-2 text-sm';
            case 'lg':
                return 'p-4 text-lg';
            default:
                return 'p-3 text-base';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return 16;
            case 'lg':
                return 24;
            default:
                return 20;
        }
    };

    const getLayoutClasses = () => {
        switch (layout) {
            case 'vertical':
                return 'flex flex-col gap-2';
            case 'grid':
                return 'grid grid-cols-2 sm:grid-cols-3 gap-2';
            default:
                return 'flex flex-wrap gap-2';
        }
    };

    const getButtonClasses = (platform: string) => {
        const config = platformConfig[platform as keyof typeof platformConfig];
        const baseClasses = `${getSizeClasses()} rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 min-w-[120px]`;

        switch (buttonStyle) {
            case 'outline':
                return `${baseClasses} border-2 ${config.outlineColor} bg-transparent`;
            case 'minimal':
                return `${baseClasses} ${config.outlineColor.replace('border-', 'text-')} hover:bg-opacity-10`;
            default:
                return `${baseClasses} ${config.color} text-white shadow-md hover:shadow-lg`;
        }
    };

    return (
        <div className={`social-share-component ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Share2 size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-800">Compartilhar</h3>
            </div>

            {/* Share Buttons */}
            <div className={getLayoutClasses()}>
                {platforms.map((platform) => {
                    const config = platformConfig[platform];
                    const Icon = config.icon;
                    const count = shareCounts[platform] || 0;

                    return (
                        <button
                            key={platform}
                            onClick={() => handleShare(platform)}
                            className={getButtonClasses(platform)}
                            aria-label={`Compartilhar no ${config.label}`}
                        >
                            <Icon size={getIconSize()} />
                            <span>{config.label}</span>
                            {showCounts && count > 0 && (
                                <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Hashtags Display */}
            {hashtags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                        <span
                            key={index}
                            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                            {tag.startsWith('#') ? tag : `#${tag}`}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SocialShareRenderer;
