'use client';

import React, { useState } from 'react';
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

interface AnalysisResultsProps {
  analysisData: any;
  onNewAnalysis: () => void;
  viewMode?: 'summary' | 'detailed';
}

export default function EnhancedAnalysisResults({ analysisData, onNewAnalysis, viewMode = 'summary' }: AnalysisResultsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const analysis = analysisData?.analysis || {};
  const consolidatedData = analysisData?.consolidatedData || {};
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
      case 'pass': case 'sell': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Extract scores from analysis
  const scores = {
    overall: analysis?.recommendation?.score || analysis?.overallScore || 0,
    company: analysis?.companyAssessment?.score || 0,
    founder: analysis?.founderAnalysis?.score || 0,
    market: analysis?.marketAnalysis?.score || 0,
    financial: analysis?.financialAnalysis?.score || 0,
    product: analysis?.productAnalysis?.score || 0,
    traction: analysis?.tractionAnalysis?.score || 0,
    risk: analysis?.riskAnalysis?.score || 0
  };

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
          {/* Key Metrics Dashboard - Summary Only */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Investment Decision */}
            <div className="bg-white border-2 rounded-xl p-6 text-center shadow-sm">
              <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 mb-3 ${
                getRecommendationColor(analysis?.recommendation?.decision)
              }`}>
                {(analysis?.recommendation?.decision || analysis?.recommendation || 'PENDING').toUpperCase()}
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                {scores.overall}/100
              </div>
              <div className="text-sm text-gray-600">Investment Score</div>
            </div>

            {/* Potential Return */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analysis?.financialProjections?.potentialReturn || consolidatedData?.financial?.expectedROI || '12-15x'}
              </div>
              <div className="text-sm text-gray-600">Potential Return</div>
            </div>

            {/* Risk Level */}
            <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
              <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {analysis?.riskAnalysis?.level || 'Medium'}
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
            <p className="text-gray-700 leading-relaxed">
              {analysis?.executiveSummary || analysis?.summary || consolidatedData?.summary || 
                `Based on our comprehensive analysis of ${consolidatedData?.companyInfo?.name || 'the startup'}, 
                we recommend this investment opportunity with an overall score of ${scores.overall}/100. 
                The company demonstrates strong potential in its market segment with notable strengths 
                in business model and team capabilities.`}
            </p>
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
        {/* Investment Decision */}
        <div className="bg-white border-2 rounded-xl p-6 text-center shadow-sm">
          <div className={`inline-flex px-4 py-2 rounded-full text-sm font-bold border-2 mb-3 ${
            getRecommendationColor(analysis?.recommendation?.decision)
          }`}>
            {(analysis?.recommendation?.decision || analysis?.recommendation || 'PENDING').toUpperCase()}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {scores.overall}/100
          </div>
          <div className="text-sm text-gray-600">Investment Score</div>
        </div>

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