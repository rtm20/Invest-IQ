import { NextRequest, NextResponse } from 'next/server';
import { visionService, geminiService } from '../../../lib/google-cloud';

interface ProcessedDocument {
  filename: string;
  fileType: string;
  size: number;
  extractedText: string;
  documentType: 'pitch_deck' | 'financial_model' | 'founders_info' | 'business_plan' | 'other';
  confidence: number;
}

interface ConsolidatedData {
  companyOverview: {
    name: string;
    industry: string;
    stage: string;
    location: string;
    description: string;
    website?: string;
    foundedYear?: string;
  };
  founders: Array<{
    name: string;
    role: string;
    background: string;
    experience: string;
    education?: string;
  }>;
  businessModel: {
    type: string;
    revenueStreams: string[];
    targetMarket: string;
    valueProposition: string;
  };
  financials: {
    currentRevenue?: number;
    projectedRevenue?: number;
    revenueGrowthRate?: number;
    grossMargin?: number;
    burnRate?: number;
    runway?: number;
    cashRaised?: number;
    fundingRound?: string;
    employees: number;
    customers?: number;
  };
  market: {
    tam?: number;
    sam?: number;
    som?: number;
    marketSize?: number;
    growthRate?: number;
    competitors: string[];
    marketTrends: string[];
  };
  product: {
    description: string;
    stage: string;
    features: string[];
    technology: string[];
    differentiators: string[];
  };
  traction: {
    customers?: number;
    revenue?: number;
    partnerships: string[];
    milestones: Array<{
      description: string;
      date?: string;
      achieved: boolean;
    }>;
  };
  funding: {
    seeking?: number;
    valuation?: number;
    useOfFunds: Array<{
      category: string;
      percentage: number;
      description: string;
    }>;
  };
  risks: Array<{
    category: string;
    description: string;
    severity: string;
    mitigation?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting multi-document upload and analysis...');
    const startTime = Date.now();

    // Parse uploaded files
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`📄 Processing ${files.length} uploaded files...`);

    // Validate files
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
        /\.(pdf|pptx|docx|txt)$/i.test(file.name);
      
      if (!isValidType) {
        console.warn(`⚠️ Unsupported file type: ${file.name}`);
      }
      
      return isValidType;
    });

    if (validFiles.length === 0) {
      return NextResponse.json(
        { error: 'No valid files found. Supported formats: PDF, PPTX, DOCX, TXT' },
        { status: 400 }
      );
    }

    console.log(`✅ ${validFiles.length} valid files found`);

    // Step 1: Process each document and extract text
    console.log('📖 Step 1: Extracting text from documents...');
    const processedDocuments: ProcessedDocument[] = [];

    for (const file of validFiles) {
      try {
        console.log(`Processing: ${file.name}...`);
        
        // Extract text based on file type
        let extractedText = '';
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          extractedText = await file.text();
        } else {
          // For PDF, DOCX, PPTX - use enhanced document processing
          const buffer = Buffer.from(await file.arrayBuffer());
          extractedText = await visionService.extractTextFromDocument(buffer, file.name);
        }

        // Classify document type
        const documentType = classifyDocumentType(file.name, extractedText);
        
        processedDocuments.push({
          filename: file.name,
          fileType: file.type,
          size: file.size,
          extractedText,
          documentType,
          confidence: calculateExtractionConfidence(extractedText, file.size)
        });

        console.log(`✅ ${file.name}: ${extractedText.length} characters extracted`);
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        // Continue with other files
      }
    }

    if (processedDocuments.length === 0) {
      return NextResponse.json(
        { error: 'Failed to extract text from any documents' },
        { status: 500 }
      );
    }

    // Step 2: Use Gemini AI to consolidate and structure the data
    console.log('🤖 Step 2: Consolidating data using Gemini AI...');
    const consolidatedData = await consolidateDocumentData(processedDocuments);

    // Step 3: Generate comprehensive AI analysis
    console.log('📊 Step 3: Generating comprehensive AI analysis...');
    const analysisResult = await generateComprehensiveAnalysis(consolidatedData, processedDocuments);

    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Multi-document analysis completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Multi-document analysis completed successfully',
      results: {
        documentsProcessed: processedDocuments.length,
        documentSummaries: processedDocuments.map(doc => ({
          filename: doc.filename,
          type: doc.documentType,
          textLength: doc.extractedText.length,
          confidence: doc.confidence
        })),
        consolidatedData,
        analysis: analysisResult,
        processingMetadata: {
          processingTime,
          documentsProcessed: processedDocuments.length,
          totalTextExtracted: processedDocuments.reduce((sum, doc) => sum + doc.extractedText.length, 0),
          analysisId: `multi_doc_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Multi-document analysis failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Multi-document analysis failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Multi-Document Upload and Analysis API',
    description: 'Upload multiple documents for comprehensive startup analysis',
    usage: 'POST with multipart/form-data containing files array',
    supportedFormats: ['PDF', 'PPTX', 'DOCX', 'TXT'],
    features: [
      'Multi-document text extraction',
      'AI-powered data consolidation',
      'Comprehensive startup analysis',
      'Document type classification',
      'Structured data extraction'
    ]
  });
}

// Helper Functions

function classifyDocumentType(filename: string, content: string): ProcessedDocument['documentType'] {
  const name = filename.toLowerCase();
  const text = content.toLowerCase();

  if (name.includes('pitch') || name.includes('deck') || text.includes('pitch deck')) {
    return 'pitch_deck';
  }
  if (name.includes('financial') || name.includes('model') || text.includes('financial model')) {
    return 'financial_model';
  }
  if (name.includes('founder') || name.includes('team') || text.includes('founder')) {
    return 'founders_info';
  }
  if (name.includes('business') || name.includes('plan') || text.includes('business plan')) {
    return 'business_plan';
  }
  
  return 'other';
}

function calculateExtractionConfidence(text: string, fileSize: number): number {
  const textLength = text.length;
  const expectedRatio = 0.01; // Expected characters per byte
  const actualRatio = textLength / fileSize;
  
  let confidence = 50;
  
  // Boost confidence based on text length
  if (textLength > 1000) confidence += 20;
  if (textLength > 5000) confidence += 10;
  
  // Adjust based on extraction ratio
  if (actualRatio > expectedRatio * 0.5) confidence += 15;
  if (actualRatio > expectedRatio) confidence += 10;
  
  return Math.min(confidence, 95);
}

async function consolidateDocumentData(documents: ProcessedDocument[]): Promise<ConsolidatedData> {
  try {
    console.log('🔄 Using Gemini AI to consolidate document data...');
    
    // Prepare consolidated text for Gemini analysis
    const documentSummaries = documents.map(doc => `
=== Document: ${doc.filename} (Type: ${doc.documentType}) ===
${doc.extractedText.substring(0, 8000)} // Limit text for API efficiency
`).join('\n\n');

    const consolidationPrompt = `
You are an expert startup analyst. Analyze the following documents and extract structured information about this startup company. 

Documents to analyze:
${documentSummaries}

Please extract and organize the following information in valid JSON format:

{
  "companyOverview": {
    "name": "Company name",
    "industry": "Industry/sector",
    "stage": "Startup stage (seed, series A, etc.)",
    "location": "Location",
    "description": "Brief company description",
    "website": "Website URL if mentioned",
    "foundedYear": "Founded year if mentioned"
  },
  "founders": [
    {
      "name": "Founder name",
      "role": "Role/title",
      "background": "Professional background",
      "experience": "Years of experience",
      "education": "Education if mentioned"
    }
  ],
  "businessModel": {
    "type": "Business model type (B2B, B2C, SaaS, etc.)",
    "revenueStreams": ["Revenue stream 1", "Revenue stream 2"],
    "targetMarket": "Target market description",
    "valueProposition": "Main value proposition"
  },
  "financials": {
    "currentRevenue": 0,
    "projectedRevenue": 0,
    "revenueGrowthRate": 0,
    "grossMargin": 0,
    "burnRate": 0,
    "runway": 0,
    "cashRaised": 0,
    "fundingRound": "Current/last funding round",
    "employees": 0,
    "customers": 0
  },
  "market": {
    "tam": 0,
    "sam": 0,
    "som": 0,
    "marketSize": 0,
    "growthRate": 0,
    "competitors": ["Competitor 1", "Competitor 2"],
    "marketTrends": ["Trend 1", "Trend 2"]
  },
  "product": {
    "description": "Product description",
    "stage": "Product stage (concept, MVP, launched, etc.)",
    "features": ["Feature 1", "Feature 2"],
    "technology": ["Technology 1", "Technology 2"],
    "differentiators": ["Differentiator 1", "Differentiator 2"]
  },
  "traction": {
    "customers": 0,
    "revenue": 0,
    "partnerships": ["Partner 1", "Partner 2"],
    "milestones": [
      {
        "description": "Milestone description",
        "date": "Date if mentioned",
        "achieved": true
      }
    ]
  },
  "funding": {
    "seeking": 0,
    "valuation": 0,
    "useOfFunds": [
      {
        "category": "Category",
        "percentage": 0,
        "description": "Description"
      }
    ]
  },
  "risks": [
    {
      "category": "Risk category",
      "description": "Risk description",
      "severity": "low/medium/high",
      "mitigation": "Mitigation strategy if mentioned"
    }
  ]
}

Extract only factual information from the documents. Use 0 or empty arrays for missing numeric data. Return ONLY valid JSON, no additional text.
`;

    const consolidationResult = await geminiService.analyzeStartupData(
      consolidationPrompt, 
      'company'
    );

    // Parse the result (it should already be parsed by geminiService)
    let consolidatedData: ConsolidatedData;
    
    if (typeof consolidationResult === 'string') {
      consolidatedData = JSON.parse(consolidationResult);
    } else {
      consolidatedData = consolidationResult as ConsolidatedData;
    }

    console.log('✅ Data consolidation completed');
    return consolidatedData;

  } catch (error) {
    console.error('❌ Error consolidating data:', error);
    
    // Return fallback consolidated data
    return generateFallbackConsolidatedData(documents);
  }
}

async function generateComprehensiveAnalysis(consolidatedData: ConsolidatedData, documents: ProcessedDocument[]): Promise<any> {
  try {
    console.log('🔍 Generating comprehensive startup analysis...');
    
    // Create analysis prompt based on consolidated data
    const analysisPrompt = `
You are an expert venture capital analyst. Based on the following consolidated startup data, provide a comprehensive investment analysis with DETAILED scoring breakdown.

Company Data:
${JSON.stringify(consolidatedData, null, 2)}

Provide a detailed investment analysis with the following structure. All scores must be out of 100 and based on actual data provided.

Return ONLY valid JSON in this EXACT format:

{
  "recommendation": {
    "decision": "invest/maybe/pass",
    "score": 0,
    "reasoning": [
      "Key reason 1",
      "Key reason 2",
      "Key reason 3"
    ],
    "keyStrengths": [
      "Strength 1",
      "Strength 2",
      "Strength 3"
    ],
    "keyWeaknesses": [
      "Weakness 1",
      "Weakness 2"
    ],
    "investmentThesis": "Detailed 2-3 sentence investment thesis",
    "nextSteps": [
      "Next step 1",
      "Next step 2"
    ]
  },
  "founderAnalysis": {
    "score": 0,
    "breakdown": {
      "founderExperience": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Detailed assessment of founder experience"
      },
      "teamComposition": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Assessment of team composition"
      },
      "advisoryBoard": {
        "points": 0,
        "maxPoints": 3,
        "assessment": "Assessment of advisory board"
      },
      "trackRecord": {
        "points": 0,
        "maxPoints": 3,
        "assessment": "Assessment of past successes"
      }
    },
    "summary": "Overall team assessment"
  },
  "marketAnalysis": {
    "score": 0,
    "breakdown": {
      "marketSize": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "TAM/SAM/SOM assessment"
      },
      "marketTiming": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Market timing and trends"
      },
      "competitionLevel": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Competitive landscape analysis"
      }
    },
    "summary": "Overall market opportunity assessment"
  },
  "productAnalysis": {
    "score": 0,
    "breakdown": {
      "innovationLevel": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Product innovation assessment"
      },
      "productMarketFit": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Product-market fit signals"
      },
      "scalability": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Scalability potential"
      }
    },
    "summary": "Overall product assessment"
  },
  "tractionAnalysis": {
    "score": 0,
    "breakdown": {
      "customerGrowth": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Customer acquisition and growth"
      },
      "revenueGrowth": {
        "points": 0,
        "maxPoints": 7,
        "assessment": "Revenue growth trajectory"
      },
      "keyPartnerships": {
        "points": 0,
        "maxPoints": 5,
        "assessment": "Strategic partnerships"
      }
    },
    "summary": "Overall traction assessment"
  },
  "financialAnalysis": {
    "score": 0,
    "breakdown": {
      "unitEconomics": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "LTV:CAC and unit economics"
      },
      "burnRate": {
        "points": 0,
        "maxPoints": 5,
        "assessment": "Burn rate and runway"
      },
      "revenueModel": {
        "points": 0,
        "maxPoints": 4,
        "assessment": "Revenue model viability"
      }
    },
    "summary": "Overall financial health assessment"
  },
  "competitiveAnalysis": {
    "score": 0,
    "breakdown": {
      "uniqueValueProp": {
        "points": 0,
        "maxPoints": 2,
        "assessment": "Unique value proposition"
      },
      "defensibility": {
        "points": 0,
        "maxPoints": 3,
        "assessment": "Competitive moats and barriers"
      }
    },
    "summary": "Competitive advantage assessment"
  },
  "riskAnalysis": {
    "level": "low/medium/high",
    "majorRisks": [
      "Risk 1",
      "Risk 2"
    ],
    "mitigation": "Risk mitigation strategies"
  },
  "executiveSummary": "Comprehensive 3-4 sentence executive summary for investors",
  "confidence": 85
}

IMPORTANT SCORING GUIDELINES:
- Base ALL scores on actual data provided in the consolidated data
- If data is missing for a category, score conservatively (30-50 range)
- Overall score should equal: (founderAnalysis.score * 0.20) + (marketAnalysis.score * 0.20) + (productAnalysis.score * 0.20) + (tractionAnalysis.score * 0.20) + (financialAnalysis.score * 0.15) + (competitiveAnalysis.score * 0.05)
- Breakdown points must add up to the category score (out of 100)
- Provide specific, actionable assessments for each factor
- Return ONLY valid JSON, no markdown or additional text
`;

    const analysisResult = await geminiService.analyzeStartupData(analysisPrompt, 'recommendation');
    
    console.log('✅ Comprehensive analysis completed');
    console.log('📊 Analysis structure:', JSON.stringify(analysisResult, null, 2).substring(0, 500));
    
    // Validate the analysis result has required fields
    if (!analysisResult.founderAnalysis || !analysisResult.marketAnalysis || 
        !analysisResult.productAnalysis || !analysisResult.tractionAnalysis) {
      console.warn('⚠️ Gemini returned incomplete analysis structure, using fallback');
      return generateFallbackAnalysis(consolidatedData);
    }
    
    // Recalculate category scores from breakdown to ensure accuracy
    const recalculateCategoryScore = (breakdown: any) => {
      if (!breakdown) return 0;
      let total = 0;
      for (const factor of Object.values(breakdown)) {
        if (factor && typeof factor === 'object' && 'points' in factor) {
          total += (factor as any).points || 0;
        }
      }
      return total;
    };
    
    // Override category scores with calculated values
    analysisResult.founderAnalysis.score = recalculateCategoryScore(analysisResult.founderAnalysis.breakdown);
    analysisResult.marketAnalysis.score = recalculateCategoryScore(analysisResult.marketAnalysis.breakdown);
    analysisResult.productAnalysis.score = recalculateCategoryScore(analysisResult.productAnalysis.breakdown);
    analysisResult.tractionAnalysis.score = recalculateCategoryScore(analysisResult.tractionAnalysis.breakdown);
    analysisResult.financialAnalysis.score = recalculateCategoryScore(analysisResult.financialAnalysis.breakdown);
    analysisResult.competitiveAnalysis.score = recalculateCategoryScore(analysisResult.competitiveAnalysis.breakdown);
    
    // Calculate overall score
    const overallScore = Math.round(
      (analysisResult.founderAnalysis.score * 0.20) +
      (analysisResult.marketAnalysis.score * 0.20) +
      (analysisResult.productAnalysis.score * 0.20) +
      (analysisResult.tractionAnalysis.score * 0.20) +
      (analysisResult.financialAnalysis.score * 0.15) +
      (analysisResult.competitiveAnalysis.score * 0.05)
    ) * 5; // Multiply by 5 to get score out of 100
    
    analysisResult.overallScore = overallScore;
    if (analysisResult.recommendation) {
      analysisResult.recommendation.overallScore = overallScore;
    }
    
    console.log('✅ Scores validated and calculated:');
    console.log(`   Overall: ${overallScore}/100`);
    console.log(`   Team: ${analysisResult.founderAnalysis.score}/20`);
    console.log(`   Market: ${analysisResult.marketAnalysis.score}/20`);
    console.log(`   Product: ${analysisResult.productAnalysis.score}/20`);
    console.log(`   Traction: ${analysisResult.tractionAnalysis.score}/20`);
    console.log(`   Financial: ${analysisResult.financialAnalysis.score}/15`);
    console.log(`   Competitive: ${analysisResult.competitiveAnalysis.score}/5`);
    
    return analysisResult;

  } catch (error) {
    console.error('❌ Error generating analysis:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    
    // Return fallback analysis
    return generateFallbackAnalysis(consolidatedData);
  }
}

function generateFallbackConsolidatedData(documents: ProcessedDocument[]): ConsolidatedData {
  // Generate basic consolidated data from documents
  const companyName = extractCompanyNameFromDocuments(documents);
  
  return {
    companyOverview: {
      name: companyName,
      industry: 'Technology',
      stage: 'Early Stage',
      location: 'Unknown',
      description: `${companyName} is a technology startup.`
    },
    founders: [],
    businessModel: {
      type: 'Unknown',
      revenueStreams: [],
      targetMarket: '',
      valueProposition: ''
    },
    financials: {
      employees: 0,
      customers: 0
    },
    market: {
      competitors: [],
      marketTrends: []
    },
    product: {
      description: '',
      stage: 'Unknown',
      features: [],
      technology: [],
      differentiators: []
    },
    traction: {
      partnerships: [],
      milestones: []
    },
    funding: {
      useOfFunds: []
    },
    risks: []
  };
}

function generateFallbackAnalysis(consolidatedData?: ConsolidatedData): any {
  const companyName = consolidatedData?.companyOverview?.name || 'Unknown Company';
  const textExtracted = consolidatedData?.financials?.customers || 0;
  
  return {
    founderAnalysis: {
      score: 6,
      breakdown: {
        founderExperience: { points: 2, maxPoints: 8, assessment: "Insufficient data to assess founder experience" },
        teamComposition: { points: 2, maxPoints: 6, assessment: "Team composition data not available" },
        advisoryBoard: { points: 1, maxPoints: 3, assessment: "Advisory board information not provided" },
        trackRecord: { points: 1, maxPoints: 3, assessment: "Previous track record not documented" }
      },
      summary: "Team assessment incomplete due to limited documentation"
    },
    marketAnalysis: {
      score: 6,
      breakdown: {
        marketSize: { points: 2, maxPoints: 8, assessment: "Market size data not provided" },
        marketTiming: { points: 2, maxPoints: 6, assessment: "Market timing analysis requires more data" },
        competitionLevel: { points: 2, maxPoints: 6, assessment: "Competitive landscape not documented" }
      },
      summary: "Market opportunity requires additional documentation"
    },
    productAnalysis: {
      score: 6,
      breakdown: {
        innovationLevel: { points: 2, maxPoints: 8, assessment: "Product innovation not clearly documented" },
        productMarketFit: { points: 2, maxPoints: 6, assessment: "Product-market fit signals not available" },
        scalability: { points: 2, maxPoints: 6, assessment: "Scalability potential unclear from documents" }
      },
      summary: "Product details require comprehensive documentation"
    },
    tractionAnalysis: {
      score: 5,
      breakdown: {
        customerGrowth: { points: 2, maxPoints: 8, assessment: "Customer growth metrics not provided" },
        revenueGrowth: { points: 2, maxPoints: 7, assessment: "Revenue growth data not available" },
        keyPartnerships: { points: 1, maxPoints: 5, assessment: "Partnership information not documented" }
      },
      summary: "Traction metrics require detailed documentation"
    },
    financialAnalysis: {
      score: 5,
      breakdown: {
        unitEconomics: { points: 2, maxPoints: 6, assessment: "Unit economics data not available" },
        burnRate: { points: 1, maxPoints: 5, assessment: "Burn rate and runway not documented" },
        revenueModel: { points: 2, maxPoints: 4, assessment: "Revenue model unclear from documents" }
      },
      summary: "Financial health assessment incomplete"
    },
    competitiveAnalysis: {
      score: 2,
      breakdown: {
        uniqueValueProp: { points: 1, maxPoints: 2, assessment: "Unique value proposition not clearly defined" },
        defensibility: { points: 1, maxPoints: 3, assessment: "Competitive moat not documented" }
      },
      summary: "Competitive positioning requires more detail"
    },
    recommendation: {
      decision: 'pass',
      score: 30,
      overallScore: 30,
      reasoning: [
        'Insufficient documentation provided for comprehensive analysis',
        'Key metrics and data points missing from uploaded documents',
        'Unable to assess team, market, product, traction, or financials thoroughly',
        'Recommend uploading complete pitch deck, financial model, and team information'
      ],
      keyStrengths: [],
      keyWeaknesses: [
        'Limited text extracted from documents',
        'Missing critical business information',
        'Incomplete financial data',
        'Lack of traction metrics'
      ],
      concerns: [
        'Documents may be password-protected or corrupted',
        'Text extraction failed - consider re-uploading in different format',
        'Need pitch deck, financial model, and founder information'
      ],
      investmentThesis: `Analysis of ${companyName} cannot be completed due to insufficient documentation. The uploaded files contained minimal extractable text (${textExtracted} characters). For proper investment analysis, please provide: 1) Complete pitch deck with company overview, market analysis, and product details, 2) Financial model with revenue projections and metrics, 3) Founder/team information and backgrounds.`,
      nextSteps: [
        'Upload complete pitch deck (PDF or PPTX)',
        'Provide detailed financial model',
        'Include founder backgrounds and team information',
        'Ensure documents are not password-protected',
        'Consider converting documents to PDF format for better text extraction'
      ]
    },
    riskAnalysis: {
      level: 'High',
      factors: [
        'Insufficient data for risk assessment',
        'Unable to evaluate market risks',
        'Financial health unclear'
      ]
    },
    executiveSummary: `Analysis of ${companyName} cannot proceed due to insufficient documentation. The system extracted minimal text from the uploaded files, preventing comprehensive investment analysis. To receive a detailed investment recommendation, please upload complete documentation including pitch deck, financial projections, team information, and market analysis. Current assessment: PASS - Incomplete data.`,
    confidence: 20
  };
}

function extractCompanyNameFromDocuments(documents: ProcessedDocument[]): string {
  for (const doc of documents) {
    // Try to extract company name from filename
    const filename = doc.filename.replace(/\.(pdf|docx|pptx|txt)$/i, '');
    if (filename.length > 3 && filename.length < 50) {
      return filename;
    }
    
    // Try to extract from document content
    const lines = doc.extractedText.split('\n');
    for (const line of lines.slice(0, 10)) {
      if (line.trim().length > 3 && line.trim().length < 50 && !line.includes('confidential')) {
        return line.trim();
      }
    }
  }
  
  return 'Unknown Company';
}