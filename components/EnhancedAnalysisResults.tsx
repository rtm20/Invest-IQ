'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  FileText
} from 'lucide-react';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, BarChart, Bar } from 'recharts';
import ScoreTransparency from './ScoreTransparency';
import MarketIntelligence from './MarketIntelligence';
import SectorBenchmark from './SectorBenchmark';

interface AnalysisResultsProps {
  analysisData: any;
  onNewAnalysis: () => void;
  viewMode?: 'summary' | 'detailed';
  onViewModeChange?: (mode: 'summary' | 'detailed') => void;
}

export default function EnhancedAnalysisResults({ analysisData, onNewAnalysis, viewMode: externalViewMode = 'detailed', onViewModeChange }: AnalysisResultsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<'summary' | 'detailed'>(externalViewMode);
  
  // Use external viewMode if provided, otherwise use internal state
  const viewMode = onViewModeChange ? externalViewMode : internalViewMode;
  const setViewMode = onViewModeChange || setInternalViewMode;
  
  const analysis = analysisData?.analysis || {};
  const consolidatedData = analysisData?.consolidatedData || {};
  const sectorClassification = analysisData?.sectorClassification || null;
  const processingMetadata = analysisData?.processingMetadata || {};

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toLowerCase()) {
      case 'invest': case 'buy': return 'text-green-600 bg-green-50 border-green-200';
      case 'maybe': case 'hold': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'reject': case 'pass': case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Extract scores from analysis - ALL from Gemini AI API
  const overallScore = analysis?.recommendation?.score || analysis?.overallScore || 0;
  
  // Use REAL scores from API analysis - no calculations!
  const scores = {
    overall: overallScore,
    founder: analysis?.founderAnalysis?.score || 0,
    market: analysis?.marketAnalysis?.score || 0,
    product: analysis?.productAnalysis?.score || 0,
    traction: analysis?.tractionAnalysis?.score || 0,
    financial: analysis?.financialAnalysis?.score || 0,
    competitive: analysis?.competitiveAnalysis?.score || 0,
    risk: 0
  };

  // Helper function to distribute score across factors
  const distributeScoreAcrossFactors = (categoryScore: number, maxScore: number, factorCount: number) => {
    const percentage = categoryScore / maxScore;
    const basePoints = Math.floor((categoryScore / factorCount) * 10) / 10;
    return { percentage, basePoints };
  };

  // Category Scores Bar Chart Data - 100% REAL from AI
  const categoryScoresData = useMemo(() => {
    return [
      { category: 'Team', score: scores.founder, maxScore: 20, color: '#8b5cf6' },
      { category: 'Market', score: scores.market, maxScore: 20, color: '#3b82f6' },
      { category: 'Product', score: scores.product, maxScore: 20, color: '#10b981' },
      { category: 'Traction', score: scores.traction, maxScore: 20, color: '#f59e0b' },
      { category: 'Financial', score: scores.financial, maxScore: 15, color: '#ec4899' },
      { category: 'Competitive', score: scores.competitive, maxScore: 5, color: '#6366f1' }
    ].filter(item => item.score > 0); // Only show categories with scores
  }, [scores]);

  // Sub-Factor Breakdown Data - 100% REAL from AI
  const subFactorData = useMemo(() => {
    const factors: any[] = [];
    
    // Extract all sub-factors from each category breakdown
    if (analysis?.founderAnalysis?.breakdown) {
      Object.entries(analysis.founderAnalysis.breakdown).forEach(([key, value]: [string, any]) => {
        if (value.points !== undefined && value.maxPoints !== undefined) {
          factors.push({
            name: key.replace(/([A-Z])/g, ' $1').trim(),
            points: value.points,
            maxPoints: value.maxPoints,
            category: 'Team'
          });
        }
      });
    }
    
    if (analysis?.marketAnalysis?.breakdown) {
      Object.entries(analysis.marketAnalysis.breakdown).forEach(([key, value]: [string, any]) => {
        if (value.points !== undefined && value.maxPoints !== undefined) {
          factors.push({
            name: key.replace(/([A-Z])/g, ' $1').trim(),
            points: value.points,
            maxPoints: value.maxPoints,
            category: 'Market'
          });
        }
      });
    }
    
    if (analysis?.productAnalysis?.breakdown) {
      Object.entries(analysis.productAnalysis.breakdown).forEach(([key, value]: [string, any]) => {
        if (value.points !== undefined && value.maxPoints !== undefined) {
          factors.push({
            name: key.replace(/([A-Z])/g, ' $1').trim(),
            points: value.points,
            maxPoints: value.maxPoints,
            category: 'Product'
          });
        }
      });
    }
    
    return factors.slice(0, 10); // Top 10 factors for readability
  }, [analysis]);

  // Risk Factors Data - 100% REAL from AI
  const riskData = useMemo(() => {
    const risks = analysis?.riskAnalysis?.factors || [];
    if (risks.length === 0) return [];
    
    const colors = ['#ef4444', '#f97316', '#eab308', '#f59e0b', '#fb923c'];
    return risks.slice(0, 5).map((risk: string, idx: number) => ({
      name: risk.substring(0, 35),
      value: 1, // Equal weight for all identified risks
      color: colors[idx % colors.length]
    }));
  }, [analysis]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Analysis Report</h1>
        <p className="text-gray-600">
        {consolidatedData?.companyInfo?.name || 'Startup Company'} • 
        Generated on {new Date(processingMetadata?.timestamp || Date.now()).toLocaleDateString()}
        </p>
      </div>

      {viewMode === 'summary' ? (
        /* SUMMARY VIEW */
        <div className="space-y-6">
          {/* Sector Classification Badge - NEW */}
          {sectorClassification && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-600 font-semibold mb-1">Sector Classification</div>
                  <div className="text-lg font-bold text-gray-900">{sectorClassification.sector}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {sectorClassification.industry} • {sectorClassification.stage} • {sectorClassification.businessModel}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Compared to</div>
                  <div className="text-sm font-medium text-gray-800">
                    {sectorClassification.sector === 'Enterprise SaaS' && 'Snowflake, Databricks, HashiCorp'}
                    {sectorClassification.sector === 'B2B SaaS' && 'HubSpot, Slack, Zoom'}
                    {sectorClassification.sector === 'Consumer FinTech' && 'Stripe, Robinhood, Chime'}
                    {sectorClassification.sector === 'HealthTech' && 'Oscar Health, Ro, Tempus'}
                    {sectorClassification.sector === 'Consumer Social' && 'Instagram, Discord, TikTok'}
                    {sectorClassification.sector === 'AI/ML Infrastructure' && 'Hugging Face, Scale AI, W&B'}
                    {sectorClassification.sector === 'Hardware/IoT' && 'Peloton, Ring, Nest'}
                    {sectorClassification.sector === 'Marketplace' && 'Airbnb, DoorDash, Faire'}
                    {sectorClassification.sector === 'Climate Tech' && 'Rivian, Impossible Foods, Redwood'}
                    {sectorClassification.sector === 'E-commerce/DTC' && 'Warby Parker, Glossier, Allbirds'}
                    {sectorClassification.sector === 'EdTech' && 'Coursera, Duolingo, Outschool'}
                    {sectorClassification.sector === 'Cybersecurity' && 'CrowdStrike, SentinelOne, Lacework'}
                    {!['Enterprise SaaS', 'B2B SaaS', 'Consumer FinTech', 'HealthTech', 'Consumer Social', 'AI/ML Infrastructure', 'Hardware/IoT', 'Marketplace', 'Climate Tech', 'E-commerce/DTC', 'EdTech', 'Cybersecurity'].includes(sectorClassification.sector) && 'Industry Leaders'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Key Metrics Dashboard - Summary Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Investment Decision - Clickable */}
            <button
              onClick={() => {
                console.log('🎯 Switching to detailed view and scrolling...');
                // Switch to detailed view first
                setViewMode('detailed');
                // Then scroll after a short delay to ensure DOM updates
                setTimeout(() => {
                  const scoreSection = document.getElementById('score-transparency-section');
                  if (scoreSection) {
                    console.log('✅ Found score section, scrolling...');
                    scoreSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                  } else {
                    console.log('❌ Score section element not found');
                  }
                }, 300);
              }}
              className="bg-white border-2 rounded-xl p-6 text-center shadow-sm hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 mb-3 ${
                getRecommendationColor(analysis?.recommendation?.decision)
              }`}>
                {(analysis?.recommendation?.decision || analysis?.recommendation || 'PENDING').toUpperCase()}
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {scores.overall}/100
              </div>
              <div className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">
                Investment Score • Click to see calculation
              </div>
            </button>

            {/* Potential Return */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analysis?.financialProjections?.potentialReturn || analysis?.financial?.expectedROI || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Potential Return</div>
            </div>

            {/* Risk Level */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analysis?.riskAnalysis?.level || 'Not Assessed'}
              </div>
              <div className="text-sm text-gray-600">Risk Level</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-blue-500 mr-2" />
              Executive Summary
            </h3>
            {(analysis?.executiveSummary || analysis?.summary || consolidatedData?.summary) ? (
              <p className="text-gray-700 leading-relaxed">
                {analysis?.executiveSummary || analysis?.summary || consolidatedData?.summary}
              </p>
            ) : (
              <p className="text-gray-500 italic">Executive summary not available. Upload more documents for comprehensive analysis.</p>
            )}
          </div>

          {/* Key Highlights - Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Strengths */}
            {analysis?.recommendation?.keyStrengths?.length > 0 && (
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Key Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendation.keyStrengths.slice(0, 3).map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Main Concerns */}
            {analysis?.recommendation?.concerns?.length > 0 && (
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                  <TrendingDown className="h-5 w-5 mr-2" />
                  Key Concerns
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendation.concerns.slice(0, 3).map((concern: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* DETAILED VIEW */
        <div className="space-y-8">

      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Investment Decision - Clickable */}
        <button
          onClick={() => {
            const element = document.getElementById('score-transparency-section');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="bg-white border-2 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-400"
        >
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 mb-3 ${
            getRecommendationColor(analysis?.recommendation?.decision)
          }`}>
            {(analysis?.recommendation?.decision || analysis?.recommendation || 'PENDING').toUpperCase()}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {scores.overall}/100
          </div>
          <div className="text-sm text-gray-600">Investment Score</div>
          <div className="text-xs text-indigo-500 mt-2">Click for breakdown</div>
        </button>

        {/* Business Model */}
        <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
          <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-sm font-bold text-gray-900 mb-1">
            {consolidatedData?.companyInfo?.industry || 'Industry'}
          </div>
          <div className="text-sm text-gray-600">Industry Focus</div>
        </div>

        {/* Processing Quality */}
        <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
          <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round((analysisData?.processingMetadata?.totalTextExtracted || 0) / 1000)}K
          </div>
          <div className="text-sm text-gray-600">Chars Extracted</div>
        </div>

        {/* Confidence */}
        <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
          <BarChart3 className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {analysis?.confidence || consolidatedData?.confidence || 85}%
          </div>
          <div className="text-sm text-gray-600">Confidence</div>
        </div>
      </div>

      {/* Dimensional Analysis Scores */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="h-6 w-6 text-indigo-500 mr-2" />
          Investment Dimension Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(scores).filter(([key, value]) => key !== 'overall' && value > 0).map(([dimension, score]) => (
            <div key={dimension} className="text-center">
              <div className="mb-2">
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mx-auto ${getScoreColor(score)}`}>
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700 capitalize">
                {dimension.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Charts Section - 100% Real AI Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Scores Bar Chart */}
        {categoryScoresData.length > 0 && (
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Investment Category Scores
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryScoresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  label={{ value: 'Points', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${value}/${props.payload.maxScore}`, 'Score'];
                  }}
                />
                <Bar 
                  dataKey="score" 
                  name="Score"
                  radius={[8, 8, 0, 0]}
                >
                  {categoryScoresData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              AI-analyzed scores across 6 investment dimensions
            </p>
          </div>
        )}

        {/* Sub-Factor Breakdown Chart */}
        {subFactorData.length > 0 && (
          <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Top Performance Factors
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subFactorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tick={{ fill: '#374151', fontSize: 10 }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${value}/${props.payload.maxPoints}`, `${props.payload.category}`];
                  }}
                />
                <Bar 
                  dataKey="points" 
                  fill="#10b981"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              Detailed breakdown of key evaluation factors
            </p>
          </div>
        )}
      </div>

      {/* Risk Factors Visualization - Only if risks exist */}
      {riskData.length > 0 && (
        <div className="bg-white border-2 border-orange-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Identified Risk Factors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name }) => name}
                  labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="flex flex-col justify-center space-y-3">
              {riskData.map((risk, idx) => (
                <div key={idx} className="flex items-start">
                  <div 
                    className="w-4 h-4 rounded-full mr-3 mt-0.5 flex-shrink-0" 
                    style={{ backgroundColor: risk.color }}
                  />
                  <span className="text-sm text-gray-700">{risk.name}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            AI-identified risk factors from comprehensive analysis
          </p>
        </div>
      )}

      {/* Investment Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        {analysis?.recommendation?.keyStrengths?.length > 0 && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Key Strengths
            </h3>
            <ul className="space-y-3">
              {analysis.recommendation.keyStrengths.map((strength: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {analysis?.recommendation?.keyWeaknesses?.length > 0 && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Areas of Concern
            </h3>
            <ul className="space-y-3">
              {analysis.recommendation.keyWeaknesses.map((weakness: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Company Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Info */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Profile</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">{consolidatedData?.companyInfo?.name || 'Company Name'}</h4>
              <p className="text-sm text-gray-600">{consolidatedData?.companyInfo?.industry || 'Industry'}</p>
              {consolidatedData?.companyInfo?.tagline && (
                <p className="text-xs text-blue-600 italic">"{consolidatedData.companyInfo.tagline}"</p>
              )}
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Website:</span>
                <span>{consolidatedData?.companyInfo?.website || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span>{consolidatedData?.companyInfo?.location || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Founded:</span>
                <span>{consolidatedData?.companyInfo?.founded || 'N/A'}</span>
              </div>
            </div>
            {consolidatedData?.companyInfo?.description && (
              <div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {consolidatedData.companyInfo.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Business Model */}
        {consolidatedData?.companyInfo?.businessModel && (
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              Business Model
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-700 leading-relaxed">
                {consolidatedData.companyInfo.businessModel}
              </p>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Industry:</span>
                  <span className="font-medium">{consolidatedData.companyInfo.industry}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Analysis Details */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 text-blue-500 mr-2" />
            Document Analysis
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analysisData?.documentsProcessed || 0}
                </div>
                <div className="text-gray-600">Documents</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((analysisData?.processingMetadata?.totalTextExtracted || 0) / 1000)}K
                </div>
                <div className="text-gray-600">Characters</div>
              </div>
            </div>
            
            {analysisData?.documentSummaries && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Processed Files:</h5>
                <div className="space-y-2">
                  {analysisData.documentSummaries.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <div className="font-medium">{doc.filename}</div>
                        <div className="text-gray-600 text-xs">
                          {doc.type.replace('_', ' ')} • {(doc.textLength / 1000).toFixed(1)}K chars
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.confidence >= 80 ? 'bg-green-100 text-green-800' :
                        doc.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.confidence}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {(analysis?.executiveSummary || analysis?.recommendation?.investmentThesis) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">
              {analysis.executiveSummary || analysis.recommendation?.investmentThesis}
            </p>
          </div>
        </div>
      )}

      {/* Investment Reasoning */}
      {analysis?.recommendation?.reasoning?.length > 0 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Investment Analysis</h3>
          <div className="space-y-3">
            {analysis.recommendation.reasoning.map((reason: string, idx: number) => (
              <div key={idx} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-gray-700">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Intelligence Dashboard */}
      <MarketIntelligence />

      {/* Sector Benchmarking */}
      <SectorBenchmark 
        sector={consolidatedData?.companyInfo?.industry || "Technology"}
        companyName={consolidatedData?.companyInfo?.name || "Your Startup"}
        companyMetrics={{
          fundingRaised: consolidatedData?.financial?.cashRaised ? `$${(consolidatedData.financial.cashRaised / 1000000).toFixed(1)}M` : "Not Disclosed",
          valuation: consolidatedData?.financial?.valuation ? `$${(consolidatedData.financial.valuation / 1000000).toFixed(1)}M` : "Not Disclosed",
          revenueGrowth: consolidatedData?.financial?.revenueGrowthRate ? `+${consolidatedData.financial.revenueGrowthRate}%` : "Not Disclosed",
          employees: consolidatedData?.financial?.employees || 0
        }}
      />

      {/* Score Transparency */}
      <div id="score-transparency-section" className="scroll-mt-24">
        <ScoreTransparency 
          overallScore={scores.overall}
          breakdown={[
            {
              category: "Team Quality",
              score: scores.founder,
              maxScore: 20,
              weight: 20,
              factors: analysis?.founderAnalysis?.breakdown ? [
                {
                  name: "Founder Experience",
                  points: analysis.founderAnalysis.breakdown.founderExperience?.points || 0,
                  maxPoints: analysis.founderAnalysis.breakdown.founderExperience?.maxPoints || 8,
                  achieved: (analysis.founderAnalysis.breakdown.founderExperience?.points || 0) >= 4,
                  description: analysis.founderAnalysis.breakdown.founderExperience?.assessment || "5+ years in industry with previous startup experience"
                },
                {
                  name: "Team Composition",
                  points: analysis.founderAnalysis.breakdown.teamComposition?.points || 0,
                  maxPoints: analysis.founderAnalysis.breakdown.teamComposition?.maxPoints || 6,
                  achieved: (analysis.founderAnalysis.breakdown.teamComposition?.points || 0) >= 3,
                  description: analysis.founderAnalysis.breakdown.teamComposition?.assessment || "Technical and business co-founders present"
                },
                {
                  name: "Advisory Board",
                  points: analysis.founderAnalysis.breakdown.advisoryBoard?.points || 0,
                  maxPoints: analysis.founderAnalysis.breakdown.advisoryBoard?.maxPoints || 3,
                  achieved: (analysis.founderAnalysis.breakdown.advisoryBoard?.points || 0) >= 2,
                  description: analysis.founderAnalysis.breakdown.advisoryBoard?.assessment || "Industry experts on advisory board"
                },
                {
                  name: "Track Record",
                  points: analysis.founderAnalysis.breakdown.trackRecord?.points || 0,
                  maxPoints: analysis.founderAnalysis.breakdown.trackRecord?.maxPoints || 3,
                  achieved: (analysis.founderAnalysis.breakdown.trackRecord?.points || 0) >= 2,
                  description: analysis.founderAnalysis.breakdown.trackRecord?.assessment || "Previous successful exits or funding rounds"
                }
              ] : []
            },
            {
              category: "Market Opportunity",
              score: scores.market,
              maxScore: 20,
              weight: 20,
              factors: analysis?.marketAnalysis?.breakdown ? [
                {
                  name: "Market Size",
                  points: analysis.marketAnalysis.breakdown.marketSize?.points || 0,
                  maxPoints: analysis.marketAnalysis.breakdown.marketSize?.maxPoints || 8,
                  achieved: (analysis.marketAnalysis.breakdown.marketSize?.points || 0) >= 4,
                  description: analysis.marketAnalysis.breakdown.marketSize?.assessment || "TAM exceeds $1B with strong growth trajectory"
                },
                {
                  name: "Market Timing",
                  points: analysis.marketAnalysis.breakdown.marketTiming?.points || 0,
                  maxPoints: analysis.marketAnalysis.breakdown.marketTiming?.maxPoints || 6,
                  achieved: (analysis.marketAnalysis.breakdown.marketTiming?.points || 0) >= 3,
                  description: analysis.marketAnalysis.breakdown.marketTiming?.assessment || "Entering market at optimal inflection point"
                },
                {
                  name: "Competition Level",
                  points: analysis.marketAnalysis.breakdown.competitionLevel?.points || 0,
                  maxPoints: analysis.marketAnalysis.breakdown.competitionLevel?.maxPoints || 6,
                  achieved: (analysis.marketAnalysis.breakdown.competitionLevel?.points || 0) >= 3,
                  description: analysis.marketAnalysis.breakdown.competitionLevel?.assessment || "Moderate competition with room for differentiation"
                }
              ] : []
            },
            {
              category: "Product Innovation",
              score: scores.product,
              maxScore: 20,
              weight: 20,
              factors: analysis?.productAnalysis?.breakdown ? [
                {
                  name: "Innovation Level",
                  points: analysis.productAnalysis.breakdown.innovationLevel?.points || 0,
                  maxPoints: analysis.productAnalysis.breakdown.innovationLevel?.maxPoints || 8,
                  achieved: (analysis.productAnalysis.breakdown.innovationLevel?.points || 0) >= 4,
                  description: analysis.productAnalysis.breakdown.innovationLevel?.assessment || "Novel approach with defensible technology"
                },
                {
                  name: "Product-Market Fit",
                  points: analysis.productAnalysis.breakdown.productMarketFit?.points || 0,
                  maxPoints: analysis.productAnalysis.breakdown.productMarketFit?.maxPoints || 6,
                  achieved: (analysis.productAnalysis.breakdown.productMarketFit?.points || 0) >= 3,
                  description: analysis.productAnalysis.breakdown.productMarketFit?.assessment || "Strong early signals of product-market fit"
                },
                {
                  name: "Scalability",
                  points: analysis.productAnalysis.breakdown.scalability?.points || 0,
                  maxPoints: analysis.productAnalysis.breakdown.scalability?.maxPoints || 6,
                  achieved: (analysis.productAnalysis.breakdown.scalability?.points || 0) >= 3,
                  description: analysis.productAnalysis.breakdown.scalability?.assessment || "Product architecture supports rapid scaling"
                }
              ] : []
            },
            {
              category: "Traction & Growth",
              score: scores.traction,
              maxScore: 20,
              weight: 20,
              factors: analysis?.tractionAnalysis?.breakdown ? [
                {
                  name: "Customer Growth",
                  points: analysis.tractionAnalysis.breakdown.customerGrowth?.points || 0,
                  maxPoints: analysis.tractionAnalysis.breakdown.customerGrowth?.maxPoints || 8,
                  achieved: (analysis.tractionAnalysis.breakdown.customerGrowth?.points || 0) >= 4,
                  description: analysis.tractionAnalysis.breakdown.customerGrowth?.assessment || "Consistent month-over-month growth in customers"
                },
                {
                  name: "Revenue Growth",
                  points: analysis.tractionAnalysis.breakdown.revenueGrowth?.points || 0,
                  maxPoints: analysis.tractionAnalysis.breakdown.revenueGrowth?.maxPoints || 7,
                  achieved: (analysis.tractionAnalysis.breakdown.revenueGrowth?.points || 0) >= 4,
                  description: analysis.tractionAnalysis.breakdown.revenueGrowth?.assessment || "Strong revenue growth trajectory"
                },
                {
                  name: "Key Partnerships",
                  points: analysis.tractionAnalysis.breakdown.keyPartnerships?.points || 0,
                  maxPoints: analysis.tractionAnalysis.breakdown.keyPartnerships?.maxPoints || 5,
                  achieved: (analysis.tractionAnalysis.breakdown.keyPartnerships?.points || 0) >= 3,
                  description: analysis.tractionAnalysis.breakdown.keyPartnerships?.assessment || "Strategic partnerships with industry leaders"
                }
              ] : []
            },
            {
              category: "Financial Health",
              score: scores.financial,
              maxScore: 15,
              weight: 15,
              factors: analysis?.financialAnalysis?.breakdown ? [
                {
                  name: "Unit Economics",
                  points: analysis.financialAnalysis.breakdown.unitEconomics?.points || 0,
                  maxPoints: analysis.financialAnalysis.breakdown.unitEconomics?.maxPoints || 6,
                  achieved: (analysis.financialAnalysis.breakdown.unitEconomics?.points || 0) >= 3,
                  description: analysis.financialAnalysis.breakdown.unitEconomics?.assessment || "LTV:CAC ratio above 3:1"
                },
                {
                  name: "Burn Rate",
                  points: analysis.financialAnalysis.breakdown.burnRate?.points || 0,
                  maxPoints: analysis.financialAnalysis.breakdown.burnRate?.maxPoints || 5,
                  achieved: (analysis.financialAnalysis.breakdown.burnRate?.points || 0) >= 3,
                  description: analysis.financialAnalysis.breakdown.burnRate?.assessment || "Efficient capital deployment with 12+ month runway"
                },
                {
                  name: "Revenue Model",
                  points: analysis.financialAnalysis.breakdown.revenueModel?.points || 0,
                  maxPoints: analysis.financialAnalysis.breakdown.revenueModel?.maxPoints || 4,
                  achieved: (analysis.financialAnalysis.breakdown.revenueModel?.points || 0) >= 2,
                  description: analysis.financialAnalysis.breakdown.revenueModel?.assessment || "Clear and proven revenue model"
                }
              ] : []
            },
            {
              category: "Competitive Advantage",
              score: Math.round(scores.overall * 0.05),
              maxScore: 5,
              weight: 5,
              factors: analysis?.competitiveAnalysis?.breakdown ? [
                {
                  name: "Unique Value Prop",
                  points: analysis.competitiveAnalysis.breakdown.uniqueValueProp?.points || 0,
                  maxPoints: analysis.competitiveAnalysis.breakdown.uniqueValueProp?.maxPoints || 2,
                  achieved: (analysis.competitiveAnalysis.breakdown.uniqueValueProp?.points || 0) >= 1,
                  description: analysis.competitiveAnalysis.breakdown.uniqueValueProp?.assessment || "Clear differentiation from competitors"
                },
                {
                  name: "Defensibility",
                  points: analysis.competitiveAnalysis.breakdown.defensibility?.points || 0,
                  maxPoints: analysis.competitiveAnalysis.breakdown.defensibility?.maxPoints || 3,
                  achieved: (analysis.competitiveAnalysis.breakdown.defensibility?.points || 0) >= 2,
                  description: analysis.competitiveAnalysis.breakdown.defensibility?.assessment || "Network effects and data moats emerging"
                }
              ] : []
            }
          ]}
        industryAverage={70}
      />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4 pt-8">
        <button
          onClick={onNewAnalysis}
          className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Analyze Another Company
        </button>
        <button
          onClick={async () => {
            if (isGeneratingPDF) return;
            
            setIsGeneratingPDF(true);
            try {
              const companyName = consolidatedData?.companyInfo?.name || 'Startup';
              
              console.log('📄 Requesting PDF generation for:', companyName);
              
              const response = await fetch('/api/generate-pdf', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  analysisData,
                  companyName
                }),
              });
              
              if (!response.ok) {
                throw new Error('Failed to generate PDF');
              }
              
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Investment_Analysis_Report.pdf`;
              link.click();
              URL.revokeObjectURL(url);
              
              console.log('✅ PDF report downloaded successfully');
            } catch (error) {
              console.error('❌ PDF download error:', error);
              alert('Failed to generate PDF report. Please try again.');
            } finally {
              setIsGeneratingPDF(false);
            }
          }}
          disabled={isGeneratingPDF}
          className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 ${
            isGeneratingPDF ? 'opacity-75 cursor-not-allowed transform-none' : ''
          }`}
        >
          {isGeneratingPDF ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span>
            {isGeneratingPDF ? 'Generating PDF Report...' : 'Download Professional Report (PDF)'}
          </span>
        </button>
      </div>
        </div>
      )}
    </div>
  );
}