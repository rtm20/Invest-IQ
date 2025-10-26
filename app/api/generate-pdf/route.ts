import { NextRequest, NextResponse } from 'next/server';
import { generatePDFReport } from '../../../lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const { analysisData, companyName } = await request.json();

    if (!analysisData || !companyName) {
      return NextResponse.json(
        { error: 'Missing analysis data or company name' },
        { status: 400 }
      );
    }

    console.log('📄 Generating PDF report for:', companyName);

    // Generate PDF
    const pdfBlob = await generatePDFReport(analysisData, companyName);
    
    // Convert blob to buffer
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('✅ PDF report generated successfully');

    // Return PDF as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_Report.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('❌ PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF report' },
      { status: 500 }
    );
  }
}