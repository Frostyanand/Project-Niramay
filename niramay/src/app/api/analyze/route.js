import { NextResponse } from 'next/server';

// The URL of your Python FastAPI backend
// In development, this defaults to localhost:8000
// Set BACKEND_URL in .env.local for production
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request) {
    try {
        const body = await request.json();
        const { vcf_url, drugs } = body;

        if (!vcf_url) {
            return NextResponse.json(
                { error: 'vcf_url is required' },
                { status: 400 }
            );
        }

        // Default drugs to analyze if none provided
        const drugsToAnalyze = drugs && drugs.length > 0
            ? drugs
            : ['Simvastatin', 'Warfarin', 'Clopidogrel', 'Azathioprine', 'Fluorouracil', 'Codeine'];

        // Forward the request to the Python FastAPI backend
        const backendResponse = await fetch(`${BACKEND_URL}/api/v1/analyze-vcf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vcf_url: vcf_url,
                drugs: drugsToAnalyze,
            }),
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error('Backend error:', errorText);
            return NextResponse.json(
                { error: `Backend analysis failed: ${backendResponse.statusText}`, detail: errorText },
                { status: backendResponse.status }
            );
        }

        const analysisData = await backendResponse.json();

        // Return the structured data to the frontend
        return NextResponse.json(analysisData, { status: 200 });

    } catch (error) {
        // This catches network errors (e.g., backend is offline)
        if (error.cause?.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    error: 'Analysis Engine Offline',
                    detail: 'Could not connect to the AI inference backend. Please ensure the Python service is running.',
                    offline: true,
                },
                { status: 503 }
            );
        }

        console.error('Analyze API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', detail: error.message },
            { status: 500 }
        );
    }
}
