// API Route: Generate Investment Memo
import { NextRequest, NextResponse } from 'next/server';
import { investmentMemoGenerator } from '@/lib/investment-memo-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        console.log('📝 Generating investment memo...');

        const body = await request.json();
        const { analysisResults, competitiveAnalysis } = body;

        if (!analysisResults) {
            return NextResponse.json(
                { success: false, error: 'Analysis results are required' },
                { status: 400 }
            );
        }

        // Generate comprehensive investment memo
        const memo = await investmentMemoGenerator.generateInvestmentMemo({
            ...analysisResults,
            competitiveAnalysis
        });

        return NextResponse.json({
            success: true,
            memo,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Investment memo generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
