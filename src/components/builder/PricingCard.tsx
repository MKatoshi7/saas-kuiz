import React from 'react';

interface PricingCardProps {
    data: {
        layout?: 'vertical' | 'compact';
        title?: string;
        price?: string;
        badge?: string;
        discount?: string;
        condition?: string;
        buttonText?: string;
        features?: string[];
        recommended?: boolean;
        originalPrice?: string;
    };
}

export function PricingCard({ data }: PricingCardProps) {
    const layout = data.layout || 'vertical';

    if (layout === 'compact') {
        // Compact horizontal layout (like the uploaded image)
        return (
            <div className=" bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 max-w-[280px]">
                {/* Header Badge */}
                {data.badge && (
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-center py-2 px-4">
                        <span className="text-sm font-semibold">{data.badge}</span>
                    </div>
                )}

                {/* Content */}
                <div className="p-4 flex items-center justify-between">
                    {/* Left side - Title */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                            {data.title || 'Plano PRO'}
                        </h3>
                    </div>

                    {/* Right side - Price */}
                    <div className="text-right">
                        {data.discount && (
                            <div className="text-xs text-green-600 font-semibold mb-1">
                                {data.discount}
                            </div>
                        )}
                        <div className="text-2xl font-bold text-gray-900">
                            {data.price || 'R$ 197,00'}
                        </div>
                        {data.condition && (
                            <div className="text-xs text-gray-500">
                                {data.condition}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Vertical traditional layout
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.title || 'Plano Premium'}</h3>
            <div className="text-4xl font-bold text-blue-600 mb-4">{data.price || 'R$ 99'}</div>
            {data.features && data.features.length > 0 && (
                <ul className="space-y-2 mb-6">
                    {data.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                    ))}
                </ul>
            )}
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                {data.buttonText || 'Assinar Agora'}
            </button>
        </div>
    );
}
