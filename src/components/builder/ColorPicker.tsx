import { useState, useEffect } from 'react';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
    className?: string;
    align?: 'left' | 'right';
}

const PRESET_COLORS = [
    '#000000', '#FFFFFF', '#334155', '#94A3B8',
    '#EF4444', '#F97316', '#F59E0B', '#84CC16',
    '#10B981', '#06B6D4', '#3B82F6', '#6366F1',
    '#8B5CF6', '#D946EF', '#F43F5E', '#881337'
];

const STORAGE_KEY = 'quizk_recent_colors';

export function ColorPicker({ value, onChange, label, className = '', align = 'left' }: ColorPickerProps) {
    const [recentColors, setRecentColors] = useState<string[]>([]);

    // Get theme primary color
    const theme = useBuilderStore((state) => state.theme);
    const primaryColor = theme?.primaryColor || '#2563EB';

    // Load recent colors and listen for storage changes
    useEffect(() => {
        const loadColors = () => {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    setRecentColors(JSON.parse(saved));
                } catch (e) {
                    console.error("Failed to parse recent colors", e);
                }
            }
        };

        loadColors();

        // Listen for storage changes from other components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadColors();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleColorChange = (color: string) => {
        onChange(color);

        // Add to recent colors if not already present
        if (!recentColors.includes(color)) {
            const newColors = [color, ...recentColors].slice(0, 6);
            setRecentColors(newColors);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newColors));

            // Dispatch storage event for other components
            window.dispatchEvent(new StorageEvent('storage', {
                key: STORAGE_KEY,
                newValue: JSON.stringify(newColors)
            }));
        }
    };

    const currentColor = value || '#000000';

    return (
        <div className={className}>
            {label && (
                <label className="text-[10px] text-gray-500 mb-1 block">{label}</label>
            )}

            <Popover>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex items-center gap-2 w-full h-8 px-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        <div
                            className="w-5 h-5 rounded border-2 border-white shadow-sm flex-shrink-0"
                            style={{ backgroundColor: currentColor }}
                        ></div>
                        <span className="text-xs text-gray-600 uppercase flex-1 text-left font-mono">{currentColor}</span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-64 p-3 z-[9999]"
                    align={align === 'right' ? 'end' : 'start'}
                    sideOffset={5}
                >
                    {/* Theme Primary Color (Quick Access) */}
                    <div className="mb-3">
                        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Cor Principal do Tema
                        </div>
                        <button
                            type="button"
                            onClick={() => handleColorChange(primaryColor)}
                            className={`w-full flex items-center gap-2 p-2 rounded-md transition-colors ${currentColor === primaryColor ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
                                }`}
                        >
                            <div
                                className="w-6 h-6 rounded border-2 border-gray-200"
                                style={{ backgroundColor: primaryColor }}
                            ></div>
                            <span className="text-xs font-mono text-gray-700">{primaryColor}</span>
                            {currentColor === primaryColor && <Check size={14} className="ml-auto text-blue-600" />}
                        </button>
                    </div>

                    {/* Recent Colors */}
                    {recentColors.length > 0 && (
                        <div className="mb-3">
                            <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Cores Recentes
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {recentColors.map((color, i) => (
                                    <button
                                        type="button"
                                        key={`recent-${i}`}
                                        onClick={() => handleColorChange(color)}
                                        className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                            }`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        {currentColor === color && (
                                            <Check size={14} className={color === '#FFFFFF' || color === '#ffffff' ? 'text-gray-800' : 'text-white'} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preset Colors */}
                    <div className="mb-3">
                        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-2">
                            Paleta Padrão
                        </div>
                        <div className="grid grid-cols-8 gap-1">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    type="button"
                                    key={color}
                                    onClick={() => handleColorChange(color)}
                                    className={`w-7 h-7 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                >
                                    {currentColor === color && (
                                        <Check size={12} className={color === '#FFFFFF' || color === '#ffffff' ? 'text-gray-800' : 'text-white'} />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div className="pt-2 border-t border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-600 text-xs text-gray-700 group">
                            <Palette size={14} className="text-gray-500 group-hover:text-blue-600" />
                            <span>Escolher cor personalizada...</span>
                            <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => handleColorChange(e.target.value)}
                                className="ml-auto w-6 h-6 rounded border-0 cursor-pointer"
                            />
                        </label>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
