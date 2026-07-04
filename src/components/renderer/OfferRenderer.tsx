'use client';

import React from 'react';
import { resolveFontFamily } from '@/lib/fonts';

interface OfferRendererProps {
  layout?: string;
  microTitle?: string;
  microTitleHtml?: string;
  microTitleStyle?: any;
  microTitleColor?: string;
  productName?: string;
  productNameHtml?: string;
  productNameStyle?: any;
  price?: string;
  priceHtml?: string;
  priceStyle?: any;
  originalPrice?: string;
  originalPriceStyle?: any;
  subtitle?: string;
  subtitleHtml?: string;
  subtitleStyle?: any;
  ctaText?: string;
  ctaTextHtml?: string;
  ctaTextStyle?: any;
  ctaUrl?: string;
  ctaColor?: string;
  ctaTextColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  accentColor?: string;
}

function applyTextStyle(s?: any): React.CSSProperties {
  if (!s) return {};
  const style: React.CSSProperties = {};
  if (s.color) style.color = s.color;
  if (s.fontSize) style.fontSize = `${s.fontSize}px`;
  if (s.fontFamily) style.fontFamily = resolveFontFamily(s.fontFamily) || s.fontFamily;
  if (s.bold) style.fontWeight = 'bold';
  if (s.italic) style.fontStyle = 'italic';
  if (s.underline) style.textDecoration = 'underline';
  if (s.strikethrough) style.textDecoration = (style.textDecoration ? style.textDecoration + ' ' : '') + 'line-through';
  if (s.align) style.textAlign = s.align;
  if (s.textTransform) style.textTransform = s.textTransform as any;
  if (s.letterSpacing !== undefined) style.letterSpacing = `${s.letterSpacing}px`;
  if (s.lineHeight) style.lineHeight = s.lineHeight;
  return style;
}

function RenderText({ html, fallback, style }: { html?: string; fallback?: string; style?: React.CSSProperties }) {
  if (html) return <span style={style} dangerouslySetInnerHTML={{ __html: html }} />;
  return <span style={style}>{fallback}</span>;
}

// ─── Layout: InLead ────────────────────────────────────────────────
function InLeadLayout(props: OfferRendererProps) {
  const accent = props.accentColor || '#2563EB';
  const bg = props.backgroundColor || '#FFFFFF';
  const br = props.borderRadius ?? 12;

  return (
    <div className="w-full rounded-xl overflow-hidden shadow-lg" style={{ backgroundColor: bg, borderRadius: `${br}px`, border: `1px solid ${props.borderColor || '#E5E7EB'}` }}>
      {/* Micro title bar */}
      {props.microTitle && (
        <div className="px-4 py-2 font-bold text-sm tracking-wide uppercase" style={{ backgroundColor: accent, color: '#FFFFFF' }}>
          <RenderText html={props.microTitleHtml} fallback={props.microTitle} style={applyTextStyle({ ...props.microTitleStyle, color: '#FFFFFF', bold: true })} />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: product name + subtitle */}
          <div className="flex-1 min-w-0">
            {props.productName && (
              <p className="text-base font-semibold text-gray-900 leading-snug">
                <RenderText html={props.productNameHtml} fallback={props.productName} style={applyTextStyle(props.productNameStyle)} />
              </p>
            )}
            {props.subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                <RenderText html={props.subtitleHtml} fallback={props.subtitle} style={applyTextStyle(props.subtitleStyle)} />
              </p>
            )}
          </div>
          {/* Right: price */}
          <div className="text-right shrink-0">
            {props.originalPrice && (
              <p className="text-sm text-gray-400 line-through mb-0.5">
                <RenderText fallback={props.originalPrice} style={applyTextStyle(props.originalPriceStyle)} />
              </p>
            )}
            {props.price && (
              <p className="text-2xl font-extrabold" style={{ color: accent }}>
                <RenderText html={props.priceHtml} fallback={props.price} style={applyTextStyle({ ...props.priceStyle, color: accent, bold: true })} />
              </p>
            )}
          </div>
        </div>
        {/* CTA Button */}
        {props.ctaText && (
          <a
            href={props.ctaUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full text-center py-3 font-semibold text-sm rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: props.ctaColor || accent, color: props.ctaTextColor || '#FFFFFF' }}
          >
            <RenderText html={props.ctaTextHtml} fallback={props.ctaText} style={applyTextStyle(props.ctaTextStyle)} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Layout: Card ──────────────────────────────────────────────────
function CardLayout(props: OfferRendererProps) {
  const accent = props.accentColor || '#7C3AED';
  const bg = props.backgroundColor || '#F9FAFB';
  const br = props.borderRadius ?? 16;

  return (
    <div className="w-full rounded-2xl overflow-hidden border" style={{ backgroundColor: bg, borderRadius: `${br}px`, borderColor: props.borderColor || '#E5E7EB' }}>
      <div className="p-6 text-center">
        {/* Micro title as badge */}
        {props.microTitle && (
          <span className="inline-block px-3 py-1 text-xs font-bold rounded-full mb-3" style={{ backgroundColor: accent + '15', color: accent }}>
            <RenderText html={props.microTitleHtml} fallback={props.microTitle} />
          </span>
        )}
        {/* Product name */}
        {props.productName && (
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            <RenderText html={props.productNameHtml} fallback={props.productName} style={applyTextStyle(props.productNameStyle)} />
          </h3>
        )}
        {/* Price */}
        <div className="my-4">
          {props.originalPrice && (
            <p className="text-sm text-gray-400 line-through">
              <RenderText fallback={props.originalPrice} style={applyTextStyle(props.originalPriceStyle)} />
            </p>
          )}
          {props.price && (
            <p className="text-4xl font-extrabold" style={{ color: accent }}>
              <RenderText html={props.priceHtml} fallback={props.price} style={applyTextStyle({ ...props.priceStyle, color: accent, bold: true })} />
            </p>
          )}
        </div>
        {/* Subtitle */}
        {props.subtitle && (
          <p className="text-sm text-gray-500 mb-4">
            <RenderText html={props.subtitleHtml} fallback={props.subtitle} style={applyTextStyle(props.subtitleStyle)} />
          </p>
        )}
        {/* CTA */}
        {props.ctaText && (
          <a
            href={props.ctaUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 font-semibold text-sm rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: props.ctaColor || accent, color: props.ctaTextColor || '#FFFFFF' }}
          >
            <RenderText html={props.ctaTextHtml} fallback={props.ctaText} style={applyTextStyle(props.ctaTextStyle)} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Layout: Minimal ───────────────────────────────────────────────
function MinimalLayout(props: OfferRendererProps) {
  const accent = props.accentColor || '#059669';

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {props.microTitle && (
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: accent }}>
              <RenderText html={props.microTitleHtml} fallback={props.microTitle} />
            </p>
          )}
          {props.productName && (
            <p className="text-base font-medium text-gray-900">
              <RenderText html={props.productNameHtml} fallback={props.productName} style={applyTextStyle(props.productNameStyle)} />
            </p>
          )}
        </div>
        <div className="text-right shrink-0 ml-4">
          {props.originalPrice && (
            <p className="text-xs text-gray-400 line-through">
              <RenderText fallback={props.originalPrice} style={applyTextStyle(props.originalPriceStyle)} />
            </p>
          )}
          {props.price && (
            <p className="text-2xl font-bold" style={{ color: accent }}>
              <RenderText html={props.priceHtml} fallback={props.price} style={applyTextStyle({ ...props.priceStyle, color: accent, bold: true })} />
            </p>
          )}
        </div>
      </div>
      {props.subtitle && (
        <p className="text-xs text-gray-500 mt-1">
          <RenderText html={props.subtitleHtml} fallback={props.subtitle} style={applyTextStyle(props.subtitleStyle)} />
        </p>
      )}
      {props.ctaText && (
        <a
          href={props.ctaUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block w-full text-center py-2.5 font-semibold text-sm rounded-lg border-2 transition-colors hover:opacity-90"
          style={{ borderColor: props.ctaColor || accent, color: props.ctaColor || accent, backgroundColor: 'transparent' }}
        >
          <RenderText html={props.ctaTextHtml} fallback={props.ctaText} style={applyTextStyle(props.ctaTextStyle)} />
        </a>
      )}
    </div>
  );
}

// ─── Layout: Highlighted ───────────────────────────────────────────
function HighlightedLayout(props: OfferRendererProps) {
  const accent = props.accentColor || '#EA580C';
  const bg = props.backgroundColor || accent;
  const br = props.borderRadius ?? 12;

  return (
    <div className="w-full rounded-xl overflow-hidden" style={{ backgroundColor: bg, borderRadius: `${br}px` }}>
      <div className="p-6 text-center">
        {/* Micro title */}
        {props.microTitle && (
          <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/80">
            <RenderText html={props.microTitleHtml} fallback={props.microTitle} />
          </p>
        )}
        {/* Product name */}
        {props.productName && (
          <h3 className="text-xl font-bold text-white mb-3">
            <RenderText html={props.productNameHtml} fallback={props.productName} style={{ color: '#FFFFFF', fontWeight: 'bold' }} />
          </h3>
        )}
        {/* Price */}
        <div className="my-4">
          {props.originalPrice && (
            <p className="text-sm text-white/50 line-through">
              <RenderText fallback={props.originalPrice} />
            </p>
          )}
          {props.price && (
            <p className="text-5xl font-extrabold text-white drop-shadow-lg">
              <RenderText html={props.priceHtml} fallback={props.price} style={{ color: '#FFFFFF', fontWeight: 900 }} />
            </p>
          )}
        </div>
        {/* Subtitle */}
        {props.subtitle && (
          <p className="text-sm text-white/70 mb-4">
            <RenderText html={props.subtitleHtml} fallback={props.subtitle} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </p>
        )}
        {/* CTA */}
        {props.ctaText && (
          <a
            href={props.ctaUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-10 py-4 font-bold text-base rounded-xl bg-white transition-all hover:scale-105 shadow-xl"
            style={{ color: accent }}
          >
            <RenderText html={props.ctaTextHtml} fallback={props.ctaText} style={{ color: accent, fontWeight: 'bold' }} />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Main Renderer ─────────────────────────────────────────────────
export function OfferRenderer(props: OfferRendererProps) {
  const layout = props.layout || 'inlead';

  switch (layout) {
    case 'card':
      return <CardLayout {...props} />;
    case 'minimal':
      return <MinimalLayout {...props} />;
    case 'highlighted':
      return <HighlightedLayout {...props} />;
    case 'inlead':
    default:
      return <InLeadLayout {...props} />;
  }
}
