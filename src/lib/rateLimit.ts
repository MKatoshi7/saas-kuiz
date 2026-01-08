import { NextRequest } from 'next/server';

const ipRequestCounts = new Map<string, { count: number; lastReset: number }>();
const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute

export function isRateLimited(request: NextRequest): boolean {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const record = ipRequestCounts.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > WINDOW_SIZE) {
        record.count = 0;
        record.lastReset = now;
    }

    record.count++;
    ipRequestCounts.set(ip, record);

    return record.count > MAX_REQUESTS;
}
