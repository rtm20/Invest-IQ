import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/api/multi-document-analyze',
    '/api/analyze',
    '/api/extract-text',
    '/api/upload'
  ]
};

export function middleware(request: NextRequest) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return NextResponse.json({}, {
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Check content length for POST requests
  if (request.method === 'POST') {
    const contentLength = parseInt(request.headers.get('content-length') || '0');
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB per file
    const TOTAL_MAX_SIZE = 100 * 1024 * 1024; // 100MB total

    if (contentLength > TOTAL_MAX_SIZE) {
      return NextResponse.json(
        { 
          error: 'Request too large',
          details: 'Total request size exceeds 100MB limit',
          limit: '100MB',
          received: `${Math.round(contentLength / (1024 * 1024))}MB`
        },
        { 
          status: 413,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          }
        }
      );
    }
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add CORS headers to all responses
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}