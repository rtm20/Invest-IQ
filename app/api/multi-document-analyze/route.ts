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
    
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
        /\.(pdf|pptx|docx|txt)$/i.test(file.name);
      const isValidSize = file.size <= maxSize;
      
      if (!isValidType) {
        console.warn(`⚠️ Unsupported file type: ${file.name}`);
      }
      if (!isValidSize) {
        console.warn(`⚠️ File too large: ${file.name}`);
      }
      
      return isValidType && isValidSize;
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
    maxFileSize: '50MB per file',
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
Based on the following consolidated startup data, provide a comprehensive investment analysis:

Company Data:
${JSON.stringify(consolidatedData, null, 2)}

Please provide a detailed analysis including:

1. Company Assessment (score 0-100)
2. Founder Team Analysis (score 0-100)  
3. Market Opportunity Analysis (score 0-100)
4. Financial Analysis (score 0-100)
5. Product/Technology Analysis (score 0-100)
6. Traction Analysis (score 0-100)
7. Risk Assessment (score 0-100)
8. Overall Investment Recommendation

Return the analysis in this JSON format:

{
  "overallScore": 0,
  "recommendation": "invest/maybe/pass",
  "confidence": 0,
  "companyAssessment": {
    "score": 0,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "reasoning": "Detailed reasoning"
  },
  "founderAnalysis": {
    "score": 0,
    "experience": "Assessment of founder experience",
    "teamComposition": "Team composition analysis",
    "leadershipCapability": "Leadership capability assessment"
  },
  "marketAnalysis": {
    "score": 0,
    "marketSize": "Market size assessment",
    "competition": "Competitive landscape analysis",
    "opportunity": "Market opportunity assessment"
  },
  "financialAnalysis": {
    "score": 0,
    "revenueModel": "Revenue model assessment",
    "growth": "Growth analysis",
    "unitEconomics": "Unit economics analysis"
  },
  "productAnalysis": {
    "score": 0,
    "innovation": "Product innovation assessment",
    "marketFit": "Product-market fit analysis",
    "technology": "Technology assessment"
  },
  "tractionAnalysis": {
    "score": 0,
    "customerGrowth": "Customer growth analysis",
    "revenueGrowth": "Revenue growth analysis",
    "partnerships": "Partnership analysis"
  },
  "riskAnalysis": {
    "score": 0,
    "majorRisks": ["risk1", "risk2"],
    "mitigationStrategies": ["strategy1", "strategy2"],
    "overallRisk": "low/medium/high"
  },
  "investmentRecommendation": {
    "decision": "invest/maybe/pass",
    "suggestedValuation": 0,
    "investmentAmount": 0,
    "keyReasons": ["reason1", "reason2"],
    "nextSteps": ["step1", "step2"]
  },
  "executiveSummary": "Comprehensive executive summary for investors"
}

Provide only valid JSON, no additional text.
`;

    const analysisResult = await geminiService.analyzeStartupData(analysisPrompt, 'recommendation');
    
    console.log('✅ Comprehensive analysis completed');
    return analysisResult;

  } catch (error) {
    console.error('❌ Error generating analysis:', error);
    
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

function generateFallbackAnalysis(consolidatedData: ConsolidatedData): any {
  return {
    overallScore: 60,
    recommendation: 'maybe',
    confidence: 50,
    companyAssessment: {
      score: 60,
      strengths: ['Identified opportunity'],
      weaknesses: ['Limited data available'],
      reasoning: 'Analysis based on limited information'
    },
    executiveSummary: `Analysis of ${consolidatedData.companyOverview.name} based on available documentation. Recommendation requires additional information for comprehensive assessment.`
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