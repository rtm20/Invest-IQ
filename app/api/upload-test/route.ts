import { NextRequest, NextResponse } from 'next/server';

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

    console.log(`📄 Test upload received: ${file.name} (${file.size} bytes)`);

    return NextResponse.json({
      success: true,
      message: 'Test upload successful',
      file: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('Test upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Test upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Upload test endpoint is working',
    timestamp: new Date().toISOString()
  });
}