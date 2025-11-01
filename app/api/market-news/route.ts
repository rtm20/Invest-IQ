import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy API for Finnhub market news
 * Keeps API key secure on server side
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'technology';
    
    const apiKey = process.env.FINNHUB_API_KEY;
    
    if (!apiKey || apiKey === 'your_finnhub_key_here') {
      return NextResponse.json({
        success: false,
        error: 'Finnhub API key not configured',
        news: []
      });
    }
    
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${apiKey}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return top 5 news items
    return NextResponse.json({
      success: true,
      news: data.slice(0, 5).map((item: any) => ({
        headline: item.headline,
        summary: item.summary || item.headline.substring(0, 150) + '...',
        source: item.source,
        url: item.url,
        datetime: new Date(item.datetime * 1000).toISOString()
      })),
      category
    });
    
  } catch (error) {
    console.error('Market news API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market news',
        news: []
      },
      { status: 500 }
    );
  }
}
