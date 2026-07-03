'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, ShoppingCart, UserPlus, Users } from 'lucide-react';

interface SocialProofRendererProps {
  style: string;
  text: string;
  number: number;
  min: number;
  max: number;
  interval: number;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: number;
  textHtml?: string;
}

const STYLE_CONFIG = {
  viewing: { icon: Eye, defaultText: 'pessoas estão vendo agora', defaultIcon: '👁️' },
  buying: { icon: ShoppingCart, defaultText: 'pessoas compraram nas últimas 24h', defaultIcon: '🛒' },
  recent: { icon: UserPlus, defaultText: 'pessoas acabaram de se inscrever', defaultIcon: '✅' },
  counter: { icon: Users, defaultText: 'pessoas já participaram', defaultIcon: '👥' },
};

const NAMES = ['Ana', 'Carlos', 'Maria', 'Pedro', 'Julia', 'Lucas', 'Beatriz', 'Gabriel', 'Camila', 'Rafael'];
const CITIES = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Salvador', 'Brasília', 'Fortaleza'];

export function SocialProofRenderer({
  style = 'viewing',
  text,
  number = 47,
  min = 20,
  max = 80,
  interval = 5,
  icon,
  backgroundColor,
  textColor,
  borderRadius = 12,
  textHtml,
}: SocialProofRendererProps) {
  const [currentNumber, setCurrentNumber] = useState(number);
  const [recentName, setRecentName] = useState('');
  const [recentCity, setRecentCity] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const config = STYLE_CONFIG[style as keyof typeof STYLE_CONFIG] || STYLE_CONFIG.viewing;
  const IconComponent = config.icon;

  useEffect(() => {
    if (style === 'recent') {
      setRecentName(NAMES[Math.floor(Math.random() * NAMES.length)]);
      setRecentCity(CITIES[Math.floor(Math.random() * CITIES.length)]);
    }

    intervalRef.current = setInterval(() => {
      const delta = Math.random() > 0.5 ? 1 : -1;
      setCurrentNumber(prev => {
        const next = prev + delta;
        if (next < min) return min + 1;
        if (next > max) return max - 1;
        return next;
      });

      if (style === 'recent') {
        setRecentName(NAMES[Math.floor(Math.random() * NAMES.length)]);
        setRecentCity(CITIES[Math.floor(Math.random() * CITIES.length)]);
      }
    }, interval * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [style, min, max, interval]);

  const displayText = text || config.defaultText;
  const displayIcon = icon || config.defaultIcon;

  if (style === 'recent') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
        style={{
          backgroundColor: backgroundColor || '#F0FDF4',
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <span className="text-sm">{displayIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: textColor || '#166534' }}>
            <span className="font-bold">{recentName}</span> de <span className="font-bold">{recentCity}</span> acabou de participar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
      style={{
        backgroundColor: backgroundColor || '#F0FDF4',
        borderRadius: `${borderRadius}px`,
      }}
    >
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 animate-pulse">
        <span className="text-sm">{displayIcon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: textColor || '#166534' }}>
          <span className="font-bold text-base">{currentNumber}</span>{' '}
          {textHtml ? (
            <span dangerouslySetInnerHTML={{ __html: textHtml }} />
          ) : (
            <span>{displayText}</span>
          )}
        </p>
      </div>
    </div>
  );
}
