import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Upload endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    const allowedExtensions = ['.pdf', '.pptx', '.docx', '.txt'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: PDF, PPTX, DOCX, TXT' },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    console.log(`📄 Processing file: ${file.name} (${file.size} bytes)`);

    // TODO: Process document and extract text
    // const processor = new DocumentProcessor();
    // const processedDocument = await processor.processFile(file);
    
    // For now, just read the file as text
    const text = await file.text();
    console.log(`✅ File read: ${text.length} characters`);

    // TODO: Perform AI analysis on the extracted text
    // const analyzer = new AIAnalyzer();
    // const analysisResult = await analyzer.analyzeStartup(text);
    
    // Mock analysis result for now
    const analysisResult = {
      companyInfo: { name: 'Test Company', industry: 'Technology' },
      financialMetrics: { currentRevenue: 1000000, revenueGrowthRate: 50 },
      teamInfo: { founders: [], totalEmployees: 10 },
      marketInfo: { tam: 1000000000, competitors: [] },
      riskFlags: [],
      recommendation: { decision: 'buy', score: 75 },
      confidence: 85,
      processingTime: 1000,
      analysisId: `analysis_${Date.now()}`
    };

    console.log(`🤖 AI analysis completed with ${analysisResult.confidence}% confidence`);

    // Mock additional insights
    const insights = {
      marketOpportunity: 'Strong market opportunity identified',
      competitiveAdvantage: 'Unique value proposition',
      scalabilityAssessment: 'High scalability potential',
      riskMitigation: 'Manageable risk profile'
    };

    const timestamp = Date.now();
    const documentId = `doc-${timestamp}`;

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        name: file.name,
        type: 'document',
        url: `processed/${documentId}`,
        uploadedAt: new Date(),
        processed: true,
        size: file.size,
        metadata: { processingMethod: 'text-extraction' }
      },
      extractedText: text,
      analysis: analysisResult,
      insights,
      processing: {
        method: 'text-extraction',
        confidence: analysisResult.confidence,
        processingTime: analysisResult.processingTime,
        analysisId: analysisResult.analysisId
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
