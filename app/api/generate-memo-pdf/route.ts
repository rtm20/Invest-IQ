import { NextRequest, NextResponse } from 'next/server';
// import { generateInvestmentMemoPDF } from '../../../lib/memo-pdf-generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { memo, companyName } = await request.json();

    if (!memo || !companyName) {
      return NextResponse.json(
        { error: 'Missing memo data or company name' },
        { status: 400 }
      );
    }

    console.log('📄 Generating Investment Memo PDF for:', companyName);

    // Generate PDF - temporarily disabled until memo-pdf-generator is fixed
    // const pdfBlob = await generateInvestmentMemoPDF(memo, companyName);
    
    return NextResponse.json(
      { error: 'PDF generation temporarily unavailable' },
      { status: 503 }
    );
    
    // Convert blob to buffer
    // const arrayBuffer = await pdfBlob.arrayBuffer();
    // const buffer = Buffer.from(arrayBuffer);

    // console.log('✅ Investment Memo PDF generated successfully');

    // Return PDF as response
    // return new NextResponse(buffer, {
    //   status: 200,
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Investment_Memo.pdf"`,
    //     'Content-Length': buffer.length.toString(),
    //   },
    // });
  } catch (error) {
    console.error('❌ Investment Memo PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Investment Memo PDF' },
      { status: 500 }
    );
  }
}
