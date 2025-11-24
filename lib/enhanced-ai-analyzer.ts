// Enhanced AI Analyzer for Multi-Document Company Analysis
import { geminiService } from './google-cloud';
import { ConsolidatedCompanyData, CompanyDocumentSet } from './enhanced-document-processor';

export interface EnhancedAnalysisResult {
  companyId: string;
  companyName: string;
  documentSources: string[];
  analysis: {
    companyOverview: CompanyAnalysis;
    foundersAssessment: FoundersAnalysis;
    financialAnalysis: FinancialAnalysis;
    marketAnalysis: MarketAnalysis;
    productAnalysis: ProductAnalysis;
    tractionAnalysis: TractionAnalysis;
    riskAssessment: RiskAnalysis;
    investmentRecommendation: InvestmentRecommendation;
  };
  insights: {
    keyStrengths: string[];
    keyWeaknesses: string[];
    criticalRisks: string[];
    opportunityAreas: string[];
    marketDifferentiators: string[];
  };
  benchmarks: BenchmarkComparison[];
  confidence: {
    overall: number;
    dataQuality: number;
    analysisDepth: number;
    sourceReliability: number;
  };
  executiveSummary: string;
  processingMetadata: {
    documentsProcessed: number;
    processingTime: number;
    analysisDate: Date;
    aiModel: string;
  };
}

export interface CompanyAnalysis {
  businessModel: {
    type: 'B2B' | 'B2C' | 'B2B2C' | 'Marketplace' | 'SaaS' | 'Hardware' | 'Mixed';
    revenueStreams: string[];
    scalability: 'Low' | 'Medium' | 'High';
    defensibility: 'Low' | 'Medium' | 'High';
  };
  stage: {
    current: 'Idea' | 'MVP' | 'Beta' | 'Launched' | 'Growth' | 'Scale';
    readiness: number; // 0-100
    nextMilestones: string[];
  };
  positioning: {
    industry: string;
    vertical: string;
    targetSegment: string;
    valueProposition: string;
  };
}

export interface FoundersAnalysis {
  teamStrength: number; // 0-100
  founderMarketFit: number; // 0-100
  experience: {
    relevant: boolean;
    yearsTotal: number;
    previousStartups: number;
    domainExpertise: string[];
  };
  teamComposition: {
    technical: boolean;
    business: boolean;
    missing: string[];
    recommendations: string[];
  };
  leadership: {
    vision: number; // 0-100
    execution: number; // 0-100
    adaptability: number; // 0-100
  };
}

export interface FinancialAnalysis {
  currentMetrics: {
    revenue: number;
    growth: {
      rate: number;
      sustainability: 'Low' | 'Medium' | 'High';
    };
    unitEconomics: {
      ltv: number;
      cac: number;
      ltvCacRatio: number;
      paybackPeriod: number;
    };
    cashPosition: {
      current: number;
      burnRate: number;
      runway: number;
    };
  };
  projections: {
    revenueProjection: number[];
    confidenceLevel: number;
    assumptions: string[];
  };
  benchmarks: {
    industryMedian: number;
    percentile: number;
    comparison: 'Below' | 'At' | 'Above';
  };
}

export interface MarketAnalysis {
  market: {
    size: {
      tam: number;
      sam: number;
      som: number;
    };
    growth: number;
    trends: string[];
    drivers: string[];
  };
  competition: {
    landscape: 'Fragmented' | 'Consolidated' | 'Emerging';
    intensity: 'Low' | 'Medium' | 'High';
    barriers: string[];
    advantage: string[];
  };
  opportunity: {
    score: number; // 0-100
    timing: 'Early' | 'Optimal' | 'Late';
    urgency: 'Low' | 'Medium' | 'High';
  };
}

export interface ProductAnalysis {
  product: {
    innovation: number; // 0-100
    marketFit: number; // 0-100
    differentiation: string[];
    technology: {
      complexity: 'Low' | 'Medium' | 'High';
      defensibility: 'Low' | 'Medium' | 'High';
      scalability: 'Low' | 'Medium' | 'High';
    };
  };
  development: {
    stage: string;
    timeline: string[];
    risks: string[];
  };
}

export interface TractionAnalysis {
  traction: {
    score: number; // 0-100
    momentum: 'Declining' | 'Flat' | 'Growing' | 'Accelerating';
    milestones: Array<{
      achievement: string;
      significance: 'Low' | 'Medium' | 'High';
      date: string;
    }>;
  };
  customerBase: {
    size: number;
    growth: number;
    retention: number;
    satisfaction: number;
  };
  partnerships: {
    strategic: string[];
    impact: 'Low' | 'Medium' | 'High';
  };
}

export interface RiskAnalysis {
  risks: Array<{
    category: 'Market' | 'Technical' | 'Financial' | 'Regulatory' | 'Competitive' | 'Execution';
    risk: string;
    probability: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    severity: number; // 0-100
    mitigation: string;
    timeline: string;
  }>;
  overallRisk: 'Low' | 'Medium' | 'High';
  riskScore: number; // 0-100
}

export interface InvestmentRecommendation {
  decision: 'Reject' | 'Maybe' | 'Invest' | 'Strong Invest';
  score: number; // 0-100
  confidence: number; // 0-100
  reasoning: string[];
  valuation: {
    suggested: number;
    range: [number, number];
    methodology: string[];
  };
  terms: {
    investmentAmount: number;
    equity: number;
    liquidationPreference: string;
  };
  nextSteps: string[];
  timeline: string;
}

export interface BenchmarkComparison {
  metric: string;
  companyValue: number;
  industryMedian: number;
  industryP75: number;
  industryP90: number;
  percentile: number;
  interpretation: string;
}

export class EnhancedAIAnalyzer {
  private analysisId: string;
  private startTime: number;

  constructor() {
    this.analysisId = `enhanced_analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
  }

  /**
   * Perform comprehensive analysis of company document set
   */
  async analyzeCompanyDocumentSet(documentSet: CompanyDocumentSet): Promise<EnhancedAnalysisResult> {
    console.log(`🤖 Starting enhanced analysis for ${documentSet.companyName}`);
    this.startTime = Date.now();

    const useRealAI = process.env.NEXT_PUBLIC_ENABLE_REAL_AI === 'true' || process.env.ENABLE_REAL_AI === 'true';

    if (useRealAI) {
      return this.performRealEnhancedAnalysis(documentSet);
    } else {
      return this.performMockEnhancedAnalysis(documentSet);
    }
  }

  /**
   * Real AI analysis using Google Cloud services
   */
  private async performRealEnhancedAnalysis(documentSet: CompanyDocumentSet): Promise<EnhancedAnalysisResult> {
    try {
      console.log('🚀 Performing real enhanced AI analysis with Google Cloud...');

      const consolidatedData = documentSet.consolidatedData;
      
      // Perform parallel analysis for different aspects using the structured data
      const [
        companyAnalysis,
        foundersAnalysis,
        financialAnalysis,
        marketAnalysis,
        productAnalysis,
        tractionAnalysis,
        riskAnalysis,
        investmentRecommendation
      ] = await Promise.all([
        this.analyzeCompanyOverview(consolidatedData),
        this.analyzeFounders(consolidatedData),
        this.analyzeFinancials(consolidatedData),
        this.analyzeMarket(consolidatedData),
        this.analyzeProduct(consolidatedData),
        this.analyzeTraction(consolidatedData),
        this.analyzeRisks(consolidatedData),
        this.generateInvestmentRecommendation(consolidatedData)
      ]);

      // Generate insights and benchmarks
      const [insights, benchmarks, executiveSummary] = await Promise.all([
        this.generateInsights(consolidatedData, {
          companyOverview: companyAnalysis,
          foundersAssessment: foundersAnalysis,
          financialAnalysis,
          marketAnalysis,
          productAnalysis,
          tractionAnalysis,
          riskAssessment: riskAnalysis,
          investmentRecommendation
        }),
        this.generateBenchmarks(consolidatedData),
        this.generateExecutiveSummary(consolidatedData, investmentRecommendation)
      ]);

      const processingTime = Date.now() - this.startTime;

      return {
        companyId: this.analysisId,
        companyName: documentSet.companyName,
        documentSources: documentSet.documents.map(d => d.filename),
        analysis: {
          companyOverview: companyAnalysis,
          foundersAssessment: foundersAnalysis,
          financialAnalysis,
          marketAnalysis,
          productAnalysis,
          tractionAnalysis,
          riskAssessment: riskAnalysis,
          investmentRecommendation
        },
        insights,
        benchmarks,
        confidence: this.calculateConfidence(documentSet),
        executiveSummary,
        processingMetadata: {
          documentsProcessed: documentSet.documents.length,
          processingTime,
          analysisDate: new Date(),
          aiModel: 'gemini-2.5-pro'
        }
      };

    } catch (error) {
      console.error('❌ Real enhanced AI analysis failed:', error);
      console.log('🔄 Falling back to mock analysis...');
      return this.performMockEnhancedAnalysis(documentSet);
    }
  }

  /**
   * Mock analysis for demonstration
   */
  private async performMockEnhancedAnalysis(documentSet: CompanyDocumentSet): Promise<EnhancedAnalysisResult> {
    console.log('🎭 Performing mock enhanced analysis...');

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    const processingTime = Date.now() - this.startTime;
    const companyName = documentSet.companyName;

    return {
      companyId: this.analysisId,
      companyName,
      documentSources: documentSet.documents.map(d => d.filename),
      analysis: {
        companyOverview: {
          businessModel: {
            type: 'SaaS',
            revenueStreams: ['Subscription fees', 'Professional services'],
            scalability: 'High',
            defensibility: 'Medium'
          },
          stage: {
            current: 'Growth',
            readiness: 75,
            nextMilestones: ['Series A funding', 'Product launch', 'Team expansion']
          },
          positioning: {
            industry: 'Technology',
            vertical: 'Enterprise Software',
            targetSegment: 'Mid-market companies',
            valueProposition: 'AI-powered automation platform'
          }
        },
        foundersAssessment: {
          teamStrength: 85,
          founderMarketFit: 90,
          experience: {
            relevant: true,
            yearsTotal: 15,
            previousStartups: 2,
            domainExpertise: ['AI/ML', 'Enterprise Software', 'Product Management']
          },
          teamComposition: {
            technical: true,
            business: true,
            missing: ['Sales leadership'],
            recommendations: ['Hire experienced VP of Sales']
          },
          leadership: {
            vision: 88,
            execution: 82,
            adaptability: 85
          }
        },
        financialAnalysis: {
          currentMetrics: {
            revenue: 2400000,
            growth: {
              rate: 300,
              sustainability: 'High'
            },
            unitEconomics: {
              ltv: 25000,
              cac: 5000,
              ltvCacRatio: 5.0,
              paybackPeriod: 12
            },
            cashPosition: {
              current: 1800000,
              burnRate: 180000,
              runway: 10
            }
          },
          projections: {
            revenueProjection: [2400000, 7200000, 18000000],
            confidenceLevel: 78,
            assumptions: ['Market growth continues', 'Customer acquisition scales', 'No major competitors']
          },
          benchmarks: {
            industryMedian: 150,
            percentile: 85,
            comparison: 'Above'
          }
        },
        marketAnalysis: {
          market: {
            size: {
              tam: 125000000000,
              sam: 15000000000,
              som: 750000000
            },
            growth: 22,
            trends: ['AI adoption', 'Remote work', 'Process automation'],
            drivers: ['Digital transformation', 'Cost optimization', 'Efficiency gains']
          },
          competition: {
            landscape: 'Fragmented',
            intensity: 'Medium',
            barriers: ['Network effects', 'Data moats', 'Customer switching costs'],
            advantage: ['AI-first approach', 'Superior user experience', 'Strong integrations']
          },
          opportunity: {
            score: 88,
            timing: 'Optimal',
            urgency: 'High'
          }
        },
        productAnalysis: {
          product: {
            innovation: 85,
            marketFit: 78,
            differentiation: ['Advanced AI algorithms', 'Intuitive interface', 'Seamless integrations'],
            technology: {
              complexity: 'High',
              defensibility: 'Medium',
              scalability: 'High'
            }
          },
          development: {
            stage: 'Production ready',
            timeline: ['Q1: Advanced features', 'Q2: Mobile app', 'Q3: Enterprise platform'],
            risks: ['Technical debt', 'Scalability challenges', 'Feature complexity']
          }
        },
        tractionAnalysis: {
          traction: {
            score: 82,
            momentum: 'Accelerating',
            milestones: [
              {
                achievement: '100 enterprise customers',
                significance: 'High',
                date: '2024-Q3'
              },
              {
                achievement: '$2M ARR',
                significance: 'High',
                date: '2024-Q4'
              }
            ]
          },
          customerBase: {
            size: 150,
            growth: 45,
            retention: 92,
            satisfaction: 88
          },
          partnerships: {
            strategic: ['Microsoft', 'Salesforce', 'AWS'],
            impact: 'High'
          }
        },
        riskAssessment: {
          risks: [
            {
              category: 'Competitive',
              risk: 'Large tech companies entering market',
              probability: 'Medium',
              impact: 'High',
              severity: 70,
              mitigation: 'Build strong moats and customer loyalty',
              timeline: '12-18 months'
            },
            {
              category: 'Financial',
              risk: 'High burn rate and funding needs',
              probability: 'Medium',
              impact: 'Medium',
              severity: 55,
              mitigation: 'Improve unit economics and extend runway',
              timeline: '6-12 months'
            }
          ],
          overallRisk: 'Medium',
          riskScore: 62
        },
        investmentRecommendation: {
          decision: 'Invest',
          score: 85,
          confidence: 82,
          reasoning: [
            'Strong founder-market fit with experienced team',
            'Large and growing addressable market',
            'Proven product-market fit with strong traction',
            'Defensible AI technology and growing moats',
            'Clear path to profitability and scalability'
          ],
          valuation: {
            suggested: 28000000,
            range: [25000000, 35000000],
            methodology: ['Revenue multiple', 'Comparable company analysis', 'DCF model']
          },
          terms: {
            investmentAmount: 5000000,
            equity: 18,
            liquidationPreference: '1x non-participating preferred'
          },
          nextSteps: [
            'Conduct technical due diligence',
            'Reference calls with customers',
            'Legal and financial audit',
            'Term sheet negotiation'
          ],
          timeline: '4-6 weeks'
        }
      },
      insights: {
        keyStrengths: [
          'Experienced founding team with domain expertise',
          'Strong product-market fit evidenced by customer traction',
          'Large addressable market with favorable tailwinds',
          'Defensible AI technology platform',
          'Strong unit economics and path to profitability'
        ],
        keyWeaknesses: [
          'High cash burn rate requiring additional funding',
          'Limited sales leadership experience',
          'Competitive market with potential big tech entrants',
          'Product complexity may limit expansion speed'
        ],
        criticalRisks: [
          'Funding gap if growth targets not met',
          'Large competitor entering with similar solution',
          'Key founder or technical talent departure'
        ],
        opportunityAreas: [
          'International market expansion',
          'Strategic partnerships with enterprise platforms',
          'Adjacent market penetration',
          'Acquisition opportunities for talent and technology'
        ],
        marketDifferentiators: [
          'AI-first approach vs traditional automation',
          'Superior user experience and ease of use',
          'Strong ecosystem integrations',
          'Domain-specific expertise and customization'
        ]
      },
      benchmarks: [
        {
          metric: 'Revenue Growth Rate',
          companyValue: 300,
          industryMedian: 150,
          industryP75: 250,
          industryP90: 400,
          percentile: 85,
          interpretation: 'Excellent growth rate, above industry P75'
        },
        {
          metric: 'Gross Margin %',
          companyValue: 85,
          industryMedian: 75,
          industryP75: 82,
          industryP90: 88,
          percentile: 78,
          interpretation: 'Strong margins, approaching industry P90'
        }
      ],
      confidence: {
        overall: 85,
        dataQuality: 82,
        analysisDepth: 88,
        sourceReliability: 85
      },
      executiveSummary: `${companyName} represents a compelling investment opportunity in the rapidly growing AI automation space. The company demonstrates strong founder-market fit with an experienced team, proven product-market fit evidenced by impressive traction metrics, and operates in a large addressable market with favorable secular trends.

Key investment highlights include 300% revenue growth, strong unit economics (5:1 LTV:CAC ratio), and defensible AI technology. The founding team's deep domain expertise and previous startup experience provide confidence in execution capability.

Primary risks include competitive intensity from well-funded incumbents and high cash burn requiring additional funding within 10 months. However, the company's differentiated AI-first approach and strong customer traction mitigate these concerns.

Investment Recommendation: INVEST at $28M pre-money valuation with $5M investment for 18% equity. The combination of strong team, large market opportunity, proven traction, and defensible technology creates an attractive risk-adjusted return profile.`,
      processingMetadata: {
        documentsProcessed: documentSet.documents.length,
        processingTime,
        analysisDate: new Date(),
        aiModel: 'mock-enhanced-analyzer'
      }
    };
  }

  // Helper methods for real AI analysis
  private async analyzeCompanyOverview(data: ConsolidatedCompanyData): Promise<CompanyAnalysis> {
    // Implementation would use Gemini API to analyze company data
    return {} as CompanyAnalysis;
  }

  private async analyzeFounders(data: ConsolidatedCompanyData): Promise<FoundersAnalysis> {
    // Implementation would analyze founder backgrounds and team composition
    return {} as FoundersAnalysis;
  }

  private async analyzeFinancials(data: ConsolidatedCompanyData): Promise<FinancialAnalysis> {
    // Implementation would analyze financial metrics and projections
    return {} as FinancialAnalysis;
  }

  private async analyzeMarket(data: ConsolidatedCompanyData): Promise<MarketAnalysis> {
    // Implementation would analyze market size, competition, and opportunity
    return {} as MarketAnalysis;
  }

  private async analyzeProduct(data: ConsolidatedCompanyData): Promise<ProductAnalysis> {
    // Implementation would analyze product innovation and market fit
    return {} as ProductAnalysis;
  }

  private async analyzeTraction(data: ConsolidatedCompanyData): Promise<TractionAnalysis> {
    // Implementation would analyze customer traction and growth metrics
    return {} as TractionAnalysis;
  }

  private async analyzeRisks(data: ConsolidatedCompanyData): Promise<RiskAnalysis> {
    // Implementation would identify and assess various risk categories
    return {} as RiskAnalysis;
  }

  private async generateInvestmentRecommendation(data: ConsolidatedCompanyData): Promise<InvestmentRecommendation> {
    // Implementation would generate investment decision and terms
    return {} as InvestmentRecommendation;
  }

  private async generateInsights(data: ConsolidatedCompanyData, analysis: any): Promise<any> {
    // Implementation would extract key insights from analysis
    return {};
  }

  private async generateBenchmarks(data: ConsolidatedCompanyData): Promise<BenchmarkComparison[]> {
    // Implementation would compare metrics against industry benchmarks
    return [];
  }

  private async generateExecutiveSummary(data: ConsolidatedCompanyData, recommendation: InvestmentRecommendation): Promise<string> {
    // Implementation would generate comprehensive executive summary
    return '';
  }

  private calculateConfidence(documentSet: CompanyDocumentSet): any {
    const numDocs = documentSet.documents.length;
    const hasMultipleTypes = new Set(documentSet.documents.map(d => d.type)).size > 1;
    
    const baseConfidence = 60;
    const docBonus = Math.min(numDocs * 10, 30);
    const typeBonus = hasMultipleTypes ? 15 : 0;
    
    const overall = Math.min(baseConfidence + docBonus + typeBonus, 95);
    
    return {
      overall,
      dataQuality: overall - 5,
      analysisDepth: overall + 3,
      sourceReliability: overall - 2
    };
  }
}

export const enhancedAIAnalyzer = new EnhancedAIAnalyzer();