'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Trash2, Bold, Italic, Underline } from 'lucide-react';
import { QuizOptionProperties } from './QuizOptionProperties';
import { QuizOptionComponent, ArgumentComponent, FAQComponent, CarouselComponent } from '@/types/funnel';
import { ArgumentProperties } from './ArgumentProperties';
import { FAQProperties } from './FAQProperties';
import { CarouselProperties } from './CarouselProperties';
import { FooterProperties } from './FooterProperties';
import { TextStyleToolbar } from './TextStyleToolbar';
import { RichTextEditor } from './RichTextEditor';
import { FullTextProperties } from './FullTextProperties';
import { ColorPickerWithPalette } from './ColorPickerWithPalette';
import { ImageUploadWithPreview } from './ImageUploadWithPreview';
import { VideoUploadWithPreview } from './VideoUploadWithPreview';
import EmojiPicker from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export function PropertiesPanel({ funnelId }: { funnelId?: string }) {
    const { selectedComponentId, deleteComponent, setSelectedComponent } = useBuilderStore();
    const componentsData = useBuilderStore((state) => state.getCurrentComponents());
    const components = Array.isArray(componentsData) ? componentsData : [];
    const updateComponent = useBuilderStore((state) => state.updateComponent);
    const steps = useBuilderStore((state) => state.steps);

    const selectedComponent = components.find((c) => c.id === selectedComponentId);

    if (!selectedComponent) {
        return (
            <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-black/5 p-4 z-20">
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <p className="text-sm font-medium text-gray-900 mb-1">Nenhum componente selecionado</p>
                    <p className="text-xs">Clique em um componente no canvas para editar</p>
                </div>
            </div>
        );
    }

    const handleUpdate = (field: string, value: any) => {
        updateComponent(selectedComponent.id, {
            ...selectedComponent,
            data: { ...selectedComponent.data, [field]: value },
        } as any);
    };

    return (
        <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-black/5 overflow-y-auto h-full z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-10">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Propriedades</h3>
                <button
                    onClick={() => setSelectedComponent(null)}
                    className="text-gray-400 hover:text-black transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="p-4">
                <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-xs text-gray-500 uppercase font-medium mb-1">Tipo</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedComponent.type}</p>
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                        <TabsTrigger value="style">Estilo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-4 mt-4">
                        {selectedComponent.type === 'headline' && (
                            <>
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Texto do Título
                                    </label>
                                    <RichTextEditor
                                        value={selectedComponent.data.text || ''}
                                        onChange={(html) => handleUpdate('text', html)}
                                        placeholder="Digite seu título aqui..."
                                        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] bg-white"
                                        isBold={selectedComponent.data.bold}
                                        isItalic={selectedComponent.data.italic}
                                        isUnderline={selectedComponent.data.underline}
                                        isStrikethrough={selectedComponent.data.strikethrough}
                                        color={selectedComponent.data.color}
                                        backgroundColor={selectedComponent.data.backgroundColor}
                                        onBoldToggle={() => handleUpdate('bold', !selectedComponent.data.bold)}
                                        onItalicToggle={() => handleUpdate('italic', !selectedComponent.data.italic)}
                                        onUnderlineToggle={() => handleUpdate('underline', !selectedComponent.data.underline)}
                                        onStrikethroughToggle={() => handleUpdate('strikethrough', !selectedComponent.data.strikethrough)}
                                    />
                                </div>

                                <FullTextProperties
                                    data={selectedComponent.data}
                                    onUpdate={handleUpdate}
                                />

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: titulo_principal"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'paragraph' && (
                            <>
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Texto do Parágrafo
                                    </label>
                                    <RichTextEditor
                                        value={selectedComponent.data.text || ''}
                                        onChange={(html) => handleUpdate('text', html)}
                                        placeholder="Digite seu parágrafo aqui..."
                                        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] bg-white"
                                        isBold={selectedComponent.data.bold}
                                        isItalic={selectedComponent.data.italic}
                                        isUnderline={selectedComponent.data.underline}
                                        isStrikethrough={selectedComponent.data.strikethrough}
                                        color={selectedComponent.data.color}
                                        backgroundColor={selectedComponent.data.backgroundColor}
                                        onBoldToggle={() => handleUpdate('bold', !selectedComponent.data.bold)}
                                        onItalicToggle={() => handleUpdate('italic', !selectedComponent.data.italic)}
                                        onUnderlineToggle={() => handleUpdate('underline', !selectedComponent.data.underline)}
                                        onStrikethroughToggle={() => handleUpdate('strikethrough', !selectedComponent.data.strikethrough)}
                                    />
                                </div>

                                <FullTextProperties
                                    data={selectedComponent.data}
                                    onUpdate={handleUpdate}
                                />

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: paragrafo_intro"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'alert' && (
                            <>
                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Texto do Destaque
                                    </label>
                                    <RichTextEditor
                                        value={selectedComponent.data.text || ''}
                                        onChange={(html) => handleUpdate('text', html)}
                                        placeholder="Digite o texto de destaque..."
                                        className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] bg-white"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Tipo de Destaque
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.type || 'info'}
                                        onChange={(e) => handleUpdate('type', e.target.value)}
                                    >
                                        <option value="info">Info (Azul)</option>
                                        <option value="success">Sucesso (Verde)</option>
                                        <option value="warning">Aviso (Amarelo)</option>
                                        <option value="error">Erro (Vermelho)</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Cor de Fundo</label>
                                        <input
                                            type="color"
                                            value={selectedComponent.data.backgroundColor || '#EFF6FF'}
                                            onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Cor da Borda</label>
                                        <input
                                            type="color"
                                            value={selectedComponent.data.borderColor || '#BFDBFE'}
                                            onChange={(e) => handleUpdate('borderColor', e.target.value)}
                                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Cor do Texto</label>
                                        <input
                                            type="color"
                                            value={selectedComponent.data.textColor || '#1E3A8A'}
                                            onChange={(e) => handleUpdate('textColor', e.target.value)}
                                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: alerta_destaque"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'image' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Upload de Imagem
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        handleUpdate('src', event.target?.result);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <div className="text-gray-500 text-sm">
                                            <span className="block font-medium text-blue-600">Clique para enviar</span>
                                            ou arraste e solte
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Largura
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.width || '100%'}
                                        onChange={(e) => handleUpdate('width', e.target.value)}
                                    >
                                        <option value="100%">100% (Largura Total)</option>
                                        <option value="75%">75%</option>
                                        <option value="50%">50% (Metade)</option>
                                        <option value="25%">25%</option>
                                        <option value="300px">Pequeno (300px)</option>
                                        <option value="500px">Médio (500px)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Texto Alternativo (Alt)
                                    </label>
                                    <Input
                                        value={selectedComponent.data.alt || ''}
                                        onChange={(e) => handleUpdate('alt', e.target.value)}
                                        placeholder="Descrição da imagem"
                                    />
                                </div>
                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: imagem_produto"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'button' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Texto do Botão
                                    </label>
                                    <Input
                                        value={selectedComponent.data.text}
                                        onChange={(e) => handleUpdate('text', e.target.value)}
                                        placeholder="Clique aqui"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Ação
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.action}
                                        onChange={(e) => handleUpdate('action', e.target.value)}
                                    >
                                        <option value="next_step">Próxima Etapa</option>
                                        <option value="jump_to_step">Ir para etapa específica</option>
                                        <option value="submit_funnel">Enviar formulário / Finalizar</option>
                                        <option value="open_url">Abrir Link Externo</option>
                                    </select>
                                </div>

                                {selectedComponent.data.action === 'jump_to_step' && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">
                                            Etapa de Destino
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedComponent.data.targetStepId || ''}
                                            onChange={(e) => handleUpdate('targetStepId', e.target.value)}
                                        >
                                            <option value="">Selecione uma etapa...</option>
                                            {steps.map((step, index) => (
                                                <option key={step.id} value={step.id}>
                                                    {index + 1}. {step.title}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Escolha para qual etapa o usuário será direcionado
                                        </p>
                                    </div>
                                )}

                                {selectedComponent.data.action === 'open_url' && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">
                                            URL
                                        </label>
                                        <Input
                                            value={selectedComponent.data.targetUrl || ''}
                                            onChange={(e) => handleUpdate('targetUrl', e.target.value)}
                                            placeholder="https://exemplo.com"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        ⏱️ Delay para Aparecer (segundos)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={selectedComponent.data.delay || 0}
                                        onChange={(e) => handleUpdate('delay', Number(e.target.value))}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Tempo em segundos antes do botão aparecer (0 = aparece imediatamente)
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: botao_cta"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'video' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        URL do Vídeo (YouTube)
                                    </label>
                                    <Input
                                        value={selectedComponent.data.url || ''}
                                        onChange={(e) => handleUpdate('url', e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Cole o link do vídeo do YouTube aqui.
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Proporção (Aspect Ratio)
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.aspectRatio || '16:9'}
                                        onChange={(e) => handleUpdate('aspectRatio', e.target.value)}
                                    >
                                        <option value="16:9">16:9 (Padrão / YouTube)</option>
                                        <option value="9:16">9:16 (Vertical / Shorts / Reels)</option>
                                        <option value="4:3">4:3 (Retrato)</option>
                                        <option value="1:1">1:1 (Quadrado)</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: video_vsl"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'image' && (
                            <>
                                <div>
                                    <ImageUploadWithPreview
                                        label="Imagem"
                                        value={selectedComponent.data.src || ''}
                                        onChange={(url) => handleUpdate('src', url)}
                                        onUploadComplete={(data) => {
                                            handleUpdate('src', data.url);
                                            handleUpdate('publicId', data.publicId);
                                        }}
                                        placeholder="https://exemplo.com/imagem.jpg"
                                        helpText="Arraste ou cole a URL da imagem"
                                        previewShape="rounded"
                                        funnelId={funnelId}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">
                                        Texto Alternativo (Alt)
                                    </label>
                                    <Input
                                        value={selectedComponent.data.alt || ''}
                                        onChange={(e) => handleUpdate('alt', e.target.value)}
                                        placeholder="Descrição da imagem"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'quiz-option' && (
                            <QuizOptionProperties component={selectedComponent as QuizOptionComponent} />
                        )}

                        {selectedComponent.type === 'argument' && (
                            <ArgumentProperties component={selectedComponent as ArgumentComponent} />
                        )}

                        {selectedComponent.type === 'faq' && (
                            <FAQProperties component={selectedComponent as FAQComponent} />
                        )}

                        {selectedComponent.type === 'input' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Tipo de Input</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.inputType || 'text'}
                                        onChange={(e) => handleUpdate('inputType', e.target.value)}
                                    >
                                        <option value="text">Texto Curto</option>
                                        <option value="email">Email</option>
                                        <option value="tel">Telefone</option>
                                        <option value="number">Número</option>
                                        <option value="date">Data</option>
                                        <option value="textarea">Texto Longo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Rótulo (Label)</label>
                                    <Input
                                        value={selectedComponent.data.label || ''}
                                        onChange={(e) => handleUpdate('label', e.target.value)}
                                        placeholder="Ex: Nome Completo"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Placeholder</label>
                                    <Input
                                        value={selectedComponent.data.placeholder || ''}
                                        onChange={(e) => handleUpdate('placeholder', e.target.value)}
                                        placeholder="Ex: Digite aqui..."
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="Ex: user_name"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'slider' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Rótulo</label>
                                    <Input
                                        value={selectedComponent.data.label || ''}
                                        onChange={(e) => handleUpdate('label', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Mínimo</label>
                                        <Input
                                            type="number"
                                            value={selectedComponent.data.min || 0}
                                            onChange={(e) => handleUpdate('min', Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Máximo</label>
                                        <Input
                                            type="number"
                                            value={selectedComponent.data.max || 100}
                                            onChange={(e) => handleUpdate('max', Number(e.target.value))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Unidade</label>
                                    <Input
                                        value={selectedComponent.data.unit || ''}
                                        onChange={(e) => handleUpdate('unit', e.target.value)}
                                        placeholder="Ex: cm, kg, %"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'audio' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Upload de Áudio</label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative group"
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                                        }}
                                        onDragLeave={(e) => {
                                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                            const file = e.dataTransfer.files?.[0];
                                            if (file && file.type.startsWith('audio/')) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    handleUpdate('url', event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            } else {
                                                alert('Por favor, envie um arquivo de áudio válido (MP3, WAV, OGG)');
                                            }
                                        }}
                                    >
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        handleUpdate('url', event.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        <div className="text-gray-500 text-sm space-y-2">
                                            <div className="text-3xl">🎵</div>
                                            <div>
                                                <span className="block font-medium text-blue-600">Clique para enviar</span>
                                                ou arraste e solte
                                            </div>
                                            <div className="text-xs text-gray-400">MP3, WAV, OGG</div>
                                        </div>
                                    </div>

                                    {selectedComponent.data.url && (
                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700 flex items-center justify-between">
                                            <span>✓ Áudio carregado</span>
                                            <button
                                                onClick={() => handleUpdate('url', '')}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                Remover
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white px-2 text-gray-400">ou use URL externa</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">URL do Áudio</label>
                                    <Input
                                        value={selectedComponent.data.url?.startsWith('data:') ? '' : (selectedComponent.data.url || '')}
                                        onChange={(e) => handleUpdate('url', e.target.value)}
                                        placeholder="https://exemplo.com/audio.mp3"
                                        disabled={selectedComponent.data.url?.startsWith('data:')}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Cole o link direto para o arquivo de áudio
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Estilo do Player</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.playerStyle || 'modern'}
                                        onChange={(e) => handleUpdate('playerStyle', e.target.value)}
                                    >
                                        <option value="whatsapp">🟢 Estilo WhatsApp</option>
                                        <option value="mp3">💿 Estilo MP3 Player</option>
                                        <option value="modern">✨ Estilo Moderno</option>
                                        <option value="simple">📱 Estilo Simples</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Escolha o visual do player de áudio
                                    </p>
                                </div>

                                {selectedComponent.data.playerStyle === 'whatsapp' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Nome do Remetente</label>
                                            <Input
                                                value={selectedComponent.data.senderName || ''}
                                                onChange={(e) => handleUpdate('senderName', e.target.value)}
                                                placeholder="Ex: João Silva"
                                            />
                                        </div>

                                        <div>
                                            <ImageUploadWithPreview
                                                label="Avatar"
                                                value={selectedComponent.data.avatarUrl || ''}
                                                onChange={(url) => handleUpdate('avatarUrl', url)}
                                                previewShape="circle"
                                                previewSize="md"
                                                helpText="Arraste ou cole a URL da imagem"
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedComponent.data.autoplay || false}
                                        onChange={(e) => handleUpdate('autoplay', e.target.checked)}
                                        id="autoplay-audio"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: audio_player"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'alert' && (
                            <>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1">Conteúdo</h4>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Título do Destaque</label>
                                        <Input
                                            value={selectedComponent.data.title || ''}
                                            onChange={(e) => handleUpdate('title', e.target.value)}
                                            placeholder="Garantia de..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Texto do Destaque</label>
                                        <RichTextEditor
                                            value={selectedComponent.data.text || ''}
                                            onChange={(html) => handleUpdate('text', html)}
                                            placeholder="Digite o texto do alerta..."
                                            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Tipo de Destaque</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            value={selectedComponent.data.variant || 'warning'}
                                            onChange={(e) => handleUpdate('variant', e.target.value)}
                                        >
                                            <option value="warning">Amarelo (Aviso)</option>
                                            <option value="danger">Vermelho (Perigo)</option>
                                            <option value="info">Azul (Info)</option>
                                            <option value="success">Verde (Sucesso)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-6">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1">Estilo</h4>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Estilo Visual</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.style || 'subtle'}
                                                onChange={(e) => handleUpdate('style', e.target.value)}
                                            >
                                                <option value="subtle">Sutil (Padrão)</option>
                                                <option value="solid">Sólido</option>
                                                <option value="outline">Borda</option>
                                                <option value="left-border">Borda Esquerda</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Animação</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.animation || 'none'}
                                                onChange={(e) => handleUpdate('animation', e.target.value)}
                                            >
                                                <option value="none">Nenhuma</option>
                                                <option value="pulse">Pulsar</option>
                                                <option value="shake">Tremer</option>
                                                <option value="bounce">Saltar</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Posição do Ícone</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.iconPosition || 'left'}
                                                onChange={(e) => handleUpdate('iconPosition', e.target.value)}
                                            >
                                                <option value="left">Esquerda</option>
                                                <option value="top">Topo</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Ícone/Emoji</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={selectedComponent.data.icon || ''}
                                                    onChange={(e) => handleUpdate('icon', e.target.value)}
                                                    placeholder="Ex: ⚠️"
                                                    className="flex-1"
                                                />
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                                                            <Smile className="h-4 w-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-full p-0 border-none" align="end">
                                                        <EmojiPicker
                                                            onEmojiClick={(emojiData) => handleUpdate('icon', emojiData.emoji)}
                                                            width="100%"
                                                            height={350}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-6">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1">Cores Personalizadas</h4>

                                    <ColorPickerWithPalette
                                        label="Cor de Fundo"
                                        value={selectedComponent.data.backgroundColor || ''}
                                        onChange={(color) => handleUpdate('backgroundColor', color)}
                                    />

                                    <ColorPickerWithPalette
                                        label="Cor da Borda"
                                        value={selectedComponent.data.borderColor || ''}
                                        onChange={(color) => handleUpdate('borderColor', color)}
                                    />

                                    <ColorPickerWithPalette
                                        label="Cor do Texto"
                                        value={selectedComponent.data.textColor || ''}
                                        onChange={(color) => handleUpdate('textColor', color)}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: alerta_destaque"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'testimonial' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Depoimento</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                                        value={selectedComponent.data.text || ''}
                                        onChange={(e) => handleUpdate('text', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Autor</label>
                                    <Input
                                        value={selectedComponent.data.author || ''}
                                        onChange={(e) => handleUpdate('author', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Função/Cargo</label>
                                    <Input
                                        value={selectedComponent.data.role || ''}
                                        onChange={(e) => handleUpdate('role', e.target.value)}
                                        placeholder="Ex: CEO, Cliente VIP"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Avatar</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                                            {selectedComponent.data.avatarUrl ? (
                                                <img src={selectedComponent.data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Foto</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:bg-gray-50 transition-colors relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (event) => {
                                                                handleUpdate('avatarUrl', event.target?.result);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                                <span className="text-xs text-blue-600 font-medium">Upload Foto</span>
                                            </div>
                                        </div>
                                        {selectedComponent.data.avatarUrl && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500"
                                                onClick={() => handleUpdate('avatarUrl', '')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Estrelas (1-5)</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={selectedComponent.data.stars || 5}
                                        onChange={(e) => handleUpdate('stars', Number(e.target.value))}
                                    />
                                </div>
                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: depoimento_cliente"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'carousel' && (
                            <CarouselProperties component={selectedComponent as CarouselComponent} />
                        )}

                        {selectedComponent.type === 'footer' && (
                            <FooterProperties component={selectedComponent as any} />
                        )}

                        {selectedComponent.type === 'pricing' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Design</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.variant || 'default'}
                                        onChange={(e) => handleUpdate('variant', e.target.value)}
                                    >
                                        <option value="default">Padrão (Box)</option>
                                        <option value="minimal">Minimalista (Clean)</option>
                                        <option value="cards">Cartão 3D (Pop)</option>
                                        <option value="highlight">Destaque (Dark/Premium)</option>
                                        <option value="flat">Plano (Lista Simples)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Título</label>
                                    <Input
                                        value={selectedComponent.data.title || ''}
                                        onChange={(e) => handleUpdate('title', e.target.value)}
                                        placeholder="Plano PRO"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Descrição Curta</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm h-20"
                                        value={selectedComponent.data.description || ''}
                                        onChange={(e) => handleUpdate('description', e.target.value)}
                                        placeholder="O melhor plano para começar..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Preço (Por)</label>
                                        <Input
                                            value={selectedComponent.data.price || ''}
                                            onChange={(e) => handleUpdate('price', e.target.value)}
                                            placeholder="R$ 197,00"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Preço Original (De)</label>
                                        <Input
                                            value={selectedComponent.data.originalPrice || ''}
                                            onChange={(e) => handleUpdate('originalPrice', e.target.value)}
                                            placeholder="R$ 297,00"
                                        />
                                    </div>
                                </div>

                                <ColorPickerWithPalette
                                    label="Cor de Destaque"
                                    value={selectedComponent.data.highlightColor || '#2563EB'}
                                    onChange={(color) => handleUpdate('highlightColor', color)}
                                />

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Badge/Tag</label>
                                    <Input
                                        value={selectedComponent.data.badge || ''}
                                        onChange={(e) => handleUpdate('badge', e.target.value)}
                                        placeholder="Mais Popular"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Condição / Rodapé</label>
                                    <Input
                                        value={selectedComponent.data.condition || ''}
                                        onChange={(e) => handleUpdate('condition', e.target.value)}
                                        placeholder="Pagamento único, acesso vitalício"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Texto do Botão</label>
                                    <Input
                                        value={selectedComponent.data.buttonText || ''}
                                        onChange={(e) => handleUpdate('buttonText', e.target.value)}
                                        placeholder="Quero este plano"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">URL de Destino</label>
                                    <Input
                                        value={selectedComponent.data.buttonUrl || ''}
                                        onChange={(e) => handleUpdate('buttonUrl', e.target.value)}
                                        placeholder="https://checkout.com/produto"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Abre ao clicar no botão de compra</p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Features (separadas por vírgula)</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm h-24"
                                        value={selectedComponent.data.features?.join(', ') || ''}
                                        onChange={(e) => handleUpdate('features', e.target.value.split(',').map(s => s.trim()))}
                                        placeholder="Acesso Imediato, Suporte 24h, Garantia de 7 dias"
                                    />
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="recommended"
                                        checked={selectedComponent.data.recommended || false}
                                        onChange={(e) => handleUpdate('recommended', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="recommended" className="text-xs font-medium text-gray-700">Marcar como Recomendado</label>
                                </div>

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: card_preco"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'spacer' && (
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-2 block">Altura (px)</label>
                                <Input
                                    type="number"
                                    value={selectedComponent.data.height || 32}
                                    onChange={(e) => handleUpdate('height', Number(e.target.value))}
                                />
                            </div>
                        )}

                        {selectedComponent.type === 'code' && (
                            <div>
                                <label className="text-xs font-medium text-gray-700 mb-2 block">Código HTML/JS</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-md p-2 text-sm font-mono h-32"
                                    value={selectedComponent.data.code || ''}
                                    onChange={(e) => handleUpdate('code', e.target.value)}
                                />
                            </div>
                        )}

                        {selectedComponent.type === 'loading' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Título Principal</label>
                                    <Input
                                        value={selectedComponent.data.headline || ''}
                                        onChange={(e) => handleUpdate('headline', e.target.value)}
                                        placeholder="Analisando seu perfil..."
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Subtítulo</label>
                                    <Input
                                        value={selectedComponent.data.subheadline || ''}
                                        onChange={(e) => handleUpdate('subheadline', e.target.value)}
                                        placeholder="Isso pode levar alguns segundos"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Texto ao Completar</label>
                                    <Input
                                        value={selectedComponent.data.endText || ''}
                                        onChange={(e) => handleUpdate('endText', e.target.value)}
                                        placeholder="Concluído!"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 flex justify-between">
                                        <span>Duração (segundos)</span>
                                        <span className="text-blue-600">{((selectedComponent.data.duration || 3000) / 1000).toFixed(1)}s</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1000"
                                        max="10000"
                                        step="500"
                                        value={selectedComponent.data.duration || 3000}
                                        onChange={(e) => handleUpdate('duration', Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                                        <span>1s</span>
                                        <span>10s</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Cor da Barra</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={selectedComponent.data.barColor || '#22c55e'}
                                                onChange={(e) => handleUpdate('barColor', e.target.value)}
                                                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Cor do Fundo</label>
                                        <input
                                            type="color"
                                            value={selectedComponent.data.trackColor || '#e2e8f0'}
                                            onChange={(e) => handleUpdate('trackColor', e.target.value)}
                                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Cor do Texto</label>
                                    <input
                                        type="color"
                                        value={selectedComponent.data.textColor || '#1e293b'}
                                        onChange={(e) => handleUpdate('textColor', e.target.value)}
                                        className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Altura da Barra</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            value={selectedComponent.data.height || 'md'}
                                            onChange={(e) => handleUpdate('height', e.target.value)}
                                        >
                                            <option value="sm">Fina</option>
                                            <option value="md">Média</option>
                                            <option value="lg">Grossa</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Arredondamento</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                            value={selectedComponent.data.rounded || 'full'}
                                            onChange={(e) => handleUpdate('rounded', e.target.value)}
                                        >
                                            <option value="none">Nenhum</option>
                                            <option value="md">Médio</option>
                                            <option value="full">Completo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="showPercentage"
                                        checked={selectedComponent.data.showPercentage !== false}
                                        onChange={(e) => handleUpdate('showPercentage', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="showPercentage" className="text-xs font-medium text-gray-700">Mostrar Porcentagem</label>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Ação ao Concluir</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.actionType || 'next_step'}
                                        onChange={(e) => handleUpdate('actionType', e.target.value)}
                                    >
                                        <option value="next_step">Ir para Próxima Etapa</option>
                                        <option value="open_url">Abrir URL</option>
                                        <option value="jump_to_step">Pular para Etapa</option>
                                    </select>

                                    {selectedComponent.data.actionType === 'open_url' && (
                                        <Input
                                            value={selectedComponent.data.targetUrl || ''}
                                            onChange={(e) => handleUpdate('targetUrl', e.target.value)}
                                            placeholder="https://..."
                                            className="mb-2"
                                        />
                                    )}

                                    {selectedComponent.data.actionType === 'jump_to_step' && (
                                        <select
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={selectedComponent.data.nextStepId || ''}
                                            onChange={(e) => handleUpdate('nextStepId', e.target.value)}
                                        >
                                            <option value="">Selecione uma etapa...</option>
                                            {steps.map((step) => (
                                                <option key={step.id} value={step.id}>
                                                    {step.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Mensagens Dinâmicas (opcional)</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-md p-2 text-sm h-20"
                                        value={(selectedComponent.data.messages || []).join('\n')}
                                        onChange={(e) => handleUpdate('messages', e.target.value.split('\n'))}
                                        placeholder="Uma mensagem por linha&#10;Conectando ao servidor...&#10;Verificando compatibilidade...&#10;Gerando plano personalizado...&#10;Pronto!"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Uma mensagem por linha. Aparecerão em sequência durante o carregamento.</p>
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'argument' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Título da Seção</label>
                                    <Input
                                        value={selectedComponent.data.headline || ''}
                                        onChange={(e) => handleUpdate('headline', e.target.value)}
                                        placeholder="O que você vai aprender..."
                                    />
                                </div>

                                <ColorPickerWithPalette
                                    label="Cor do Título"
                                    value={selectedComponent.data.headlineColor || ''}
                                    onChange={(color) => handleUpdate('headlineColor', color)}
                                />

                                <ColorPickerWithPalette
                                    label="Cor do Texto"
                                    value={selectedComponent.data.textColor || ''}
                                    onChange={(color) => handleUpdate('textColor', color)}
                                />

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: argumentos_venda"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'vsl-video' && (
                            <>
                                <VideoUploadWithPreview
                                    label="Vídeo VSL"
                                    value={selectedComponent.data.url || ''}
                                    onChange={(url) => handleUpdate('url', url)}
                                    onUploadComplete={(data) => {
                                        handleUpdate('url', data.url);
                                        handleUpdate('publicId', data.publicId);
                                    }}
                                    funnelId={funnelId || undefined}
                                    helpText="Suba um vídeo MP4/MOV ou cole um link direto."
                                />

                                <ImageUploadWithPreview
                                    label="Thumbnail (Capa)"
                                    value={selectedComponent.data.thumbnailUrl || ''}
                                    onChange={(url) => handleUpdate('thumbnailUrl', url)}
                                    onUploadComplete={(data) => {
                                        handleUpdate('thumbnailUrl', data.url);
                                        // We don't necessarily need the publicId for thumbnail here, but it's good practice
                                    }}
                                    funnelId={funnelId || undefined}
                                />

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-700">Autoplay Mudo</label>
                                        <Switch
                                            checked={selectedComponent.data.autoPlay !== false}
                                            onCheckedChange={(checked) => handleUpdate('autoPlay', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-700">Reiniciar ao Clicar</label>
                                        <Switch
                                            checked={selectedComponent.data.restartOnClick !== false}
                                            onCheckedChange={(checked) => handleUpdate('restartOnClick', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-700">Desmutar ao Clicar</label>
                                        <Switch
                                            checked={selectedComponent.data.unmuteOnClick !== false}
                                            onCheckedChange={(checked) => handleUpdate('unmuteOnClick', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-700">Mostrar Barra de Progresso</label>
                                        <Switch
                                            checked={selectedComponent.data.showProgressBar !== false}
                                            onCheckedChange={(checked) => handleUpdate('showProgressBar', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-gray-700">Progresso Acelerado (Fake)</label>
                                        <Switch
                                            checked={selectedComponent.data.fakeProgress !== false}
                                            onCheckedChange={(checked) => handleUpdate('fakeProgress', checked)}
                                        />
                                    </div>
                                </div>

                                {selectedComponent.data.showProgressBar !== false && (
                                    <ColorPickerWithPalette
                                        label="Cor da Barra de Progresso"
                                        value={selectedComponent.data.progressBarColor || '#2563EB'}
                                        onChange={(color) => handleUpdate('progressBarColor', color)}
                                    />
                                )}

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Texto do Botão de Play</label>
                                    <Input
                                        value={selectedComponent.data.playButtonText || 'CLIQUE PARA OUVIR'}
                                        onChange={(e) => handleUpdate('playButtonText', e.target.value)}
                                    />
                                </div>

                                <ColorPickerWithPalette
                                    label="Cor do Botão de Play"
                                    value={selectedComponent.data.playButtonColor || '#2563EB'}
                                    onChange={(color) => handleUpdate('playButtonColor', color)}
                                />

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Duração Estimada (Segundos)</label>
                                    <Input
                                        type="number"
                                        value={selectedComponent.data.fakeProgressDuration || 300}
                                        onChange={(e) => handleUpdate('fakeProgressDuration', Number(e.target.value))}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Usado para calcular a velocidade da barra fake.</p>
                                </div>
                            </>
                        )}

                        {!['headline', 'paragraph', 'button', 'quiz-option', 'video', 'vsl-video', 'image', 'input', 'slider', 'audio', 'alert', 'testimonial', 'pricing', 'spacer', 'code', 'loading', 'argument'].includes(selectedComponent.type) && (
                            <p className="text-xs text-gray-500">
                                Edição avançada para {selectedComponent.type} em breve...
                            </p>
                        )}
                    </TabsContent>

                    <TabsContent value="style" className="space-y-4 mt-4">
                        {selectedComponent.type === 'button' && (
                            <>
                                <ColorPickerWithPalette
                                    label="Cor de Fundo"
                                    value={selectedComponent.data.styles?.backgroundColor || '#2563EB'}
                                    onChange={(color) => {
                                        updateComponent(selectedComponent.id, {
                                            ...selectedComponent,
                                            data: {
                                                ...selectedComponent.data,
                                                styles: {
                                                    ...selectedComponent.data.styles,
                                                    backgroundColor: color
                                                }
                                            }
                                        } as any);
                                    }}
                                />

                                <ColorPickerWithPalette
                                    label="Cor do Texto"
                                    value={selectedComponent.data.styles?.textColor || '#FFFFFF'}
                                    onChange={(color) => {
                                        updateComponent(selectedComponent.id, {
                                            ...selectedComponent,
                                            data: {
                                                ...selectedComponent.data,
                                                styles: {
                                                    ...selectedComponent.data.styles,
                                                    textColor: color
                                                }
                                            }
                                        } as any);
                                    }}
                                />

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Sombra</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.styles?.shadow || 'md'}
                                        onChange={(e) => {
                                            updateComponent(selectedComponent.id, {
                                                ...selectedComponent,
                                                data: {
                                                    ...selectedComponent.data,
                                                    styles: {
                                                        ...selectedComponent.data.styles,
                                                        shadow: e.target.value
                                                    }
                                                }
                                            } as any);
                                        }}
                                    >
                                        <option value="none">Nenhuma</option>
                                        <option value="sm">Pequena</option>
                                        <option value="md">Média</option>
                                        <option value="lg">Grande</option>
                                        <option value="xl">Extra Grande</option>
                                        <option value="3d">3D (Sombra Dura)</option>
                                        <option value="glow">Brilho (Cor do Botão)</option>
                                        <option value="shadow-sm">Sombra Suave</option>
                                        <option value="shadow-md">Sombra Média</option>
                                        <option value="shadow-lg">Sombra Longa</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Bordas</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.styles?.borderRadius || 'md'}
                                        onChange={(e) => {
                                            updateComponent(selectedComponent.id, {
                                                ...selectedComponent,
                                                data: {
                                                    ...selectedComponent.data,
                                                    styles: {
                                                        ...selectedComponent.data.styles,
                                                        borderRadius: e.target.value
                                                    }
                                                }
                                            } as any);
                                        }}
                                    >
                                        <option value="none">Sem Bordas</option>
                                        <option value="sm">Pequeno</option>
                                        <option value="md">Médio</option>
                                        <option value="lg">Grande</option>
                                        <option value="full">Totalmente Arredondado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Tamanho</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.styles?.size || 'md'}
                                        onChange={(e) => {
                                            updateComponent(selectedComponent.id, {
                                                ...selectedComponent,
                                                data: {
                                                    ...selectedComponent.data,
                                                    styles: {
                                                        ...selectedComponent.data.styles,
                                                        size: e.target.value
                                                    }
                                                }
                                            } as any);
                                        }}
                                    >
                                        <option value="sm">Pequeno</option>
                                        <option value="md">Médio</option>
                                        <option value="lg">Grande</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Animação</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.styles?.animation || 'none'}
                                        onChange={(e) => {
                                            updateComponent(selectedComponent.id, {
                                                ...selectedComponent,
                                                data: {
                                                    ...selectedComponent.data,
                                                    styles: {
                                                        ...selectedComponent.data.styles,
                                                        animation: e.target.value
                                                    }
                                                }
                                            } as any);
                                        }}
                                    >
                                        <option value="none">Nenhuma</option>
                                        <option value="pulse">Pulsar</option>
                                        <option value="pop">Pop Suave</option>
                                        <option value="bounce">Bounce (Salto)</option>
                                        <option value="gradient">Degradê Rotativo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Velocidade da Animação</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.styles?.animationSpeed || 'normal'}
                                        onChange={(e) => {
                                            updateComponent(selectedComponent.id, {
                                                ...selectedComponent,
                                                data: {
                                                    ...selectedComponent.data,
                                                    styles: {
                                                        ...selectedComponent.data.styles,
                                                        animationSpeed: e.target.value
                                                    }
                                                }
                                            } as any);
                                        }}
                                    >
                                        <option value="slow">Devagar (3s)</option>
                                        <option value="normal">Normal (2s)</option>
                                        <option value="fast">Rápido (1s)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {selectedComponent.type !== 'button' && (
                            <p className="text-xs text-gray-500">Opções de estilo em breve...</p>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Delete Button */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-300 hover:bg-red-50 gap-2"
                        onClick={async () => {
                            if (confirm('Tem certeza que deseja excluir este componente?')) {
                                // If component has a publicId (Cloudinary asset), delete it
                                const componentData = selectedComponent.data as any;
                                if (componentData.publicId) {
                                    try {
                                        await fetch('/api/upload/delete', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ publicId: componentData.publicId }),
                                        });
                                    } catch (error) {
                                        console.error('Failed to delete asset from Cloudinary:', error);
                                    }
                                }
                                deleteComponent(selectedComponent.id);
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                        Excluir Componente
                    </Button>
                </div>
            </div>
        </div>
    );
}
