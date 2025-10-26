// Enhanced Document Processor for Multi-Document Company Analysis
import { visionService, cloudStorage } from './google-cloud';

export interface DocumentMetadata {
  type: 'pitch_deck' | 'founders_checklist' | 'investment_memo' | 'financial_model' | 'unknown';
  confidence: number;
  filename: string;
  companyName?: string;
  extractedFields: Record<string, any>;
}

export interface CompanyDocumentSet {
  companyName: string;
  companyFolder: string;
  documents: ProcessedDocument[];
  consolidatedData: ConsolidatedCompanyData;
}

export interface ProcessedDocument {
  filename: string;
  type: DocumentMetadata['type'];
  rawText: string;
  extractedData: any;
  processingMethod: 'vision_api' | 'text_extraction' | 'ocr_fallback';
  metadata: DocumentMetadata;
}

export interface ConsolidatedCompanyData {
  companyInfo: {
    name: string;
    industry: string;
    stage: string;
    location: string;
    website?: string;
    description: string;
    foundedYear?: string;
  };
  founders: Array<{
    name: string;
    role: string;
    background: string;
    experience: string;
    education?: string;
    previousCompanies?: string[];
  }>;
  financials: {
    currentRevenue?: number;
    projectedRevenue?: number;
    revenueGrowthRate?: number;
    grossMargin?: number;
    burnRate?: number;
    runway?: number;
    cashRaised?: number;
    valuation?: number;
    fundingRound?: string;
    fundingAmount?: number;
    employees: number;
    customers?: number;
    arr?: number;
    mrr?: number;
  };
  product: {
    description: string;
    stage: 'concept' | 'mvp' | 'beta' | 'launched' | 'scaling';
    technology: string[];
    differentiators: string[];
    targetMarket: string;
  };
  market: {
    tam?: number;
    sam?: number;
    som?: number;
    marketGrowthRate?: number;
    marketTrends: string[];
    competitors: string[];
    marketPosition: string;
  };
  traction: {
    milestones: Array<{
      description: string;
      date?: string;
      achieved: boolean;
    }>;
    partnerships: string[];
    customers?: number;
    revenue?: number;
    users?: number;
    growth: Array<{
      metric: string;
      value: number;
      period: string;
    }>;
  };
  risks: Array<{
    category: 'market' | 'technical' | 'financial' | 'regulatory' | 'competitive' | 'operational';
    description: string;
    severity: 'low' | 'medium' | 'high';
    mitigation?: string;
  }>;
  investmentDetails: {
    fundingGoal?: number;
    useOfFunds: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    exitStrategy?: string;
    timeline?: string;
  };
}

export class EnhancedDocumentProcessor {
  private readonly documentTypePatterns = {
    pitch_deck: /pitch.*deck|deck|presentation/i,
    founders_checklist: /checklist|founder.*checklist|lv.*checklist/i,
    investment_memo: /investment.*memo|memorandum|memo/i,
    financial_model: /financial.*model|model|projections/i
  };

  private readonly companyNameExtractors = [
    /company[:\s]*([^\n\r,]+)/i,
    /startup[:\s]*([^\n\r,]+)/i,
    /^([A-Z][a-zA-Z\s&.]+)$/m,
    /name[:\s]*([^\n\r,]+)/i
  ];

  /**
   * Process all documents for a company folder
   */
  async processCompanyFolder(folderPath: string): Promise<CompanyDocumentSet> {
    const companyName = this.extractCompanyNameFromPath(folderPath);
    console.log(`📁 Processing company folder: ${companyName}`);

    // Scan folder for documents
    const documentPaths = await this.scanFolderForDocuments(folderPath);
    console.log(`📄 Found ${documentPaths.length} documents`);

    // Process each document
    const processedDocuments: ProcessedDocument[] = [];
    for (const docPath of documentPaths) {
      try {
        const processed = await this.processDocument(docPath);
        processedDocuments.push(processed);
        console.log(`✅ Processed: ${processed.filename} (${processed.type})`);
      } catch (error) {
        console.error(`❌ Error processing ${docPath}:`, error);
      }
    }

    // Consolidate data from all documents
    const consolidatedData = this.consolidateCompanyData(processedDocuments, companyName);

    return {
      companyName,
      companyFolder: folderPath,
      documents: processedDocuments,
      consolidatedData
    };
  }

  /**
   * Process a single document
   */
  async processDocument(filePath: string): Promise<ProcessedDocument> {
    const filename = filePath.split(/[\\\/]/).pop() || '';
    const documentType = this.identifyDocumentType(filename);
    
    console.log(`📄 Processing ${filename} as ${documentType}`);

    // Extract raw text (this would use Google Vision API in production)
    const rawText = await this.extractTextFromDocument(filePath);
    
    // Extract structured data based on document type
    const extractedData = await this.extractStructuredData(rawText, documentType);

    return {
      filename,
      type: documentType,
      rawText,
      extractedData,
      processingMethod: 'text_extraction', // Would be 'vision_api' in production
      metadata: {
        type: documentType,
        confidence: this.calculateExtractionConfidence(rawText, extractedData),
        filename,
        extractedFields: Object.keys(extractedData)
      }
    };
  }

  /**
   * Identify document type based on filename and content
   */
  private identifyDocumentType(filename: string): DocumentMetadata['type'] {
    const lowerFilename = filename.toLowerCase();
    
    for (const [type, pattern] of Object.entries(this.documentTypePatterns)) {
      if (pattern.test(lowerFilename)) {
        return type as DocumentMetadata['type'];
      }
    }
    
    return 'unknown';
  }

  /**
   * Extract structured data based on document type
   */
  private async extractStructuredData(text: string, type: DocumentMetadata['type']): Promise<any> {
    switch (type) {
      case 'pitch_deck':
        return this.extractPitchDeckData(text);
      case 'founders_checklist':
        return this.extractFoundersChecklistData(text);
      case 'investment_memo':
        return this.extractInvestmentMemoData(text);
      default:
        return this.extractGenericData(text);
    }
  }

  /**
   * Extract data from pitch deck
   */
  private extractPitchDeckData(text: string): any {
    return {
      companyInfo: this.extractCompanyInfo(text),
      problem: this.extractSection(text, /problem|pain.*point|challenge/i),
      solution: this.extractSection(text, /solution|product|service/i),
      market: this.extractMarketData(text),
      businessModel: this.extractSection(text, /business.*model|revenue.*model|monetization/i),
      traction: this.extractTractionData(text),
      team: this.extractTeamInfo(text),
      financials: this.extractFinancialData(text),
      competition: this.extractSection(text, /competition|competitor|competitive/i),
      funding: this.extractFundingInfo(text)
    };
  }

  /**
   * Extract data from founders checklist
   */
  private extractFoundersChecklistData(text: string): any {
    return {
      founderDetails: this.extractFounderDetails(text),
      companyDetails: this.extractCompanyDetails(text),
      financialMetrics: this.extractDetailedFinancials(text),
      legalStatus: this.extractLegalInfo(text),
      productStatus: this.extractProductInfo(text),
      marketResearch: this.extractMarketResearch(text),
      risks: this.extractRiskAssessment(text),
      milestones: this.extractMilestones(text)
    };
  }

  /**
   * Extract data from investment memo
   */
  private extractInvestmentMemoData(text: string): any {
    return {
      executiveSummary: this.extractSection(text, /executive.*summary|summary/i),
      investmentThesis: this.extractSection(text, /investment.*thesis|thesis/i),
      marketAnalysis: this.extractMarketAnalysis(text),
      competitiveAnalysis: this.extractCompetitiveAnalysis(text),
      financialAnalysis: this.extractFinancialAnalysis(text),
      riskAnalysis: this.extractRiskAnalysis(text),
      recommendation: this.extractRecommendation(text),
      valuation: this.extractValuation(text)
    };
  }

  /**
   * Consolidate data from multiple documents into a single company profile
   */
  private consolidateCompanyData(documents: ProcessedDocument[], companyName: string): ConsolidatedCompanyData {
    const pitchDecks = documents.filter(d => d.type === 'pitch_deck');
    const checklists = documents.filter(d => d.type === 'founders_checklist');
    const memos = documents.filter(d => d.type === 'investment_memo');

    // Combine and prioritize data from different sources
    const consolidated: ConsolidatedCompanyData = {
      companyInfo: this.consolidateCompanyInfo(pitchDecks, checklists, memos, companyName),
      founders: this.consolidateFounderInfo(pitchDecks, checklists),
      financials: this.consolidateFinancialInfo(pitchDecks, checklists, memos),
      product: this.consolidateProductInfo(pitchDecks, checklists),
      market: this.consolidateMarketInfo(pitchDecks, checklists, memos),
      traction: this.consolidateTractionInfo(pitchDecks, checklists),
      risks: this.consolidateRiskInfo(pitchDecks, checklists, memos),
      investmentDetails: this.consolidateInvestmentInfo(pitchDecks, memos)
    };

    return consolidated;
  }

  // Helper methods for data extraction and consolidation
  private extractCompanyNameFromPath(path: string): string {
    const parts = path.split(/[\\\/]/);
    const folderName = parts[parts.length - 1] || parts[parts.length - 2];
    return folderName.replace(/^\d+\.\s*/, ''); // Remove numbering like "01. "
  }

  private async scanFolderForDocuments(folderPath: string): Promise<string[]> {
    // This would scan the actual folder in production
    // For now, return mock paths based on the structure we observed
    return []; // Placeholder
  }

  private async extractTextFromDocument(filePath: string): Promise<string> {
    // This would use Google Vision API for PDFs or read text files directly
    // For now, return placeholder text
    return "Sample document text content...";
  }

  private extractSection(text: string, pattern: RegExp): string {
    const lines = text.split('\n');
    const sectionStart = lines.findIndex(line => pattern.test(line));
    if (sectionStart === -1) return '';
    
    // Extract content until next major section or end
    const section = lines.slice(sectionStart, sectionStart + 10).join('\n');
    return section.trim();
  }

  private extractCompanyInfo(text: string): any {
    return {
      name: this.extractWithPattern(text, this.companyNameExtractors),
      industry: this.extractIndustry(text),
      description: this.extractDescription(text),
      location: this.extractLocation(text),
      website: this.extractWebsite(text)
    };
  }

  private extractMarketData(text: string): any {
    return {
      tam: this.extractNumericValue(text, /tam|total.*addressable.*market/i),
      sam: this.extractNumericValue(text, /sam|serviceable.*addressable.*market/i),
      som: this.extractNumericValue(text, /som|serviceable.*obtainable.*market/i),
      marketSize: this.extractNumericValue(text, /market.*size/i),
      growthRate: this.extractPercentage(text, /growth.*rate|cagr/i)
    };
  }

  private extractFinancialData(text: string): any {
    return {
      revenue: this.extractNumericValue(text, /revenue|sales/i),
      growthRate: this.extractPercentage(text, /growth/i),
      employees: this.extractNumericValue(text, /employee|team.*size/i),
      customers: this.extractNumericValue(text, /customer|client/i),
      funding: this.extractNumericValue(text, /funding|investment/i)
    };
  }

  private extractTeamInfo(text: string): any {
    // Extract founder and team information
    const founderSections = text.match(/founder|ceo|cto|founder.*team/gi) || [];
    return {
      founders: founderSections.map(section => ({
        role: 'Founder',
        background: section
      }))
    };
  }

  private extractTractionData(text: string): any {
    return {
      customers: this.extractNumericValue(text, /customer|user/i),
      revenue: this.extractNumericValue(text, /revenue/i),
      growth: this.extractPercentage(text, /growth/i)
    };
  }

  private extractFundingInfo(text: string): any {
    return {
      seeking: this.extractNumericValue(text, /seeking|raising|funding.*goal/i),
      valuation: this.extractNumericValue(text, /valuation/i),
      useOfFunds: this.extractSection(text, /use.*of.*funds|fund.*usage/i)
    };
  }

  // Additional helper methods would be implemented here...
  private extractWithPattern(text: string, patterns: RegExp[]): string {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) return match[1].trim();
    }
    return '';
  }

  private extractNumericValue(text: string, pattern: RegExp): number | undefined {
    const match = text.match(new RegExp(pattern.source + '[:\\s]*([\\d,\\.]+)', 'i'));
    if (match && match[1]) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return undefined;
  }

  private extractPercentage(text: string, pattern: RegExp): number | undefined {
    const match = text.match(new RegExp(pattern.source + '[:\\s]*([\\d,\\.]+)%?', 'i'));
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    return undefined;
  }

  private calculateExtractionConfidence(text: string, extractedData: any): number {
    const fields = Object.keys(extractedData).length;
    const textLength = text.length;
    const baseConfidence = Math.min(50 + fields * 5, 90);
    const lengthBonus = Math.min(textLength / 1000 * 5, 10);
    return Math.round(baseConfidence + lengthBonus);
  }

  // Consolidation methods (simplified versions)
  private consolidateCompanyInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[], memos: ProcessedDocument[], defaultName: string): any {
    // Priority: Checklist > Pitch Deck > Memo > Default
    return {
      name: defaultName,
      industry: 'Technology', // Would extract from documents
      stage: 'Seed',
      location: 'Unknown',
      description: 'AI-powered startup'
    };
  }

  private consolidateFounderInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[]): any[] {
    return [];
  }

  private consolidateFinancialInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[], memos: ProcessedDocument[]): any {
    return {
      employees: 0,
      customers: 0
    };
  }

  private consolidateProductInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[]): any {
    return {
      description: '',
      stage: 'mvp' as const,
      technology: [],
      differentiators: [],
      targetMarket: ''
    };
  }

  private consolidateMarketInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[], memos: ProcessedDocument[]): any {
    return {
      marketTrends: [],
      competitors: [],
      marketPosition: ''
    };
  }

  private consolidateTractionInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[]): any {
    return {
      milestones: [],
      partnerships: [],
      growth: []
    };
  }

  private consolidateRiskInfo(pitchDecks: ProcessedDocument[], checklists: ProcessedDocument[], memos: ProcessedDocument[]): any[] {
    return [];
  }

  private consolidateInvestmentInfo(pitchDecks: ProcessedDocument[], memos: ProcessedDocument[]): any {
    return {
      useOfFunds: []
    };
  }

  // Placeholder methods for detailed extraction functions
  private extractFounderDetails(text: string): any { return {}; }
  private extractCompanyDetails(text: string): any { return {}; }
  private extractDetailedFinancials(text: string): any { return {}; }
  private extractLegalInfo(text: string): any { return {}; }
  private extractProductInfo(text: string): any { return {}; }
  private extractMarketResearch(text: string): any { return {}; }
  private extractRiskAssessment(text: string): any { return {}; }
  private extractMilestones(text: string): any { return {}; }
  private extractMarketAnalysis(text: string): any { return {}; }
  private extractCompetitiveAnalysis(text: string): any { return {}; }
  private extractFinancialAnalysis(text: string): any { return {}; }
  private extractRiskAnalysis(text: string): any { return {}; }
  private extractRecommendation(text: string): any { return {}; }
  private extractValuation(text: string): any { return {}; }
  private extractIndustry(text: string): string { return 'Technology'; }
  private extractDescription(text: string): string { return ''; }
  private extractLocation(text: string): string { return ''; }
  private extractWebsite(text: string): string { return ''; }
  
  private extractGenericData(text: string): any {
    return {
      companyInfo: this.extractCompanyInfo(text),
      financials: this.extractFinancialData(text),
      team: this.extractTeamInfo(text)
    };
  }
}

export const enhancedDocumentProcessor = new EnhancedDocumentProcessor();