// Batch Company Analysis System
import { promises as fs } from 'fs';
import path from 'path';
import { enhancedDocumentProcessor, CompanyDocumentSet } from './enhanced-document-processor';
import { enhancedAIAnalyzer, EnhancedAnalysisResult } from './enhanced-ai-analyzer';
import { visionService } from './google-cloud';

export interface BatchAnalysisReport {
  summary: {
    totalCompanies: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    processingTime: number;
    analysisDate: Date;
  };
  companies: CompanyAnalysisReport[];
  insights: {
    industryTrends: string[];
    commonStrengths: string[];
    commonWeaknesses: string[];
    riskPatterns: string[];
    investmentOpportunities: InvestmentOpportunity[];
  };
  benchmarks: {
    averageRevenue: number;
    averageGrowthRate: number;
    averageValuation: number;
    topPerformers: string[];
    riskDistribution: Record<string, number>;
  };
}

export interface CompanyAnalysisReport {
  companyName: string;
  folder: string;
  status: 'success' | 'failed' | 'partial';
  documents: string[];
  analysis?: EnhancedAnalysisResult;
  error?: string;
  processingTime: number;
}

export interface InvestmentOpportunity {
  companyName: string;
  score: number;
  reasoning: string[];
  recommendation: 'Pass' | 'Maybe' | 'Invest' | 'Strong Invest';
  suggestedValuation: number;
}

export class BatchCompanyAnalyzer {
  private companyDataPath: string;
  private analysisResults: CompanyAnalysisReport[] = [];

  constructor(companyDataPath: string = './Company Data') {
    this.companyDataPath = path.resolve(companyDataPath);
  }

  /**
   * Analyze all companies in the Company Data directory
   */
  async analyzeAllCompanies(): Promise<BatchAnalysisReport> {
    console.log('🚀 Starting batch analysis of all companies...');
    const startTime = Date.now();

    try {
      // Scan for company folders
      const companyFolders = await this.scanCompanyFolders();
      console.log(`📁 Found ${companyFolders.length} company folders`);

      // Process each company
      const results: CompanyAnalysisReport[] = [];
      for (const folder of companyFolders) {
        console.log(`\\n📊 Processing ${folder}...`);
        const result = await this.analyzeCompany(folder);
        results.push(result);
        
        // Add delay to avoid overwhelming the AI service
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate comprehensive report
      const report = await this.generateBatchReport(results, Date.now() - startTime);
      
      // Save report to file
      await this.saveBatchReport(report);
      
      console.log('✅ Batch analysis completed!');
      return report;

    } catch (error) {
      console.error('❌ Batch analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze a specific company
   */
  async analyzeCompany(companyFolder: string): Promise<CompanyAnalysisReport> {
    const startTime = Date.now();
    const companyName = this.extractCompanyName(companyFolder);
    
    try {
      console.log(`📄 Processing documents for ${companyName}...`);
      
      // Get document paths
      const folderPath = path.join(this.companyDataPath, companyFolder);
      const documents = await this.getDocumentPaths(folderPath);
      
      if (documents.length === 0) {
        return {
          companyName,
          folder: companyFolder,
          status: 'failed',
          documents: [],
          error: 'No documents found',
          processingTime: Date.now() - startTime
        };
      }

      // Process documents (simplified for demo - would use real processing in production)
      const documentSet = await this.createMockDocumentSet(companyName, documents);
      
      // Analyze with enhanced AI
      const analysis = await enhancedAIAnalyzer.analyzeCompanyDocumentSet(documentSet);
      
      return {
        companyName,
        folder: companyFolder,
        status: 'success',
        documents: documents.map(d => path.basename(d)),
        analysis,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error(`❌ Error analyzing ${companyName}:`, error);
      return {
        companyName,
        folder: companyFolder,
        status: 'failed',
        documents: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Scan for company folders in the Company Data directory
   */
  private async scanCompanyFolders(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.companyDataPath, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
    } catch (error) {
      console.error('Error scanning company folders:', error);
      return [];
    }
  }

  /**
   * Get document paths in a company folder
   */
  private async getDocumentPaths(folderPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(folderPath);
      return files
        .filter(file => this.isDocumentFile(file))
        .map(file => path.join(folderPath, file));
    } catch (error) {
      console.error(`Error reading folder ${folderPath}:`, error);
      return [];
    }
  }

  /**
   * Check if file is a document we can process
   */
  private isDocumentFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ['.pdf', '.docx', '.pptx', '.txt'].includes(ext);
  }

  /**
   * Extract company name from folder name
   */
  private extractCompanyName(folderName: string): string {
    // Remove numbering like "01. " from folder names
    return folderName.replace(/^\\d+\\.\\s*/, '');
  }

  /**
   * Create mock document set (in production this would use real document processing)
   */
  private async createMockDocumentSet(companyName: string, documentPaths: string[]): Promise<CompanyDocumentSet> {
    const documents = documentPaths.map((docPath, index) => ({
      filename: path.basename(docPath),
      type: this.guessDocumentType(path.basename(docPath)) as any,
      rawText: `Sample text content for ${path.basename(docPath)}...`,
      extractedData: {},
      processingMethod: 'mock' as any,
      metadata: {
        type: this.guessDocumentType(path.basename(docPath)) as any,
        confidence: 80,
        filename: path.basename(docPath),
        extractedFields: {}
      }
    }));

    return {
      companyName,
      companyFolder: documentPaths[0] ? path.dirname(documentPaths[0]) : '',
      documents,
      consolidatedData: {
        companyInfo: {
          name: companyName,
          industry: 'Technology',
          stage: 'Seed',
          location: 'Unknown',
          description: `${companyName} is an innovative startup in the technology sector.`
        },
        founders: [],
        financials: {
          employees: Math.floor(Math.random() * 50) + 5,
          customers: Math.floor(Math.random() * 200) + 10
        },
        product: {
          description: '',
          stage: 'mvp' as const,
          technology: [],
          differentiators: [],
          targetMarket: ''
        },
        market: {
          marketTrends: [],
          competitors: [],
          marketPosition: ''
        },
        traction: {
          milestones: [],
          partnerships: [],
          growth: []
        },
        risks: [],
        investmentDetails: {
          useOfFunds: []
        }
      }
    };
  }

  /**
   * Guess document type from filename
   */
  private guessDocumentType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('pitch') || lower.includes('deck')) return 'pitch_deck';
    if (lower.includes('checklist') || lower.includes('founder')) return 'founders_checklist';
    if (lower.includes('memo') || lower.includes('investment')) return 'investment_memo';
    return 'unknown';
  }

  /**
   * Generate comprehensive batch analysis report
   */
  private async generateBatchReport(results: CompanyAnalysisReport[], processingTime: number): Promise<BatchAnalysisReport> {
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'failed');

    // Calculate insights and benchmarks
    const insights = this.calculateInsights(successful);
    const benchmarks = this.calculateBenchmarks(successful);

    return {
      summary: {
        totalCompanies: results.length,
        successfulAnalyses: successful.length,
        failedAnalyses: failed.length,
        processingTime,
        analysisDate: new Date()
      },
      companies: results,
      insights,
      benchmarks
    };
  }

  /**
   * Calculate cross-company insights
   */
  private calculateInsights(successfulAnalyses: CompanyAnalysisReport[]): any {
    const analyses = successfulAnalyses.map(r => r.analysis).filter(Boolean);
    
    // Extract common patterns
    const commonStrengths = this.findCommonPatterns(
      analyses.map(a => a!.insights.keyStrengths).flat()
    );
    
    const commonWeaknesses = this.findCommonPatterns(
      analyses.map(a => a!.insights.keyWeaknesses).flat()
    );

    const investmentOpportunities: InvestmentOpportunity[] = analyses
      .map(a => ({
        companyName: a!.companyName,
        score: a!.analysis.investmentRecommendation.score,
        reasoning: a!.analysis.investmentRecommendation.reasoning,
        recommendation: a!.analysis.investmentRecommendation.decision,
        suggestedValuation: a!.analysis.investmentRecommendation.valuation.suggested
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      industryTrends: ['AI/ML adoption', 'Digital transformation', 'Remote work solutions'],
      commonStrengths,
      commonWeaknesses,
      riskPatterns: ['Competitive market risks', 'Funding requirements', 'Technical execution'],
      investmentOpportunities
    };
  }

  /**
   * Calculate benchmarks across companies
   */
  private calculateBenchmarks(successfulAnalyses: CompanyAnalysisReport[]): any {
    const analyses = successfulAnalyses.map(r => r.analysis).filter(Boolean);
    
    const revenues = analyses.map(a => a!.analysis.financialAnalysis.currentMetrics.revenue);
    const growthRates = analyses.map(a => a!.analysis.financialAnalysis.currentMetrics.growth.rate);
    const valuations = analyses.map(a => a!.analysis.investmentRecommendation.valuation.suggested);

    return {
      averageRevenue: this.average(revenues),
      averageGrowthRate: this.average(growthRates),
      averageValuation: this.average(valuations),
      topPerformers: analyses
        .sort((a, b) => b!.analysis.investmentRecommendation.score - a!.analysis.investmentRecommendation.score)
        .slice(0, 3)
        .map(a => a!.companyName),
      riskDistribution: {
        'Low': analyses.filter(a => a!.analysis.riskAssessment.overallRisk === 'Low').length,
        'Medium': analyses.filter(a => a!.analysis.riskAssessment.overallRisk === 'Medium').length,
        'High': analyses.filter(a => a!.analysis.riskAssessment.overallRisk === 'High').length
      }
    };
  }

  /**
   * Find common patterns in string arrays
   */
  private findCommonPatterns(items: string[]): string[] {
    const frequency: Record<string, number> = {};
    items.forEach(item => {
      const normalized = item.toLowerCase().trim();
      frequency[normalized] = (frequency[normalized] || 0) + 1;
    });

    return Object.entries(frequency)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, _]) => item);
  }

  /**
   * Calculate average of number array
   */
  private average(numbers: number[]): number {
    return numbers.length > 0 ? numbers.reduce((sum, n) => sum + n, 0) / numbers.length : 0;
  }

  /**
   * Save batch report to file
   */
  private async saveBatchReport(report: BatchAnalysisReport): Promise<void> {
    try {
      const reportPath = path.join(process.cwd(), 'batch-analysis-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }
}

export const batchCompanyAnalyzer = new BatchCompanyAnalyzer();