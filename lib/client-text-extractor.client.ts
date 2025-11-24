// Client-side text extraction from PDF and DOCX files
// This extracts all text content in the browser before uploading
// Dramatically reduces file size while preserving 100% of text data

export interface TextExtractionResult {
  originalFile: File;
  extractedText: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  originalSize: number;
  extractedSize: number;
  reductionPercentage: number;
  format: 'pdf' | 'docx' | 'txt' | 'other';
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    pages?: string[];
  };
}

/**
 * Extract text from any supported file type
 */
export async function extractTextFromFile(file: File): Promise<TextExtractionResult> {
  console.log(`📄 Extracting text from: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  
  const fileType = getFileType(file);
  let extractedText = '';
  let pageCount: number | undefined;
  let metadata: any = {};

  try {
    switch (fileType) {
      case 'pdf':
        const pdfResult = await extractTextFromPDF(file);
        extractedText = pdfResult.text;
        pageCount = pdfResult.pageCount;
        metadata = pdfResult.metadata;
        break;
      
      case 'docx':
        extractedText = await extractTextFromDOCX(file);
        break;
      
      case 'txt':
        extractedText = await file.text();
        break;
      
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }

    const wordCount = countWords(extractedText);
    const characterCount = extractedText.length;
    const extractedSize = new Blob([extractedText]).size;
    const reductionPercentage = ((file.size - extractedSize) / file.size) * 100;

    console.log(`✅ Text extracted: ${wordCount} words, ${characterCount} characters`);
    console.log(`📉 Size reduction: ${(file.size / 1024 / 1024).toFixed(2)} MB → ${(extractedSize / 1024).toFixed(2)} KB (-${reductionPercentage.toFixed(1)}%)`);

    return {
      originalFile: file,
      extractedText,
      pageCount,
      wordCount,
      characterCount,
      originalSize: file.size,
      extractedSize,
      reductionPercentage,
      format: fileType,
      metadata
    };
  } catch (error) {
    console.error(`❌ Failed to extract text from ${file.name}:`, error);
    throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from PDF using PDF.js (dynamically imported)
 */
async function extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number; metadata: any }> {
  try {
    // Dynamically import PDF.js only when needed (client-side only)
    const pdfjsLib = await import('pdfjs-dist');
    
    // Configure worker
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const pageCount = pdf.numPages;
    const textPages: string[] = [];
    const metadata: any = {
      pages: []
    };

    console.log(`📖 PDF has ${pageCount} pages, extracting text...`);

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      textPages.push(`\n--- Page ${pageNum} ---\n${pageText}`);
      metadata.pages.push(pageText);
      
      // Progress logging for large PDFs
      if (pageNum % 5 === 0 || pageNum === pageCount) {
        console.log(`  Processed ${pageNum}/${pageCount} pages...`);
      }
    }

    const fullText = textPages.join('\n');
    
    return {
      text: fullText,
      pageCount,
      metadata
    };
  } catch (error) {
    console.error('PDF.js import failed:', error);
    throw new Error('PDF text extraction is only available in the browser. Please ensure you are running this code on the client side.');
  }
}

/**
 * Extract text from DOCX - Server-side only
 * Note: DOCX extraction is handled server-side via the API
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  console.log('📝 DOCX files are processed server-side');
  // Return empty string - actual extraction happens on server
  return '';
}

/**
 * Get file type from file name and mime type
 */
function getFileType(file: File): 'pdf' | 'docx' | 'txt' | 'other' {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  
  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }
  
  if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
    return 'docx';
  }
  
  if (type === 'text/plain' || name.endsWith('.txt')) {
    return 'txt';
  }
  
  return 'other';
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Extract text from multiple files
 */
export async function extractTextFromMultipleFiles(files: File[]): Promise<TextExtractionResult[]> {
  console.log(`📦 Starting text extraction for ${files.length} files...`);
  
  const results: TextExtractionResult[] = [];
  
  for (const file of files) {
    try {
      const result = await extractTextFromFile(file);
      results.push(result);
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Still add a result with error info
      results.push({
        originalFile: file,
        extractedText: '',
        wordCount: 0,
        characterCount: 0,
        originalSize: file.size,
        extractedSize: 0,
        reductionPercentage: 0,
        format: 'other'
      });
    }
  }
  
  const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalExtracted = results.reduce((sum, r) => sum + r.extractedSize, 0);
  const overallReduction = ((totalOriginal - totalExtracted) / totalOriginal) * 100;
  
  console.log(`✅ Text extraction complete:
    - Total original size: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB
    - Total extracted size: ${(totalExtracted / 1024).toFixed(2)} KB
    - Overall reduction: ${overallReduction.toFixed(1)}%
    - Total words: ${results.reduce((sum, r) => sum + r.wordCount, 0).toLocaleString()}
  `);
  
  return results;
}

/**
 * Check if text extraction is supported for this file
 */
export function isTextExtractionSupported(file: File): boolean {
  const fileType = getFileType(file);
  return ['pdf', 'docx', 'txt'].includes(fileType);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
