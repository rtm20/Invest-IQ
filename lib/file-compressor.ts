// File compression utilities to keep files under Google Cloud Vision API limits
import sharp from 'sharp';
const pdfLib = require('pdf-lib');

// Google Cloud Vision API inline content limit
const VISION_API_LIMIT = 4.5 * 1024 * 1024; // 4.5 MB
// Target size with safety margin
const TARGET_SIZE = 4 * 1024 * 1024; // 4 MB target

export interface CompressionResult {
  buffer: Buffer;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  method: string;
}

export class FileCompressor {
  /**
   * Compress file if needed to stay under Vision API limits
   */
  async compressIfNeeded(
    buffer: Buffer,
    filename?: string,
    mimeType?: string
  ): Promise<CompressionResult> {
    const originalSize = buffer.length;
    
    console.log(`📊 File size check: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // If file is already under target size, return as-is
    if (originalSize <= TARGET_SIZE) {
      console.log('✅ File is already under target size, no compression needed');
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        method: 'none',
      };
    }
    
    console.log(`⚠️ File exceeds target size (${(TARGET_SIZE / 1024 / 1024).toFixed(2)} MB), compressing...`);
    
    // Determine file type
    const fileType = this.getFileType(filename, mimeType);
    
    try {
      let compressedBuffer: Buffer;
      let method: string;
      
      switch (fileType) {
        case 'pdf':
          ({ buffer: compressedBuffer, method } = await this.compressPDF(buffer));
          break;
        
        case 'image':
          ({ buffer: compressedBuffer, method } = await this.compressImage(buffer));
          break;
        
        case 'document':
          // For non-image documents, convert to optimized PDF
          ({ buffer: compressedBuffer, method } = await this.compressDocument(buffer));
          break;
        
        default:
          // For unknown types, try image compression as fallback
          try {
            ({ buffer: compressedBuffer, method } = await this.compressImage(buffer));
          } catch {
            // If image compression fails, return original
            console.log('⚠️ Could not compress file, returning original');
            compressedBuffer = buffer;
            method = 'failed';
          }
      }
      
      const compressedSize = compressedBuffer.length;
      const compressionRatio = originalSize / compressedSize;
      
      console.log(`✅ Compression complete: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedSize / 1024 / 1024).toFixed(2)} MB (${compressionRatio.toFixed(2)}x reduction)`);
      
      // If still too large, apply more aggressive compression
      if (compressedSize > VISION_API_LIMIT) {
        console.log('⚠️ Still exceeds limit, applying aggressive compression...');
        const aggressive = await this.aggressiveCompression(compressedBuffer, fileType);
        return {
          buffer: aggressive.buffer,
          originalSize,
          compressedSize: aggressive.buffer.length,
          compressionRatio: originalSize / aggressive.buffer.length,
          method: `${method}-aggressive`,
        };
      }
      
      return {
        buffer: compressedBuffer,
        originalSize,
        compressedSize,
        compressionRatio,
        method,
      };
    } catch (error) {
      console.error('❌ Compression error:', error);
      // Return original buffer if compression fails
      return {
        buffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        method: 'error',
      };
    }
  }
  
  /**
   * Compress PDF files
   */
  private async compressPDF(buffer: Buffer): Promise<{ buffer: Buffer; method: string }> {
    try {
      console.log('📄 Compressing PDF...');
      
      const pdfDoc = await pdfLib.PDFDocument.load(buffer);
      
      // Remove metadata to reduce size
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('');
      pdfDoc.setSubject('');
      pdfDoc.setKeywords([]);
      pdfDoc.setProducer('');
      pdfDoc.setCreator('');
      
      // Save with compression
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
      
      return {
        buffer: Buffer.from(compressedBytes),
        method: 'pdf-optimize',
      };
    } catch (error) {
      console.error('❌ PDF compression error:', error);
      // If PDF compression fails, try converting to images
      return this.pdfToImages(buffer);
    }
  }
  
  /**
   * Convert PDF to compressed images
   */
  private async pdfToImages(buffer: Buffer): Promise<{ buffer: Buffer; method: string }> {
    // Note: This would require pdf2pic or similar
    // For now, return original buffer
    console.log('⚠️ PDF to image conversion not implemented, using original');
    return {
      buffer,
      method: 'pdf-original',
    };
  }
  
  /**
   * Compress image files
   */
  private async compressImage(buffer: Buffer): Promise<{ buffer: Buffer; method: string }> {
    try {
      console.log('🖼️ Compressing image...');
      
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // Calculate target dimensions to achieve target file size
      const targetPixels = Math.floor((TARGET_SIZE / buffer.length) * (metadata.width! * metadata.height!));
      const scaleFactor = Math.sqrt(targetPixels / (metadata.width! * metadata.height!));
      
      const targetWidth = Math.floor(metadata.width! * Math.min(scaleFactor, 1));
      
      // Compress image with quality optimization
      let compressedBuffer: Buffer;
      
      if (metadata.format === 'png') {
        // For PNG, convert to JPEG for better compression
        compressedBuffer = await image
          .resize(targetWidth, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 85,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();
      } else if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
        // For JPEG, optimize quality
        compressedBuffer = await image
          .resize(targetWidth, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 85,
            progressive: true,
            mozjpeg: true,
          })
          .toBuffer();
      } else {
        // For other formats, convert to JPEG
        compressedBuffer = await image
          .resize(targetWidth, null, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 85,
            progressive: true,
          })
          .toBuffer();
      }
      
      return {
        buffer: compressedBuffer,
        method: 'image-optimize',
      };
    } catch (error) {
      console.error('❌ Image compression error:', error);
      throw error;
    }
  }
  
  /**
   * Compress document files (DOCX, PPTX, etc.)
   */
  private async compressDocument(buffer: Buffer): Promise<{ buffer: Buffer; method: string }> {
    // Documents are typically small, but if needed we could:
    // 1. Extract text only
    // 2. Convert to simplified PDF
    // For now, return as-is
    return {
      buffer,
      method: 'document-passthrough',
    };
  }
  
  /**
   * Apply aggressive compression when standard methods aren't enough
   */
  private async aggressiveCompression(
    buffer: Buffer,
    fileType: string
  ): Promise<{ buffer: Buffer; method: string }> {
    console.log('🔥 Applying aggressive compression...');
    
    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      
      // More aggressive scaling - aim for 70% of target size
      const targetSize = TARGET_SIZE * 0.7;
      const targetPixels = Math.floor((targetSize / buffer.length) * (metadata.width! * metadata.height!));
      const scaleFactor = Math.sqrt(targetPixels / (metadata.width! * metadata.height!));
      
      const targetWidth = Math.floor(metadata.width! * Math.min(scaleFactor, 0.5)); // Max 50% scaling
      
      // Very aggressive JPEG compression
      const compressedBuffer = await image
        .resize(targetWidth, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: 70, // Lower quality for more compression
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer();
      
      return {
        buffer: compressedBuffer,
        method: 'aggressive-jpeg',
      };
    } catch (error) {
      console.error('❌ Aggressive compression error:', error);
      // Last resort: return original and let API handle it
      return {
        buffer,
        method: 'aggressive-failed',
      };
    }
  }
  
  /**
   * Determine file type from filename or mime type
   */
  private getFileType(filename?: string, mimeType?: string): string {
    if (mimeType) {
      if (mimeType.includes('pdf')) return 'pdf';
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
      if (mimeType.includes('presentation')) return 'document';
    }
    
    if (filename) {
      const ext = filename.toLowerCase().split('.').pop();
      if (ext === 'pdf') return 'pdf';
      if (ext && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext)) return 'image';
      if (ext && ['docx', 'doc', 'pptx', 'ppt'].includes(ext)) return 'document';
    }
    
    return 'unknown';
  }
  
  /**
   * Estimate if file needs compression
   */
  needsCompression(fileSize: number): boolean {
    return fileSize > TARGET_SIZE;
  }
  
  /**
   * Get recommended compression method
   */
  getRecommendedMethod(filename?: string, mimeType?: string): string {
    const type = this.getFileType(filename, mimeType);
    
    switch (type) {
      case 'pdf':
        return 'PDF optimization and image conversion if needed';
      case 'image':
        return 'Image resizing and quality optimization';
      case 'document':
        return 'Document optimization';
      default:
        return 'Automatic detection and optimization';
    }
  }
}

export const fileCompressor = new FileCompressor();
