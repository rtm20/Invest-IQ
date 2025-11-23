'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Target, FileText, Loader2, Zap } from 'lucide-react';
import EnhancedAnalysisResults from './EnhancedAnalysisResults';
import CompetitiveLandscape from './CompetitiveLandscape';
import InvestmentMemoViewer from './InvestmentMemoViewer';

interface AIEnhancedAnalysisWrapperProps {
    analysisData: any;
    onNewAnalysis: () => void;
    viewMode?: 'summary' | 'detailed';
    onViewModeChange?: (mode: 'summary' | 'detailed') => void;
    onActiveFeatureChange?: (feature: 'analysis' | 'competitive' | 'memo') => void;
    onDownloadRequest?: () => void;
}

export default function AIEnhancedAnalysisWrapper({
    analysisData,
    onNewAnalysis,
    viewMode,
    onViewModeChange,
    onActiveFeatureChange,
    onDownloadRequest
}: AIEnhancedAnalysisWrapperProps) {
    // State for AI-powered features
    const [competitiveLandscape, setCompetitiveLandscape] = useState<any>(null);
    const [isLoadingCompetitors, setIsLoadingCompetitors] = useState(false);
    const [investmentMemo, setInvestmentMemo] = useState<any>(null);
    const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
    const [activeAIFeature, setActiveAIFeature] = useState<'analysis' | 'competitive' | 'memo'>('analysis');

    const companyName = analysisData?.consolidatedData?.companyInfo?.name || 'Startup Company';
    const industry = analysisData?.consolidatedData?.companyInfo?.industry || 'Technology';
    const description = analysisData?.consolidatedData?.companyInfo?.description || '';
    const businessModel = analysisData?.consolidatedData?.companyInfo?.businessModel || '';

    // Notify parent when active feature changes
    useEffect(() => {
        if (onActiveFeatureChange) {
            onActiveFeatureChange(activeAIFeature);
        }
    }, [activeAIFeature, onActiveFeatureChange]);

    // Expose investmentMemo to parent for download
    useEffect(() => {
        if (investmentMemo) {
            // Store memo reference for parent to access
            (window as any).__investmentMemo = investmentMemo;
            (window as any).__companyName = companyName;
        }
    }, [investmentMemo, companyName]);

    // Load competitive intelligence
    const handleLoadCompetitiveIntelligence = async () => {
        if (competitiveLandscape) {
            setActiveAIFeature('competitive');
            return;
        }

        setIsLoadingCompetitors(true);
        try {
            console.log('🔍 Loading competitive intelligence...');

            const response = await fetch('/api/competitive-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName,
                    industry,
                    description,
                    businessModel
                })
            });

            const result = await response.json();

            if (result.success) {
                setCompetitiveLandscape(result.analysis);
                setActiveAIFeature('competitive');
                console.log('✅ Competitive intelligence loaded');
            } else {
                console.error('Failed to load competitive intelligence:', result.error);
                alert('Failed to load competitive intelligence. Please try again.');
            }
        } catch (error) {
            console.error('Error loading competitive intelligence:', error);
            alert('Error loading competitive intelligence. Please try again.');
        } finally {
            setIsLoadingCompetitors(false);
        }
    };

    // Generate investment memo
    const handleGenerateInvestmentMemo = async () => {
        if (investmentMemo) {
            setActiveAIFeature('memo');
            return;
        }

        setIsGeneratingMemo(true);
        try {
            console.log('📝 Generating investment memo...');

            const response = await fetch('/api/generate-memo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisResults: analysisData })
            });

            const result = await response.json();

            if (result.success) {
                setInvestmentMemo(result.memo);
                setActiveAIFeature('memo');
                console.log('✅ Investment memo generated');
            } else {
                console.error('Failed to generate memo:', result.error);
                alert('Failed to generate investment memo. Please try again.');
            }
        } catch (error) {
            console.error('Error generating memo:', error);
            alert('Error generating investment memo. Please try again.');
        } finally {
            setIsGeneratingMemo(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Single Unified Navigation Bar */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Title */}
                        <div className="flex items-center space-x-2">
                            <Sparkles className="h-6 w-6 text-purple-600" />
                            <h2 className="text-lg font-bold text-gray-900">AI-Powered Analysis</h2>
                            <span className="text-sm text-gray-500">• {companyName}</span>
                        </div>

                        {/* Center: 3 Main Sections */}
                        <div className="flex items-center space-x-2">
                            {/* Analysis Report */}
                            <button
                                onClick={() => setActiveAIFeature('analysis')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeAIFeature === 'analysis'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                <span>Analysis Report</span>
                            </button>

                            {/* Competitive Intelligence */}
                            <button
                                onClick={handleLoadCompetitiveIntelligence}
                                disabled={isLoadingCompetitors}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeAIFeature === 'competitive'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${isLoadingCompetitors ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoadingCompetitors ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Target className="h-4 w-4" />
                                )}
                                <span>{isLoadingCompetitors ? 'Loading...' : 'Competitive Intelligence'}</span>
                                {!competitiveLandscape && !isLoadingCompetitors && (
                                    <Zap className="h-3 w-3 text-yellow-400" />
                                )}
                            </button>

                            {/* Investment Memo */}
                            <button
                                onClick={handleGenerateInvestmentMemo}
                                disabled={isGeneratingMemo}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${activeAIFeature === 'memo'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    } ${isGeneratingMemo ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isGeneratingMemo ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4" />
                                )}
                                <span>{isGeneratingMemo ? 'Generating...' : 'Investment Memo'}</span>
                                {!investmentMemo && !isGeneratingMemo && (
                                    <Zap className="h-3 w-3 text-yellow-400" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Analysis Report View */}
                {activeAIFeature === 'analysis' && (
                    <EnhancedAnalysisResults
                        analysisData={analysisData}
                        onNewAnalysis={onNewAnalysis}
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                )}

                {/* Competitive Intelligence View */}
                {activeAIFeature === 'competitive' && (
                    <div className="space-y-6">
                        {isLoadingCompetitors ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    AI is Discovering Competitors...
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Using Google Gemini to analyze the competitive landscape
                                </p>
                                <div className="max-w-md mx-auto space-y-2 text-sm text-gray-500">
                                    <p>✓ Identifying direct competitors</p>
                                    <p>✓ Analyzing indirect competitors</p>
                                    <p>✓ Evaluating market positioning</p>
                                    <p>✓ Generating strategic insights</p>
                                </div>
                            </div>
                        ) : competitiveLandscape ? (
                            <CompetitiveLandscape
                                landscape={competitiveLandscape}
                                companyName={companyName}
                            />
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <Target className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Competitive Intelligence Not Loaded
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Click the "Competitive Intelligence" button above to discover and analyze competitors
                                </p>
                                <button
                                    onClick={handleLoadCompetitiveIntelligence}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Load Competitive Intelligence
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Investment Memo View */}
                {activeAIFeature === 'memo' && (
                    <div className="space-y-6">
                        {isGeneratingMemo ? (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    AI is Writing Investment Memo...
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Google Gemini is generating a professional VC-style investment memo
                                </p>
                                <div className="max-w-md mx-auto space-y-2 text-sm text-gray-500">
                                    <p>✓ Executive summary</p>
                                    <p>✓ Market analysis</p>
                                    <p>✓ Financial projections</p>
                                    <p>✓ Risk assessment</p>
                                    <p>✓ Investment recommendation</p>
                                </div>
                            </div>
                        ) : investmentMemo ? (
                            <InvestmentMemoViewer
                                memo={investmentMemo}
                                companyName={companyName}
                            />
                        ) : (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                                <Sparkles className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    Investment Memo Not Generated
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Click the "Investment Memo" button above to generate a professional VC-style memo
                                </p>
                                <button
                                    onClick={handleGenerateInvestmentMemo}
                                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Generate Investment Memo
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Action Buttons for Quick Access */}
            <div className="fixed bottom-8 right-8 flex flex-col space-y-3">
                {activeAIFeature !== 'competitive' && !competitiveLandscape && (
                    <button
                        onClick={handleLoadCompetitiveIntelligence}
                        disabled={isLoadingCompetitors}
                        className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110 disabled:opacity-50"
                        title="Load Competitive Intelligence"
                    >
                        {isLoadingCompetitors ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <Target className="h-6 w-6" />
                        )}
                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Competitive Intelligence
                        </span>
                    </button>
                )}

                {activeAIFeature !== 'memo' && !investmentMemo && (
                    <button
                        onClick={handleGenerateInvestmentMemo}
                        disabled={isGeneratingMemo}
                        className="group relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-110 disabled:opacity-50"
                        title="Generate Investment Memo"
                    >
                        {isGeneratingMemo ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            <Sparkles className="h-6 w-6" />
                        )}
                        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Investment Memo
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
