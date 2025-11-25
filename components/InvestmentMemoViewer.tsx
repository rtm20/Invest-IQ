'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface InvestmentMemoViewerProps {
    memo: any;
    companyName: string;
}

export default function InvestmentMemoViewer({ memo, companyName }: InvestmentMemoViewerProps) {
    const [activeSection, setActiveSection] = useState('executive');

    // Grouped sections for better organization
    const sectionGroups = [
        {
            title: 'Overview',
            sections: [
                { id: 'executive', label: 'Executive Summary', icon: '📊' },
                { id: 'highlights', label: 'Key Highlights', icon: '⭐' },
                { id: 'recommendation', label: 'Recommendation', icon: '✅' }
            ]
        },
        {
            title: 'Company Analysis',
            sections: [
                { id: 'company', label: 'Company', icon: '🏢' },
                { id: 'team', label: 'Team', icon: '👥' },
                { id: 'product', label: 'Business & Product', icon: '💼', 
                  content: ['business', 'company'] } // Combined business model with company
            ]
        },
        {
            title: 'Market & Traction',
            sections: [
                { id: 'market', label: 'Market', icon: '📈' },
                { id: 'traction', label: 'Traction', icon: '🚀' }
            ]
        },
        {
            title: 'Financials & Risk',
            sections: [
                { id: 'financial', label: 'Financials', icon: '💰' },
                { id: 'risks', label: 'Risks', icon: '⚠️' }
            ]
        },
        {
            title: 'Investment Details',
            sections: [
                { id: 'thesis', label: 'Thesis', icon: '💡' },
                { id: 'terms', label: 'Deal Terms', icon: '📝' }
            ]
        }
    ];

    const getRecommendationColor = (decision: string) => {
        switch (decision) {
            case 'Strong Invest': return 'bg-green-600 text-white';
            case 'Invest': return 'bg-green-500 text-white';
            case 'Maybe': return 'bg-yellow-500 text-white';
            case 'Reject': case 'Pass': return 'bg-red-500 text-white';
            case 'Strong Reject': case 'Strong Pass': return 'bg-red-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex">
            {/* Vertical Sidebar Navigation */}
            <div className="w-64 bg-gradient-to-b from-indigo-50 to-purple-50 border-r border-indigo-100 p-4 overflow-y-auto max-h-[700px]">
                <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wide mb-4 px-2">
                    Investment Memo
                </h3>
                
                {sectionGroups.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-5">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                            {group.title}
                        </div>
                        <div className="space-y-1">
                            {group.sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center ${
                                        activeSection === section.id
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'text-gray-700 hover:bg-white hover:shadow-sm'
                                    }`}
                                >
                                    <span className="mr-2.5 text-base">{section.icon}</span>
                                    <span className="truncate">{section.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[700px]">{/* Executive Summary */}
                {activeSection === 'executive' && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Executive Summary</h3>
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200 p-8 rounded-2xl shadow-lg">
                            <div className="prose prose-lg max-w-none">
                                {(() => {
                                    // Handle case where executiveSummary might be a JSON string or object
                                    let summaryText = memo.executiveSummary;
                                    
                                    // If it's an object or stringified JSON, try to extract meaningful text
                                    if (typeof summaryText === 'object') {
                                        summaryText = JSON.stringify(summaryText, null, 2);
                                    }
                                    
                                    // Check if it looks like JSON
                                    if (summaryText.trim().startsWith('{') || summaryText.trim().startsWith('[')) {
                                        try {
                                            const parsed = JSON.parse(summaryText);
                                            // If it's an object with an executiveSummary property
                                            if (parsed.executiveSummary) {
                                                summaryText = parsed.executiveSummary;
                                            } else {
                                                // Just display the stringified version formatted
                                                summaryText = JSON.stringify(parsed, null, 2);
                                            }
                                        } catch (e) {
                                            // Not valid JSON, use as is
                                        }
                                    }
                                    
                                    // Split into paragraphs and render
                                    const paragraphs = summaryText.split(/\n\n+/).filter((p: string) => p.trim());
                                    
                                    return paragraphs.map((paragraph: string, idx: number) => {
                                        // Parse markdown bold syntax (**text**) and render as bold
                                        const parts = paragraph.split(/\*\*/);
                                        
                                        return (
                                            <p key={idx} className="text-gray-800 leading-relaxed text-lg font-light mb-4">
                                                {parts.map((part, partIdx) => (
                                                    partIdx % 2 === 1 ? (
                                                        <strong key={partIdx} className="font-bold text-gray-900">{part}</strong>
                                                    ) : (
                                                        <span key={partIdx}>{part}</span>
                                                    )
                                                ))}
                                            </p>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Investment Highlights */}
                {activeSection === 'highlights' && (
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Highlights</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {memo.investmentHighlights?.map((highlight: string, idx: number) => (
                                <div key={idx} className="flex items-start space-x-4 p-5 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-l-4 border-green-500 rounded-r-xl shadow-sm hover:shadow-md transition-all">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                                        {idx + 1}
                                    </div>
                                    <p className="text-gray-800 flex-1 leading-relaxed pt-1">{highlight.replace(/\*\*/g, '')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Company Overview */}
                {activeSection === 'company' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Company Overview</h3>

                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-600 p-6 rounded-r-xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-purple-900 mb-3 text-lg flex items-center">
                                <span className="mr-2">🎯</span> Mission
                            </h4>
                            <p className="text-gray-800 leading-relaxed">{memo.companyOverview.mission.replace(/\*\*/g, '')}</p>
                        </div>

                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-600 p-6 rounded-r-xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-red-900 mb-3 text-lg flex items-center">
                                <span className="mr-2">⚡</span> Problem
                            </h4>
                            <p className="text-gray-800 leading-relaxed">{memo.companyOverview.problem.replace(/\*\*/g, '')}</p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-600 p-6 rounded-r-xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
                                <span className="mr-2">💡</span> Solution
                            </h4>
                            <p className="text-gray-800 leading-relaxed">{memo.companyOverview.solution.replace(/\*\*/g, '')}</p>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600 p-6 rounded-r-xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-green-900 mb-3 text-lg flex items-center">
                                <span className="mr-2">🚀</span> Value Proposition
                            </h4>
                            <p className="text-gray-800 leading-relaxed">{memo.companyOverview.valueProposition.replace(/\*\*/g, '')}</p>
                        </div>
                    </div>
                )}

                {/* Market Analysis */}
                {activeSection === 'market' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Market Analysis</h3>

                        {Object.entries(memo.marketAnalysis).map(([key, value], idx) => (
                            <div key={key} className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-indigo-900 mb-3 text-lg capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-gray-800 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Business Model */}
                {activeSection === 'business' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Model Analysis</h3>

                        {Object.entries(memo.businessModel).map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border border-blue-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-blue-900 mb-3 text-lg capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-gray-800 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Combined Business & Product Section */}
                {activeSection === 'product' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Model & Product</h3>

                        <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-xl mb-5">
                            <h4 className="font-bold text-blue-900 mb-3 text-lg">Business Model</h4>
                            <div className="space-y-3">
                                {Object.entries(memo.businessModel).map(([key, value]) => (
                                    <div key={key}>
                                        <p className="font-semibold text-blue-800 text-sm capitalize mb-1">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </p>
                                        <p className="text-gray-700 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-purple-50 border-l-4 border-purple-600 p-5 rounded-r-xl">
                            <h4 className="font-bold text-purple-900 mb-3 text-lg">Company Overview</h4>
                            <div className="space-y-3">
                                {memo.companyOverview.mission && (
                                    <div>
                                        <p className="font-semibold text-purple-800 text-sm mb-1">Mission</p>
                                        <p className="text-gray-700 leading-relaxed">{memo.companyOverview.mission.replace(/\*\*/g, '')}</p>
                                    </div>
                                )}
                                {memo.companyOverview.valueProposition && (
                                    <div>
                                        <p className="font-semibold text-purple-800 text-sm mb-1">Value Proposition</p>
                                        <p className="text-gray-700 leading-relaxed">{memo.companyOverview.valueProposition.replace(/\*\*/g, '')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Assessment */}
                {activeSection === 'team' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Team Assessment</h3>

                        {Object.entries(memo.teamAssessment).map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border border-orange-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-orange-900 mb-3 text-lg capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-gray-800 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Traction Metrics */}
                {activeSection === 'traction' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Traction & Growth Metrics</h3>

                        {Object.entries(memo.tractionMetrics).map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-green-900 mb-3 text-lg capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-gray-800 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Financial Analysis */}
                {activeSection === 'financial' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Analysis</h3>

                        {Object.entries(memo.financialAnalysis).map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-emerald-900 mb-3 text-lg capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-gray-800 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Risk Assessment */}
                {activeSection === 'risks' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment</h3>

                        <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 p-6 rounded-xl">
                            <h4 className="font-bold text-red-900 mb-4">Key Risks</h4>
                            <ul className="space-y-3">
                                {memo.riskAssessment.keyRisks?.map((risk: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="text-red-600 font-bold mr-3">⚠</span>
                                        <span className="text-gray-700">{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl">
                            <h4 className="font-bold text-blue-900 mb-4">Mitigation Strategies</h4>
                            <ul className="space-y-3">
                                {memo.riskAssessment.mitigationStrategies?.map((strategy: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="text-blue-600 font-bold mr-3">→</span>
                                        <span className="text-gray-700">{strategy}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {memo.riskAssessment.redFlags?.length > 0 && (
                            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 p-6 rounded-xl">
                                <h4 className="font-bold text-yellow-900 mb-4">Red Flags</h4>
                                <ul className="space-y-3">
                                    {memo.riskAssessment.redFlags.map((flag: string, idx: number) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="text-yellow-600 font-bold mr-3">🚩</span>
                                            <span className="text-gray-700">{flag}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Investment Thesis */}
                {activeSection === 'thesis' && (
                    <div className="space-y-5">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Investment Thesis</h3>

                        {Object.entries(memo.investmentThesis).map(([key, value]) => (
                            <div key={key} className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                                <h4 className="font-bold text-purple-900 mb-3 text-lg capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </h4>
                                <p className="text-gray-800 leading-relaxed">{(value as string).replace(/\*\*/g, '')}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Deal Terms */}
                {activeSection === 'terms' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Proposed Deal Terms</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(memo.dealTerms).map(([key, value]) => (
                                <div key={key} className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 p-6 rounded-xl">
                                    <h4 className="font-semibold text-indigo-900 mb-2 text-sm uppercase tracking-wide">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </h4>
                                    <p className="text-gray-900 text-lg font-bold">{value as string}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recommendation */}
                {activeSection === 'recommendation' && (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Final Recommendation</h3>

                        <div className={`${getRecommendationColor(memo.recommendation.decision)} p-10 rounded-2xl shadow-2xl text-center transform hover:scale-105 transition-transform`}>
                            {(() => {
                                const decision = memo.recommendation.decision;
                                if (decision === 'Pass') {
                                    return <XCircle className="h-20 w-20 mx-auto mb-4 animate-pulse" />;
                                } else if (decision === 'Maybe') {
                                    return <AlertCircle className="h-20 w-20 mx-auto mb-4 animate-pulse" />;
                                } else {
                                    return <CheckCircle className="h-20 w-20 mx-auto mb-4 animate-pulse" />;
                                }
                            })()}
                            <div className="text-5xl font-bold mb-3">{memo.recommendation.decision}</div>
                            <div className="text-xl opacity-95">AI Investment Recommendation</div>
                        </div>

                        <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 border border-gray-300 p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-gray-900 mb-3 text-lg">Reasoning</h4>
                            <p className="text-gray-800 leading-relaxed">{memo.recommendation.reasoning.replace(/\*\*/g, '')}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-blue-900 mb-4 text-lg">Next Steps</h4>
                            <ol className="space-y-3">
                                {memo.recommendation.nextSteps?.map((step: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm mr-3">{idx + 1}</span>
                                        <span className="text-gray-800 leading-relaxed pt-0.5">{step.replace(/\*\*/g, '')}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border border-purple-200 p-6 rounded-xl shadow-sm">
                            <h4 className="font-bold text-purple-900 mb-2 text-lg flex items-center">
                                <span className="mr-2">⏱️</span> Timeline
                            </h4>
                            <p className="text-gray-800 text-lg font-medium">{memo.recommendation.timeline.replace(/\*\*/g, '')}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
