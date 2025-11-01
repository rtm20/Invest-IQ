/**
 * Real Market Data API Integration
 * Uses legitimate public APIs for market intelligence
 * NO HARDCODED DATA
 */

// Finnhub API for market sentiment and news
// Using secure backend proxy to protect API key
export async function getMarketSentiment(sector: string = 'technology') {
  try {
    const response = await fetch(`/api/market-news?category=${sector}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.success) return null;
    
    // Analyze sentiment from recent news
    const sentimentScore = analyzeSentiment(data.news);
    
    return {
      sentiment: sentimentScore > 0.6 ? 'Bullish' : sentimentScore < 0.4 ? 'Bearish' : 'Neutral',
      news: data.news.map((item: any) => ({
        headline: item.headline,
        summary: item.summary,
        source: item.source,
        url: item.url
      }))
    };
  } catch (error) {
    console.error('Market sentiment API error:', error);
    return null;
  }
}

function analyzeSentiment(news: any[]): number {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['growth', 'surge', 'profit', 'success', 'invest', 'bullish', 'rise'];
  const negativeWords = ['loss', 'decline', 'bearish', 'crash', 'fall', 'concern'];
  
  let score = 0.5; // neutral baseline
  
  news.forEach(item => {
    const text = (item.headline + ' ' + item.summary).toLowerCase();
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 0.02;
    });
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 0.02;
    });
  });
  
  return Math.max(0, Math.min(1, score));
}

// Get real funding statistics from public sources
export async function getFundingStatistics(sector: string) {
  try {
    // Using public Pitchbook/Crunchbase API alternatives
    // For demo: use cached realistic data or API when available
    const response = await fetch('/api/funding-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sector })
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Funding stats API error:', error);
    return null;
  }
}

// Get regional startup data
export async function getRegionalData(location: string) {
  try {
    // Use IP geolocation for user location
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();
    
    return {
      city: geoData.city || location,
      region: geoData.region,
      country: geoData.country_name
    };
  } catch (error) {
    console.error('Regional data error:', error);
    return { city: location, region: '', country: '' };
  }
}

// Get competitor data from public sources
export async function getCompetitorData(industry: string, companyName: string) {
  try {
    // Call backend API that aggregates public data
    const response = await fetch('/api/competitor-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry, companyName })
    });
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Competitor data error:', error);
    return null;
  }
}

// Get real market news
export async function getMarketNews(sector: string = 'technology') {
  try {
    const response = await fetch(`/api/market-news?category=${sector}`);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.success ? data.news : [];
  } catch (error) {
    console.error('Market news error:', error);
    return [];
  }
}

// Geocode user location
export async function getUserLocation(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.city || 'Unknown';
  } catch (error) {
    return 'Unknown';
  }
}
