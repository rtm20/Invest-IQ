// AI-Powered Competitive Intelligence Engine
// Auto-discovers competitors using Google Custom Search + analyzes with Gemini

import { geminiService } from './google-cloud';

export interface CompetitorProfile {
  name: string;
  description: string;
  website?: string;
  fundingStage?: string;
  fundingAmount?: string;
  foundedYear?: string;
  teamSize?: string;
  keyDifferentiators: string[];
  strengths: string[];
  weaknesses: string[];
  marketPosition: 'leader' | 'challenger' | 'niche' | 'emerging';
  threatLevel: 'high' | 'medium' | 'low';
}

export interface CompetitiveAnalysis {
  primaryCompetitors: CompetitorProfile[];
  marketPositioning: {
    yourPosition: string;
    competitiveAdvantages: string[];
    vulnerabilities: string[];
    recommendedStrategy: string;
  };
  marketLandscape: {
    totalCompetitors: number;
    marketConcentration: 'fragmented' | 'consolidated' | 'emerging';
    barrierToEntry: 'high' | 'medium' | 'low';
    marketTrend: 'growing' | 'stable' | 'declining';
  };
  insights: string[];
  timestamp: string;
}

class AICompetitiveIntelligenceEngine {
  /**
   * Discover and analyze competitors for a startup
   */
  async analyzeCompetitors(
    companyName: string,
    industry: string,
    productDescription: string,
    targetMarket: string,
    sector?: string
  ): Promise<CompetitiveAnalysis> {
    try {
      console.log('🔍 Starting AI Competitive Intelligence Analysis...');
      console.log('📊 Sector:', sector || 'Not specified');
      
      // Step 1: Discover competitors using Google Custom Search
      const competitors = await this.discoverCompetitors(
        companyName,
        industry,
        productDescription,
        targetMarket,
        sector
      );

      // Step 2: Analyze each competitor with AI (BATCH - 1 API call)
      const competitorProfiles = await this.analyzeCompetitorProfiles(
        competitors,
        companyName,
        productDescription
      );

      // Step 3: Analyze market landscape (No API call - local computation)
      const landscape = this.analyzeMarketLandscape(competitorProfiles);

      // Step 4: Generate positioning + insights (COMBINED - 1 API call)
      const { positioning, insights } = await this.generatePositioningAndInsights(
        companyName,
        productDescription,
        competitorProfiles,
        landscape
      );

      return {
        primaryCompetitors: competitorProfiles,
        marketPositioning: positioning,
        marketLandscape: landscape,
        insights,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Competitive intelligence analysis failed:', error);
      throw error;
    }
  }

  /**
   * Discover competitors using Google Custom Search
   */
  private async discoverCompetitors(
    companyName: string,
    industry: string,
    productDescription: string,
    targetMarket: string,
    sector?: string
  ): Promise<string[]> {
    try {
      console.log('🔎 Discovering competitors via Google Custom Search...');
      console.log('📊 Using sector:', sector || 'generic industry search');

      // Use Google Custom Search API
      const searchApiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
      
      if (!searchApiKey || !searchEngineId || 
          searchApiKey === 'your_google_api_key_here' ||
          searchEngineId === 'your_search_engine_id_here') {
        console.log('⚠️ Google Custom Search not configured - using AI-generated competitors');
        return await this.generateCompetitorsWithAI(industry, targetMarket, sector);
      }

      // Use sector if available for more targeted search, combined with product description
      // Example: "student gig work" + "Marketplace" gives better results than just "Marketplace"
      let searchTerm = '';
      if (productDescription && productDescription.length > 20) {
        // Extract key business concept from description
        // Look for key phrases that define the business model
        const desc = productDescription.toLowerCase();
        
        // Common business model keywords to prioritize
        const businessKeywords = [
          'student gig', 'freelance', 'marketplace', 'e-commerce', 'fintech', 'healthtech',
          'edtech', 'saas', 'b2b', 'b2c', 'social network', 'platform', 'gig work',
          'food delivery', 'ride sharing', 'job board', 'recruitment', 'learning'
        ];
        
        // Find matching business model keywords
        const matchedKeywords = businessKeywords.filter(kw => desc.includes(kw));
        
        if (matchedKeywords.length > 0) {
          // Use the first matched keyword + sector for better results
          searchTerm = sector ? `${matchedKeywords[0]} ${sector} india` : `${matchedKeywords[0]} startup india`;
        } else {
          // Extract first 3-4 meaningful words from description
          const descWords = productDescription
            .replace(/[^\w\s]/g, ' ')
            .split(' ')
            .filter(w => w.length > 3)
            .slice(0, 4)
            .join(' ');
          searchTerm = sector ? `${descWords} ${sector}` : descWords || industry;
        }
        
        console.log('📝 Extracted search term from description:', searchTerm);
      } else {
        searchTerm = sector || industry;
      }
      
      const query = `"${searchTerm}" startup companies competitors -conference -event -summit -news -article -list -"top 10"`;
      const url = `https://www.googleapis.com/customsearch/v1?key=${searchApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
      
      console.log('🔍 Search query:', query);
      console.log('📄 Product description used:', productDescription.substring(0, 100));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('❌ Google Search API error:', response.status);
        return await this.generateCompetitorsWithAI(industry, targetMarket, sector);
      }
      
      const data = await response.json();
      const results = data.items || [];

      // Extract potential competitor names and filter out non-companies
      const potentialCompetitors = results
        .map((result: any) => {
          const title = result.title || '';
          const snippet = result.snippet || '';
          
          // Skip obvious non-companies
          const skipKeywords = ['conference', 'event', 'summit', 'tech 2025', 'tech 2024', 'funded by', 'news', 'article', 'blog', 'list of', 'top 10', 'best'];
          const lowerTitle = title.toLowerCase();
          const lowerSnippet = snippet.toLowerCase();
          
          if (skipKeywords.some(keyword => lowerTitle.includes(keyword) || lowerSnippet.includes(keyword))) {
            return null;
          }
          
          // Extract company name (first part before - or |)
          const companyMatch = title.match(/^([^-|:]+)/);
          const name = companyMatch ? companyMatch[1].trim() : title.substring(0, 50).trim();
          
          // Skip if too long (likely article title) or too short
          if (name.length < 3 || name.length > 50) {
            return null;
          }
          
          return { name, title, snippet };
        })
        .filter((item: { name: string; title: string; snippet: string } | null): item is { name: string; title: string; snippet: string } => 
          item !== null && item.name.toLowerCase() !== companyName.toLowerCase()
        )
        .slice(0, 8); // Get top 8 for AI validation

      console.log(`🔍 Found ${potentialCompetitors.length} potential competitors, validating with AI...`);
      
      // Use AI to validate which are actual companies
      if (potentialCompetitors.length > 0) {
        const validatedCompetitors = await this.validateCompetitorsWithAI(
          potentialCompetitors.map((c: { name: string; snippet: string }) => ({ name: c.name, description: c.snippet })),
          industry,
          targetMarket,
          sector
        );
        
        if (validatedCompetitors.length > 0) {
          console.log(`✅ Discovered ${validatedCompetitors.length} validated competitors:`, validatedCompetitors);
          return validatedCompetitors;
        }
      }
      
      console.log('⚠️ No valid competitors found in search results, using AI generation...');
      return await this.generateCompetitorsWithAI(industry, targetMarket, sector, productDescription);
    } catch (error) {
      console.error('❌ Competitor discovery failed:', error);
      return await this.generateCompetitorsWithAI(industry, targetMarket, sector, productDescription);
    }
  }

  /**
   * Validate competitor candidates using AI - filter out conferences, events, and non-companies
   */
  private async validateCompetitorsWithAI(
    candidates: { name: string; description: string }[],
    industry: string,
    targetMarket: string,
    sector?: string
  ): Promise<string[]> {
    try {
      const sectorInfo = sector ? ` in the ${sector} sector` : '';
      const prompt = `You are analyzing potential competitors in the ${industry} industry${sectorInfo} targeting ${targetMarket}.

Below is a list of candidates from search results. Some are actual companies, some are conferences, events, or article titles.

Candidates:
${candidates.map((c, i) => `${i + 1}. ${c.name}\nContext: ${c.description}`).join('\n\n')}

Return ONLY the names of ACTUAL COMPANIES that are legitimate competitors (not conferences, events, news articles, or lists).

Return as a JSON array of company names: ["Company 1", "Company 2", ...]

RETURN ONLY THE JSON ARRAY, NO OTHER TEXT.`;
      
      const response = await this.callGemini(prompt, 500, 0.3);
      
      // Extract JSON array
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const validCompetitors = JSON.parse(jsonMatch[0]);
        return validCompetitors.filter((name: string) => 
          name && name.length > 2 && name.length < 50
        ).slice(0, 5);
      }
      
      return [];
    } catch (error) {
      console.error('❌ AI competitor validation failed:', error);
      return [];
    }
  }

  /**
   * Generate competitor names using AI when search is unavailable
   */
  private async generateCompetitorsWithAI(industry: string, targetMarket: string, sector?: string, productDescription?: string): Promise<string[]> {
    try {
      const sectorInfo = sector ? ` specifically in the ${sector} sector` : '';
      const productInfo = productDescription ? `\n\nProduct/Service Description: ${productDescription}` : '';
      
      const prompt = `You are a competitive intelligence expert. List 4-5 REAL, EXISTING startup competitors.

Industry: ${industry}${sectorInfo}
Target Market: ${targetMarket}${productInfo}

CRITICAL REQUIREMENTS:
- Return ONLY direct competitors that offer similar products/services
- Must be REAL companies (not generic giants like Amazon, eBay unless they have a specific relevant product line)
- NO conferences, events, or news articles
- Focus on startups and mid-size companies in the SAME niche
- If the product is about "student gig work" or "youth monetization", find competitors in freelance/gig platforms for students
- If the product is about "e-commerce", find e-commerce startups in the same category

Return ONLY a JSON array of company names: ["Company 1", "Company 2", "Company 3", "Company 4"]

NO additional text, just the JSON array.`;
      
      const response = await this.callGemini(prompt, 300, 0.7);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const competitors = JSON.parse(jsonMatch[0]);
        console.log('✅ AI-generated competitors:', competitors);
        return competitors.slice(0, 5);
      }
    } catch (error) {
      console.error('❌ AI competitor generation failed:', error);
      throw new Error('Failed to generate competitor names. Please try again.');
    }
    
    // No fallback - throw error if search fails
    throw new Error('Failed to discover competitors. Please try again.');
  }

  /**
   * Analyze competitor profiles using Gemini AI - BATCH MODE (Single API call)
   */
  private async analyzeCompetitorProfiles(
    competitorNames: string[],
    yourCompanyName: string,
    yourProductDescription: string
  ): Promise<CompetitorProfile[]> {
    try {
      console.log('🤖 Analyzing all competitor profiles in ONE batch call to Gemini AI...');

      // BATCH ALL COMPETITORS INTO A SINGLE API CALL
      const prompt = `You are a competitive intelligence analyst. Analyze ALL these competitors at once.

**Your Company:** ${yourCompanyName}
**Your Product:** ${yourProductDescription}

**Competitors to Analyze:** ${competitorNames.join(', ')}

Provide a comprehensive competitive analysis for ALL competitors in a SINGLE JSON array:

[
  {
    "name": "Competitor 1 name",
    "description": "Brief 1-2 sentence description",
    "website": "Official website URL if known",
    "fundingStage": "Seed/Series A/Series B/etc or Unknown",
    "fundingAmount": "Total funding raised or Unknown",
    "foundedYear": "Year founded or Unknown",
    "teamSize": "Estimated team size or Unknown",
    "keyDifferentiators": ["Feature 1", "Feature 2", "Feature 3"],
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "marketPosition": "leader|challenger|niche|emerging",
    "threatLevel": "high|medium|low"
  },
  {
    "name": "Competitor 2 name",
    ...
  }
]

Analyze all ${competitorNames.length} competitors. Base your analysis on general market knowledge. Be realistic and analytical.`;

      const response = await this.callGemini(prompt, 2500, 0.3);

      console.log('📥 Raw Gemini response type:', typeof response);
      
      // Try to parse if it's a string
      let profiles: any[];
      if (typeof response === 'string') {
        console.log('📥 Response length:', response.length);
        console.log('📥 First 500 chars:', response.substring(0, 500));
        
        // Extract JSON array from string
        const firstBracket = response.indexOf('[');
        const lastBracket = response.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          const jsonStr = response.substring(firstBracket, lastBracket + 1);
          console.log('🔍 Extracted JSON length:', jsonStr.length);
          console.log('🔍 Extracted JSON preview:', jsonStr.substring(0, 200));
          
          profiles = JSON.parse(jsonStr);
        } else {
          console.error('❌ No valid JSON array brackets found in response');
          console.error('📋 Full response:', response);
          throw new Error('No JSON array found in response');
        }
      } else if (Array.isArray(response)) {
        // Response is already parsed as array
        console.log('✅ Response already parsed as array with', (response as any[]).length, 'items');
        profiles = response as any[];
      } else {
        console.error('❌ Unexpected response type:', typeof response);
        throw new Error('Unexpected response format');
      }
      
      if (!Array.isArray(profiles)) {
        console.error('❌ Profiles is not an array:', typeof profiles);
        throw new Error('Response is not a valid array');
      }
      
      console.log(`✅ Analyzed ${profiles.length} competitors in a single batch call`);
      return profiles;
    } catch (error) {
      console.error('❌ Batch competitor profile analysis failed:', error);
      
      // No fallback data - throw error so UI can show proper error message
      throw new Error('Failed to analyze competitors. Please try again later.');
    }
  }

  /**
   * Analyze a single competitor using Gemini AI
   */
  private async analyzeCompetitor(
    competitorName: string,
    yourCompanyName: string,
    yourProductDescription: string
  ): Promise<CompetitorProfile> {
    try {
      const prompt = `You are a competitive intelligence analyst. Analyze this competitor in detail.

**Your Company:** ${yourCompanyName}
**Your Product:** ${yourProductDescription}

**Competitor to Analyze:** ${competitorName}

Provide a comprehensive competitive analysis in JSON format:

{
  "name": "Competitor name",
  "description": "Brief 1-2 sentence description",
  "website": "Official website URL if known",
  "fundingStage": "Seed/Series A/Series B/etc or Unknown",
  "fundingAmount": "Total funding raised or Unknown",
  "foundedYear": "Year founded or Unknown",
  "teamSize": "Estimated team size or Unknown",
  "keyDifferentiators": ["Feature 1", "Feature 2", "Feature 3"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "marketPosition": "leader|challenger|niche|emerging",
  "threatLevel": "high|medium|low"
}

Base your analysis on general market knowledge. Be realistic and analytical.`;

      const response = await this.callGemini(prompt, 1000, 0.3);

      // Extract JSON more robustly - find first { and last }
      const firstBrace = response.indexOf('{');
      const lastBrace = response.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = response.substring(firstBrace, lastBrace + 1);
        try {
          const profile = JSON.parse(jsonStr);
          console.log(`✅ Analyzed competitor: ${profile.name}`);
          return profile;
        } catch (parseError) {
          console.error(`JSON parse error for ${competitorName}:`, parseError);
          console.error('Extracted JSON:', jsonStr.substring(0, 200));
        }
      }

      throw new Error('Failed to extract valid JSON from response');
    } catch (error) {
      console.error(`❌ Failed to analyze ${competitorName}:`, error);
      throw new Error(`Failed to analyze competitor: ${competitorName}`);
    }
  }

  /**
   * Generate competitive positioning insights
   */
  private async generateCompetitivePositioning(
    companyName: string,
    productDescription: string,
    competitors: CompetitorProfile[]
  ): Promise<CompetitiveAnalysis['marketPositioning']> {
    try {
      console.log('📊 Generating competitive positioning insights...');

      const prompt = `You are a strategic business consultant. Analyze the competitive positioning.

**Company:** ${companyName}
**Product:** ${productDescription}

**Competitors:**
${competitors.map((c, i) => `
${i + 1}. ${c.name}
   - Position: ${c.marketPosition}
   - Strengths: ${c.strengths.join(', ')}
   - Weaknesses: ${c.weaknesses.join(', ')}
   - Threat Level: ${c.threatLevel}
`).join('\n')}

Provide strategic positioning analysis in JSON format:

{
  "yourPosition": "Where ${companyName} fits in the market (1-2 sentences)",
  "competitiveAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "vulnerabilities": ["Vulnerability 1", "Vulnerability 2"],
  "recommendedStrategy": "Recommended competitive strategy (2-3 sentences)"
}

Be specific and actionable.`;

      const response = await this.callGemini(prompt, 1200, 0.4);
      
      // Extract JSON more robustly
      const firstBrace = response.indexOf('{');
      const lastBrace = response.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = response.substring(firstBrace, lastBrace + 1);
        try {
          const positioning = JSON.parse(jsonStr);
          console.log('✅ Generated competitive positioning insights');
          return positioning;
        } catch (parseError) {
          console.error('Positioning JSON parse error:', parseError);
        }
      }

      throw new Error('Failed to parse positioning response');
    } catch (error) {
      console.error('❌ Positioning analysis failed:', error);
      throw new Error('Failed to generate competitive positioning analysis');
    }
  }

  /**
   * Analyze market landscape
   */
  private analyzeMarketLandscape(
    competitors: CompetitorProfile[]
  ): CompetitiveAnalysis['marketLandscape'] {
    const totalCompetitors = competitors.length;

    // Analyze market concentration
    const leaders = competitors.filter(c => c.marketPosition === 'leader').length;
    const marketConcentration = 
      leaders >= 2 ? 'consolidated' : 
      totalCompetitors >= 5 ? 'fragmented' : 
      'emerging';

    // Analyze threat levels
    const highThreats = competitors.filter(c => c.threatLevel === 'high').length;
    const barrierToEntry = 
      highThreats >= 2 ? 'high' : 
      totalCompetitors >= 5 ? 'medium' : 
      'low';

    return {
      totalCompetitors,
      marketConcentration,
      barrierToEntry,
      marketTrend: 'growing', // Default assumption for startups
    };
  }

  /**
   * Generate competitive positioning AND strategic insights in ONE API call
   */
  private async generatePositioningAndInsights(
    companyName: string,
    productDescription: string,
    competitors: CompetitorProfile[],
    landscape: CompetitiveAnalysis['marketLandscape']
  ): Promise<{
    positioning: CompetitiveAnalysis['marketPositioning'];
    insights: string[];
  }> {
    try {
      console.log('📊 Generating positioning + insights in ONE batch call...');

      const prompt = `You are a strategic business consultant. Provide comprehensive competitive analysis.

**Company:** ${companyName}
**Product:** ${productDescription}

**Competitors Analysis:**
${competitors.map((c, i) => `
${i + 1}. ${c.name}
   - Position: ${c.marketPosition}
   - Strengths: ${c.strengths.join(', ')}
   - Weaknesses: ${c.weaknesses.join(', ')}
   - Threat Level: ${c.threatLevel}
`).join('\n')}

**Market Landscape:**
- Total Competitors: ${landscape.totalCompetitors}
- Market Concentration: ${landscape.marketConcentration}
- Barrier to Entry: ${landscape.barrierToEntry}
- Market Trend: ${landscape.marketTrend}

Provide BOTH positioning analysis AND strategic insights in ONE JSON response:

{
  "positioning": {
    "yourPosition": "Where ${companyName} fits in the market (1-2 sentences)",
    "competitiveAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
    "vulnerabilities": ["Vulnerability 1", "Vulnerability 2"],
    "recommendedStrategy": "Recommended competitive strategy (2-3 sentences)"
  },
  "insights": [
    "Strategic insight 1",
    "Strategic insight 2",
    "Strategic insight 3",
    "Strategic insight 4",
    "Strategic insight 5"
  ]
}

Be specific, actionable, and realistic. Focus on ${companyName}'s unique opportunities.`;

      const response = await this.callGemini(prompt, 2000, 0.4);
      
      // Extract JSON more robustly
      const firstBrace = response.indexOf('{');
      const lastBrace = response.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = response.substring(firstBrace, lastBrace + 1);
        try {
          const result = JSON.parse(jsonStr);
          console.log('✅ Generated positioning + insights in single call');
          return {
            positioning: result.positioning,
            insights: result.insights
          };
        } catch (parseError) {
          console.error('Combined analysis JSON parse error:', parseError);
        }
      }

      throw new Error('Failed to parse combined positioning and insights response');
    } catch (error) {
      console.error('❌ Combined positioning and insights failed:', error);
      
      // No fallback data - throw error so failures are transparent
      throw new Error('Failed to generate positioning insights. Please try again later.');
    }
  }

  /**
   * Generate strategic insights using AI
   */
  private async generateStrategicInsights(
    companyName: string,
    competitors: CompetitorProfile[],
    positioning: CompetitiveAnalysis['marketPositioning'],
    landscape: CompetitiveAnalysis['marketLandscape']
  ): Promise<string[]> {
    try {
      console.log('💡 Generating strategic insights with AI...');

      const prompt = `You are a strategic advisor for startups. Generate 5 key strategic insights.

**Company:** ${companyName}
**Market Position:** ${positioning.yourPosition}
**Market Landscape:** ${landscape.marketConcentration} market with ${landscape.totalCompetitors} competitors
**Barrier to Entry:** ${landscape.barrierToEntry}

**Competitive Advantages:**
${positioning.competitiveAdvantages.map(a => `- ${a}`).join('\n')}

**Vulnerabilities:**
${positioning.vulnerabilities.map(v => `- ${v}`).join('\n')}

Provide 5 strategic insights as a JSON array of strings. Each insight should be:
- Actionable (specific next steps)
- Data-driven (reference the competitive analysis)
- Investment-focused (relevant for investors)

Format: ["Insight 1", "Insight 2", "Insight 3", "Insight 4", "Insight 5"]`;

      const response = await this.callGemini(prompt, 600, 0.5);

      // Extract JSON array more robustly
      const firstBracket = response.indexOf('[');
      const lastBracket = response.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const jsonStr = response.substring(firstBracket, lastBracket + 1);
        try {
          const insights = JSON.parse(jsonStr);
          console.log(`✅ Generated ${insights.length} strategic insights`);
          return insights;
        } catch (parseError) {
          console.error('Insights JSON parse error:', parseError);
        }
      }

      throw new Error('Failed to parse insights response');
    } catch (error) {
      console.error('❌ Strategic insights generation failed:', error);
      throw new Error('Failed to generate strategic insights');
    }
  }

  /**
   * Helper: Call Gemini AI and return raw response
   */
  private async callGemini(prompt: string, maxTokens: number = 2000, temperature: number = 0.3): Promise<string> {
    try {
      // Use callGeminiRaw to get unparsed JSON response
      const response = await geminiService.callGeminiRaw(prompt, maxTokens, temperature);
      return response;
    } catch (error) {
      console.error('❌ Gemini call failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiCompetitiveIntelligence = new AICompetitiveIntelligenceEngine();
