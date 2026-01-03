import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed for Hobby plan

async function handler(req: NextRequest) {
    const url = new URL(req.url);
    const target = url.searchParams.get('target');

    if (!target) {
        return NextResponse.json({ error: 'Missing target param' }, { status: 400 });
    }

    try {
        const options: RequestInit = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const body = await req.text();
            options.body = body;
        }

        const response = await fetch(target, options);

        // Forward the response (Binary Safe)
        const body = await response.arrayBuffer();

        return new NextResponse(body, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
            }
        });
    } catch (e) {
        return NextResponse.json({ error: String(e) }, { status: 500 });
    }
}

export { handler as GET, handler as POST };
