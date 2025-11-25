import { NextRequest, NextResponse } from 'next/server';
import { visionService, geminiService } from '../../../lib/google-cloud';
import { getSectorBenchmarks, formatBenchmarkGuidance } from '../../../lib/sector-benchmarks';

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

    // Step 2.5: Classify startup sector for targeted benchmarking
    console.log('🔍 Step 2.5: Classifying startup sector...');
    const sectorClassification = await classifyStartupSector(consolidatedData);

    // Step 3: Generate comprehensive AI analysis with sector-specific benchmarks
    console.log('📊 Step 3: Generating comprehensive AI analysis...');
    const analysisResult = await generateComprehensiveAnalysis(consolidatedData, processedDocuments, sectorClassification);

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
        sectorClassification,
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

async function classifyStartupSector(consolidatedData: ConsolidatedData): Promise<{ sector: string; industry: string; stage: string; businessModel: string }> {
  try {
    console.log('🔍 Classifying startup sector for targeted benchmarking...');
    
    // Validate consolidatedData has required fields
    if (!consolidatedData || !consolidatedData.companyOverview || !consolidatedData.businessModel || !consolidatedData.product) {
      console.warn('⚠️ Incomplete consolidated data, using default sector');
      console.log('Debug - Has companyOverview:', !!consolidatedData?.companyOverview);
      console.log('Debug - Has businessModel:', !!consolidatedData?.businessModel);
      console.log('Debug - Has product:', !!consolidatedData?.product);
      return {
        sector: 'B2B SaaS',
        industry: 'Software',
        stage: 'Early Stage',
        businessModel: 'SaaS'
      };
    }
    
    console.log('✅ Consolidated data complete, proceeding with classification...');
    console.log(`📊 Company: ${consolidatedData.companyOverview.name}`);
    console.log(`📊 Industry: ${consolidatedData.companyOverview.industry}`);
    console.log(`📊 Business Model: ${consolidatedData.businessModel.type}`);
    console.log(`📊 Product: ${consolidatedData.product.description?.substring(0, 100)}...`);
    
    const classificationPrompt = `
You are a venture capital analyst expert at categorizing startups into investment sectors.

Analyze this startup and classify it into the MOST APPROPRIATE sector category:

Company Information:
- Name: ${consolidatedData.companyOverview.name || 'Unknown'}
- Industry: ${consolidatedData.companyOverview.industry || 'Unknown'}
- Description: ${consolidatedData.companyOverview.description || 'Unknown'}
- Business Model: ${consolidatedData.businessModel.type || 'Unknown'}
- Product: ${consolidatedData.product.description || 'Unknown'}
- Target Market: ${consolidatedData.businessModel.targetMarket || 'Unknown'}
- Revenue Streams: ${consolidatedData.businessModel?.revenueStreams?.join(', ') || 'Unknown'}
- Stage: ${consolidatedData.companyOverview.stage || 'Unknown'}

AVAILABLE SECTORS (choose EXACTLY ONE):
1. "Enterprise SaaS" - Cloud software for large enterprises (Snowflake, Databricks, HashiCorp style)
2. "B2B SaaS" - Software for SMBs and businesses (HubSpot, Slack, Zoom style)
3. "Consumer FinTech" - Consumer financial services/payments (Stripe, Robinhood, Chime style)
4. "HealthTech" - Healthcare technology/digital health (Oscar Health, Ro, Tempus style)
5. "Consumer Social" - Social networks/communities (Instagram, Discord, TikTok style)
6. "AI/ML Infrastructure" - AI developer tools/infrastructure (Hugging Face, Scale AI style)
7. "Hardware/IoT" - Physical products/IoT devices (Peloton, Ring, Nest style)
8. "Marketplace" - Two-sided marketplaces (Airbnb, DoorDash, Faire style)
9. "Climate Tech" - Climate/sustainability solutions (Rivian, Impossible Foods style)
10. "E-commerce/DTC" - Direct-to-consumer brands (Warby Parker, Glossier, Allbirds style)
11. "EdTech" - Education technology (Coursera, Duolingo, Outschool style)
12. "Cybersecurity" - Security and compliance (CrowdStrike, SentinelOne style)

CLASSIFICATION RULES:
- Choose the PRIMARY sector that best describes the company's core business
- Use "Enterprise SaaS" for large enterprise infrastructure (data warehouses, cloud platforms)
- Use "B2B SaaS" for SMB/mid-market business software (CRM, communication, productivity)
- Use "AI/ML Infrastructure" ONLY if selling to AI developers/engineers (not just using AI)
- Use "HealthTech" for medical devices, digital health, telehealth, clinical software
- Use "Consumer FinTech" for consumer-facing financial products (NOT B2B payments)
- Use "Cybersecurity" for security products (NOT general enterprise software)
- Use "Marketplace" for two-sided platforms connecting buyers/sellers
- Use "Hardware/IoT" for physical products with software components

Return ONLY valid JSON with this EXACT structure:
{
  "sector": "Exact sector name from list above - MUST match exactly",
  "industry": "General industry category (1-2 words)",
  "stage": "Seed/Series A/Series B/Growth",
  "businessModel": "B2B/B2C/B2B2C/Marketplace/Platform"
}

CRITICAL: The "sector" field MUST be one of the 12 exact sector names listed above. Do not create new categories.
`;

    const classificationResult = await geminiService.analyzeStartupData(
      classificationPrompt,
      'company'
    );

    console.log('🔍 Raw classification result:', JSON.stringify(classificationResult, null, 2));

    // Handle array or object response
    let classificationData = classificationResult;
    if (Array.isArray(classificationResult) && classificationResult.length > 0) {
      console.log('📦 Classification returned array, extracting first element');
      classificationData = classificationResult[0];
    }

    // Validate that the returned sector matches one of our benchmarks
    const validSectors = [
      'Enterprise SaaS', 'B2B SaaS', 'Consumer FinTech', 'HealthTech',
      'Consumer Social', 'AI/ML Infrastructure', 'Hardware/IoT', 'Marketplace',
      'Climate Tech', 'E-commerce/DTC', 'EdTech', 'Cybersecurity'
    ];

    let finalSector = classificationData.sector || 'B2B SaaS';
    
    // If AI returned something not in our list, find the closest match
    if (!validSectors.includes(finalSector)) {
      console.warn(`⚠️ AI returned invalid sector: ${finalSector}, finding closest match...`);
      const normalized = finalSector.toLowerCase();
      
      // Simple fallback matching
      if (normalized.includes('saas') || normalized.includes('software')) {
        finalSector = normalized.includes('enterprise') ? 'Enterprise SaaS' : 'B2B SaaS';
      } else if (normalized.includes('health') || normalized.includes('medical')) {
        finalSector = 'HealthTech';
      } else if (normalized.includes('fintech') || normalized.includes('financial')) {
        finalSector = 'Consumer FinTech';
      } else if (normalized.includes('ai') || normalized.includes('ml')) {
        finalSector = 'AI/ML Infrastructure';
      } else {
        finalSector = 'B2B SaaS'; // Safe default
      }
    }

    console.log('📌 Classified Sector:', finalSector, '| Industry:', classificationData.industry || 'Unknown');

    return {
      sector: finalSector,
      industry: classificationData.industry || consolidatedData.companyOverview.industry || 'Software',
      stage: classificationData.stage || consolidatedData.companyOverview.stage || 'Series A',
      businessModel: classificationData.businessModel || consolidatedData.businessModel.type || 'B2B'
    };
  } catch (error) {
    console.error('⚠️ Sector classification failed, using default:', error);
    return {
      sector: 'B2B SaaS',
      industry: consolidatedData?.companyOverview?.industry || 'Software',
      stage: consolidatedData?.companyOverview?.stage || 'Early Stage',
      businessModel: consolidatedData?.businessModel?.type || 'SaaS'
    };
  }
}

async function consolidateDocumentData(documents: ProcessedDocument[]): Promise<ConsolidatedData> {
  try {
    console.log('🔄 Using Gemini AI to consolidate document data...');
    
    // Prepare FULL document text for Gemini analysis (NO TRUNCATION)
    const documentSummaries = documents.map(doc => `
=== Document: ${doc.filename} (Type: ${doc.documentType}) ===
${doc.extractedText}
`).join('\n\n');

    console.log(`📊 Sending ${documentSummaries.length} characters to Gemini for consolidation...`);

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

    const consolidationResult = await geminiService.callGeminiRaw(
      consolidationPrompt,
      8192, // Max tokens for large response
      0.2   // Low temperature for structured output
    );

    // Parse the JSON response
    let consolidatedData: ConsolidatedData;
    
    console.log('🔍 Raw response length:', consolidationResult.length);
    
    try {
      const parsed = JSON.parse(consolidationResult);
      console.log('✅ JSON parsed successfully');
      console.log('🔍 Parsed type:', Array.isArray(parsed) ? 'array' : 'object');
      
      // Check if Gemini returned an array (sometimes it does)
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('📦 Gemini returned array, extracting first element');
        consolidatedData = parsed[0];
      } else {
        consolidatedData = parsed;
      }
      
      console.log('🔍 Top-level keys:', Object.keys(consolidatedData));
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.log('Full response:', consolidationResult);
      throw new Error('Failed to parse consolidation response as JSON');
    }

    console.log('✅ Data consolidation completed');
    console.log('🔍 Final structure check:');
    console.log('  - Has companyOverview:', !!consolidatedData.companyOverview);
    console.log('  - Has businessModel:', !!consolidatedData.businessModel);
    console.log('  - Has product:', !!consolidatedData.product);
    
    if (consolidatedData.companyOverview) {
      console.log('  - Company name:', consolidatedData.companyOverview.name);
      console.log('  - Industry:', consolidatedData.companyOverview.industry);
    }
    
    return consolidatedData;

  } catch (error) {
    console.error('❌ Error consolidating data:', error);
    throw new Error('Failed to consolidate document data. Please try again.');
  }
}

async function generateComprehensiveAnalysis(
  consolidatedData: ConsolidatedData, 
  documents: ProcessedDocument[],
  sectorClassification: { sector: string; industry: string; stage: string; businessModel: string }
): Promise<any> {
  try {
    console.log('🔍 Generating comprehensive startup analysis...');
    console.log(`📌 Sector: ${sectorClassification.sector} | Industry: ${sectorClassification.industry}`);
    
    // Get sector-specific benchmarks
    const sectorBenchmarks = getSectorBenchmarks(sectorClassification.sector);
    const benchmarkGuidance = sectorBenchmarks 
      ? formatBenchmarkGuidance(sectorBenchmarks)
      : 'Using general startup benchmarks (sector not found in database)';
    
    console.log(`✅ Loaded benchmarks for ${sectorClassification.sector}`);
    
    // Create analysis prompt based on consolidated data
    const analysisPrompt = `
You are an expert VC analyst. Analyze this startup data and return a comprehensive investment analysis.

Company Data:
${JSON.stringify(consolidatedData, null, 2)}

IMPORTANT: Return ONLY valid, complete JSON. Do not truncate. Ensure all arrays and objects are properly closed.

Return this EXACT JSON structure:

{
  "recommendation": {
    "decision": "invest/maybe/reject",
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

CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no truncation
2. Close ALL arrays and objects properly
3. BE GENEROUS WITH SCORING - Most successful VC investments score 60-75/100
4. Category scores = sum of breakdown points
5. Award points for POTENTIAL and EVIDENCE, not perfection
6. Missing data is NORMAL for startups - don't over-penalize
7. Keep assessments concise (max 100 chars each)
8. Ensure JSON is complete before responding

${benchmarkGuidance}

CALIBRATION GUIDANCE:
Compare the startup you're analyzing to the real examples above within the ${sectorClassification.sector} sector.
Use these sector-specific benchmarks to determine appropriate scores:
• 70-80/100 = Exceptional (top 5% within this sector)
• 60-69/100 = Strong invest (top 20% within this sector)
• 50-59/100 = Maybe/Consider (shows promise for this sector)
• Below 50/100 = Pass/Reject (significant concerns for this sector)

IMPORTANT: Adjust your expectations based on sector norms. What's impressive for HealthTech (e.g., FDA approval in progress) 
differs from Consumer Social (e.g., viral growth) or Enterprise SaaS (e.g., $20M ARR).
`;

    // Use callGeminiRaw to get the detailed analysis structure (not the simplified recommendation format)
    const analysisResponseText = await geminiService.callGeminiRaw(analysisPrompt, 8000, 0.2);
    
    // Parse the response
    let analysisResult: any;
    try {
      const cleanText = analysisResponseText.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      analysisResult = JSON.parse(cleanText);
      
      // Handle array responses (sometimes Gemini returns [{...}] instead of {...})
      if (Array.isArray(analysisResult)) {
        console.log('⚠️ Gemini returned array, extracting first element');
        analysisResult = analysisResult[0];
      }
    } catch (parseError) {
      console.error('❌ Failed to parse analysis response:', parseError);
      console.error('📄 Raw response (first 2000 chars):', analysisResponseText.substring(0, 2000));
      throw new Error('Failed to parse AI analysis response. Please retry.');
    }
    
    console.log('✅ Comprehensive analysis completed');
    console.log('📊 Analysis structure keys:', Object.keys(analysisResult));
    console.log('📊 Analysis structure sample:', JSON.stringify(analysisResult, null, 2).substring(0, 1000));
    
    // Validate the analysis result has required fields
    const requiredFields = ['founderAnalysis', 'marketAnalysis', 'productAnalysis', 'tractionAnalysis', 'financialAnalysis', 'competitiveAnalysis'];
    const missingFields = requiredFields.filter(field => !analysisResult[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Gemini returned incomplete analysis. Missing fields:', missingFields);
      console.error('📊 Received fields:', Object.keys(analysisResult));
      console.error('📊 Full response (first 2000 chars):', JSON.stringify(analysisResult, null, 2).substring(0, 2000));
      throw new Error(`Gemini API returned incomplete analysis. Missing: ${missingFields.join(', ')}. Please retry.`);
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
    if (analysisResult.founderAnalysis?.breakdown) {
      analysisResult.founderAnalysis.score = recalculateCategoryScore(analysisResult.founderAnalysis.breakdown);
    }
    if (analysisResult.marketAnalysis?.breakdown) {
      analysisResult.marketAnalysis.score = recalculateCategoryScore(analysisResult.marketAnalysis.breakdown);
    }
    if (analysisResult.productAnalysis?.breakdown) {
      analysisResult.productAnalysis.score = recalculateCategoryScore(analysisResult.productAnalysis.breakdown);
    }
    if (analysisResult.tractionAnalysis?.breakdown) {
      analysisResult.tractionAnalysis.score = recalculateCategoryScore(analysisResult.tractionAnalysis.breakdown);
    }
    if (analysisResult.financialAnalysis?.breakdown) {
      analysisResult.financialAnalysis.score = recalculateCategoryScore(analysisResult.financialAnalysis.breakdown);
    }
    if (analysisResult.competitiveAnalysis?.breakdown) {
      analysisResult.competitiveAnalysis.score = recalculateCategoryScore(analysisResult.competitiveAnalysis.breakdown);
    }
    
    // Calculate overall score - normalize each category to percentage then apply weights
    const teamPercent = ((analysisResult.founderAnalysis?.score || 0) / 20) * 100;
    const marketPercent = ((analysisResult.marketAnalysis?.score || 0) / 20) * 100;
    const productPercent = ((analysisResult.productAnalysis?.score || 0) / 20) * 100;
    const tractionPercent = ((analysisResult.tractionAnalysis?.score || 0) / 20) * 100;
    const financialPercent = ((analysisResult.financialAnalysis?.score || 0) / 15) * 100;
    const competitivePercent = ((analysisResult.competitiveAnalysis?.score || 0) / 5) * 100;
    
    const overallScore = Math.round(
      (teamPercent * 0.20) +
      (marketPercent * 0.20) +
      (productPercent * 0.20) +
      (tractionPercent * 0.20) +
      (financialPercent * 0.15) +
      (competitivePercent * 0.05)
    );
    
    analysisResult.overallScore = overallScore;
    
    // Map overall score to consistent decision across the entire application
    let consistentDecision: string;
    if (overallScore >= 70) {
      consistentDecision = 'Strong Invest';
    } else if (overallScore >= 60) {
      consistentDecision = 'Invest';
    } else if (overallScore >= 50) {
      consistentDecision = 'Maybe';
    } else {
      consistentDecision = 'Pass';
    }
    
    // Override AI decision with score-based decision for consistency
    if (analysisResult.recommendation) {
      analysisResult.recommendation.decision = consistentDecision;
      analysisResult.recommendation.overallScore = overallScore;
    }
    
    console.log('✅ Scores validated and calculated:');
    console.log(`   Overall: ${overallScore}/100 → Decision: ${consistentDecision}`);
    console.log(`   Team: ${analysisResult.founderAnalysis?.score || 0}/20`);
    console.log(`   Market: ${analysisResult.marketAnalysis?.score || 0}/20`);
    console.log(`   Product: ${analysisResult.productAnalysis?.score || 0}/20`);
    console.log(`   Traction: ${analysisResult.tractionAnalysis?.score || 0}/20`);
    console.log(`   Financial: ${analysisResult.financialAnalysis?.score || 0}/15`);
    console.log(`   Competitive: ${analysisResult.competitiveAnalysis?.score || 0}/5`);
    
    return analysisResult;

  } catch (error) {
    console.error('❌ Error generating analysis:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Removed fallback data generation functions - all errors now propagate to show proper error messages
// instead of displaying dummy/placeholder data

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