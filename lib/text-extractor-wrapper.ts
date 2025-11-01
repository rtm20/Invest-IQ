// Wrapper to ensure text extraction only happens on client-side
'use client';

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

// Only import on client-side
let extractionModule: any = null;

async function getExtractionModule() {
  if (typeof window === 'undefined') {
    throw new Error('Text extraction is only available in the browser');
  }
  
  if (!extractionModule) {
    extractionModule = await import('./client-text-extractor.client');
  }
  
  return extractionModule;
}

export async function extractTextFromFile(file: File): Promise<TextExtractionResult> {
  const module = await getExtractionModule();
  return module.extractTextFromFile(file);
}

export async function extractTextFromMultipleFiles(files: File[]): Promise<TextExtractionResult[]> {
  const module = await getExtractionModule();
  return module.extractTextFromMultipleFiles(files);
}

export function isTextExtractionSupported(file: File): boolean {
  if (typeof window === 'undefined') return false;
  
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  
  return (
    type === 'application/pdf' || name.endsWith('.pdf') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx') ||
    type === 'text/plain' || name.endsWith('.txt')
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
