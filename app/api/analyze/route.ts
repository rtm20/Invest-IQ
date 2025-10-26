import { NextRequest, NextResponse } from 'next/server';
import { AIAnalyzer } from '@/lib/ai-analyzer';

export async function POST(request: NextRequest) {
    try {
        console.log('🤖 AI analysis API called');

        const body = await request.json();
        const { text, analysisType } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Text content is required for analysis' },
                { status: 400 }
            );
        }

        if (!analysisType || typeof analysisType !== 'string') {
            return NextResponse.json(
                { error: 'Analysis type is required' },
                { status: 400 }
            );
        }

        const validAnalysisTypes = ['company', 'financial', 'team', 'market', 'risk', 'recommendation'];
        if (!validAnalysisTypes.includes(analysisType)) {
            return NextResponse.json(
                {
                    error: 'Invalid analysis type',
                    validTypes: validAnalysisTypes
                },
                { status: 400 }
            );
        }

        // Validate text length
        if (text.length < 50) {
            return NextResponse.json(
                { error: 'Text content too short. Please provide more detailed information.' },
                { status: 400 }
            );
        }

        if (text.length > 50000) {
            return NextResponse.json(
                { error: 'Text content too long. Maximum 50,000 characters allowed.' },
                { status: 400 }
            );
        }

        console.log(`🔍 Performing comprehensive startup analysis (${text.length} characters)...`);

        // Use comprehensive AI analyzer
        const analyzer = new AIAnalyzer();
        const fullAnalysis = await analyzer.analyzeStartup(text);

        // Extract specific analysis type if requested
        let result;
        switch (analysisType) {
            case 'company':
                result = { companyInfo: fullAnalysis.companyInfo, confidence: fullAnalysis.confidence };
                break;
            case 'financial':
                result = { financialMetrics: fullAnalysis.financialMetrics, confidence: fullAnalysis.confidence };
                break;
            case 'team':
                result = { teamInfo: fullAnalysis.teamInfo, confidence: fullAnalysis.confidence };
                break;
            case 'market':
                result = { marketInfo: fullAnalysis.marketInfo, confidence: fullAnalysis.confidence };
                break;
            case 'risk':
                result = { riskFlags: fullAnalysis.riskFlags, confidence: fullAnalysis.confidence };
                break;
            case 'recommendation':
                result = { recommendation: fullAnalysis.recommendation, confidence: fullAnalysis.confidence };
                break;
            default:
                result = fullAnalysis;
        }

        console.log(`✅ Analysis completed for ${analysisType}`);

        return NextResponse.json({
            success: true,
            analysisType,
            result,
            metadata: {
                textLength: text.length,
                processedAt: new Date().toISOString(),
                model: (process.env.NEXT_PUBLIC_ENABLE_REAL_AI === 'true' || process.env.ENABLE_REAL_AI === 'true') ? 'gemini-2.5-pro' : 'demo-mode',
                confidence: fullAnalysis.confidence,
                processingTime: fullAnalysis.processingTime,
                analysisId: fullAnalysis.analysisId
            }
        });


    } catch (error) {
        console.error('Analysis API error:', error);

        return NextResponse.json(
            {
                error: 'Analysis failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'AI Startup Analyst API',
        version: '1.0.0',
        endpoints: {
            analyze: 'POST /api/analyze - Analyze startup documents',
            upload: 'POST /api/upload - Upload documents to Cloud Storage',
        },
        powered_by: 'Google Cloud AI',
    });
}
