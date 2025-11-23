import jsPDF from 'jspdf';

interface InvestmentMemo {
    executiveSummary: string;
    investmentHighlights: string[];
    companyOverview: {
        mission: string;
        problem: string;
        solution: string;
        valueProposition: string;
    };
    marketAnalysis: {
        marketSize: string;
        marketDynamics: string;
        competitiveLandscape: string;
        marketOpportunity: string;
    };
    businessModel: {
        revenueModel: string;
        unitEconomics: string;
        scalability: string;
        defensibility: string;
    };
    teamAssessment: {
        founderBackground: string;
        teamStrengths: string;
        keyHires: string;
        advisors: string;
    };
    tractionMetrics: {
        currentTraction: string;
        growthTrajectory: string;
        keyMilestones: string;
        customerTestimonials: string;
    };
    financialAnalysis: {
        currentFinancials: string;
        projections: string;
        fundingHistory: string;
        useOfFunds: string;
    };
    riskAssessment: {
        keyRisks: string[];
        mitigationStrategies: string[];
        redFlags: string[];
    };
    investmentThesis: {
        whyNow: string;
        whyThis: string;
        whyUs: string;
        expectedReturn: string;
    };
    dealTerms: {
        proposedInvestment: string;
        valuation: string;
        ownership: string;
        boardSeat: string;
        liquidationPreference: string;
    };
    recommendation: {
        decision: string;
        reasoning: string;
        nextSteps: string[];
        timeline: string;
    };
}

export class InvestmentMemoPDFGenerator {
    private pdf: jsPDF;
    private pageWidth: number;
    private pageHeight: number;
    private margin: number;
    private yPos: number;
    private readonly lineHeight = 7;
    private readonly maxWidth: number;

    constructor() {
        this.pdf = new jsPDF('p', 'mm', 'a4');
        this.pageWidth = this.pdf.internal.pageSize.getWidth();
        this.pageHeight = this.pdf.internal.pageSize.getHeight();
        this.margin = 20;
        this.yPos = this.margin;
        this.maxWidth = this.pageWidth - 2 * this.margin;
    }

    private checkPageBreak(spaceNeeded: number = 20) {
        if (this.yPos + spaceNeeded > this.pageHeight - this.margin) {
            this.pdf.addPage();
            this.yPos = this.margin;
            return true;
        }
        return false;
    }

    private cleanText(text: string): string {
        // Remove markdown syntax and formatting artifacts
        return text
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/\+P\s*/g, '') // Remove +P artifacts
            .replace(/^[+\-•]\s*/gm, '') // Remove bullet point symbols at start of lines
            .trim();
    }

    private addTitle(text: string, color: [number, number, number] = [99, 102, 241]) {
        this.checkPageBreak(15);
        this.pdf.setFontSize(24);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(...color);
        this.pdf.text(this.cleanText(text), this.margin, this.yPos);
        this.yPos += 12;
    }

    private addSectionTitle(text: string, color: [number, number, number] = [67, 56, 202]) {
        this.checkPageBreak(12);
        this.yPos += 5;
        this.pdf.setFontSize(16);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(...color);
        this.pdf.text(this.cleanText(text), this.margin, this.yPos);
        this.yPos += 8;
    }

    private addSubsectionTitle(text: string, color: [number, number, number] = [79, 70, 229]) {
        this.checkPageBreak(10);
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(...color);
        this.pdf.text(this.cleanText(text), this.margin, this.yPos);
        this.yPos += 6;
    }

    private addParagraph(text: string, indent: number = 0) {
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(50, 50, 50);

        const cleanedText = this.cleanText(text);
        const lines = this.pdf.splitTextToSize(cleanedText, this.maxWidth - indent);

        for (const line of lines) {
            this.checkPageBreak(7);
            this.pdf.text(line, this.margin + indent, this.yPos);
            this.yPos += this.lineHeight;
        }
    }

    private addBulletPoint(text: string, bullet: string = '•') {
        this.checkPageBreak(10);
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(50, 50, 50);

        const cleanedText = this.cleanText(text);
        const bulletWidth = 5;
        const lines = this.pdf.splitTextToSize(cleanedText, this.maxWidth - bulletWidth - 5);

        // Draw bullet
        this.pdf.text(bullet, this.margin, this.yPos);

        // Draw text
        for (let i = 0; i < lines.length; i++) {
            if (i > 0) this.checkPageBreak(7);
            this.pdf.text(lines[i], this.margin + bulletWidth, this.yPos);
            this.yPos += this.lineHeight;
        }
    }

    private addNumberedPoint(number: number, text: string) {
        this.addBulletPoint(text, `${number}.`);
    }

    private addSeparator() {
        this.checkPageBreak(8);
        this.yPos += 3;
        this.pdf.setDrawColor(200, 200, 200);
        this.pdf.setLineWidth(0.5);
        this.pdf.line(this.margin, this.yPos, this.pageWidth - this.margin, this.yPos);
        this.yPos += 5;
    }

    private addColoredBox(title: string, content: string, color: [number, number, number]) {
        this.checkPageBreak(25);
        
        const boxPadding = 5;
        const boxWidth = this.maxWidth;
        const startY = this.yPos;

        // Calculate height needed
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        const titleHeight = 7;

        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        const contentLines = this.pdf.splitTextToSize(this.cleanText(content), boxWidth - 2 * boxPadding);
        const contentHeight = contentLines.length * this.lineHeight;

        const boxHeight = titleHeight + contentHeight + 2 * boxPadding;

        // Check if box fits on page
        if (this.yPos + boxHeight > this.pageHeight - this.margin) {
            this.pdf.addPage();
            this.yPos = this.margin;
        }

        // Draw light background (much lighter opacity)
        const lightColor: [number, number, number] = [
            Math.min(255, color[0] + 180),
            Math.min(255, color[1] + 180),
            Math.min(255, color[2] + 180)
        ];
        this.pdf.setFillColor(...lightColor);
        this.pdf.rect(this.margin, this.yPos, boxWidth, boxHeight, 'F');

        // Draw border
        this.pdf.setDrawColor(...color);
        this.pdf.setLineWidth(0.5);
        this.pdf.rect(this.margin, this.yPos, boxWidth, boxHeight, 'S');

        // Add title
        this.yPos += boxPadding + 5;
        this.pdf.setFontSize(11);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(...color);
        this.pdf.text(this.cleanText(title), this.margin + boxPadding, this.yPos);

        // Add content (dark text for readability)
        this.yPos += 2;
        this.pdf.setFontSize(10);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(40, 40, 40);

        for (const line of contentLines) {
            this.yPos += this.lineHeight;
            this.pdf.text(line, this.margin + boxPadding, this.yPos);
        }

        this.yPos += boxPadding + 3;
    }

    private addHeader(companyName: string) {
        // Gradient header background (simulated with rectangles)
        this.pdf.setFillColor(99, 102, 241);
        this.pdf.rect(0, 0, this.pageWidth, 50, 'F');

        // Title
        this.pdf.setFontSize(28);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.text('INVESTMENT MEMORANDUM', this.margin, 20);

        // Company name
        this.pdf.setFontSize(18);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(companyName, this.margin, 32);

        // Date
        this.pdf.setFontSize(10);
        const date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        this.pdf.text(`Generated: ${date}`, this.margin, 42);

        this.yPos = 60;
    }

    private addFooter(pageNumber: number) {
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(128, 128, 128);
        
        // Page number (center)
        this.pdf.text(
            `Page ${pageNumber}`,
            this.pageWidth / 2,
            this.pageHeight - 10,
            { align: 'center' }
        );
        
        // Confidential text (center)
        this.pdf.text(
            'CONFIDENTIAL - FOR INVESTMENT COMMITTEE USE ONLY',
            this.pageWidth / 2,
            this.pageHeight - 5,
            { align: 'center' }
        );
        
        // Invest-IQ branding (bottom right)
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(99, 102, 241); // Indigo color
        this.pdf.text(
            'Invest-IQ',
            this.pageWidth - this.margin,
            this.pageHeight - 7,
            { align: 'right' }
        );
    }

    public async generate(memo: InvestmentMemo, companyName: string): Promise<Blob> {
        // Add header
        this.addHeader(companyName);

        // Executive Summary
        this.addSectionTitle('EXECUTIVE SUMMARY', [99, 102, 241]);
        this.addParagraph(memo.executiveSummary);
        this.addSeparator();

        // Investment Highlights
        this.addSectionTitle('INVESTMENT HIGHLIGHTS', [16, 185, 129]);
        if (memo.investmentHighlights && memo.investmentHighlights.length > 0) {
            memo.investmentHighlights.forEach((highlight) => {
                this.addBulletPoint(highlight, '⭐');
            });
        }
        this.addSeparator();

        // Company Overview
        this.addSectionTitle('COMPANY OVERVIEW', [139, 92, 246]);
        
        this.addColoredBox('Mission', memo.companyOverview.mission, [139, 92, 246]);
        this.yPos += 3;
        
        this.addColoredBox('Problem', memo.companyOverview.problem, [239, 68, 68]);
        this.yPos += 3;
        
        this.addColoredBox('Solution', memo.companyOverview.solution, [59, 130, 246]);
        this.yPos += 3;
        
        this.addColoredBox('Value Proposition', memo.companyOverview.valueProposition, [16, 185, 129]);
        this.addSeparator();

        // Market Analysis
        this.addSectionTitle('MARKET ANALYSIS', [59, 130, 246]);
        
        this.addSubsectionTitle('Market Size');
        this.addParagraph(memo.marketAnalysis.marketSize);
        this.yPos += 3;
        
        this.addSubsectionTitle('Market Dynamics');
        this.addParagraph(memo.marketAnalysis.marketDynamics);
        this.yPos += 3;
        
        this.addSubsectionTitle('Competitive Landscape');
        this.addParagraph(memo.marketAnalysis.competitiveLandscape);
        this.yPos += 3;
        
        this.addSubsectionTitle('Market Opportunity');
        this.addParagraph(memo.marketAnalysis.marketOpportunity);
        this.addSeparator();

        // Business Model
        this.addSectionTitle('BUSINESS MODEL', [245, 158, 11]);
        
        this.addSubsectionTitle('Revenue Model');
        this.addParagraph(memo.businessModel.revenueModel);
        this.yPos += 3;
        
        this.addSubsectionTitle('Unit Economics');
        this.addParagraph(memo.businessModel.unitEconomics);
        this.yPos += 3;
        
        this.addSubsectionTitle('Scalability');
        this.addParagraph(memo.businessModel.scalability);
        this.yPos += 3;
        
        this.addSubsectionTitle('Defensibility');
        this.addParagraph(memo.businessModel.defensibility);
        this.addSeparator();

        // Team Assessment
        this.addSectionTitle('TEAM ASSESSMENT', [251, 146, 60]);
        
        this.addSubsectionTitle('Founder Background');
        this.addParagraph(memo.teamAssessment.founderBackground);
        this.yPos += 3;
        
        this.addSubsectionTitle('Team Strengths');
        this.addParagraph(memo.teamAssessment.teamStrengths);
        this.yPos += 3;
        
        this.addSubsectionTitle('Key Hires');
        this.addParagraph(memo.teamAssessment.keyHires);
        this.yPos += 3;
        
        this.addSubsectionTitle('Advisors');
        this.addParagraph(memo.teamAssessment.advisors);
        this.addSeparator();

        // Traction Metrics
        this.addSectionTitle('TRACTION & GROWTH METRICS', [16, 185, 129]);
        
        this.addSubsectionTitle('Current Traction');
        this.addParagraph(memo.tractionMetrics.currentTraction);
        this.yPos += 3;
        
        this.addSubsectionTitle('Growth Trajectory');
        this.addParagraph(memo.tractionMetrics.growthTrajectory);
        this.yPos += 3;
        
        this.addSubsectionTitle('Key Milestones');
        this.addParagraph(memo.tractionMetrics.keyMilestones);
        this.yPos += 3;
        
        this.addSubsectionTitle('Customer Testimonials');
        this.addParagraph(memo.tractionMetrics.customerTestimonials);
        this.addSeparator();

        // Financial Analysis
        this.addSectionTitle('FINANCIAL ANALYSIS', [5, 150, 105]);
        
        this.addSubsectionTitle('Current Financials');
        this.addParagraph(memo.financialAnalysis.currentFinancials);
        this.yPos += 3;
        
        this.addSubsectionTitle('Projections');
        this.addParagraph(memo.financialAnalysis.projections);
        this.yPos += 3;
        
        this.addSubsectionTitle('Funding History');
        this.addParagraph(memo.financialAnalysis.fundingHistory);
        this.yPos += 3;
        
        this.addSubsectionTitle('Use of Funds');
        this.addParagraph(memo.financialAnalysis.useOfFunds);
        this.addSeparator();

        // Risk Assessment
        this.addSectionTitle('RISK ASSESSMENT', [239, 68, 68]);
        
        this.addSubsectionTitle('Key Risks', [220, 38, 38]);
        if (memo.riskAssessment.keyRisks && memo.riskAssessment.keyRisks.length > 0) {
            memo.riskAssessment.keyRisks.forEach((risk) => {
                this.addBulletPoint(risk, '⚠');
            });
        }
        this.yPos += 3;
        
        this.addSubsectionTitle('Mitigation Strategies', [59, 130, 246]);
        if (memo.riskAssessment.mitigationStrategies && memo.riskAssessment.mitigationStrategies.length > 0) {
            memo.riskAssessment.mitigationStrategies.forEach((strategy) => {
                this.addBulletPoint(strategy, '→');
            });
        }
        this.yPos += 3;
        
        if (memo.riskAssessment.redFlags && memo.riskAssessment.redFlags.length > 0) {
            this.addSubsectionTitle('Red Flags', [234, 179, 8]);
            memo.riskAssessment.redFlags.forEach((flag) => {
                this.addBulletPoint(flag, '▲');
            });
        }
        this.addSeparator();

        // Investment Thesis
        this.addSectionTitle('INVESTMENT THESIS', [168, 85, 247]);
        
        this.addSubsectionTitle('Why Now?');
        this.addParagraph(memo.investmentThesis.whyNow);
        this.yPos += 3;
        
        this.addSubsectionTitle('Why This Company?');
        this.addParagraph(memo.investmentThesis.whyThis);
        this.yPos += 3;
        
        this.addSubsectionTitle('Why Us?');
        this.addParagraph(memo.investmentThesis.whyUs);
        this.yPos += 3;
        
        this.addSubsectionTitle('Expected Return');
        this.addParagraph(memo.investmentThesis.expectedReturn);
        this.addSeparator();

        // Deal Terms
        this.addSectionTitle('PROPOSED DEAL TERMS', [99, 102, 241]);
        
        this.checkPageBreak(40);
        const terms = [
            { label: 'Proposed Investment', value: memo.dealTerms.proposedInvestment },
            { label: 'Valuation', value: memo.dealTerms.valuation },
            { label: 'Ownership', value: memo.dealTerms.ownership },
            { label: 'Board Seat', value: memo.dealTerms.boardSeat },
            { label: 'Liquidation Preference', value: memo.dealTerms.liquidationPreference }
        ];

        terms.forEach(({ label, value }) => {
            this.pdf.setFontSize(10);
            this.pdf.setFont('helvetica', 'bold');
            this.pdf.setTextColor(67, 56, 202);
            this.pdf.text(label + ':', this.margin, this.yPos);
            
            this.pdf.setFont('helvetica', 'normal');
            this.pdf.setTextColor(50, 50, 50);
            this.pdf.text(this.cleanText(value), this.margin + 50, this.yPos);
            this.yPos += 8;
        });
        this.addSeparator();

        // Recommendation
        this.addSectionTitle('FINAL RECOMMENDATION', [16, 185, 129]);
        
        // Decision box
        this.checkPageBreak(30);
        // Recommendation color logic:
        // INVEST = Green (go ahead, positive)
        // MAYBE = Yellow (caution, needs consideration)
        // PASS = Orange (stop, don't proceed)
        const decisionColors: { [key: string]: [number, number, number] } = {
            'Strong Invest': [22, 163, 74],   // Dark green - strong buy
            'Invest': [34, 197, 94],           // Green - buy
            'Maybe': [234, 179, 8],            // Yellow - hold/consider
            'Pass': [249, 115, 22],            // Orange - don't invest
            'Strong Pass': [234, 88, 12]       // Dark orange - strong rejection
        };
        
        const decisionColor = decisionColors[memo.recommendation.decision] || [107, 114, 128];
        
        this.pdf.setFillColor(...decisionColor);
        this.pdf.rect(this.margin, this.yPos, this.maxWidth, 20, 'F');
        
        this.pdf.setFontSize(20);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.text(
            this.cleanText(memo.recommendation.decision).toUpperCase(),
            this.pageWidth / 2,
            this.yPos + 13,
            { align: 'center' }
        );
        this.yPos += 25;
        
        this.addSubsectionTitle('Reasoning');
        this.addParagraph(memo.recommendation.reasoning);
        this.yPos += 3;
        
        this.addSubsectionTitle('Next Steps');
        if (memo.recommendation.nextSteps && memo.recommendation.nextSteps.length > 0) {
            memo.recommendation.nextSteps.forEach((step, index) => {
                this.addNumberedPoint(index + 1, step);
            });
        }
        this.yPos += 3;
        
        this.addSubsectionTitle('Timeline');
        this.addParagraph(memo.recommendation.timeline);

        // Add page numbers to all pages
        const pageCount = this.pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            this.pdf.setPage(i);
            this.addFooter(i);
        }

        // Return as Blob
        return this.pdf.output('blob');
    }
}

export async function generateInvestmentMemoPDF(memo: InvestmentMemo, companyName: string): Promise<Blob> {
    const generator = new InvestmentMemoPDFGenerator();
    return await generator.generate(memo, companyName);
}
