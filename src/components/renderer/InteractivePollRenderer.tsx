import React, { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp } from 'lucide-react';

export interface PollOption {
    id: string;
    text: string;
    votes?: number;
    color?: string;
}

export interface InteractivePollData {
    question: string;
    options: PollOption[];
    allowMultiple?: boolean;
    showResults?: 'always' | 'after-vote' | 'never';
    showPercentages?: boolean;
    showVoteCount?: boolean;
    totalVotes?: number;
    animateResults?: boolean;
    theme?: 'default' | 'gradient' | 'minimal';
}

interface InteractivePollRendererProps {
    data: InteractivePollData;
    className?: string;
    onVote?: (optionIds: string[]) => void;
}

export function InteractivePollRenderer({ data, className = '', onVote }: InteractivePollRendererProps) {
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [hasVoted, setHasVoted] = useState(false);
    const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
    const [isAnimating, setIsAnimating] = useState(false);

    const {
        question,
        options = [],
        allowMultiple = false,
        showResults = 'after-vote',
        showPercentages = true,
        showVoteCount = true,
        totalVotes = 0,
        animateResults = true,
        theme = 'default'
    } = data;

    // Initialize local votes from data
    useEffect(() => {
        const votes: Record<string, number> = {};
        options.forEach(option => {
            votes[option.id] = option.votes || 0;
        });
        setLocalVotes(votes);
    }, [options]);

    // Calculate total votes
    const calculatedTotalVotes = Object.values(localVotes).reduce((sum, votes) => sum + votes, 0) || totalVotes;

    // Calculate percentages
    const getPercentage = (optionId: string) => {
        if (calculatedTotalVotes === 0) return 0;
        return Math.round((localVotes[optionId] / calculatedTotalVotes) * 100);
    };

    // Handle option selection
    const handleOptionClick = (optionId: string) => {
        if (hasVoted && showResults === 'after-vote') return;

        if (allowMultiple) {
            setSelectedOptions(prev => {
                const newSet = new Set(prev);
                if (newSet.has(optionId)) {
                    newSet.delete(optionId);
                } else {
                    newSet.add(optionId);
                }
                return newSet;
            });
        } else {
            setSelectedOptions(new Set([optionId]));
        }
    };

    // Handle vote submission
    const handleVote = () => {
        if (selectedOptions.size === 0) return;

        // Update local votes
        const newVotes = { ...localVotes };
        selectedOptions.forEach(optionId => {
            newVotes[optionId] = (newVotes[optionId] || 0) + 1;
        });
        setLocalVotes(newVotes);
        setHasVoted(true);

        // Trigger animation
        if (animateResults) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1000);
        }

        // Call parent callback
        if (onVote) {
            onVote(Array.from(selectedOptions));
        }

        // Track vote event
        if (typeof window !== 'undefined' && (window as any).trackEvent) {
            (window as any).trackEvent('poll_vote', {
                question,
                options: Array.from(selectedOptions)
            });
        }
    };

    // Determine if results should be shown
    const shouldShowResults =
        showResults === 'always' ||
        (showResults === 'after-vote' && hasVoted);

    // Get option color
    const getOptionColor = (option: PollOption, index: number) => {
        if (option.color) return option.color;

        const colors = [
            '#3B82F6', // blue
            '#10B981', // green
            '#F59E0B', // amber
            '#EF4444', // red
            '#8B5CF6', // purple
            '#EC4899', // pink
        ];
        return colors[index % colors.length];
    };

    // Get theme classes
    const getThemeClasses = () => {
        switch (theme) {
            case 'gradient':
                return 'bg-gradient-to-br from-blue-50 to-purple-50 border-0';
            case 'minimal':
                return 'bg-transparent border-0';
            default:
                return 'bg-white border border-gray-200';
        }
    };

    return (
        <div className={`interactive-poll-component ${getThemeClasses()} rounded-xl p-6 shadow-sm ${className}`}>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Enquete</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{question}</h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6">
                {options.map((option, index) => {
                    const percentage = getPercentage(option.id);
                    const isSelected = selectedOptions.has(option.id);
                    const optionColor = getOptionColor(option, index);

                    return (
                        <div key={option.id} className="relative">
                            <button
                                onClick={() => handleOptionClick(option.id)}
                                disabled={hasVoted && showResults === 'after-vote'}
                                className={`
                                    w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                                    ${isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                    }
                                    ${hasVoted && showResults === 'after-vote' ? 'cursor-default' : 'cursor-pointer'}
                                    ${isAnimating ? 'animate-pulse' : ''}
                                `}
                            >
                                {/* Result Bar (Background) */}
                                {shouldShowResults && (
                                    <div
                                        className="absolute inset-0 rounded-lg transition-all duration-1000 ease-out"
                                        style={{
                                            background: `linear-gradient(to right, ${optionColor}15 ${percentage}%, transparent ${percentage}%)`,
                                        }}
                                    />
                                )}

                                {/* Content */}
                                <div className="relative flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        {/* Radio/Checkbox */}
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                                        `}>
                                            {isSelected && (
                                                <div className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </div>

                                        {/* Option Text */}
                                        <span className="font-medium text-gray-900">{option.text}</span>
                                    </div>

                                    {/* Results */}
                                    {shouldShowResults && (
                                        <div className="flex items-center gap-3">
                                            {showVoteCount && (
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Users size={14} />
                                                    <span>{localVotes[option.id] || 0}</span>
                                                </div>
                                            )}
                                            {showPercentages && (
                                                <div className="font-bold text-lg" style={{ color: optionColor }}>
                                                    {percentage}%
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Vote Button */}
            {!hasVoted && (
                <button
                    onClick={handleVote}
                    disabled={selectedOptions.size === 0}
                    className={`
                        w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
                        ${selectedOptions.size > 0
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {allowMultiple && selectedOptions.size > 1
                        ? `Votar (${selectedOptions.size} selecionadas)`
                        : 'Votar'
                    }
                </button>
            )}

            {/* Footer Stats */}
            {shouldShowResults && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <TrendingUp size={16} />
                            <span>Total de votos: <strong>{calculatedTotalVotes}</strong></span>
                        </div>
                        {hasVoted && (
                            <span className="text-green-600 font-medium">✓ Você votou</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InteractivePollRenderer;
