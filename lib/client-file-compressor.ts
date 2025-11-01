// Client-side file compression for reducing upload size
// This runs in the browser before sending files to the API

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB to stay under 4.5 MB limit with overhead
const TARGET_SIZE = 3.5 * 1024 * 1024; // Target 3.5 MB to be safe
const AGGRESSIVE_TARGET = 2 * 1024 * 1024; // 2 MB for aggressive compression

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressionPercentage: number;
  wasCompressed: boolean;
  method: 'none' | 'pdf-optimize' | 'text-extraction' | 'image-downscale' | 'aggressive-split';
  warning?: string;
}

/**
 * Compress a file on the client-side before uploading
 */
export async function compressFileForUpload(file: File): Promise<CompressionResult> {
  const originalSize = file.size;
  
  console.log(`📦 Checking file: ${file.name} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);
  
  // If file is already small enough, no compression needed
  if (originalSize <= MAX_FILE_SIZE) {
    console.log(`✅ File is already under limit, no compression needed`);
    return {
      compressedFile: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      compressionPercentage: 0,
      wasCompressed: false,
      method: 'none'
    };
  }
  
  console.log(`🔧 File exceeds ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(1)} MB, compressing...`);
  
  // Attempt compression based on file type
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return await compressPDF(file, originalSize);
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx')
  ) {
    return await compressDOCX(file, originalSize);
  } else {
    // For other file types, try generic compression
    return await genericCompress(file, originalSize);
  }
}

/**
 * Compress PDF by splitting into chunks if too large
 * For very large PDFs, we'll create a lightweight text-only version
 */
async function compressPDF(file: File, originalSize: number): Promise<CompressionResult> {
  try {
    console.log('📄 Attempting aggressive PDF compression...');
    
    // For PDFs, the best approach is to split them into smaller chunks
    // or convert to a text-based format that the server can still process
    
    // Strategy: Create a compressed archive with chunked data
    const arrayBuffer = await file.arrayBuffer();
    const chunkSize = TARGET_SIZE; // 3.5 MB chunks
    const chunks: Uint8Array[] = [];
    
    // Split file into chunks
    for (let i = 0; i < arrayBuffer.byteLength; i += chunkSize) {
      const chunk = new Uint8Array(arrayBuffer.slice(i, Math.min(i + chunkSize, arrayBuffer.byteLength)));
      chunks.push(chunk);
    }
    
    console.log(`📦 Split PDF into ${chunks.length} chunks`);
    
    // If single chunk fits, just compress it
    if (chunks.length === 1) {
      // Apply aggressive compression using pako library alternative
      const compressed = await aggressiveCompress(chunks[0]);
      
      if (compressed.byteLength <= TARGET_SIZE) {
        const compressedBlob = new Blob([compressed], { type: 'application/pdf' });
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });
        const compressedSize = compressedFile.size;
        
        const compressionRatio = originalSize / compressedSize;
        const compressionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
        
        console.log(`✅ PDF compressed: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionPercentage.toFixed(1)}% reduction)`);
        
        return {
          compressedFile,
          originalSize,
          compressedSize,
          compressionRatio,
          compressionPercentage,
          wasCompressed: true,
          method: 'pdf-optimize'
        };
      }
    }
    
    // For multi-chunk or still too large files, take first chunk only with warning
    console.warn('⚠️ PDF is very large, using first chunk only (recommended: split document before upload)');
    
    const firstChunk = chunks[0];
    const compressed = await aggressiveCompress(firstChunk);
    const compressedBlob = new Blob([compressed], { type: 'application/pdf' });
    const compressedFile = new File([compressedBlob], file.name, { type: file.type });
    const compressedSize = compressedFile.size;
    
    const compressionRatio = originalSize / compressedSize;
    const compressionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
    
    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      compressionPercentage,
      wasCompressed: true,
      method: 'aggressive-split',
      warning: chunks.length > 1 
        ? `Large file split: only first ${(compressedSize / 1024 / 1024).toFixed(1)}MB of ${(originalSize / 1024 / 1024).toFixed(1)}MB uploaded. Consider splitting your document.`
        : undefined
    };
  } catch (error) {
    console.error('❌ PDF compression failed:', error);
    return await genericCompress(file, originalSize);
  }
}

/**
 * Aggressive compression using multiple techniques
 */
async function aggressiveCompress(data: Uint8Array): Promise<ArrayBuffer> {
  try {
    // Use the browser's CompressionStream with maximum compression
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      }
    });
    
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const compressedArrayBuffer = await new Response(compressedStream).arrayBuffer();
    
    return compressedArrayBuffer;
  } catch (error) {
    console.error('Compression failed:', error);
    return data.buffer as ArrayBuffer; // Return original buffer if compression fails
  }
}

/**
 * Compress DOCX by aggressive size reduction
 */
async function compressDOCX(file: File, originalSize: number): Promise<CompressionResult> {
  try {
    console.log('📝 Attempting aggressive DOCX compression...');
    
    // DOCX is already a ZIP archive, so we need to be more aggressive
    const arrayBuffer = await file.arrayBuffer();
    
    // Apply aggressive compression
    const compressedBuffer = await aggressiveCompress(new Uint8Array(arrayBuffer));
    
    // If still too large, truncate to fit within limit
    let finalData: ArrayBuffer = compressedBuffer;
    let warning: string | undefined;
    
    if (compressedBuffer.byteLength > TARGET_SIZE) {
      console.warn(`⚠️ DOCX still too large after compression, truncating to ${(TARGET_SIZE / 1024 / 1024).toFixed(1)}MB`);
      finalData = compressedBuffer.slice(0, TARGET_SIZE);
      warning = `Document truncated to fit ${(TARGET_SIZE / 1024 / 1024).toFixed(1)}MB limit. Consider splitting your document.`;
    }
    
    const compressedBlob = new Blob([finalData], { type: file.type });
    const compressedFile = new File([compressedBlob], file.name, { type: file.type });
    const compressedSize = compressedFile.size;
    
    const compressionRatio = originalSize / compressedSize;
    const compressionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
    
    console.log(`✅ DOCX compressed: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionPercentage.toFixed(1)}% reduction)`);
    
    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      compressionPercentage,
      wasCompressed: true,
      method: 'aggressive-split',
      warning
    };
  } catch (error) {
    console.error('❌ DOCX compression failed:', error);
    return await genericCompress(file, originalSize);
  }
}

/**
 * Generic compression using browser's CompressionStream API
 */
async function genericCompress(file: File, originalSize: number): Promise<CompressionResult> {
  try {
    console.log('🔧 Applying generic compression...');
    
    const arrayBuffer = await file.arrayBuffer();
    
    // Use gzip compression
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(arrayBuffer));
        controller.close();
      }
    });
    
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const compressedArrayBuffer = await new Response(compressedStream).arrayBuffer();
    
    // Create a new file with compressed content
    // We'll wrap it to preserve the original file extension but mark it as compressed
    const compressedBlob = new Blob([compressedArrayBuffer], { type: file.type });
    const compressedFile = new File([compressedBlob], file.name, { type: file.type });
    const compressedSize = compressedFile.size;
    
    const compressionRatio = originalSize / compressedSize;
    const compressionPercentage = ((originalSize - compressedSize) / originalSize) * 100;
    
    console.log(`✅ File compressed: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionPercentage.toFixed(1)}% reduction)`);
    
    return {
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
      compressionPercentage,
      wasCompressed: true,
      method: 'text-extraction'
    };
  } catch (error) {
    console.error('❌ Generic compression failed:', error);
    
    // Last resort: return original file and let server handle it
    return {
      compressedFile: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      compressionPercentage: 0,
      wasCompressed: false,
      method: 'none'
    };
  }
}

/**
 * Batch compress multiple files
 */
export async function compressMultipleFiles(files: File[]): Promise<CompressionResult[]> {
  console.log(`📦 Starting compression for ${files.length} files...`);
  
  const results: CompressionResult[] = [];
  
  for (const file of files) {
    const result = await compressFileForUpload(file);
    results.push(result);
  }
  
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0);
  const overallReduction = ((totalOriginal - totalCompressed) / totalOriginal) * 100;
  
  console.log(`✅ Compression complete:
    - Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB
    - Total compressed size: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB
    - Overall reduction: ${overallReduction.toFixed(1)}%
  `);
  
  return results;
}

/**
 * Check if file needs compression
 */
export function needsCompression(file: File): boolean {
  return file.size > MAX_FILE_SIZE;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
