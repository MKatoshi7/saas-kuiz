import { NextResponse } from 'next/server'
import { FUNNEL_TEMPLATES } from '@/lib/templates'

export async function GET() {
    return NextResponse.json({ templates: FUNNEL_TEMPLATES })
}
