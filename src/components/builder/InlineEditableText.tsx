'use client';

import React, { useRef, useCallback, useState } from 'react';
import { MiniToolbar, MiniToolbarStyle } from './MiniToolbar';
import { resolveFontFamily } from '@/lib/fonts';

interface InlineEditableTextProps {
  value?: string;
  htmlValue?: string;
  style?: MiniToolbarStyle;
  onUpdate: (text: string, html: string, style?: MiniToolbarStyle) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export function InlineEditableText({
  value,
  htmlValue,
  style,
  onUpdate,
  placeholder = 'Clique para editar...',
  className = '',
  minHeight = 40,
}: InlineEditableTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = useCallback(() => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    const text = ref.current.innerText;
    onUpdate(text, html);
    setIsEditing(false);
  }, [onUpdate]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setTimeout(() => ref.current?.focus(), 0);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleStyleUpdate = useCallback((newStyle: MiniToolbarStyle) => {
    onUpdate(value || '', htmlValue || '', newStyle);
  }, [value, htmlValue, onUpdate]);

  const isEmpty = !htmlValue && !value;

  return (
    <div className="relative group/inline" onClick={handleClick}>
      {isEditing && (
        <div className="absolute -top-1 left-0 right-0 z-50 -mt-1">
          <MiniToolbar
            style={style}
            onStyleUpdate={handleStyleUpdate}
          />
        </div>
      )}
      <div
        ref={ref}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={isEditing ? handleBlur : undefined}
        onDoubleClick={handleDoubleClick}
        className={`outline-none ${isEditing ? 'cursor-text bg-blue-50/30 ring-2 ring-blue-400/50 rounded' : 'cursor-pointer hover:bg-blue-50/20 hover:ring-1 hover:ring-blue-300/30 rounded'} transition-all ${className}`}
        style={{
          minHeight: `${minHeight}px`,
          fontSize: style?.fontSize ? `${style.fontSize}px` : undefined,
          fontFamily: resolveFontFamily(style?.fontFamily),
          lineHeight: style?.lineHeight,
          letterSpacing: style?.letterSpacing ? `${style.letterSpacing}px` : undefined,
          textTransform: style?.textTransform as any,
        }}
        dangerouslySetInnerHTML={{ __html: htmlValue || value || '' }}
      />
      {!isEditing && isEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-400">{placeholder}</span>
        </div>
      )}
      {!isEditing && (
        <div className="absolute top-0 right-0 opacity-0 group-hover/inline:opacity-100 transition-opacity pointer-events-none">
          <span className="text-[9px] text-blue-400 bg-white/80 px-1 rounded">clique 2x para editar</span>
        </div>
      )}
    </div>
  );
}
