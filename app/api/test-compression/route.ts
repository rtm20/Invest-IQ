import { NextRequest, NextResponse } from 'next/server';
import { fileCompressor } from '@/lib/file-compressor';

/**
 * Test endpoint to demonstrate file compression
 * Upload a file to see detailed compression statistics
 */
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

    console.log('\n===========================================');
    console.log('🧪 COMPRESSION TEST STARTED');
    console.log('===========================================');
    console.log(`📁 File: ${file.name}`);
    console.log(`📊 Type: ${file.type}`);
    console.log(`📏 Original Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('-------------------------------------------');

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Test compression
    const startTime = Date.now();
    const result = await fileCompressor.compressIfNeeded(
      buffer,
      file.name,
      file.type
    );
    const compressionTime = Date.now() - startTime;

    const savedSize = result.originalSize - result.compressedSize;
    const savedPercent = ((savedSize / result.originalSize) * 100).toFixed(1);

    console.log('\n✅ COMPRESSION COMPLETE');
    console.log('-------------------------------------------');
    console.log(`⏱️  Time taken: ${compressionTime}ms`);
    console.log(`💾 Space saved: ${(savedSize / 1024 / 1024).toFixed(2)} MB (${savedPercent}%)`);
    console.log('===========================================\n');

    return NextResponse.json({
      success: true,
      compressionStats: {
        fileName: file.name,
        fileType: file.type,
        originalSize: result.originalSize,
        originalSizeMB: (result.originalSize / 1024 / 1024).toFixed(2),
        compressedSize: result.compressedSize,
        compressedSizeMB: (result.compressedSize / 1024 / 1024).toFixed(2),
        compressionRatio: result.compressionRatio.toFixed(2),
        compressionMethod: result.method,
        spaceSaved: savedSize,
        spaceSavedMB: (savedSize / 1024 / 1024).toFixed(2),
        spaceSavedPercent: savedPercent,
        compressionTimeMs: compressionTime,
        wasCompressed: result.method !== 'none',
        underLimit: result.compressedSize <= 4.5 * 1024 * 1024,
        googleVisionAPILimit: '4.5 MB',
      },
      message: result.method === 'none' 
        ? '✅ File is already under the size limit - no compression needed!'
        : `🎉 File compressed successfully! Saved ${savedPercent}% of space.`
    });

  } catch (error) {
    console.error('❌ Compression test error:', error);
    return NextResponse.json(
      { 
        error: 'Compression test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
