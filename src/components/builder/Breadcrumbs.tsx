'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    return (
        <nav className={`flex items-center gap-2 text-sm ${className}`} aria-label="Breadcrumb">
            <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Dashboard"
            >
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-400" />

                    {item.href && !item.active ? (
                        <Link
                            href={item.href}
                            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={`font-medium ${item.active ? 'text-gray-900' : 'text-gray-600'}`}>
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
