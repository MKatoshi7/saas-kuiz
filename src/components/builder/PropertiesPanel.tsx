'use client';

import React from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Trash2, Bold, Italic, Underline, Settings2, Sparkles, MousePointer2 } from 'lucide-react';
import { QuizOptionProperties } from './QuizOptionProperties';
import { QuizOptionComponent, ArgumentComponent, FAQComponent, CarouselComponent, PieChartComponent, BarChartComponent } from '@/types/funnel';
import { ArgumentProperties } from './ArgumentProperties';
import { FAQProperties } from './FAQProperties';
import { CarouselProperties } from './CarouselProperties';
import { FooterProperties } from './FooterProperties';
import { PieChartProperties, BarChartProperties } from './ChartProperties';
import { TextStyleToolbar } from './TextStyleToolbar';
import { RichTextEditor } from './RichTextEditor';
import { FullTextProperties } from './FullTextProperties';
import { ColorPickerWithPalette } from './ColorPickerWithPalette';
import { MiniToolbar } from './MiniToolbar';
import { RichTextField } from './RichTextField';
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
            <div className="w-80 border-l border-border/60 bg-background flex flex-col h-full overflow-y-auto">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl" />
                        <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <Settings2 className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-base font-semibold tracking-tight">Painel de Propriedades</h3>
                        <p className="text-sm text-muted-foreground mt-1.5 text-balance">
                            Selecione um componente no canvas para editar suas propriedades.
                        </p>
                    </div>
                    <div className="pt-4 border-t border-border/60 w-full">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Atalhos rápidos
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1.5 text-left mx-auto max-w-[200px]">
                            <li className="flex items-center gap-2">
                                <kbd className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">⌘K</kbd>
                                Paleta de comandos
                            </li>
                            <li className="flex items-center gap-2">
                                <kbd className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">⌘D</kbd>
                                Duplicar selecionado
                            </li>
                            <li className="flex items-center gap-2">
                                <kbd className="font-mono text-[10px] bg-secondary px-1.5 py-0.5 rounded">⌫</kbd>
                                Excluir selecionado
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                Personalize cores na aba Design
                            </li>
                        </ul>
                    </div>
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
        <div className="w-80 bg-background/80 backdrop-blur-xl border-l border-border/60 overflow-y-auto h-full z-20">
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-10">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Settings2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Propriedades</p>
                        <p className="text-sm font-semibold capitalize truncate">{selectedComponent.type.replace('-', ' ')}</p>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedComponent(null)}
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors flex items-center justify-center shrink-0"
                    title="Fechar painel"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="p-4">
                <div className="mb-4 pb-4 border-b border-border/60 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Componente</p>
                        <p className="text-sm font-medium capitalize">{selectedComponent.type.replace('-', ' ')}</p>
                    </div>
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                            if (selectedComponent) {
                                deleteComponent(selectedComponent.id)
                                setSelectedComponent(null)
                            }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>

                <Tabs defaultValue="content" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content">Conteúdo</TabsTrigger>
                        <TabsTrigger value="style">Estilo</TabsTrigger>
                    </TabsList>

                    <TabsContent value="content" className="space-y-4 mt-4">
                        {selectedComponent.type === 'headline' && (
                            <>
                                <RichTextField
                                    label="Texto"
                                    value={selectedComponent.data.text}
                                    htmlValue={selectedComponent.data.textHtml}
                                    style={selectedComponent.data.textStyle}
                                    onUpdate={(text, html, style) => {
                                        handleUpdate('text', text);
                                        if (html) handleUpdate('textHtml', html);
                                        if (style) handleUpdate('textStyle', style);
                                    }}
                                    minHeight={40}
                                    placeholder="Digite o título..."
                                />

                                <div className="pt-3 border-t border-gray-200 mt-3">
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
                                <RichTextField
                                    label="Texto"
                                    value={selectedComponent.data.text}
                                    htmlValue={selectedComponent.data.textHtml}
                                    style={selectedComponent.data.textStyle}
                                    onUpdate={(text, html, style) => {
                                        handleUpdate('text', text);
                                        if (html) handleUpdate('textHtml', html);
                                        if (style) handleUpdate('textStyle', style);
                                    }}
                                    minHeight={80}
                                    placeholder="Digite o parágrafo..."
                                />

                                <div className="pt-3 border-t border-gray-200 mt-3">
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
                                <RichTextField
                                    label="Texto do Botão"
                                    value={selectedComponent.data.text}
                                    htmlValue={selectedComponent.data.textHtml}
                                    style={selectedComponent.data.textStyle}
                                    onUpdate={(text, html, style) => {
                                        handleUpdate('text', text);
                                        if (html) handleUpdate('textHtml', html);
                                        if (style) handleUpdate('textStyle', style);
                                    }}
                                    minHeight={36}
                                    placeholder="Texto do botão"
                                    compact
                                    showPresets={false}
                                />

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
                                            if (data && data.url) {
                                                handleUpdate('src', data.url);
                                                if (data.publicId) {
                                                    handleUpdate('publicId', data.publicId);
                                                }
                                            }
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

                        {selectedComponent.type === 'pie-chart' && (
                            <PieChartProperties component={selectedComponent as PieChartComponent} />
                        )}

                        {selectedComponent.type === 'bar-chart' && (
                            <BarChartProperties component={selectedComponent as BarChartComponent} />
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
                                    <RichTextField
                                        label="Label do Campo"
                                        value={selectedComponent.data.label}
                                        htmlValue={selectedComponent.data.labelHtml}
                                        style={selectedComponent.data.labelStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('label', text);
                                            if (html) handleUpdate('labelHtml', html);
                                            if (style) handleUpdate('labelStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Nome do campo"
                                        compact
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
                                    <RichTextField
                                        label="Label do Slider"
                                        value={selectedComponent.data.label}
                                        htmlValue={selectedComponent.data.labelHtml}
                                        style={selectedComponent.data.labelStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('label', text);
                                            if (html) handleUpdate('labelHtml', html);
                                            if (style) handleUpdate('labelStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Label do slider"
                                        compact
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
                                        <option value="whatsapp">🟢 WhatsApp Clássico</option>
                                        <option value="whatsapp2">💬 WhatsApp Moderno</option>
                                        <option value="mp3">💿 MP3 Player</option>
                                        <option value="streaming">🎵 Streaming (Spotify)</option>
                                        <option value="modern">✨ Estilo Moderno</option>
                                        <option value="simple">📱 Simples</option>
                                        <option value="simple2">✈️ Telegram</option>
                                    </select>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Escolha o visual do player de áudio
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome do Áudio</label>
                                    <RichTextField
                                        label="Nome do Áudio"
                                        value={selectedComponent.data.audioName}
                                        htmlValue={selectedComponent.data.audioNameHtml}
                                        style={selectedComponent.data.audioNameStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('audioName', text);
                                            if (html) handleUpdate('audioNameHtml', html);
                                            if (style) handleUpdate('audioNameStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Nome da faixa"
                                        compact
                                        showPresets={false}
                                    />
                                </div>

                                {(selectedComponent.data.playerStyle === 'whatsapp' || selectedComponent.data.playerStyle === 'whatsapp2') && (
                                    <>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Nome do Remetente</label>
                                            <RichTextField
                                                label="Nome do Remetente"
                                                value={selectedComponent.data.senderName}
                                                htmlValue={selectedComponent.data.senderNameHtml}
                                                style={selectedComponent.data.senderNameStyle}
                                                onUpdate={(text, html, style) => {
                                                    handleUpdate('senderName', text);
                                                    if (html) handleUpdate('senderNameHtml', html);
                                                    if (style) handleUpdate('senderNameStyle', style);
                                                }}
                                                minHeight={36}
                                                placeholder="Remetente"
                                                compact
                                                showPresets={false}
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
                                        <RichTextField
                                            label="Título"
                                            value={selectedComponent.data.title}
                                            htmlValue={selectedComponent.data.titleHtml}
                                            style={selectedComponent.data.titleStyle}
                                            onUpdate={(text, html, style) => {
                                                handleUpdate('title', text);
                                                if (html) handleUpdate('titleHtml', html);
                                                if (style) handleUpdate('titleStyle', style);
                                            }}
                                            minHeight={36}
                                            placeholder="Título do destaque"
                                            compact
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
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Tipo</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.variant || 'info'}
                                                onChange={(e) => handleUpdate('variant', e.target.value)}
                                            >
                                                <option value="info">ℹ️ Info (Azul)</option>
                                                <option value="success">✅ Sucesso (Verde)</option>
                                                <option value="warning">⚠️ Aviso (Amarelo)</option>
                                                <option value="danger">🚨 Perigo (Vermelho)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Estilo Visual</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.style || 'left-border'}
                                                onChange={(e) => handleUpdate('style', e.target.value)}
                                            >
                                                <option value="left-border">Borda Esquerda</option>
                                                <option value="subtle">Sutil</option>
                                                <option value="solid">Sólido</option>
                                                <option value="outline">Contorno</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Tamanho</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.fontSize || 'sm'}
                                                onChange={(e) => handleUpdate('fontSize', e.target.value)}
                                            >
                                                <option value="xs">Extra Pequeno</option>
                                                <option value="sm">Pequeno</option>
                                                <option value="md">Médio</option>
                                                <option value="lg">Grande</option>
                                                <option value="xl">Extra Grande</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Espaçamento</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.padding || 'normal'}
                                                onChange={(e) => handleUpdate('padding', e.target.value)}
                                            >
                                                <option value="sm">Compacto</option>
                                                <option value="normal">Normal</option>
                                                <option value="lg">Largo</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Animação</label>
                                            <select
                                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                value={selectedComponent.data.animation || 'none'}
                                                onChange={(e) => handleUpdate('animation', e.target.value)}
                                            >
                                                <option value="none">Nenhuma</option>
                                                <option value="pulse">Pulsar</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-700 mb-2 block">Ícone</label>
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
                                <RichTextField
                                    label="Depoimento"
                                    value={selectedComponent.data.text}
                                    htmlValue={selectedComponent.data.textHtml}
                                    style={selectedComponent.data.textStyle}
                                    onUpdate={(text, html, style) => {
                                        handleUpdate('text', text);
                                        if (html) handleUpdate('textHtml', html);
                                        if (style) handleUpdate('textStyle', style);
                                    }}
                                    minHeight={80}
                                    placeholder="Texto do depoimento..."
                                />
                                <RichTextField
                                    label="Autor"
                                    value={selectedComponent.data.author}
                                    htmlValue={selectedComponent.data.authorHtml}
                                    style={selectedComponent.data.authorStyle}
                                    onUpdate={(text, html, style) => {
                                        handleUpdate('author', text);
                                        if (html) handleUpdate('authorHtml', html);
                                        if (style) handleUpdate('authorStyle', style);
                                    }}
                                    minHeight={36}
                                    placeholder="Nome do autor"
                                    compact
                                />
                                <RichTextField
                                    label="Cargo/Função"
                                    value={selectedComponent.data.role}
                                    htmlValue={selectedComponent.data.roleHtml}
                                    style={selectedComponent.data.roleStyle}
                                    onUpdate={(text, html, style) => {
                                        handleUpdate('role', text);
                                        if (html) handleUpdate('roleHtml', html);
                                        if (style) handleUpdate('roleStyle', style);
                                    }}
                                    minHeight={36}
                                    placeholder="Cargo ou função"
                                    compact
                                />
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
                                    <RichTextField
                                        label="Nome do Plano"
                                        value={selectedComponent.data.title}
                                        htmlValue={selectedComponent.data.titleHtml}
                                        style={selectedComponent.data.titleStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('title', text);
                                            if (html) handleUpdate('titleHtml', html);
                                            if (style) handleUpdate('titleStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Nome do plano"
                                        compact
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Descrição Curta</label>
                                    <RichTextField
                                        label="Descrição"
                                        value={selectedComponent.data.description}
                                        htmlValue={selectedComponent.data.descriptionHtml}
                                        style={selectedComponent.data.descriptionStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('description', text);
                                            if (html) handleUpdate('descriptionHtml', html);
                                            if (style) handleUpdate('descriptionStyle', style);
                                        }}
                                        minHeight={60}
                                        placeholder="Descrição do plano..."
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
                                    <RichTextField
                                        label="Badge"
                                        value={selectedComponent.data.badge}
                                        htmlValue={selectedComponent.data.badgeHtml}
                                        style={selectedComponent.data.badgeStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('badge', text);
                                            if (html) handleUpdate('badgeHtml', html);
                                            if (style) handleUpdate('badgeStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Ex: MAIS POPULAR"
                                        compact
                                        showPresets={false}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Condição / Rodapé</label>
                                    <RichTextField
                                        label="Condição"
                                        value={selectedComponent.data.condition}
                                        htmlValue={selectedComponent.data.conditionHtml}
                                        style={selectedComponent.data.conditionStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('condition', text);
                                            if (html) handleUpdate('conditionHtml', html);
                                            if (style) handleUpdate('conditionStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Ex: Preço promocional"
                                        compact
                                        showPresets={false}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Texto do Botão</label>
                                    <RichTextField
                                        label="Texto do Botão"
                                        value={selectedComponent.data.buttonText}
                                        htmlValue={selectedComponent.data.buttonTextHtml}
                                        style={selectedComponent.data.buttonTextStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('buttonText', text);
                                            if (html) handleUpdate('buttonTextHtml', html);
                                            if (style) handleUpdate('buttonTextStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Texto do botão"
                                        compact
                                        showPresets={false}
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
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Features (uma por linha)</label>
                                    <RichTextField
                                        label="Features (uma por linha)"
                                        value={Array.isArray(selectedComponent.data.features) ? selectedComponent.data.features.join('\n') : (selectedComponent.data.features as any || '')}
                                        htmlValue={selectedComponent.data.featuresHtml}
                                        style={selectedComponent.data.featuresStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('features', text.split('\n').filter(s => s.trim()));
                                            if (html) handleUpdate('featuresHtml', html);
                                            if (style) handleUpdate('featuresStyle', style);
                                        }}
                                        minHeight={80}
                                        placeholder={"Feature 1\nFeature 2\nFeature 3"}
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
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Estilo do Loading</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                        value={selectedComponent.data.loadingStyle || 'bar'}
                                        onChange={(e) => handleUpdate('loadingStyle', e.target.value)}
                                    >
                                        <option value="bar">Barra</option>
                                        <option value="circle">Círculo</option>
                                        <option value="dots">Pontos</option>
                                        <option value="pulse">Pulso</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Título Principal</label>
                                    <RichTextField
                                        label="Headline"
                                        value={selectedComponent.data.headline}
                                        htmlValue={selectedComponent.data.headlineHtml}
                                        style={selectedComponent.data.headlineStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('headline', text);
                                            if (html) handleUpdate('headlineHtml', html);
                                            if (style) handleUpdate('headlineStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Carregando..."
                                        compact
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Subtítulo</label>
                                    <RichTextField
                                        label="Sub-headline"
                                        value={selectedComponent.data.subheadline}
                                        htmlValue={selectedComponent.data.subheadlineHtml}
                                        style={selectedComponent.data.subheadlineStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('subheadline', text);
                                            if (html) handleUpdate('subheadlineHtml', html);
                                            if (style) handleUpdate('subheadlineStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Aguarde um momento..."
                                        compact
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Texto ao Completar</label>
                                    <RichTextField
                                        label="Texto Final"
                                        value={selectedComponent.data.endText}
                                        htmlValue={selectedComponent.data.endTextHtml}
                                        style={selectedComponent.data.endTextStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('endText', text);
                                            if (html) handleUpdate('endTextHtml', html);
                                            if (style) handleUpdate('endTextStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="Pronto!"
                                        compact
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 flex justify-between">
                                        <span>Duração</span>
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

                                {selectedComponent.data.showPercentage !== false && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="percentageInside"
                                                checked={selectedComponent.data.percentageInside === true}
                                                onChange={(e) => handleUpdate('percentageInside', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="percentageInside" className="text-xs font-medium text-gray-700">Porcentagem dentro da barra</label>
                                        </div>

                                        {selectedComponent.data.percentageInside === true && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 mb-2 block">Posição do valor</label>
                                                <select
                                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                                                    value={selectedComponent.data.percentagePosition || 'center'}
                                                    onChange={(e) => handleUpdate('percentagePosition', e.target.value)}
                                                >
                                                    <option value="left">Esquerda</option>
                                                    <option value="center">Centro</option>
                                                    <option value="right">Direita</option>
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Cor da Barra</label>
                                        <input
                                            type="color"
                                            value={selectedComponent.data.barColor || '#22c55e'}
                                            onChange={(e) => handleUpdate('barColor', e.target.value)}
                                            className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                                        />
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
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Altura</label>
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

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Ação ao Concluir</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.actionType || 'next_step'}
                                        onChange={(e) => handleUpdate('actionType', e.target.value)}
                                    >
                                        <option value="none">Fazer Nada</option>
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
                                    }}
                                    funnelId={funnelId || undefined}
                                />

                                <div className="space-y-3 pt-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Proporção do Vídeo</label>
                                        <select
                                            value={selectedComponent.data.aspectRatio || '16:9'}
                                            onChange={(e) => handleUpdate('aspectRatio', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="16:9">16:9 (Horizontal)</option>
                                            <option value="9:16">9:16 (Vertical/Stories)</option>
                                            <option value="4:3">4:3 (Clássico)</option>
                                            <option value="1:1">1:1 (Quadrado)</option>
                                        </select>
                                    </div>
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
                                    <RichTextField
                                        label="Texto do Botão"
                                        value={selectedComponent.data.playButtonText}
                                        htmlValue={selectedComponent.data.playButtonTextHtml}
                                        style={selectedComponent.data.playButtonTextStyle}
                                        onUpdate={(text, html, style) => {
                                            handleUpdate('playButtonText', text);
                                            if (html) handleUpdate('playButtonTextHtml', html);
                                            if (style) handleUpdate('playButtonTextStyle', style);
                                        }}
                                        minHeight={36}
                                        placeholder="▶ Assistir Agora"
                                        compact
                                        showPresets={false}
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

                        {selectedComponent.type === 'timer' && (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Minutos</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={selectedComponent.data.minutes !== undefined ? selectedComponent.data.minutes : 5}
                                            onChange={(e) => handleUpdate('minutes', Number(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 mb-2 block">Segundos</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={selectedComponent.data.seconds || 0}
                                            onChange={(e) => handleUpdate('seconds', Number(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Estilo</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedComponent.data.style || 'boxes'}
                                        onChange={(e) => handleUpdate('style', e.target.value)}
                                    >
                                        <option value="boxes">Caixas (Padrão)</option>
                                        <option value="minimal">Minimalista</option>
                                        <option value="circle">Circular</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="autoStart"
                                        checked={selectedComponent.data.autoStart !== false}
                                        onChange={(e) => handleUpdate('autoStart', e.target.checked)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="autoStart" className="text-xs font-medium text-gray-700">Iniciar Automaticamente</label>
                                </div>

                                <div className="pt-4 border-t border-gray-200 mt-4">
                                    <label className="text-xs font-medium text-gray-700 mb-2 block">Nome da Variável (Analytics)</label>
                                    <Input
                                        value={selectedComponent.data.variableName || ''}
                                        onChange={(e) => handleUpdate('variableName', e.target.value)}
                                        placeholder="ex: timer_oferta"
                                    />
                                </div>
                            </>
                        )}

                        {selectedComponent.type === 'social-proof' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Estilo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'viewing', label: '👁️ Vendo Agora' },
                                            { value: 'buying', label: '🛒 Compraram' },
                                            { value: 'recent', label: '✅ Recentes' },
                                            { value: 'counter', label: '👥 Contador' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleUpdate('style', opt.value)}
                                                className={`p-2 text-xs rounded-lg border transition-all ${
                                                    selectedComponent.data.style === opt.value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Ícone (emoji)</label>
                                    <Input
                                        value={selectedComponent.data.icon || ''}
                                        onChange={(e) => handleUpdate('icon', e.target.value)}
                                        placeholder="Ex: 👁️"
                                        className="h-8 text-sm"
                                    />
                                </div>

                                {selectedComponent.data.style !== 'recent' && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Texto</label>
                                        <Input
                                            value={selectedComponent.data.text || ''}
                                            onChange={(e) => handleUpdate('text', e.target.value)}
                                            placeholder="pessoas estão vendo agora"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Número Base</label>
                                        <Input
                                            type="number"
                                            value={selectedComponent.data.number || 47}
                                            onChange={(e) => handleUpdate('number', parseInt(e.target.value) || 47)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Mín</label>
                                        <Input
                                            type="number"
                                            value={selectedComponent.data.min || 20}
                                            onChange={(e) => handleUpdate('min', parseInt(e.target.value) || 20)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Máx</label>
                                        <Input
                                            type="number"
                                            value={selectedComponent.data.max || 80}
                                            onChange={(e) => handleUpdate('max', parseInt(e.target.value) || 80)}
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Intervalo (segundos)</label>
                                    <Input
                                        type="number"
                                        min="2"
                                        max="60"
                                        value={selectedComponent.data.interval || 5}
                                        onChange={(e) => handleUpdate('interval', parseInt(e.target.value) || 5)}
                                        className="h-8 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Cor de Fundo</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={selectedComponent.data.backgroundColor || '#F0FDF4'}
                                                onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
                                                className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                                            />
                                            <span className="text-[10px] text-gray-400">{selectedComponent.data.backgroundColor || '#F0FDF4'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Cor do Texto</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={selectedComponent.data.textColor || '#166534'}
                                                onChange={(e) => handleUpdate('textColor', e.target.value)}
                                                className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                                            />
                                            <span className="text-[10px] text-gray-400">{selectedComponent.data.textColor || '#166534'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Raio da Borda</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="32"
                                        value={selectedComponent.data.borderRadius ?? 12}
                                        onChange={(e) => handleUpdate('borderRadius', parseInt(e.target.value) || 12)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedComponent.type === 'whatsapp-button' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Número WhatsApp</label>
                                    <Input
                                        value={selectedComponent.data.phoneNumber || ''}
                                        onChange={(e) => handleUpdate('phoneNumber', e.target.value)}
                                        placeholder="+5511999999999"
                                        className="h-8 text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Formato: +55DDDNUMERO</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Mensagem Pré-preenchida</label>
                                    <textarea
                                        value={selectedComponent.data.message || ''}
                                        onChange={(e) => handleUpdate('message', e.target.value)}
                                        placeholder="Olá! Vim pelo quiz."
                                        className="w-full p-2 text-sm border border-gray-200 rounded-lg min-h-[60px]"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Use {'{nome}'}, {'{email}'}, {'{resultado}'} para personalizar</p>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Texto do Botão</label>
                                    <Input
                                        value={selectedComponent.data.buttonText || ''}
                                        onChange={(e) => handleUpdate('buttonText', e.target.value)}
                                        placeholder="Falar no WhatsApp"
                                        className="h-8 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Ícone (emoji)</label>
                                    <Input
                                        value={selectedComponent.data.icon || ''}
                                        onChange={(e) => handleUpdate('icon', e.target.value)}
                                        placeholder="💬"
                                        className="h-8 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Estilo</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'default', label: 'Padrão' },
                                            { value: 'floating', label: 'Flutuante' },
                                            { value: 'inline', label: 'Inline' },
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handleUpdate('style', opt.value)}
                                                className={`p-2 text-xs rounded-lg border transition-all ${
                                                    selectedComponent.data.style === opt.value
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {selectedComponent.data.style === 'floating' && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Posição</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { value: 'bottom-left', label: 'Esquerda' },
                                                { value: 'bottom-center', label: 'Centro' },
                                                { value: 'bottom-right', label: 'Direita' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => handleUpdate('position', opt.value)}
                                                    className={`p-2 text-xs rounded-lg border transition-all ${
                                                        selectedComponent.data.position === opt.value
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Cor do Botão</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={selectedComponent.data.buttonColor || '#25D366'}
                                                onChange={(e) => handleUpdate('buttonColor', e.target.value)}
                                                className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                                            />
                                            <span className="text-[10px] text-gray-400">{selectedComponent.data.buttonColor || '#25D366'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">Cor do Texto</label>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="color"
                                                value={selectedComponent.data.textColor || '#FFFFFF'}
                                                onChange={(e) => handleUpdate('textColor', e.target.value)}
                                                className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
                                            />
                                            <span className="text-[10px] text-gray-400">{selectedComponent.data.textColor || '#FFFFFF'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Raio da Borda</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="32"
                                        value={selectedComponent.data.borderRadius ?? 12}
                                        onChange={(e) => handleUpdate('borderRadius', parseInt(e.target.value) || 12)}
                                        className="h-8 text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {!['headline', 'paragraph', 'button', 'quiz-option', 'video', 'vsl-video', 'image', 'input', 'slider', 'audio', 'alert', 'testimonial', 'pricing', 'spacer', 'code', 'loading', 'argument', 'timer', 'social-proof', 'whatsapp-button'].includes(selectedComponent.type) && (
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
