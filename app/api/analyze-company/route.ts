import { NextRequest, NextResponse } from 'next/server';
import { batchCompanyAnalyzer } from '../../../lib/batch-analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyFolder } = body;

    if (!companyFolder) {
      return NextResponse.json(
        { error: 'Company folder name is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing single company: ${companyFolder}`);

    // Analyze specific company
    const result = await batchCompanyAnalyzer.analyzeCompany(companyFolder);

    if (result.status === 'failed') {
      return NextResponse.json(
        { error: result.error || 'Analysis failed' },
        { status: 400 }
      );
    }

    console.log(`✅ Analysis completed for ${result.companyName}`);

    return NextResponse.json({
      success: true,
      company: result.companyName,
      analysis: result.analysis,
      processingTime: result.processingTime,
      documentsProcessed: result.documents.length
    });

  } catch (error) {
    console.error('❌ Company analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'Company analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Single Company Analysis API',
    description: 'Analyze a specific company from the Company Data directory',
    usage: 'POST /api/analyze-company with { "companyFolder": "01. Data stride" }',
    availableCompanies: [
      '01. Data stride',
      '02. Naario', 
      '03. Inlustro',
      '04. Ctruh',
      '05. Cashvisory',
      '06. Dr.Doodley',
      '07. Kredily',
      '08. Indishreshtha',
      '09. We360 AI',
      '10. Sensesemi',
      '11. Hexafun',
      '12. Timbuckdo',
      '13. Multipl',
      '14. Ziniosa'
    ]
  });
}