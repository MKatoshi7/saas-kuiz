const toolbarContent = (
    <div
        className={`flex flex-col items-start gap-1.5 bg-slate-900 text-white p-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-700 pointer-events-auto ${anchorRef ? 'fixed z-[9999]' : `absolute z-[9999] ${className || '-top-16 left-0'}`
            }`}
        style={anchorRef ? {
            top: coords.top,
            left: coords.left,
            transform: 'translateY(-100%)'
        } : undefined}
    >
        {/* ROW 1: Basic Formatting */}
        <div className="flex items-center gap-2 w-full">
            {/* Tag Selector */}
            <div className="flex bg-slate-800 rounded overflow-hidden">
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate('tag', 'h1'); }}
                    className={`p-1.5 hover:bg-slate-700 ${currentData.tag === 'h1' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Título Principal (H1)"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate('tag', 'h2'); }}
                    className={`p-1.5 hover:bg-slate-700 ${currentData.tag === 'h2' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Subtítulo (H2)"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate('tag', 'p'); }}
                    className={`p-1.5 hover:bg-slate-700 ${currentData.tag === 'p' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Parágrafo (P)"
                >
                    <Type size={16} />
                </button>
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            {/* Inline Formatting: Bold, Italic, Underline */}
            <div className="flex bg-slate-800 rounded overflow-hidden">
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); applyFormat('bold'); }}
                    className={`p-1.5 hover:bg-slate-700 ${isBold ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Negrito (Ctrl+B)"
                >
                    <Bold size={16} />
                </button>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); applyFormat('italic'); }}
                    className={`p-1.5 hover:bg-slate-700 ${isItalic ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Itálico (Ctrl+I)"
                >
                    <Italic size={16} />
                </button>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); applyFormat('underline'); }}
                    className={`p-1.5 hover:bg-slate-700 ${isUnderline ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Sublinhado (Ctrl+U)"
                >
                    <Underline size={16} />
                </button>
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            {/* Alignment */}
            <div className="flex bg-slate-800 rounded overflow-hidden">
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate('align', 'left'); }}
                    className={`p-1.5 hover:bg-slate-700 ${currentData.align === 'left' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Alinhar à Esquerda"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate('align', 'center'); }}
                    className={`p-1.5 hover:bg-slate-700 ${currentData.align === 'center' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Centralizar"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onUpdate('align', 'right'); }}
                    className={`p-1.5 hover:bg-slate-700 ${currentData.align === 'right' ? 'text-blue-400 bg-slate-700' : 'text-gray-400'}`}
                    title="Alinhar à Direita"
                >
                    <AlignRight size={16} />
                </button>
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            {/* Emoji Picker */}
            <div className="relative" ref={emojiPickerRef}>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(!showEmojiPicker); }}
                    className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-blue-400"
                    title="Inserir Emoji"
                >
                    <Smile size={16} />
                </button>

                {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-[110]">
                        <EmojiPicker
                            onEmojiClick={(emojiData: EmojiClickData) => {
                                const selection = window.getSelection();
                                if (selection && selection.rangeCount > 0) {
                                    const range = selection.getRangeAt(0);
                                    range.deleteContents();
                                    const emojiNode = document.createTextNode(emojiData.emoji);
                                    range.insertNode(emojiNode);
                                    range.setStartAfter(emojiNode);
                                    range.setEndAfter(emojiNode);
                                    selection.removeAllRanges();
                                    selection.addRange(range);

                                    const editor = selection.anchorNode?.parentElement?.closest('[contenteditable="true"]') as HTMLElement;
                                    if (editor) {
                                        editor.dispatchEvent(new Event('input', { bubbles: true }));
                                    }
                                }
                                setShowEmojiPicker(false);
                            }}
                            width={300}
                            height={400}
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                        />
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            {/* Color & Palette Trigger */}
            <div className="relative" ref={paletteRef}>
                <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => { e.stopPropagation(); setShowPalette(!showPalette); }}
                    className="flex items-center gap-1 p-1 hover:bg-slate-800 rounded"
                    title="Cor do Texto"
                >
                    <div
                        className="w-5 h-5 rounded border-2 border-white/30"
                        style={{ backgroundColor: currentColor }}
                    ></div>
                    <ChevronDown size={12} className={`text-gray-400 transition-transform ${showPalette ? 'rotate-180' : ''}`} />
                </button>

                {/* Color Palette Popover */}
                {showPalette && (
                    <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 rounded-lg shadow-xl border border-slate-700 w-56 z-[110]">
                        {/* Theme Primary Color */}
                        <div className="mb-3">
                            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Cor Principal do Tema
                            </div>
                            <button
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={(e) => { e.stopPropagation(); handleColorChange(primaryColor); }}
                                className={`w-full flex items-center gap-2 p-2 rounded-md transition-colors ${currentColor === primaryColor ? 'bg-slate-700' : 'hover:bg-slate-700/50'}`}
                            >
                                <div className="w-6 h-6 rounded border border-white/20" style={{ backgroundColor: primaryColor }}></div>
                                <span className="text-xs font-mono text-gray-300">{primaryColor}</span>
                                {currentColor === primaryColor && <Check size={14} className="ml-auto text-green-400" />}
                            </button>
                        </div>

                        {/* Recent Colors */}
                        {recentColors.length > 0 && (
                            <div className="mb-3">
                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                    Cores Recentes
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {recentColors.map((color, i) => (
                                        <button
                                            key={`recent-${i}`}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={(e) => { e.stopPropagation(); handleColorChange(color); }}
                                            className={`w-7 h-7 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-white ring-1 ring-blue-400' : 'border-white/10'}`}
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        >
                                            {currentColor === color && (
                                                <Check size={12} className={color === '#FFFFFF' || color === '#ffffff' ? 'text-black' : 'text-white'} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preset Colors */}
                        <div className="mb-3">
                            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Paleta Padrão
                            </div>
                            <div className="grid grid-cols-8 gap-1">
                                {PRESET_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => { e.stopPropagation(); handleColorChange(color); }}
                                        className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${currentColor === color ? 'border-white ring-1 ring-blue-400' : 'border-white/10'}`}
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    >
                                        {currentColor === color && (
                                            <Check size={10} className={color === '#FFFFFF' || color === '#ffffff' ? 'text-black' : 'text-white'} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Highlight Colors */}
                        <div className="mb-3">
                            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                                Realce (Grifar)
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {HIGHLIGHT_COLORS.map((color) => (
                                    <button
                                        key={color}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => { e.stopPropagation(); handleHighlightChange(color); }}
                                        className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center border-white/10`}
                                        style={{ backgroundColor: color === 'transparent' ? 'transparent' : color }}
                                        title={color === 'transparent' ? 'Remover Realce' : color}
                                    >
                                        {color === 'transparent' && (
                                            <div className="w-full h-px bg-red-500 rotate-45 transform" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Color Picker */}
                        <div className="pt-2 border-t border-slate-700">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-blue-400 text-xs text-gray-300 group">
                                <Palette size={14} className="text-gray-400 group-hover:text-blue-400" />
                                <span>Escolher cor personalizada...</span>
                                <input
                                    type="color"
                                    value={currentColor}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => handleColorChange(e.target.value)}
                                    className="ml-auto w-6 h-6 rounded border-0 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            {/* Clear Formatting */}
            <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => { e.stopPropagation(); clearFormatting(); }}
                className="p-1.5 hover:bg-slate-800 rounded text-gray-400 hover:text-red-400"
                title="Limpar Formatação"
            >
                <Eraser size={16} />
            </button>
        </div>

        {/* ROW 2: Font Size & Weight */}
        <div className="w-full pt-1 border-t border-slate-800 flex items-center gap-3 px-1">
            <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Tamanho</span>
                <select
                    value={currentData.fontSize || 'normal'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('fontSize', e.target.value)}
                    className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    <option value="micro">Micro (8px)</option>
                    <option value="minusculo">Minúsculo (12px)</option>
                    <option value="small">Pequeno</option>
                    <option value="normal">Normal</option>
                    <option value="medium">Médio</option>
                    <option value="big">Grande</option>
                    <option value="bigger">Muito Grande</option>
                    <option value="huge">Gigante</option>
                </select>
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Peso</span>
                <select
                    value={currentData.fontWeight || 400}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('fontWeight', Number(e.target.value))}
                    className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    <option value="100">Fino (100)</option>
                    <option value="300">Leve (300)</option>
                    <option value="400">Normal (400)</option>
                    <option value="500">Médio (500)</option>
                    <option value="600">Semi-Negrito (600)</option>
                    <option value="700">Negrito (700)</option>
                    <option value="800">Extra-Negrito (800)</option>
                    <option value="900">Black (900)</option>
                </select>
            </div>
        </div>

        {/* ROW 3: Letter Spacing & Line Height */}
        <div className="w-full pt-1 border-t border-slate-800 flex items-center gap-3 px-1">
            <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Espaçamento</span>
                <select
                    value={currentData.letterSpacing || 'normal'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('letterSpacing', e.target.value)}
                    className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    <option value="tighter">Mais Apertado</option>
                    <option value="tight">Apertado</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Largo</option>
                    <option value="wider">Mais Largo</option>
                    <option value="widest">Muito Largo</option>
                </select>
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Altura</span>
                <select
                    value={currentData.lineHeight || 'normal'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('lineHeight', e.target.value)}
                    className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    <option value="tight">Compacto</option>
                    <option value="snug">Ajustado</option>
                    <option value="normal">Normal</option>
                    <option value="relaxed">Relaxado</option>
                    <option value="loose">Solto</option>
                </select>
            </div>
        </div>

        {/* ROW 4: Text Transform & Drop Shadow */}
        <div className="w-full pt-1 border-t border-slate-800 flex items-center gap-3 px-1">
            <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Transformação</span>
                <select
                    value={currentData.textTransform || 'none'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('textTransform', e.target.value)}
                    className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    <option value="none">Nenhuma</option>
                    <option value="uppercase">MAIÚSCULAS</option>
                    <option value="lowercase">minúsculas</option>
                    <option value="capitalize">Capitalizar</option>
                </select>
            </div>

            <div className="w-px h-5 bg-slate-700"></div>

            <div className="flex items-center gap-2 flex-1">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Sombra</span>
                <select
                    value={currentData.dropShadow || 'none'}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdate('dropShadow', e.target.value)}
                    className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                >
                    <option value="none">Nenhuma</option>
                    <option value="sm">Pequena (3D)</option>
                    <option value="md">Média (3D)</option>
                    <option value="lg">Grande (3D)</option>
                    <option value="xl">Extra Grande (3D)</option>
                </select>
            </div>
        </div>

        {/* ROW 5: Text Stroke (Contorno) */}
        <div className="w-full pt-1 border-t border-slate-800 px-1">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">Contorno</span>
                    <select
                        value={currentData.textStroke?.width || 0}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdate('textStroke', {
                            ...currentData.textStroke,
                            width: Number(e.target.value)
                        })}
                        className="flex-1 bg-slate-800 text-xs font-medium text-white border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700"
                    >
                        <option value="0">Nenhum</option>
                        <option value="1">1px</option>
                        <option value="2">2px</option>
                        <option value="3">3px</option>
                        <option value="4">4px</option>
                        <option value="5">5px</option>
                    </select>
                </div>

                {(currentData.textStroke?.width || 0) > 0 && (
                    <>
                        <div className="w-px h-5 bg-slate-700"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-400 whitespace-nowrap">Cor</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const input = document.createElement('input');
                                    input.type = 'color';
                                    input.value = currentData.textStroke?.color || '#000000';
                                    input.onchange = (evt) => {
                                        const target = evt.target as HTMLInputElement;
                                        onUpdate('textStroke', {
                                            ...currentData.textStroke,
                                            color: target.value
                                        });
                                    };
                                    input.click();
                                }}
                                className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded"
                            >
                                <div
                                    className="w-4 h-4 rounded border border-white/30"
                                    style={{ backgroundColor: currentData.textStroke?.color || '#000000' }}
                                />
                                <span className="text-[9px] font-mono text-gray-300">
                                    {currentData.textStroke?.color || '#000000'}
                                </span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
);

if (anchorRef && typeof document !== 'undefined') {
    return createPortal(toolbarContent, document.body);
}

return toolbarContent;
}
