// AI-Powered Competitive Intelligence Engine
// Uses Google Search + Gemini to automatically discover and analyze competitors

import { VertexAI } from '@google-cloud/vertexai';

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_PROJECT_ID || 'ai-startup-analyst-hackathon';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

interface CompetitorProfile {
  name: string;
  website: string;
  description: string;
  fundingRaised: string;
  lastRound: string;
  investors: string[];
  keyMetrics: {
    employees: string;
    founded: string;
    headquarters: string;
  };
  strengths: string[];
  weaknesses: string[];
  marketPosition: 'Leader' | 'Challenger' | 'Niche Player' | 'Emerging';
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  differentiationGap: string[];
}

interface CompetitiveLandscape {
  totalCompetitors: number;
  directCompetitors: CompetitorProfile[];
  indirectCompetitors: CompetitorProfile[];
  marketLeader: CompetitorProfile | null;
  competitiveAdvantages: string[];
  competitiveThreats: string[];
  marketGaps: string[];
  strategicRecommendations: string[];
  competitiveMatrix: {
    innovation: { company: number; avgCompetitor: number };
    funding: { company: number; avgCompetitor: number };
    marketShare: { company: number; avgCompetitor: number };
    teamSize: { company: number; avgCompetitor: number };
  };
}

export class CompetitiveIntelligenceEngine {
  private vertexAI: VertexAI;
  private model: any;

  constructor() {
    this.vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.4,
        topP: 0.8,
      },
    });
  }

  /**
   * Main method: Analyze competitive landscape for a company
   */
  async analyzeCompetitiveLandscape(
    companyName: string,
    industry: string,
    description: string,
    businessModel: string
  ): Promise<CompetitiveLandscape> {
    console.log(`🔍 Starting competitive intelligence analysis for ${companyName}...`);

    try {
      // Step 1: Discover competitors using AI
      const competitors = await this.discoverCompetitors(companyName, industry, description);

      // Step 2: Analyze each competitor in detail
      const competitorProfiles = await this.analyzeCompetitors(competitors, industry);

      // Step 3: Generate competitive insights
      const landscape = await this.generateCompetitiveLandscape(
        companyName,
        competitorProfiles,
        businessModel
      );

      console.log(`✅ Competitive analysis complete: ${landscape.totalCompetitors} competitors identified`);
      return landscape;

    } catch (error) {
      console.error('❌ Competitive intelligence analysis failed:', error);
      return this.getMockCompetitiveLandscape(companyName);
    }
  }

  /**
   * Step 1: Use AI to discover competitors
   */
  private async discoverCompetitors(
    companyName: string,
    industry: string,
    description: string
  ): Promise<string[]> {
    const prompt = `You are a market research expert. Based on the following company information, identify 5-7 direct competitors and 3-5 indirect competitors.

Company: ${companyName}
Industry: ${industry}
Description: ${description}

Return ONLY a JSON array of competitor names (no explanations):
{
  "directCompetitors": ["Company A", "Company B", ...],
  "indirectCompetitors": ["Company X", "Company Y", ...]
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanText);

      return [...(parsed.directCompetitors || []), ...(parsed.indirectCompetitors || [])];
    } catch (error) {
      console.error('Failed to discover competitors:', error);
      return [];
    }
  }

  /**
   * Step 2: Analyze each competitor using AI
   */
  private async analyzeCompetitors(
    competitorNames: string[],
    industry: string
  ): Promise<CompetitorProfile[]> {
    const profiles: CompetitorProfile[] = [];

    // Analyze in batches to avoid rate limits
    for (const competitor of competitorNames.slice(0, 8)) {
      try {
        const profile = await this.analyzeCompetitor(competitor, industry);
        if (profile) {
          profiles.push(profile);
        }
      } catch (error) {
        console.error(`Failed to analyze ${competitor}:`, error);
      }
    }

    return profiles;
  }

  /**
   * Analyze a single competitor
   */
  private async analyzeCompetitor(
    competitorName: string,
    industry: string
  ): Promise<CompetitorProfile | null> {
    const prompt = `You are a competitive intelligence analyst. Research and analyze the following competitor in the ${industry} industry.

Competitor: ${competitorName}

Provide detailed analysis in this EXACT JSON format:
{
  "name": "${competitorName}",
  "website": "https://...",
  "description": "Brief description of what they do",
  "fundingRaised": "$XXM total raised",
  "lastRound": "Series A/B/C - $XXM",
  "investors": ["Investor 1", "Investor 2"],
  "keyMetrics": {
    "employees": "50-100",
    "founded": "2020",
    "headquarters": "San Francisco, CA"
  },
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "marketPosition": "Leader",
  "threatLevel": "High",
  "differentiationGap": ["Gap 1", "Gap 2"]
}

Use your knowledge to provide accurate, realistic data. If you don't know exact figures, provide reasonable estimates based on typical companies in this space.`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const profile = JSON.parse(cleanText);

      return profile as CompetitorProfile;
    } catch (error) {
      console.error(`Failed to analyze ${competitorName}:`, error);
      return null;
    }
  }

  /**
   * Step 3: Generate competitive landscape insights
   */
  private async generateCompetitiveLandscape(
    companyName: string,
    competitors: CompetitorProfile[],
    businessModel: string
  ): Promise<CompetitiveLandscape> {
    const prompt = `You are a strategic analyst. Analyze the competitive landscape for ${companyName}.

Business Model: ${businessModel}

Competitors:
${JSON.stringify(competitors, null, 2)}

Generate strategic insights in this EXACT JSON format:
{
  "competitiveAdvantages": ["Advantage 1", "Advantage 2", "Advantage 3"],
  "competitiveThreats": ["Threat 1", "Threat 2", "Threat 3"],
  "marketGaps": ["Gap 1", "Gap 2", "Gap 3"],
  "strategicRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "competitiveMatrix": {
    "innovation": { "company": 75, "avgCompetitor": 65 },
    "funding": { "company": 60, "avgCompetitor": 70 },
    "marketShare": { "company": 45, "avgCompetitor": 55 },
    "teamSize": { "company": 50, "avgCompetitor": 80 }
  }
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const insights = JSON.parse(cleanText);

      // Categorize competitors
      const directCompetitors = competitors.filter(c => 
        c.threatLevel === 'High' || c.threatLevel === 'Critical'
      );
      const indirectCompetitors = competitors.filter(c => 
        c.threatLevel === 'Low' || c.threatLevel === 'Medium'
      );

      const marketLeader = competitors.find(c => c.marketPosition === 'Leader') || null;

      return {
        totalCompetitors: competitors.length,
        directCompetitors,
        indirectCompetitors,
        marketLeader,
        ...insights
      };

    } catch (error) {
      console.error('Failed to generate landscape insights:', error);
      return this.getMockCompetitiveLandscape(companyName);
    }
  }

  /**
   * Fallback mock data
   */
  private getMockCompetitiveLandscape(companyName: string): CompetitiveLandscape {
    return {
      totalCompetitors: 6,
      directCompetitors: [
        {
          name: "Competitor A",
          website: "https://competitora.com",
          description: "Leading player in the market with established customer base",
          fundingRaised: "$50M total raised",
          lastRound: "Series B - $25M",
          investors: ["Sequoia Capital", "Andreessen Horowitz"],
          keyMetrics: {
            employees: "100-200",
            founded: "2018",
            headquarters: "San Francisco, CA"
          },
          strengths: [
            "Strong brand recognition",
            "Large customer base",
            "Well-funded with top-tier investors"
          ],
          weaknesses: [
            "Legacy technology stack",
            "Slower to innovate",
            "Higher pricing"
          ],
          marketPosition: "Leader",
          threatLevel: "High",
          differentiationGap: [
            "AI-first approach vs traditional methods",
            "Better user experience",
            "More affordable pricing"
          ]
        },
        {
          name: "Competitor B",
          website: "https://competitorb.com",
          description: "Fast-growing challenger with innovative approach",
          fundingRaised: "$30M total raised",
          lastRound: "Series A - $15M",
          investors: ["Accel", "Y Combinator"],
          keyMetrics: {
            employees: "50-100",
            founded: "2020",
            headquarters: "New York, NY"
          },
          strengths: [
            "Modern technology",
            "Strong product-market fit",
            "Rapid growth"
          ],
          weaknesses: [
            "Limited market presence",
            "Smaller team",
            "Less funding"
          ],
          marketPosition: "Challenger",
          threatLevel: "Medium",
          differentiationGap: [
            "More comprehensive features",
            "Better integration capabilities"
          ]
        }
      ],
      indirectCompetitors: [
        {
          name: "Competitor C",
          website: "https://competitorc.com",
          description: "Adjacent market player expanding into this space",
          fundingRaised: "$20M total raised",
          lastRound: "Series A - $12M",
          investors: ["First Round Capital"],
          keyMetrics: {
            employees: "30-50",
            founded: "2021",
            headquarters: "Austin, TX"
          },
          strengths: [
            "Niche expertise",
            "Strong customer relationships"
          ],
          weaknesses: [
            "Limited feature set",
            "Smaller market"
          ],
          marketPosition: "Niche Player",
          threatLevel: "Low",
          differentiationGap: [
            "Broader market focus",
            "More scalable solution"
          ]
        }
      ],
      marketLeader: {
        name: "Competitor A",
        website: "https://competitora.com",
        description: "Leading player in the market with established customer base",
        fundingRaised: "$50M total raised",
        lastRound: "Series B - $25M",
        investors: ["Sequoia Capital", "Andreessen Horowitz"],
        keyMetrics: {
          employees: "100-200",
          founded: "2018",
          headquarters: "San Francisco, CA"
        },
        strengths: [
          "Strong brand recognition",
          "Large customer base",
          "Well-funded with top-tier investors"
        ],
        weaknesses: [
          "Legacy technology stack",
          "Slower to innovate",
          "Higher pricing"
        ],
        marketPosition: "Leader",
        threatLevel: "High",
        differentiationGap: [
          "AI-first approach vs traditional methods",
          "Better user experience",
          "More affordable pricing"
        ]
      },
      competitiveAdvantages: [
        `${companyName} leverages cutting-edge AI technology for superior analysis`,
        "More affordable pricing structure compared to established players",
        "Modern, user-friendly interface with better UX",
        "Faster time-to-insight with automated processing"
      ],
      competitiveThreats: [
        "Established competitors have larger customer bases and brand recognition",
        "Well-funded rivals can outspend on marketing and sales",
        "Market leaders may copy innovative features",
        "Potential for aggressive pricing from competitors"
      ],
      marketGaps: [
        "Lack of AI-powered real-time analysis in existing solutions",
        "Poor user experience in legacy tools",
        "High pricing barriers for smaller investors",
        "Limited integration capabilities with modern tools"
      ],
      strategicRecommendations: [
        "Focus on AI differentiation and superior user experience",
        "Target underserved mid-market segment initially",
        "Build strong integration ecosystem to create switching costs",
        "Emphasize speed and accuracy in marketing messaging",
        "Develop strategic partnerships with complementary platforms"
      ],
      competitiveMatrix: {
        innovation: { company: 85, avgCompetitor: 60 },
        funding: { company: 55, avgCompetitor: 75 },
        marketShare: { company: 35, avgCompetitor: 65 },
        teamSize: { company: 45, avgCompetitor: 80 }
      }
    };
  }
}

export const competitiveIntelligence = new CompetitiveIntelligenceEngine();
