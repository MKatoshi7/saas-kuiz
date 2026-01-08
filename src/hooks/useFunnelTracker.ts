'use client';

import { useState, useEffect } from 'react';

// Helper to get cookie value
function getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

interface TrackingPayload {
    visitorId: string;
    stepId: string;
    stepName: string;
    action: string;
    value: string;
}

export function useFunnelTracker(funnelId: string) {
    const [visitorId, setVisitorId] = useState<string | null>(null);

    // Initialize session on mount
    useEffect(() => {
        const initSession = async () => {
            // ALWAYS create a new session on mount (per user request for F5 = new visitor)
            // We do NOT check localStorage anymore.

            // Capture UTM parameters from URL
            const urlParams = new URLSearchParams(window.location.search);
            const utmParams = {
                utm_source: urlParams.get('utm_source') || undefined,
                utm_medium: urlParams.get('utm_medium') || undefined,
                utm_campaign: urlParams.get('utm_campaign') || undefined,
                utm_term: urlParams.get('utm_term') || undefined,
                utm_content: urlParams.get('utm_content') || undefined,
            };

            // Capture Facebook Click ID (fbclid) and cookies
            const fbclid = urlParams.get('fbclid');
            const fbc = getCookie('_fbc') || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
            const fbp = getCookie('_fbp') || `fb.1.${Date.now()}.${Math.random().toString(36).substring(2)}`;

            // Capture additional tracking data
            const referrer = document.referrer || undefined;
            const userAgent = navigator.userAgent || undefined;

            // Try to get geolocation (city, state) - uses IP-based service
            let geoData: any = {};
            try {
                const geoResponse = await fetch('https://ipapi.co/json/');
                if (geoResponse.ok) {
                    geoData = await geoResponse.json();
                }
            } catch (e) {
                console.log('Could not fetch geolocation');
            }

            // Build visitor data payload
            const visitorData = {
                fbc,
                fbp,
                city: geoData.city,
                region: geoData.region,
                country: geoData.country_name,
                ip: geoData.ip,
            };

            // Log UTM detection
            if (utmParams.utm_source) {
                console.log('🎯 UTM Parameters detected:', utmParams);
            }

            try {
                // Create new visitor session with all tracking data
                const res = await fetch('/api/track/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        funnelId,
                        ...utmParams,
                        referrer,
                        userAgent,
                        visitorData
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    const vid = data.visitorId;

                    // We do NOT save to localStorage anymore

                    console.log('✅ NEW Session created:', {
                        id: vid,
                        funnelId,
                        utm_source: utmParams.utm_source,
                        city: geoData.city
                    });

                    setVisitorId(vid);
                }
            } catch (error) {
                console.error('Failed to initialize visitor session:', error);
            }
        };

        if (funnelId) {
            initSession();
        }
    }, [funnelId]);

    const [eventQueue, setEventQueue] = useState<TrackingPayload[]>([]);

    // Process queued events when visitorId is available
    useEffect(() => {
        if (visitorId && eventQueue.length > 0) {
            console.log(`Processing ${eventQueue.length} queued events for visitor ${visitorId}`);
            eventQueue.forEach(payload => {
                const payloadWithVisitorId = { ...payload, visitorId };
                sendEvent(payloadWithVisitorId);
            });
            setEventQueue([]);
        }
    }, [visitorId, eventQueue]);

    const sendEvent = (payload: TrackingPayload) => {
        // Use sendBeacon for reliability (works even during page navigation)
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        const sent = navigator.sendBeacon('/api/track/event', blob);

        if (!sent) {
            // Fallback to fetch if beacon fails
            fetch('/api/track/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(console.error);
        }
    };

    // Track quiz answer with actual value
    const trackAnswer = (stepId: string, question: string, answerValue: string) => {
        const payload: TrackingPayload = {
            visitorId: visitorId || '', // Placeholder if not ready
            stepId,
            stepName: question,
            action: 'answer',
            value: answerValue // THE KEY: Save actual answer text
        };

        if (!visitorId) {
            console.log('Queueing event (visitorId not ready):', payload);
            setEventQueue(prev => [...prev, payload]);
            return;
        }

        sendEvent(payload);
    };

    // Track lead capture + fire pixels with COMPLETE Facebook data
    const trackLead = async (email?: string, phone?: string, name?: string, isConverted: boolean = false) => {
        if (!visitorId) return;

        try {
            // Generate external_id (Facebook uses SHA-256 hash of email)
            let external_id: string | undefined;
            if (email) {
                const encoder = new TextEncoder();
                const data = encoder.encode(email.toLowerCase().trim());
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                external_id = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }

            // Get current URL for event_source_url
            const event_source_url = window.location.href;
            const action_source = 'website';

            // 1. Save to database with ALL data
            await fetch('/api/track/lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    visitorId,
                    email,
                    phone,
                    name,
                    external_id,
                    event_source_url,
                    action_source,
                    isConverted
                })
            });

            console.log('✅ Lead tracked with complete data:', {
                email: email ? '✓' : '✗',
                phone: phone ? '✓' : '✗',
                name: name ? '✓' : '✗',
                external_id: external_id ? '✓ (hashed)' : '✗',
                event_source_url
            });

            // 2. Fire Facebook Pixel with enhanced data
            if (typeof window !== 'undefined' && (window as any).fbq) {
                (window as any).fbq('track', 'Lead', {
                    content_name: 'Funnel Signup',
                    value: 0.00,
                    currency: 'BRL',
                    // Enhanced Facebook data
                    external_id: external_id,
                    em: email ? await hashData(email) : undefined,
                    ph: phone ? await hashData(phone) : undefined,
                    fn: name ? await hashData(name.split(' ')[0]) : undefined,
                    ln: name ? await hashData(name.split(' ').slice(-1)[0]) : undefined,
                });

                console.log('📘 Facebook Pixel fired with enhanced matching');
            }

            // 3. Fire TikTok Pixel
            if (typeof window !== 'undefined' && (window as any).ttq) {
                (window as any).ttq.track('CompleteRegistration', {
                    email: email,
                    phone_number: phone,
                });
            }
        } catch (error) {
            console.error('Failed to track lead:', error);
        }
    };

    // Helper to hash data for Facebook (they want hashed PII)
    async function hashData(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataEncoded = encoder.encode(data.toLowerCase().trim());
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataEncoded);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    return { visitorId, trackAnswer, trackLead };
}
