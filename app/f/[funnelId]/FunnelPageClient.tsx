'use client';

import React, { useEffect, useState } from 'react';
import { FunnelEngine } from '@/components/renderer/FunnelEngine';
import { FunnelComponentData } from '@/types/funnel';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { FunnelShell } from '@/components/renderer/FunnelShell';
import { FunnelTheme } from '@/types/funnel';
import { useFunnelTracker } from '@/hooks/useFunnelTracker';
import { sendFacebookEvent } from '../actions';

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
    marketingConfig?: {
        fbPixelId?: string;
        fbAccessToken?: string;
        gtmId?: string;
    };
}

export default function FunnelPageClient({ funnelId, initialSteps, initialComponents, themeConfig, marketingConfig }: FunnelPageClientProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { visitorId, trackAnswer, trackLead } = useFunnelTracker(funnelId);

    // Store contact data temporarily to aggregate before sending
    const [contactData, setContactData] = useState<{ email?: string, phone?: string, name?: string }>({});

    // Local answers state for dynamic variable interpolation
    const [localAnswers, setLocalAnswers] = useState<Record<string, any>>({});

    // Log visitor ID for debugging
    useEffect(() => {
        if (visitorId) {
            console.log('✅ Visitor session initialized:', visitorId);
        }
    }, [visitorId]);

    // Track PageView via CAPI on mount
    useEffect(() => {
        if (marketingConfig?.fbPixelId && marketingConfig?.fbAccessToken) {
            sendFacebookEvent(
                marketingConfig.fbPixelId,
                marketingConfig.fbAccessToken,
                'PageView',
                { funnelId },
                { external_id: visitorId }
            ).then(res => {
                if (res.success) console.log('✅ FB CAPI PageView sent');
                else console.error('❌ FB CAPI PageView failed', res.error);
            });
        }
    }, [marketingConfig, funnelId, visitorId]);

    const handleStepChange = (stepIndex: number) => {
        console.log(`📍 Step changed to ${stepIndex}`, initialSteps[stepIndex]?.title);
        setCurrentStepIndex(stepIndex);
    };

    const handleAnswer = async (stepId: string, componentId: string, value: any) => {
        const currentStep = initialSteps.find(s => s.id === stepId);
        const stepName = currentStep?.title || 'Unknown Step';

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

        trackAnswer(stepId, stepName, answerValue);

        // Store locally for dynamic variable interpolation
        setLocalAnswers(prev => ({ ...prev, [stepId]: answerValue }));

        const component = initialComponents[stepId]?.find(c => c.id === componentId);
        if (component?.type === 'input') {
            const inputData = component.data as any;
            const fieldName = (inputData.name || '').toLowerCase();
            const labelText = (inputData.label || '').toLowerCase();
            const varName = (inputData.variableName || '').toLowerCase();
            const newContactData = { ...contactData };

            const isEmail = inputData.inputType === 'email' ||
                varName.includes('email') || varName.includes('e-mail') ||
                fieldName.includes('email') || labelText.includes('email');

            const isPhone = inputData.inputType === 'tel' ||
                varName.includes('phone') || varName.includes('telefone') || varName.includes('whatsapp') || varName.includes('celular') ||
                fieldName.includes('phone') || fieldName.includes('telefone') || fieldName.includes('whatsapp') ||
                labelText.includes('phone') || labelText.includes('telefone') || labelText.includes('whatsapp');

            const isName = inputData.inputType === 'text' &&
                !newContactData.name &&
                (varName.includes('nome') || varName.includes('name') ||
                    fieldName.includes('nome') || labelText.includes('nome') ||
                    labelText.includes('nome completo'));

            if (isEmail && answerValue) {
                console.log('📧 Email captured:', answerValue);
                newContactData.email = answerValue;
            } else if (isPhone && answerValue) {
                console.log('📱 Phone captured:', answerValue);
                newContactData.phone = answerValue;
            } else if (isName && answerValue) {
                console.log('👤 Name captured:', answerValue);
                newContactData.name = answerValue;
            }

            setContactData(newContactData);

            if (newContactData.email || newContactData.phone) {
                console.log('💾 Saving lead with:', newContactData);
                await trackLead(newContactData.email, newContactData.phone, newContactData.name);
            }
        }
    };

    const handleComplete = async () => {
        console.log('✅ Funnel completed!');
        await trackLead(undefined, undefined, undefined, true); // Final lead event with isConverted=true

        // Send Lead event via CAPI
        if (marketingConfig?.fbPixelId && marketingConfig?.fbAccessToken) {
            sendFacebookEvent(
                marketingConfig.fbPixelId,
                marketingConfig.fbAccessToken,
                'Lead',
                { funnelId, status: 'completed' },
                {
                    external_id: visitorId,
                    em: contactData.email ? [contactData.email] : undefined, // Should be hashed ideally
                    ph: contactData.phone ? [contactData.phone] : undefined  // Should be hashed ideally
                }
            ).then(res => {
                if (res.success) console.log('✅ FB CAPI Lead sent');
                else console.error('❌ FB CAPI Lead failed', res.error);
            });
        }

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
            <FunnelShell theme={currentTheme}>
                <div className="p-10 sm:p-12 text-center w-full animate-fade-in-up">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-3xl blur-xl" />
                        <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-balance">Obrigado!</h2>
                    <p className="mt-3 text-muted-foreground text-balance">
                        Suas respostas foram enviadas com sucesso.
                    </p>
                    <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Sparkles className="w-3 h-3" />
                        Powered by Kuiz
                    </div>
                </div>
            </FunnelShell>
        );
    }

    // Render immediately without waiting for visitor ID
    return (
        <FunnelShell theme={currentTheme}>
            <div className="w-full">
                <FunnelEngine
                    funnelId={funnelId}
                    steps={initialSteps}
                    componentsByStep={initialComponents}
                    onStepChange={handleStepChange}
                    onAnswer={handleAnswer}
                    onComplete={handleComplete}
                    theme={currentTheme}
                    answers={localAnswers}
                />
            </div>
        </FunnelShell>
    );
}
