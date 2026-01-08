import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { FunnelComponentData } from '@/types/funnel';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableComponent } from './SortableComponent';
import { useDroppable } from '@dnd-kit/core';
import { Image as ImageIcon, Video, Clock, BarChart, FormInput, Loader2, Copy, Edit2, Trash2, GripHorizontal, UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { DevicePreview } from './DevicePreview';
import { ThemedCanvasPreview } from './ThemedCanvasPreview';
import { TextBlock } from './TextBlock';
import { TextToolbar } from './TextToolbar';
import { InlineTextEditor } from './InlineTextEditor';
import { PricingCard } from './PricingCard';
import { AudioPlayerPreview } from './AudioPlayerPreview';
import { UnifiedTextRenderer } from '@/components/renderer/UnifiedTextRenderer';
import { ArgumentRenderer } from '@/components/renderer/FunnelArgumentRenderer';
import { PricingRenderer } from '@/components/renderer/PricingRenderer';
import { PricingComponent } from '@/types/funnel';
import { QuizOptionsRenderer } from '@/components/renderer/QuizOptionsRenderer';
import { CarouselRenderer } from '@/components/renderer/CarouselRenderer';

export function Canvas({ previewDevice }: { previewDevice: 'mobile' | 'desktop' }) {
    // Granular selectors to prevent unnecessary re-renders
    const currentStepId = useBuilderStore((state) => state.currentStepId);
    const components = useBuilderStore((state) => {
        const componentsData = state.currentStepId ? state.componentsByStep[state.currentStepId] : [];
        return Array.isArray(componentsData) ? componentsData : [];
    });
    const selectedComponentId = useBuilderStore((state) => state.selectedComponentId);
    const setSelectedComponent = useBuilderStore((state) => state.setSelectedComponent);
    const duplicateComponent = useBuilderStore((state) => state.duplicateComponent);
    const deleteComponent = useBuilderStore((state) => state.deleteComponent);
    const updateComponent = useBuilderStore((state) => state.updateComponent);

    // Make the canvas droppable
    const { setNodeRef } = useDroppable({
        id: 'canvas-droppable',
    });



    if (!currentStepId) {
        return (
            <div className="flex-1 bg-transparent p-8 overflow-y-auto flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <p className="text-sm font-medium text-gray-900 mb-1">Selecione uma etapa</p>
                    <p className="text-xs">Escolha uma etapa na barra lateral para começar a editar</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-transparent relative overflow-hidden flex flex-col h-full">
            {/* Canvas Content */}
            <div className="flex-1 p-8 overflow-hidden flex justify-center items-center">
                <div
                    ref={setNodeRef}
                    className="w-full h-full flex justify-center items-center"
                >
                    <DevicePreview device={previewDevice}>
                        <ThemedCanvasPreview>
                            <SortableContext
                                items={components.map(c => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {components.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center pt-20">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-black/5">
                                            <UploadCloud className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-900 font-medium text-sm">
                                            Comece a construir
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Arraste componentes da barra lateral
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 min-h-[500px] pb-20">
                                        {components.map((component) => (
                                            <SortableComponent
                                                key={component.id}
                                                id={component.id}
                                                isSelected={selectedComponentId === component.id}
                                                onClick={() => setSelectedComponent(component.id)}
                                            >
                                                <ComponentRenderer
                                                    component={component}
                                                    isSelected={selectedComponentId === component.id}
                                                    onClick={() => setSelectedComponent(component.id)}
                                                    onDuplicate={() => duplicateComponent(component.id)}
                                                    onDelete={() => deleteComponent(component.id)}
                                                    onUpdate={updateComponent}
                                                />
                                            </SortableComponent>
                                        ))}
                                    </div>
                                )}
                            </SortableContext>
                        </ThemedCanvasPreview>
                    </DevicePreview>
                </div>
            </div>
        </div>
    );
}

import '@/styles/button-animations.css';

// ... (imports remain the same)

// Component Renderer with memoization
const ComponentRenderer = React.memo(function ComponentRenderer({
    component,
    isSelected,
    onClick,
    onDuplicate,
    onDelete,
    onUpdate,
}: {
    component: FunnelComponentData;
    isSelected: boolean;
    onClick: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onUpdate: (id: string, data: Partial<FunnelComponentData>) => void;
}) {
    const baseClasses = `cursor-pointer rounded transition-all ${isSelected ? 'ring-2 ring-black bg-black/5' : 'hover:ring-1 hover:ring-black/10'}`;

    return (
        <div className="relative group">
            {/* Black Mini-Menu - Visible on Hover */}
            <div className={`absolute -top-8 right-0 bg-black rounded-t-lg flex items-center gap-0.5 px-1.5 py-1 z-50 shadow-lg transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {/* Drag Handle */}
                <div className="text-white hover:text-white/90 cursor-grab p-1">
                    <GripHorizontal className="w-3 h-3" />
                </div>

                <div className="w-px h-3 bg-white/30 mx-0.5" />

                {/* Edit */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className="text-white hover:text-white/90 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Editar"
                >
                    <Edit2 className="w-3 h-3" />
                </button>

                {/* Duplicate */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="text-white hover:text-white/90 p-1 hover:bg-white/20 rounded transition-colors"
                    title="Duplicar"
                >
                    <Copy className="w-3 h-3" />
                </button>

                {/* Delete */}
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-white hover:text-white/90 p-1 hover:bg-red-500 rounded transition-colors"
                    title="Excluir"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            <div className={baseClasses} onClick={onClick}>
                {renderContent(component, onUpdate, isSelected)}
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if component ID, selection state, or data changed
    return prevProps.component.id === nextProps.component.id &&
        prevProps.isSelected === nextProps.isSelected &&
        JSON.stringify(prevProps.component.data) === JSON.stringify(nextProps.component.data);
});

function renderContent(component: FunnelComponentData, onUpdate: (id: string, data: Partial<FunnelComponentData>) => void, isSelected: boolean) {
    switch (component.type) {
        // ... (other cases remain the same until button)
        case 'headline':
            return (
                <div className="p-2 relative">
                    {isSelected && (
                        <TextToolbar
                            currentData={component.data}
                            onUpdate={(key, value) => onUpdate(component.id, { data: { ...component.data, [key]: value } } as any)}
                            isVisible={true}
                            className="top-0 right-full mr-2"
                        />
                    )}
                    {isSelected ? (
                        <InlineTextEditor
                            value={component.data.text || ''}
                            onChange={(html) => onUpdate(component.id, { data: { ...component.data, text: html } } as any)}
                            className={`font-bold text-gray-900 ${component.data.fontSize === 'huge' ? 'text-4xl' :
                                component.data.fontSize === 'bigger' ? 'text-2xl' :
                                    component.data.fontSize === 'big' ? 'text-xl' :
                                        component.data.fontSize === 'medium' ? 'text-lg' :
                                            component.data.fontSize === 'normal' ? 'text-base' :
                                                component.data.fontSize === 'small' ? 'text-sm' : 'text-base'
                                }`}
                            style={{
                                textAlign: component.data.align as any,
                                color: component.data.color
                            }}
                            placeholder="Digite seu título..."
                        />
                    ) : (
                        <UnifiedTextRenderer
                            text={component.data.text || 'Clique para editar...'}
                            tag="h1"
                            fontSize={component.data.fontSize}
                            align={component.data.align}
                            color={component.data.color}
                            letterSpacing={component.data.letterSpacing}
                            lineHeight={component.data.lineHeight}
                            textTransform={component.data.textTransform}
                            dropShadow={component.data.dropShadow}
                            textStroke={component.data.textStroke}
                        />
                    )}
                </div>
            );

        case 'paragraph':
            return (
                <div className="p-2 relative">
                    {isSelected && (
                        <TextToolbar
                            currentData={component.data}
                            onUpdate={(key, value) => onUpdate(component.id, { data: { ...component.data, [key]: value } } as any)}
                            isVisible={true}
                            className="top-0 right-full mr-2"
                        />
                    )}
                    {isSelected ? (
                        <InlineTextEditor
                            value={component.data.text || ''}
                            onChange={(html) => onUpdate(component.id, { data: { ...component.data, text: html } } as any)}
                            className={`text-gray-600 ${component.data.fontSize === 'huge' ? 'text-4xl' :
                                component.data.fontSize === 'bigger' ? 'text-2xl' :
                                    component.data.fontSize === 'big' ? 'text-xl' :
                                        component.data.fontSize === 'medium' ? 'text-lg' :
                                            component.data.fontSize === 'normal' ? 'text-base' :
                                                component.data.fontSize === 'small' ? 'text-sm' : 'text-base'
                                }`}
                            style={{
                                textAlign: component.data.align as any,
                                color: component.data.color
                            }}
                            placeholder="Digite seu parágrafo..."
                        />
                    ) : (
                        <UnifiedTextRenderer
                            text={component.data.text || 'Clique para editar...'}
                            tag="p"
                            fontSize={component.data.fontSize}
                            align={component.data.align}
                            color={component.data.color}
                            letterSpacing={component.data.letterSpacing}
                            lineHeight={component.data.lineHeight}
                            textTransform={component.data.textTransform}
                            dropShadow={component.data.dropShadow}
                            textStroke={component.data.textStroke}
                        />
                    )}
                </div>
            );

        case 'alert':
            const alertData = component.data as any;
            const alertType = alertData.type || alertData.variant || 'info';
            const alertStyle = alertData.style || 'subtle';
            const alertAnimation = alertData.animation || 'none';

            const alertColors = {
                info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-500' },
                success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-500' },
                warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-500' },
                error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-500' },
                danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-500' },
            };

            const colors = alertColors[alertType as keyof typeof alertColors] || alertColors.info;

            // Animation classes
            const animationClasses = {
                none: '',
                pulse: 'animate-pulse',
                shake: 'animate-shake',
                bounce: 'animate-bounce',
            };

            // Style classes
            let styleClasses = '';
            let styleStyles: React.CSSProperties = {};

            if (alertStyle === 'solid') {
                styleClasses = `text-white rounded-lg p-4 shadow-md`;
                styleStyles = {
                    backgroundColor: alertData.backgroundColor || (alertType === 'info' ? '#3b82f6' : alertType === 'success' ? '#22c55e' : alertType === 'warning' ? '#eab308' : '#ef4444'),
                    borderColor: 'transparent',
                    color: '#ffffff'
                };
            } else if (alertStyle === 'outline') {
                styleClasses = `border-2 rounded-lg p-4 bg-transparent`;
                styleStyles = {
                    borderColor: alertData.borderColor || (alertType === 'info' ? '#3b82f6' : alertType === 'success' ? '#22c55e' : alertType === 'warning' ? '#eab308' : '#ef4444'),
                    color: alertData.textColor || (alertType === 'info' ? '#1e40af' : alertType === 'success' ? '#166534' : alertType === 'warning' ? '#854d0e' : '#991b1b')
                };
            } else if (alertStyle === 'left-border') {
                styleClasses = `border-l-4 rounded-r-lg p-4 ${colors.bg}`;
                styleStyles = {
                    backgroundColor: alertData.backgroundColor,
                    borderLeftColor: alertData.borderColor || (alertType === 'info' ? '#3b82f6' : alertType === 'success' ? '#22c55e' : alertType === 'warning' ? '#eab308' : '#ef4444'),
                    color: alertData.textColor
                };
            } else {
                // Subtle (Default)
                styleClasses = `rounded-lg border ${colors.bg} ${colors.border} p-4`;
                styleStyles = {
                    backgroundColor: alertData.backgroundColor,
                    borderColor: alertData.borderColor,
                    color: alertData.textColor
                };
            }

            const iconPosition = alertData.iconPosition || 'left';
            const isIconTop = iconPosition === 'top';

            return (
                <div className="p-2">
                    <div
                        className={`w-full ${styleClasses} ${animationClasses[alertAnimation as keyof typeof animationClasses] || ''}`}
                        style={styleStyles}
                    >
                        <div className={`flex ${isIconTop ? 'flex-col items-center text-center' : 'items-start text-left'} gap-3`}>
                            {alertData.icon && (
                                <span className={`${isIconTop ? 'text-4xl mb-2' : 'text-xl mt-0.5'} flex-shrink-0`}>{alertData.icon}</span>
                            )}
                            <div className="w-full">
                                {alertData.title && (
                                    <h4 className={`font-bold mb-1 ${isIconTop ? 'text-lg' : 'text-base'}`} style={{ color: 'inherit' }}>
                                        {alertData.title}
                                    </h4>
                                )}
                                <div
                                    className={`font-medium text-sm md:text-base ${alertStyle === 'solid' ? 'text-white' : colors.text}`}
                                    style={{ color: alertStyle === 'solid' ? '#ffffff' : alertData.textColor }}
                                    dangerouslySetInnerHTML={{ __html: alertData.text || 'Texto de destaque...' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'button':
            const btnStyles = component.data.styles || {};
            // Use theme primaryColor as default for buttons
            const themePrimaryColor = useBuilderStore.getState().theme.primaryColor || '#2563EB';
            const bgColor = btnStyles.backgroundColor || themePrimaryColor;
            const txtColor = btnStyles.textColor || '#FFFFFF';
            const btnShadow = btnStyles.shadow || 'md';
            const btnRadius = btnStyles.borderRadius || 'md';
            const btnSize = btnStyles.size || 'md';
            const btnAnimation = btnStyles.animation || 'none';
            const btnSpeed = btnStyles.animationSpeed || 'normal';

            const shadowClasses: Record<string, string> = {
                none: '', sm: 'shadow-sm', md: 'shadow-md',
                lg: 'shadow-lg', xl: 'shadow-xl', '3d': '', glow: ''
            };

            const radiusClasses: Record<string, string> = {
                none: 'rounded-none', sm: 'rounded',
                md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full'
            };

            const sizeClasses: Record<string, string> = {
                sm: 'py-2 px-4 text-sm',
                md: 'py-3 px-6 text-base',
                lg: 'py-4 px-8 text-lg'
            };

            // 3D Effect Logic
            const is3D = btnShadow === '3d';
            const shadowStyle = is3D
                ? `0 4px 0 ${adjustColorBrightness(bgColor, -20)}` // Darker shade for 3D side
                : btnShadow === 'glow'
                    ? `0 0 20px ${bgColor}80`
                    : undefined;

            const transformStyle = is3D ? 'translateY(-2px)' : undefined;
            const activeTransform = is3D ? 'translateY(2px)' : undefined; // This would be for active state, but hard to preview without interaction

            return (
                <div className="p-2">
                    <button
                        className={`w-full font-semibold transition-all hover:opacity-90 
                            ${shadowClasses[btnShadow]} 
                            ${radiusClasses[btnRadius]} 
                            ${sizeClasses[btnSize]}
                            ${btnAnimation !== 'none' ? `animate-button-${btnAnimation} animation-${btnSpeed}` : ''}
                        `}
                        style={{
                            backgroundColor: bgColor,
                            color: txtColor,
                            boxShadow: shadowStyle,
                            transform: transformStyle,
                            marginBottom: is3D ? '4px' : '0', // Compensate for 3D height
                        }}
                    >
                        {component.data.text || 'Clique aqui'}
                    </button>
                </div>
            );

        case 'image':
            const onDrop = async (acceptedFiles: File[], fileRejections: any[], event: any) => {
                const file = acceptedFiles[0];
                if (file) {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const funnelId = useBuilderStore.getState().currentFunnelId;
                        if (funnelId) {
                            formData.append('funnelId', funnelId);
                        } else {
                            console.error('No funnelId found');
                            return;
                        }

                        const response = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error('Upload failed');
                        }

                        const data = await response.json();
                        onUpdate(component.id, { data: { ...component.data, src: data.url } } as any);
                    } catch (error) {
                        console.error('Error uploading image:', error);
                        alert('Erro ao fazer upload da imagem. Tente novamente.');
                    }
                } else if (event?.dataTransfer) {
                    // Handle URL drop
                    const url = event.dataTransfer.getData('text/uri-list') || event.dataTransfer.getData('text/plain');
                    if (url && (url.match(/\.(jpeg|jpg|gif|png|webp)/i) || url.startsWith('http'))) {
                        onUpdate(component.id, { data: { ...component.data, src: url } } as any);
                    }
                }
            };

            const { getRootProps, getInputProps, isDragActive } = useDropzone({
                onDrop,
                accept: { 'image/*': [] },
                maxFiles: 1
            });

            return (
                <div className="p-2">
                    <div {...getRootProps()} className={`relative ${isDragActive ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
                        <input {...getInputProps()} />
                        {component.data.src ? (
                            <div className="relative group/image">
                                <img
                                    src={component.data.src}
                                    alt={component.data.alt || 'Imagem do funil'}
                                    className="rounded-lg object-cover mx-auto"
                                    style={{ width: component.data.width || '100%' }}
                                />
                                {isDragActive && (
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center border-2 border-blue-500 border-dashed">
                                        <span className="text-blue-600 font-semibold bg-white px-4 py-2 rounded-lg shadow-lg">
                                            Solte para substituir a imagem
                                        </span>
                                    </div>
                                )}
                                {!isDragActive && (
                                    <div className="absolute inset-0 opacity-0 group-hover/image:opacity-100 transition-opacity bg-black/50 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-medium bg-blue-600 px-4 py-2 rounded-lg">
                                            Arraste ou clique para alterar
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div
                                className={`w-full h-48 rounded-lg flex items-center justify-center border-2 border-dashed transition-colors cursor-pointer
                                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                            >
                                <div className="text-center text-gray-500">
                                    <ImageIcon className={`w-8 h-8 mx-auto mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="text-sm font-medium">
                                        {isDragActive ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'video':
            const aspectRatio = component.data.aspectRatio || '16:9';
            const aspectRatioClass = {
                '16:9': 'aspect-video',
                '9:16': 'aspect-[9/16]',
                '4:3': 'aspect-[4/3]',
                '1:1': 'aspect-square',
            }[aspectRatio] || 'aspect-video';

            return (
                <div className="p-2">
                    {component.data.url ? (
                        <div className={`${aspectRatioClass} w-full bg-black rounded-lg overflow-hidden relative`}>
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src={component.data.url.replace('watch?v=', 'embed/')}
                                title="Video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : (
                        <div className={`w-full ${aspectRatioClass} bg-gray-900 rounded-lg flex items-center justify-center`}>
                            <div className="text-center text-gray-500">
                                <Video className="w-8 h-8 mx-auto mb-2 text-white" />
                                <span className="text-sm text-white">Vídeo Player</span>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'timer':
            return (
                <div className="p-2">
                    <div className="flex justify-center gap-4 text-center">
                        {['00', '15', '00'].map((val, i) => (
                            <div key={i} className="bg-gray-800 text-white p-2 rounded w-16">
                                <div className="text-xl font-bold">{val}</div>
                                <div className="text-[10px] uppercase text-gray-400">
                                    {['Min', 'Seg', 'Ms'][i]}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'progressbar':
            return (
                <div className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <p className="text-xs text-center mt-1 text-gray-500">50% Completo</p>
                </div>
            );

        case 'input':
            return (
                <div className="p-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-400">
                        <FormInput className="w-4 h-4 mr-2" />
                        <span className="text-sm">Digite seu email...</span>
                    </div>
                </div>
            );

        case 'argument':
            return (
                <div className="p-2">
                    <ArgumentRenderer component={component as any} />
                </div>
            );

        case 'loading':
            const loadingHeight = component.data.height || 'md';
            const loadingRounded = component.data.rounded || 'full';
            const loadingBarColor = component.data.barColor || '#22c55e';
            const loadingTrackColor = component.data.trackColor || '#e2e8f0';
            const loadingTextColor = component.data.textColor || '#1e293b';

            const heightMap: Record<string, string> = {
                sm: 'h-2',
                md: 'h-4',
                lg: 'h-6',
            };

            return (
                <div className="p-4 flex flex-col items-center justify-center text-center">
                    <h2
                        className="text-xl font-bold mb-2"
                        style={{ color: loadingTextColor }}
                    >
                        {component.data.headline || 'Processando...'}
                    </h2>

                    {component.data.subheadline && (
                        <p className="text-gray-500 mb-6 text-sm font-medium opacity-80">
                            {component.data.subheadline}
                        </p>
                    )}

                    <div
                        className={`w-full overflow-hidden shadow-inner ${heightMap[loadingHeight]} ${loadingRounded === 'full' ? 'rounded-full' : loadingRounded === 'md' ? 'rounded-md' : ''}`}
                        style={{ backgroundColor: loadingTrackColor }}
                    >
                        <div
                            className="h-full"
                            style={{
                                width: '50%',
                                backgroundColor: loadingBarColor,
                                boxShadow: `0 0 10px ${loadingBarColor}40`
                            }}
                        />
                    </div>

                    {component.data.showPercentage !== false && (
                        <div className="mt-3 font-mono text-sm font-bold text-gray-400">
                            50%
                        </div>
                    )}

                    <div className="mt-2 text-xs text-gray-400">
                        {(component.data.messages && component.data.messages[0]) || "Conectando ao servidor..."}
                    </div>
                </div>
            );

        case 'carousel':
            return (
                <div className="p-2">
                    <CarouselRenderer component={component as any} />
                </div>
            );

        case 'quiz-option':
            return (
                <div className="p-2">
                    <QuizOptionsRenderer
                        component={component as any}
                        onNext={() => { }}
                        onAnswer={() => { }}
                        theme={useBuilderStore.getState().theme}
                    />
                </div>
            );

        case 'slider':
            return (
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-700">{component.data.label || 'Valor'}</label>
                        <span className="text-lg font-bold text-blue-600">{component.data.defaultValue || component.data.min} {component.data.unit}</span>
                    </div>
                    <input
                        type="range"
                        min={component.data.min}
                        max={component.data.max}
                        defaultValue={component.data.defaultValue || component.data.min}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>{component.data.min} {component.data.unit}</span>
                        <span>{component.data.max} {component.data.unit}</span>
                    </div>
                </div>
            );

        case 'audio':
            return (
                <div className="p-2">
                    <AudioPlayerPreview
                        audioSrc={component.data.url || ''}
                        playerStyle={component.data.playerStyle || 'modern'}
                        avatarSrc={component.data.avatarUrl}
                        senderName={component.data.senderName || 'Áudio'}
                    />
                </div>
            );


        case 'testimonial':
            return (
                <div className="p-2">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex gap-1 mb-3 text-yellow-400">
                            {[...Array(component.data.stars || 5)].map((_, i) => (
                                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <p className="text-gray-600 italic mb-4">"{component.data.text || 'Depoimento incrível do cliente'}"</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                {component.data.author?.charAt(0) || 'A'}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{component.data.author || 'Nome do Cliente'}</div>
                                {component.data.role && <div className="text-xs text-gray-500">{component.data.role}</div>}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'pricing':
            return (
                <div className="p-2">
                    <PricingRenderer
                        component={component as PricingComponent}
                        onSelect={() => { }}
                    />
                </div>
            );

        case 'spacer':
            return (
                <div className="p-2">
                    <div className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-xs text-gray-400" style={{ height: `${component.data.height || 32}px` }}>
                        Espaçamento: {component.data.height || 32}px
                    </div>
                </div>
            );

        case 'code':
            return (
                <div className="p-2">
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Código Personalizado / Pixel</span>
                        </div>
                        <div className="text-gray-500">{'<script>...</script>'}</div>
                    </div>
                </div>
            );



        case 'faq':
            const faqItems = component.data.items || [];

            return (
                <div className="p-4 flex flex-col items-center">
                    <div className="w-full" style={{ maxWidth: component.data.width || '100%' }}>
                        {/* Optional Headline */}
                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                {component.data.headline || 'Perguntas Frequentes'}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {faqItems.length > 0 ? (
                                faqItems.map((item: any) => (
                                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                                            <span className="font-medium text-gray-900">{item.question}</span>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Placeholder
                                <div className="bg-white border border-gray-200 rounded-lg p-4 opacity-50">
                                    <span className="font-medium text-gray-900">Exemplo de pergunta?</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );

        case 'footer':
            const footerBg = component.data.backgroundColor || '#111827';
            const footerText = component.data.textColor || '#ffffff';

            return (
                <div
                    className="p-4 text-center"
                    style={{ backgroundColor: footerBg, color: footerText }}
                >
                    <p className="text-sm">{component.data.text || '© 2024 Todos os direitos reservados'}</p>
                    {component.data.links && component.data.links.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-4 mt-2 text-xs">
                            {component.data.links.map((link: any) => (
                                <span
                                    key={link.id}
                                    style={{ color: footerText, opacity: 0.8 }}
                                >
                                    {link.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            );

        default:
            return (
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 text-center">
                        Componente: {(component as any).type}
                    </p>
                </div>
            );
    }
}

function adjustColorBrightness(hex: string, percent: number): string {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle shorthand hex (#abc -> #aabbcc)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Parse RGB values
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // Adjust brightness (negative = darker, positive = lighter)
    r = Math.max(0, Math.min(255, Math.floor(r * (1 + percent / 100))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 + percent / 100))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 + percent / 100))));

    // Convert back to hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

