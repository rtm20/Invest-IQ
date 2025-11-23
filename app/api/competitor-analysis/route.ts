import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../lib/google-cloud';

/**
 * Competitor Analysis API - Powered by Google Services
 * Uses: Google Custom Search API + Gemini AI analysis
 * 100% Real data from public sources
 */
export async function POST(request: NextRequest) {
  try {
    const { industry, companyName } = await request.json();
    
    console.log(`🔍 Searching for competitors in ${industry} sector...`);
    
    // Use Google Custom Search to find competitor information
    const competitors = await searchCompetitorsWithGoogle(industry, companyName);
    
    if (competitors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No competitors found via public search',
        competitors: [],
        alternative: {
          suggestion: 'Upload competitor pitch decks for AI-powered comparison',
          note: 'Our AI can analyze and compare multiple companies from your documents'
        },
        industry,
        companyName,
        dataSource: 'Google Custom Search + Public Data'
      });
    }
    
    // Use Gemini AI to analyze and structure the competitor data
    const analyzedCompetitors = await analyzeCompetitorsWithGemini(competitors, industry);
    
    return NextResponse.json({
      success: true,
      competitors: analyzedCompetitors,
      industry,
      companyName,
      dataSource: 'Google Search + Gemini AI Analysis',
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Competitor analysis API error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze competitors',
        message: 'Upload competitor documents for AI-powered analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function searchCompetitorsWithGoogle(industry: string, companyName: string): Promise<any[]> {
  try {
    const searchApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    console.log('🔑 API Key Status:', searchApiKey ? `Set (${searchApiKey.substring(0, 10)}...)` : 'Missing');
    console.log('🔍 Search Engine ID:', searchEngineId ? `Set (${searchEngineId.substring(0, 10)}...)` : 'Missing');
    
    if (!searchApiKey || !searchEngineId || 
        searchApiKey === 'your_google_api_key_here' ||
        searchEngineId === 'your_search_engine_id_here') {
      console.log('⚠️ Google Custom Search not configured - keys are placeholders');
      return [];
    }
    
    // Search for top competitors in the industry
    const query = `top ${industry} startups funding valuation metrics -${companyName}`;
    console.log('🔍 Search Query:', query);
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${searchApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=5`;
    console.log('📡 Calling Google Custom Search API...');
    
    const response = await fetch(url);
    
    console.log('📊 API Response Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Google Search API error:', response.status, errorText);
      return [];
    }
    
    const data = await response.json();
    console.log('✅ Search results received:', data.items?.length || 0, 'items');
    const results = data.items || [];
    
    console.log(`✅ Found ${results.length} potential competitors via Google Search`);
    
    return results.map((item: any) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      source: 'Google Search'
    }));
    
  } catch (error) {
    console.error('Google Search error:', error);
    return [];
  }
}

async function analyzeCompetitorsWithGemini(searchResults: any[], industry: string): Promise<any[]> {
  try {
    console.log('🤖 Using Gemini AI to analyze competitor information...');
    
    // Limit search results to avoid token limits
    const limitedResults = searchResults.slice(0, 3).map(r => ({
      title: r.title,
      snippet: r.snippet
    }));
    
    // If we have no search results, return empty
    if (limitedResults.length === 0) {
      console.log('⚠️ No search results to analyze');
      return [];
    }
    
    const prompt = `Extract competitor information from these search results about ${industry} companies.

Search Results:
${JSON.stringify(limitedResults, null, 2)}

Return ONLY a valid JSON array (maximum 3 companies). Use this exact structure:
[
  {
    "name": "Company Name",
    "fundingRaised": "Not Disclosed",
    "valuation": "Not Disclosed",
    "revenueGrowth": "Not Disclosed",
    "employees": "Not Disclosed",
    "keyHighlight": "One sentence description",
    "dataQuality": "partial"
  }
]

CRITICAL: 
- Return ONLY the JSON array
- No markdown code blocks
- No explanations
- All string values must use double quotes
- If no clear company found, return: []
`;
    
    console.log('📤 Sending to Gemini...');
    
    try {
      const analysis = await geminiService.analyzeStartupData(prompt, 'company');
      console.log('📥 Gemini response type:', typeof analysis, Array.isArray(analysis));
      
      if (Array.isArray(analysis) && analysis.length > 0) {
        // Validate each competitor has required fields
        const validCompetitors = analysis.filter(comp => 
          comp && 
          typeof comp === 'object' && 
          comp.name && 
          typeof comp.name === 'string'
        ).slice(0, 3);
        
        if (validCompetitors.length > 0) {
          console.log('✅ Found', validCompetitors.length, 'valid competitors from Gemini');
          return validCompetitors;
        }
      }
    } catch (geminiError) {
      console.error('⚠️ Gemini AI parsing failed:', geminiError);
      console.log('📋 No competitor data could be extracted from AI analysis');
    }
    
    console.log('⚠️ No competitors could be extracted - returning empty array');
    return [];
    
  } catch (error) {
    console.error('❌ Competitor analysis error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

