import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface AnalysisData {
  consolidatedData?: any;
  analysis?: any;
  processingMetadata?: any;
  documentSummaries?: any[];
  
  // Legacy support
  companyData?: any;
  financialData?: any;
  teamData?: any;
  marketData?: any;
  riskData?: any;
  recommendationData?: any;
  executiveSummary?: string;
}

export class PDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private yPos: number;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margin = 20;
    this.yPos = this.margin;
  }

  private normalizeDataStructure(data: AnalysisData) {
    // If data is already in legacy format, return as-is
    if (data.companyData || data.financialData) {
      return data;
    }
    
    // Convert new format to legacy format for PDF generation
    const consolidatedData = data.consolidatedData || {};
    const analysis = data.analysis || {};
    
    console.log('🔍 Original data structure:', { consolidatedData, analysis });
    
    return {
      executiveSummary: analysis.executiveSummary || consolidatedData.executiveSummary || 'Executive summary not available.',
      companyData: {
        companyInfo: {
          name: consolidatedData.companyInfo?.name || analysis.company?.companyInfo?.name || 'Unknown Company',
          industry: consolidatedData.companyInfo?.industry || analysis.company?.companyInfo?.industry || 'Unknown Industry',
          tagline: consolidatedData.companyInfo?.tagline || analysis.company?.companyInfo?.tagline || '',
          description: consolidatedData.companyInfo?.description || analysis.company?.companyInfo?.description || '',
          website: consolidatedData.companyInfo?.website || analysis.company?.companyInfo?.website || '',
          location: consolidatedData.companyInfo?.location || analysis.company?.companyInfo?.location || '',
          founded: consolidatedData.companyInfo?.founded || analysis.company?.companyInfo?.founded || '',
          businessModel: consolidatedData.companyInfo?.businessModel || analysis.company?.companyInfo?.businessModel || ''
        }
      },
      financialData: {
        financialMetrics: {
          currentRevenue: consolidatedData.financialMetrics?.currentRevenue || analysis.financial?.financialMetrics?.currentRevenue || 0,
          revenueGrowthRate: consolidatedData.financialMetrics?.revenueGrowthRate || analysis.financial?.financialMetrics?.revenueGrowthRate || 0,
          grossMargin: consolidatedData.financialMetrics?.grossMargin || analysis.financial?.financialMetrics?.grossMargin || 0,
          burnRate: consolidatedData.financialMetrics?.burnRate || analysis.financial?.financialMetrics?.burnRate || 0,
          runway: consolidatedData.financialMetrics?.runway || analysis.financial?.financialMetrics?.runway || 0,
          cashRaised: consolidatedData.financialMetrics?.cashRaised || analysis.financial?.financialMetrics?.cashRaised || 0,
          valuation: consolidatedData.financialMetrics?.valuation || analysis.financial?.financialMetrics?.valuation || 0,
          employees: consolidatedData.financialMetrics?.employees || analysis.financial?.financialMetrics?.employees || 0,
          customers: consolidatedData.financialMetrics?.customers || analysis.financial?.financialMetrics?.customers || 0
        },
        unitEconomics: {
          cac: consolidatedData.unitEconomics?.cac || analysis.financial?.unitEconomics?.cac || 0,
          ltv: consolidatedData.unitEconomics?.ltv || analysis.financial?.unitEconomics?.ltv || 0,
          paybackPeriod: consolidatedData.unitEconomics?.paybackPeriod || analysis.financial?.unitEconomics?.paybackPeriod || 0,
          churnRate: consolidatedData.unitEconomics?.churnRate || analysis.financial?.unitEconomics?.churnRate || 0
        }
      },
      teamData: {
        founders: consolidatedData.founders || analysis.team?.founders || [],
        totalEmployees: consolidatedData.totalEmployees || analysis.team?.totalEmployees || 0,
        keyHires: consolidatedData.keyHires || analysis.team?.keyHires || [],
        advisors: consolidatedData.advisors || analysis.team?.advisors || []
      },
      marketData: {
        marketInfo: {
          tam: consolidatedData.marketInfo?.tam || analysis.market?.marketInfo?.tam || 0,
          sam: consolidatedData.marketInfo?.sam || analysis.market?.marketInfo?.sam || 0,
          som: consolidatedData.marketInfo?.som || analysis.market?.marketInfo?.som || 0,
          marketGrowthRate: consolidatedData.marketInfo?.marketGrowthRate || analysis.market?.marketInfo?.marketGrowthRate || 0,
          competitors: consolidatedData.marketInfo?.competitors || analysis.market?.marketInfo?.competitors || [],
          marketPosition: consolidatedData.marketInfo?.marketPosition || analysis.market?.marketInfo?.marketPosition || ''
        }
      },
      riskData: {
        riskFlags: analysis.risks?.riskFlags || analysis.risk?.riskFlags || []
      },
      recommendationData: {
        recommendation: {
          decision: analysis.recommendation?.recommendation?.decision || analysis.recommendation?.decision || 'hold',
          score: analysis.recommendation?.recommendation?.score || analysis.recommendation?.score || 0,
          reasoning: analysis.recommendation?.recommendation?.reasoning || analysis.recommendation?.reasoning || [],
          keyStrengths: analysis.recommendation?.recommendation?.keyStrengths || analysis.recommendation?.keyStrengths || [],
          keyWeaknesses: analysis.recommendation?.recommendation?.keyWeaknesses || analysis.recommendation?.keyWeaknesses || [],
          investmentThesis: analysis.recommendation?.recommendation?.investmentThesis || analysis.recommendation?.investmentThesis || '',
          suggestedValuation: analysis.recommendation?.recommendation?.suggestedValuation || analysis.recommendation?.suggestedValuation || 0,
          suggestedCheck: analysis.recommendation?.recommendation?.suggestedCheck || analysis.recommendation?.suggestedCheck || 0,
          nextSteps: analysis.recommendation?.recommendation?.nextSteps || analysis.recommendation?.nextSteps || []
        }
      }
    };
  }

  async generateAnalysisReport(data: AnalysisData, companyName: string): Promise<Blob> {
    // Normalize data structure for backwards compatibility
    const normalizedData = this.normalizeDataStructure(data);
    
    console.log('📋 Normalized data for PDF:', normalizedData);
    
    // Add header
    this.addHeader(companyName);
    
    // Add executive summary with key metrics dashboard
    this.addExecutiveSummaryWithDashboard(normalizedData.executiveSummary || '', normalizedData);
    
    // Add investment recommendation
    this.addRecommendationSection(normalizedData.recommendationData);
    
    // Add company overview
    this.addCompanySection(normalizedData.companyData);
    
    // Add financial analysis
    this.addFinancialSection(normalizedData.financialData);
    
    // Add team analysis
    this.addTeamSection(normalizedData.teamData);
    
    // Add market analysis
    this.addMarketSection(normalizedData.marketData);
    
    // Add risk analysis
    this.addRiskSection(normalizedData.riskData);
    
    // Add footer
    this.addFooter();
    
    return this.pdf.output('blob');
  }

  private addHeader(companyName: string) {
    // Add company logo area (placeholder)
    this.pdf.setFillColor(79, 70, 229); // Indigo color
    this.pdf.rect(this.margin, this.margin, this.pageWidth - 2 * this.margin, 15, 'F');
    
    // Add title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Investment Analysis Report', this.margin + 5, this.margin + 10);
    
    // Add company name
    this.pdf.setFontSize(14);
    this.pdf.text(`${companyName}`, this.pageWidth - this.margin - 5, this.margin + 10, { align: 'right' });
    
    // Add date
    this.pdf.setFontSize(10);
    this.pdf.text(`Generated on ${new Date().toLocaleDateString()}`, this.pageWidth - this.margin - 5, this.margin + 5, { align: 'right' });
    
    this.yPos = this.margin + 25;
    this.pdf.setTextColor(0, 0, 0);
  }

  private addSection(title: string, content: string) {
    this.checkPageBreak();
    
    // Add section title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(79, 70, 229);
    this.pdf.text(title, this.margin, this.yPos);
    this.yPos += 10;
    
    // Add underline
    this.pdf.setDrawColor(79, 70, 229);
    this.pdf.line(this.margin, this.yPos - 2, this.margin + 50, this.yPos - 2);
    this.yPos += 5;
    
    // Add content
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(content, this.pageWidth - 2 * this.margin);
    this.pdf.text(lines, this.margin, this.yPos);
    this.yPos += lines.length * 5 + 10;
  }

  private addRecommendationSection(data: any) {
    if (!data?.recommendation) return;
    
    this.checkPageBreak(40);
    
    const rec = data.recommendation;
    
    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(79, 70, 229);
    this.pdf.text('Investment Recommendation', this.margin, this.yPos);
    this.yPos += 10;
    
    // Score visualization (progress bar)
    this.addScoreVisualization(rec.score || 0);
    this.yPos += 15;
    
    // Recommendation box
    const boxHeight = 30;
    const decisionColor = rec.decision === 'buy' ? [34, 197, 94] : 
                         rec.decision === 'sell' ? [239, 68, 68] : [249, 115, 22];
    
    this.pdf.setFillColor(decisionColor[0], decisionColor[1], decisionColor[2]);
    this.pdf.roundedRect(this.margin, this.yPos, this.pageWidth - 2 * this.margin, boxHeight, 3, 3, 'F');
    
    // Decision text
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${rec.decision.toUpperCase()} - Overall Score: ${rec.score}/100`, this.margin + 10, this.yPos + 15);
    
    this.yPos += boxHeight + 10;
    this.pdf.setTextColor(0, 0, 0);
    
    // Investment thesis
    if (rec.investmentThesis) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Investment Thesis:', this.margin, this.yPos);
      this.yPos += 7;
      
      this.pdf.setFont('helvetica', 'normal');
      const thesisLines = this.pdf.splitTextToSize(rec.investmentThesis, this.pageWidth - 2 * this.margin);
      this.pdf.text(thesisLines, this.margin, this.yPos);
      this.yPos += thesisLines.length * 5 + 10;
    }
    
    // Key strengths and weaknesses
    this.addKeyPoints('Key Strengths', rec.keyStrengths, [34, 197, 94]);
    this.addKeyPoints('Key Weaknesses', rec.keyWeaknesses, [239, 68, 68]);
    
    // Valuation
    if (rec.suggestedValuation) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`Suggested Valuation: $${rec.suggestedValuation.toLocaleString()}`, this.margin, this.yPos);
      this.yPos += 7;
    }
    
    if (rec.suggestedCheck) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`Suggested Investment: $${rec.suggestedCheck.toLocaleString()}`, this.margin, this.yPos);
      this.yPos += 15;
    }
  }

  private addKeyPoints(title: string, points: string[], color: number[]) {
    if (!points || points.length === 0) return;
    
    this.checkPageBreak(20);
    
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(color[0], color[1], color[2]);
    this.pdf.text(title + ':', this.margin, this.yPos);
    this.yPos += 7;
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    points.forEach(point => {
      if (point && point.trim()) {
        this.pdf.text('• ' + point, this.margin + 5, this.yPos);
        this.yPos += 5;
      }
    });
    
    this.yPos += 5;
  }

  private addCompanySection(data: any) {
    if (!data?.companyInfo) return;
    
    this.addSectionHeader('Company Overview');
    
    const company = data.companyInfo;
    
    this.addInfoRow('Company Name:', company.name);
    this.addInfoRow('Industry:', company.industry);
    this.addInfoRow('Founded:', company.founded);
    this.addInfoRow('Location:', company.location);
    this.addInfoRow('Business Model:', company.businessModel);
    
    if (company.description) {
      this.yPos += 5;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Description:', this.margin, this.yPos);
      this.yPos += 7;
      
      this.pdf.setFont('helvetica', 'normal');
      const descLines = this.pdf.splitTextToSize(company.description, this.pageWidth - 2 * this.margin);
      this.pdf.text(descLines, this.margin, this.yPos);
      this.yPos += descLines.length * 5 + 15;
    }
  }

  private addFinancialSection(data: any) {
    if (!data?.financialMetrics) return;
    
    this.addSectionHeader('Financial Analysis');
    
    const metrics = data.financialMetrics;
    
    // Key metrics in a more visual format
    this.addMetricBox('Monthly Revenue', metrics.currentRevenue ? `$${metrics.currentRevenue.toLocaleString()}` : 'N/A');
    this.addMetricBox('Growth Rate', metrics.revenueGrowthRate ? `${metrics.revenueGrowthRate}%` : 'N/A');
    this.addMetricBox('Gross Margin', metrics.grossMargin ? `${metrics.grossMargin}%` : 'N/A');
    
    this.yPos += 5;
    
    // Additional metrics
    this.addInfoRow('Burn Rate:', metrics.burnRate ? `$${metrics.burnRate.toLocaleString()}/month` : 'N/A');
    this.addInfoRow('Runway:', metrics.runway ? `${metrics.runway} months` : 'N/A');
    this.addInfoRow('Cash Raised:', metrics.cashRaised ? `$${metrics.cashRaised.toLocaleString()}` : 'N/A');
    this.addInfoRow('Valuation:', metrics.valuation ? `$${metrics.valuation.toLocaleString()}` : 'N/A');
    this.addInfoRow('Employees:', metrics.employees || 'N/A');
    this.addInfoRow('Customers:', metrics.customers || 'N/A');
    
    if (data.unitEconomics) {
      this.yPos += 10;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Unit Economics:', this.margin, this.yPos);
      this.yPos += 7;
      
      const unit = data.unitEconomics;
      this.addInfoRow('Customer Acquisition Cost (CAC):', unit.cac ? `$${unit.cac}` : 'N/A');
      this.addInfoRow('Lifetime Value (LTV):', unit.ltv ? `$${unit.ltv}` : 'N/A');
      
      // LTV/CAC visualization
      if (unit.ltv && unit.cac) {
        const ratio = unit.ltv / unit.cac;
        this.addRatioVisualization('LTV/CAC Ratio', ratio, 3); // 3x is the benchmark
      }
      
      this.addInfoRow('Payback Period:', unit.paybackPeriod ? `${unit.paybackPeriod} months` : 'N/A');
      this.addInfoRow('Churn Rate:', unit.churnRate ? `${unit.churnRate}%` : 'N/A');
    }
    
    this.yPos += 15;
  }

  private addTeamSection(data: any) {
    if (!data?.founders || data.founders.length === 0) return;
    
    this.addSectionHeader('Team Analysis');
    
    data.founders.forEach((founder: any, index: number) => {
      this.checkPageBreak(20);
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(12);
      this.pdf.text(`${founder.name} - ${founder.role}`, this.margin, this.yPos);
      this.yPos += 7;
      
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(10);
      
      if (founder.background) {
        const bgLines = this.pdf.splitTextToSize(founder.background, this.pageWidth - 2 * this.margin - 10);
        this.pdf.text(bgLines, this.margin + 5, this.yPos);
        this.yPos += bgLines.length * 4 + 5;
      }
      
      if (founder.education) {
        this.pdf.text(`Education: ${founder.education}`, this.margin + 5, this.yPos);
        this.yPos += 5;
      }
      
      if (founder.yearsExperience) {
        this.pdf.text(`Experience: ${founder.yearsExperience} years`, this.margin + 5, this.yPos);
        this.yPos += 5;
      }
      
      this.yPos += 5;
    });
    
    this.yPos += 10;
  }

  private addMarketSection(data: any) {
    if (!data?.marketInfo) return;
    
    this.addSectionHeader('Market Analysis');
    
    const market = data.marketInfo;
    
    this.addInfoRow('Total Addressable Market (TAM):', market.tam ? `$${market.tam.toLocaleString()}` : 'N/A');
    this.addInfoRow('Serviceable Addressable Market (SAM):', market.sam ? `$${market.sam.toLocaleString()}` : 'N/A');
    this.addInfoRow('Serviceable Obtainable Market (SOM):', market.som ? `$${market.som.toLocaleString()}` : 'N/A');
    this.addInfoRow('Market Growth Rate:', market.marketGrowthRate ? `${market.marketGrowthRate}%` : 'N/A');
    this.addInfoRow('Market Position:', market.marketPosition || 'N/A');
    
    if (market.competitors && market.competitors.length > 0) {
      this.yPos += 5;
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Key Competitors:', this.margin, this.yPos);
      this.yPos += 7;
      
      this.pdf.setFont('helvetica', 'normal');
      market.competitors.forEach((competitor: string) => {
        if (competitor && competitor.trim()) {
          this.pdf.text('• ' + competitor, this.margin + 5, this.yPos);
          this.yPos += 5;
        }
      });
    }
    
    this.yPos += 15;
  }

  private addRiskSection(data: any) {
    if (!data?.riskFlags || data.riskFlags.length === 0) return;
    
    this.addSectionHeader('Risk Analysis');
    
    data.riskFlags.forEach((risk: any) => {
      this.checkPageBreak(15);
      
      // Risk severity color
      const severityColor = risk.severity === 'high' ? [239, 68, 68] :
                          risk.severity === 'medium' ? [249, 115, 22] : [34, 197, 94];
      
      this.pdf.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${risk.severity?.toUpperCase()} RISK: ${risk.title}`, this.margin, this.yPos);
      this.yPos += 7;
      
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFont('helvetica', 'normal');
      
      if (risk.description) {
        const descLines = this.pdf.splitTextToSize(risk.description, this.pageWidth - 2 * this.margin);
        this.pdf.text(descLines, this.margin, this.yPos);
        this.yPos += descLines.length * 5 + 5;
      }
      
      if (risk.recommendation) {
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.text('Recommendation:', this.margin, this.yPos);
        this.yPos += 5;
        
        this.pdf.setFont('helvetica', 'normal');
        const recLines = this.pdf.splitTextToSize(risk.recommendation, this.pageWidth - 2 * this.margin);
        this.pdf.text(recLines, this.margin, this.yPos);
        this.yPos += recLines.length * 5 + 10;
      }
    });
    
    this.yPos += 10;
  }

  private addSectionHeader(title: string) {
    this.checkPageBreak(20);
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(79, 70, 229);
    this.pdf.text(title, this.margin, this.yPos);
    this.yPos += 8;
    
    // Add underline
    this.pdf.setDrawColor(79, 70, 229);
    this.pdf.line(this.margin, this.yPos, this.margin + 40, this.yPos);
    this.yPos += 10;
    
    this.pdf.setTextColor(0, 0, 0);
  }

  private addInfoRow(label: string, value: string) {
    this.checkPageBreak();
    
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.text(label, this.margin, this.yPos);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(value, this.margin + 60, this.yPos);
    this.yPos += 6;
  }

  private checkPageBreak(requiredSpace: number = 15) {
    if (this.yPos + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.yPos = this.margin;
    }
  }

  private addScoreVisualization(score: number) {
    const barWidth = this.pageWidth - 2 * this.margin - 40;
    const barHeight = 8;
    
    // Score label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Investment Score:', this.margin, this.yPos);
    
    // Background bar (gray)
    this.pdf.setFillColor(230, 230, 230);
    this.pdf.roundedRect(this.margin + 35, this.yPos - 3, barWidth, barHeight, 2, 2, 'F');
    
    // Progress bar (colored based on score)
    const progressWidth = (barWidth * score) / 100;
    const scoreColor = score >= 80 ? [34, 197, 94] : 
                      score >= 60 ? [249, 115, 22] : [239, 68, 68];
    
    this.pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.roundedRect(this.margin + 35, this.yPos - 3, progressWidth, barHeight, 2, 2, 'F');
    
    // Score text
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`${score}%`, this.margin + 35 + barWidth + 5, this.yPos + 2);
  }

  private addMetricBox(label: string, value: string) {
    const boxWidth = 55;
    const boxHeight = 25;
    
    // Box background
    this.pdf.setFillColor(245, 245, 245);
    this.pdf.roundedRect(this.margin, this.yPos, boxWidth, boxHeight, 3, 3, 'F');
    
    // Box border
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.roundedRect(this.margin, this.yPos, boxWidth, boxHeight, 3, 3, 'S');
    
    // Label
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(label, this.margin + 3, this.yPos + 6);
    
    // Value
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(value, this.margin + 3, this.yPos + 18);
    
    this.yPos += boxHeight + 8;
  }

  private addRatioVisualization(label: string, ratio: number, benchmark: number) {
    this.checkPageBreak();
    
    // Label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${label}:`, this.margin, this.yPos);
    
    // Visual representation
    const maxWidth = 60;
    const barHeight = 6;
    const ratioWidth = Math.min((ratio / (benchmark * 2)) * maxWidth, maxWidth);
    
    // Background
    this.pdf.setFillColor(230, 230, 230);
    this.pdf.rect(this.margin + 40, this.yPos - 2, maxWidth, barHeight, 'F');
    
    // Benchmark line
    const benchmarkPos = (benchmark / (benchmark * 2)) * maxWidth;
    this.pdf.setDrawColor(100, 100, 100);
    this.pdf.line(this.margin + 40 + benchmarkPos, this.yPos - 2, this.margin + 40 + benchmarkPos, this.yPos + 4);
    
    // Ratio bar
    const color = ratio >= benchmark ? [34, 197, 94] : [239, 68, 68];
    this.pdf.setFillColor(color[0], color[1], color[2]);
    this.pdf.rect(this.margin + 40, this.yPos - 2, ratioWidth, barHeight, 'F');
    
    // Value
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(`${ratio.toFixed(1)}x`, this.margin + 105, this.yPos + 2);
    
    this.yPos += 10;
  }

  private addExecutiveSummaryWithDashboard(summary: string, data: any) {
    this.checkPageBreak(60);
    
    // Title
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(79, 70, 229);
    this.pdf.text('Executive Summary', this.margin, this.yPos);
    this.yPos += 10;
    
    // Key Metrics Dashboard
    const startY = this.yPos;
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.roundedRect(this.margin, this.yPos, this.pageWidth - 2 * this.margin, 45, 5, 5, 'F');
    
    this.yPos += 8;
    
    // Dashboard title
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Key Metrics at a Glance', this.margin + 5, this.yPos);
    this.yPos += 10;
    
    // Metrics in columns
    const col1X = this.margin + 5;
    const col2X = this.margin + 70;
    const col3X = this.margin + 135;
    
    const currentY = this.yPos;
    
    // Column 1
    this.yPos = currentY;
    this.addDashboardMetric('Overall Score', `${data?.recommendationData?.recommendation?.score || 'N/A'}/100`, col1X);
    this.addDashboardMetric('Decision', data?.recommendationData?.recommendation?.decision?.toUpperCase() || 'N/A', col1X);
    
    // Column 2
    this.yPos = currentY;
    this.addDashboardMetric('Revenue', data?.financialData?.financialMetrics?.currentRevenue ? 
      `$${data.financialData.financialMetrics.currentRevenue.toLocaleString()}` : 'N/A', col2X);
    this.addDashboardMetric('Growth', data?.financialData?.financialMetrics?.revenueGrowthRate ? 
      `${data.financialData.financialMetrics.revenueGrowthRate}%` : 'N/A', col2X);
    
    // Column 3
    this.yPos = currentY;
    this.addDashboardMetric('Valuation', data?.financialData?.financialMetrics?.valuation ? 
      `$${data.financialData.financialMetrics.valuation.toLocaleString()}` : 'N/A', col3X);
    this.addDashboardMetric('Market Size', data?.marketData?.marketInfo?.tam ? 
      `$${data.marketData.marketInfo.tam.toLocaleString()}` : 'N/A', col3X);
    
    this.yPos = startY + 55;
    
    // Executive summary content
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(0, 0, 0);
    
    const lines = this.pdf.splitTextToSize(summary || 'Executive summary not available.', this.pageWidth - 2 * this.margin);
    this.pdf.text(lines, this.margin, this.yPos);
    this.yPos += lines.length * 5 + 15;
  }

  private addDashboardMetric(label: string, value: string, x: number) {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(label, x, this.yPos);
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text(value, x, this.yPos + 5);
    
    this.yPos += 12;
  }

  private addFooter() {
    const totalPages = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);
      
      // Footer text
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text('AI Startup Analysis Report', this.margin, this.pageHeight - 8);
      this.pdf.text(`Page ${i} of ${totalPages}`, this.pageWidth - this.margin, this.pageHeight - 8, { align: 'right' });
      this.pdf.text(`Generated by Google Gemini AI • ${new Date().toLocaleDateString()}`, this.pageWidth / 2, this.pageHeight - 8, { align: 'center' });
    }
  }
}

export const generatePDFReport = async (analysisData: AnalysisData, companyName: string): Promise<Blob> => {
  const generator = new PDFGenerator();
  return await generator.generateAnalysisReport(analysisData, companyName);
};