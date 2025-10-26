import { NextRequest, NextResponse } from 'next/server';
import { batchCompanyAnalyzer } from '../../../lib/batch-analyzer';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting batch company analysis...');

    // Run batch analysis
    const report = await batchCompanyAnalyzer.analyzeAllCompanies();

    console.log('✅ Batch analysis completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Batch analysis completed',
      report: {
        summary: report.summary,
        topCompanies: report.companies
          .filter(c => c.status === 'success')
          .sort((a, b) => (b.analysis?.analysis.investmentRecommendation.score || 0) - (a.analysis?.analysis.investmentRecommendation.score || 0))
          .slice(0, 5),
        insights: report.insights,
        benchmarks: report.benchmarks
      },
      metadata: {
        processingTime: report.summary.processingTime,
        analysisDate: report.summary.analysisDate,
        companiesAnalyzed: report.summary.totalCompanies,
        successRate: Math.round((report.summary.successfulAnalyses / report.summary.totalCompanies) * 100)
      }
    });

  } catch (error) {
    console.error('❌ Batch analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Batch analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Batch Company Analysis API',
    description: 'Analyze all companies in the Company Data directory',
    usage: 'POST /api/batch-analyze to start batch analysis',
    features: [
      'Multi-document analysis per company',
      'Cross-company benchmarking',
      'Investment opportunity ranking',
      'Risk pattern identification',
      'Industry trend analysis'
    ]
  });
}