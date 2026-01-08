'use client';

import React, { useEffect, useState } from 'react';
import { FunnelEngine } from '@/components/renderer/FunnelEngine';
import { FunnelComponentData } from '@/types/funnel';
import { CheckCircle2 } from 'lucide-react';
import { ThemeWrapper } from '@/components/renderer/ThemeWrapper';
import { FunnelTheme } from '@/types/funnel';
import { useFunnelTracker } from '@/hooks/useFunnelTracker';

interface Step {
    id: string;
    title: string;
    order: number;
}

interface FunnelPageClientProps {
    funnelId: string;
    initialSteps: Step[];
    initialComponents: Record<string, FunnelComponentData[]>;
    themeConfig?: FunnelTheme;
}

export default function FunnelPageClient({ funnelId, initialSteps, initialComponents, themeConfig }: FunnelPageClientProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { visitorId, trackAnswer, trackLead } = useFunnelTracker(funnelId);

    // Store contact data temporarily to aggregate before sending
    const [contactData, setContactData] = useState<{ email?: string, phone?: string, name?: string }>({});

    // Log visitor ID for debugging
    useEffect(() => {
        if (visitorId) {
            console.log('✅ Visitor session initialized:', visitorId);
        }
    }, [visitorId]);

    const handleStepChange = (stepIndex: number) => {
        console.log(`📍 Step changed to ${stepIndex}`, initialSteps[stepIndex]?.title);
        setCurrentStepIndex(stepIndex);
    };

    const handleAnswer = async (stepId: string, componentId: string, value: any) => {
        const currentStep = initialSteps.find(s => s.id === stepId);
        const stepName = currentStep?.title || 'Unknown Step';

        // Convert value to string for tracking
        let answerValue = '';
        if (typeof value === 'string') {
            answerValue = value;
        } else if (Array.isArray(value)) {
            answerValue = value.join(', ');
        } else if (typeof value === 'object' && value !== null) {
            answerValue = JSON.stringify(value);
        } else {
            answerValue = String(value);
        }

        console.log('📝 Answer tracked:', {
            stepId,
            stepName,
            componentId,
            value: answerValue,
            visitorId
        });

        // Track the answer
        trackAnswer(stepId, stepName, answerValue);

        // Check if it's a lead capture field
        const component = initialComponents[stepId]?.find(c => c.id === componentId);
        if (component?.type === 'input') {
            const inputData = component.data as any;
            const newContactData = { ...contactData };

            if (inputData.inputType === 'email') {
                console.log('📧 Email captured:', answerValue);
                newContactData.email = answerValue;
            } else if (inputData.inputType === 'tel') {
                console.log('📱 Phone captured:', answerValue);
                newContactData.phone = answerValue;
            } else if (inputData.inputType === 'text' && inputData.label?.toLowerCase().includes('nome')) {
                console.log('👤 Name captured:', answerValue);
                newContactData.name = answerValue;
            }

            setContactData(newContactData);

            // Send lead data if we have email or phone
            if (newContactData.email || newContactData.phone) {
                console.log('💾 Saving lead with:', newContactData);
                await trackLead(newContactData.email, newContactData.phone, newContactData.name);
            }
        }
    };

    const handleComplete = async () => {
        console.log('✅ Funnel completed!');
        await trackLead(undefined, undefined, undefined, true); // Final lead event with isConverted=true
        setIsCompleted(true);
    };

    const defaultTheme: FunnelTheme = {
        primaryColor: '#2563EB',
        fontFamily: 'Inter',
        page: { type: 'color', value: '#f3f4f6' },
        container: {
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            shadow: 'xl',
            opacity: 1,
            blur: 0
        }
    };

    const currentTheme = { ...defaultTheme, ...themeConfig };

    if (isCompleted) {
        return (
            <ThemeWrapper theme={currentTheme}>
                <div className="p-8 text-center w-full">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Obrigado!</h2>
                    <p className="text-gray-600">Suas respostas foram enviadas com sucesso.</p>
                </div>
            </ThemeWrapper>
        );
    }

    // Render immediately without waiting for visitor ID
    return (
        <ThemeWrapper theme={currentTheme}>
            <div className="w-full">
                <FunnelEngine
                    funnelId={funnelId}
                    steps={initialSteps}
                    componentsByStep={initialComponents}
                    onStepChange={handleStepChange}
                    onAnswer={handleAnswer}
                    onComplete={handleComplete}
                    theme={currentTheme}
                />
            </div>
        </ThemeWrapper>
    );
}
