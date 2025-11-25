// API Route: AI-Powered Competitive Intelligence Analysis
import { NextRequest, NextResponse } from 'next/server';
import { aiCompetitiveIntelligence } from '@/lib/ai-competitive-intelligence';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        console.log('🔍 Starting AI competitive intelligence analysis...');

        const body = await request.json();
        const { companyName, industry, description, businessModel, sector } = body;

        if (!companyName || !industry) {
            return NextResponse.json(
                { success: false, error: 'Company name and industry are required' },
                { status: 400 }
            );
        }

        console.log('📊 Analyzing competitors for sector:', sector || 'Not specified');

        // Perform AI-powered competitive analysis
        const analysis = await aiCompetitiveIntelligence.analyzeCompetitors(
            companyName,
            industry,
            description || '', // Use description field from frontend
            businessModel || '', // Use businessModel as targetMarket
            sector || '' // Pass sector to improve competitor discovery
        );

        return NextResponse.json({
            success: true,
            analysis,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Competitive intelligence API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
