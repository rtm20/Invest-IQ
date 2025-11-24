'use client';

import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, AlertTriangle, DollarSign, Users, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { CompetitorProfile, CompetitiveAnalysis } from '@/lib/ai-competitive-intelligence';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

// Local interface for component props (extends the API interface if needed)
interface CompetitorProfileDisplay extends CompetitorProfile {
    // Additional display-only properties can be added here if needed
}

interface CompetitiveLandscapeProps {
    landscape: CompetitiveAnalysis;
    companyName: string;
}

export default function CompetitiveLandscape({ landscape, companyName }: CompetitiveLandscapeProps) {
    const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'direct' | 'indirect' | 'insights'>('direct');

    // Prepare competitive positioning data - 100% REAL from AI
    const competitorPositionData = useMemo(() => {
        if (!landscape.primaryCompetitors || landscape.primaryCompetitors.length === 0) return [];
        
        return landscape.primaryCompetitors.slice(0, 5).map(comp => {
            let positionScore = 0;
            const position = comp.marketPosition?.toLowerCase();
            
            // Map actual AI-determined positions to scores
            if (position === 'leader') positionScore = 100;
            else if (position === 'challenger') positionScore = 75;
            else if (position === 'niche') positionScore = 50;
            else if (position === 'emerging') positionScore = 35;
            
            // Map threat level to numeric value
            let threatScore = 0;
            const threat = comp.threatLevel?.toLowerCase();
            if (threat === 'high') threatScore = 85;
            else if (threat === 'medium') threatScore = 60;
            else if (threat === 'low') threatScore = 35;
            
            return {
                name: comp.name.substring(0, 25),
                marketPosition: positionScore,
                threatLevel: threatScore,
                position: comp.marketPosition,
                threat: comp.threatLevel
            };
        });
    }, [landscape]);

    const getThreatColor = (level: string) => {
        const normalized = level?.toLowerCase();
        switch (normalized) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-300';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getPositionIcon = (position: string) => {
        const normalized = position?.toLowerCase();
        switch (normalized) {
            case 'leader': return '👑';
            case 'challenger': return '⚔️';
            case 'niche': 
            case 'niche player': return '🎯';
            case 'emerging': return '🌱';
            default: return '📊';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Simplified Header - No redundant title */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">
                            Discovered <span className="font-semibold text-purple-600">{landscape.marketLandscape?.totalCompetitors || landscape.primaryCompetitors?.length || 0} competitors</span> • Analyzed market positioning
                        </p>
                    </div>
                    <div className="bg-purple-100 rounded-lg px-4 py-2">
                        <div className="text-purple-600 text-xs font-medium">Market Leader</div>
                        <div className="text-purple-900 text-sm font-bold">
                            {landscape.primaryCompetitors?.[0]?.name || 'No Clear Leader'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-8">
                    {[
                        { id: 'direct', label: 'Primary Competitors', count: landscape.primaryCompetitors?.length || 0 },
                        { id: 'indirect', label: 'Market Insights', icon: '📊' },
                        { id: 'insights', label: 'Strategic Insights', icon: '💡' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                    ? 'border-purple-600 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.label} {tab.count !== undefined && `(${tab.count})`} {tab.icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-8">
                {/* Direct Competitors */}
                {activeTab === 'direct' && (
                    <div className="space-y-4">
                        {landscape.primaryCompetitors?.map((competitor: CompetitorProfile, idx: number) => (
                            <div key={idx} className="border-2 border-purple-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                                <div
                                    className="p-6 cursor-pointer bg-gradient-to-r from-white to-purple-50"
                                    onClick={() => setExpandedCompetitor(expandedCompetitor === competitor.name ? null : competitor.name)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-2xl">{getPositionIcon(competitor.marketPosition)}</span>
                                                <h4 className="text-xl font-bold text-gray-900">{competitor.name}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getThreatColor(competitor.threatLevel)}`}>
                                                    {competitor.threatLevel} Threat
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                    {competitor.marketPosition}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-3">{competitor.description}</p>
                                            <div className="flex items-center space-x-6 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium text-gray-700">{competitor.fundingAmount || 'Unknown'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                    <span className="font-medium text-gray-700">{competitor.teamSize || 'Unknown'}</span>
                                                </div>
                                                {competitor.foundedYear && competitor.foundedYear !== 'Unknown' && (
                                                    <div className="text-gray-500">Founded {competitor.foundedYear}</div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="ml-4">
                                            {expandedCompetitor === competitor.name ? (
                                                <ChevronUp className="h-6 w-6 text-purple-600" />
                                            ) : (
                                                <ChevronDown className="h-6 w-6 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedCompetitor === competitor.name && (
                                    <div className="px-6 pb-6 bg-white border-t border-purple-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                            {/* Strengths */}
                                            <div>
                                                <h5 className="font-semibold text-green-700 mb-3 flex items-center">
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    Strengths
                                                </h5>
                                                <ul className="space-y-2">
                                                    {competitor.strengths.map((strength, i) => (
                                                        <li key={i} className="flex items-start text-sm">
                                                            <span className="text-green-500 mr-2">✓</span>
                                                            <span className="text-gray-700">{strength}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Weaknesses */}
                                            <div>
                                                <h5 className="font-semibold text-red-700 mb-3 flex items-center">
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    Weaknesses
                                                </h5>
                                                <ul className="space-y-2">
                                                    {competitor.weaknesses.map((weakness, i) => (
                                                        <li key={i} className="flex items-start text-sm">
                                                            <span className="text-red-500 mr-2">✗</span>
                                                            <span className="text-gray-700">{weakness}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Key Differentiators */}
                                        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <h5 className="font-semibold text-purple-900 mb-3">
                                                🎯 How {competitor.name} Differentiates
                                            </h5>
                                            <ul className="space-y-2">
                                                {competitor.keyDifferentiators?.map((diff: string, i: number) => (
                                                    <li key={i} className="flex items-start text-sm">
                                                        <span className="text-purple-600 mr-2">→</span>
                                                        <span className="text-gray-700">{diff}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Website and Funding Info */}
                                        {(competitor.website || competitor.fundingStage) && (
                                            <div className="mt-4">
                                                {competitor.website && competitor.website !== 'Unknown' && (
                                                    <div className="mb-2">
                                                        <span className="text-sm font-semibold text-gray-700">Website: </span>
                                                        <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                                                            {competitor.website}
                                                        </a>
                                                    </div>
                                                )}
                                                {competitor.fundingStage && competitor.fundingStage !== 'Unknown' && (
                                                    <div>
                                                        <span className="text-sm font-semibold text-gray-700">Funding Stage: </span>
                                                        <span className="text-sm text-gray-600">{competitor.fundingStage}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Market Positioning */}
                {activeTab === 'indirect' && (
                    <div className="space-y-6">
                {/* Competitive Positioning Bar Chart - 100% Real AI Data */}
                        {competitorPositionData.length > 0 && (
                            <div className="bg-white border-2 border-purple-200 rounded-xl p-6">
                                <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                                    <span className="mr-2">📊</span>
                                    Competitive Positioning Analysis
                                </h4>
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={competitorPositionData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} />
                                        <YAxis 
                                            type="category" 
                                            dataKey="name" 
                                            width={120}
                                            tick={{ fill: '#374151', fontSize: 11 }}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value: any, name: string) => {
                                                if (name === 'marketPosition') return [value, 'Market Position Score'];
                                                if (name === 'threatLevel') return [value, 'Threat Level Score'];
                                                return [value, name];
                                            }}
                                        />
                                        <Legend />
                                        <Bar 
                                            dataKey="marketPosition" 
                                            name="Market Position" 
                                            fill="#8b5cf6"
                                            radius={[0, 8, 8, 0]}
                                        />
                                        <Bar 
                                            dataKey="threatLevel" 
                                            name="Competitive Threat" 
                                            fill="#f59e0b"
                                            radius={[0, 8, 8, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <p className="font-semibold text-purple-900 mb-1">Market Position:</p>
                                        <p className="text-gray-600">Leader (100) &gt; Challenger (75) &gt; Niche (50) &gt; Emerging (35)</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-orange-900 mb-1">Threat Level:</p>
                                        <p className="text-gray-600">High (85) &gt; Medium (60) &gt; Low (35)</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    Based on AI analysis of competitor positions and threat assessment
                                </p>
                            </div>
                        )}

                        {landscape.marketPositioning && (
                            <>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                                    <h4 className="text-lg font-bold text-blue-900 mb-3">Your Market Position</h4>
                                    <p className="text-gray-700 text-base">{landscape.marketPositioning.yourPosition}</p>
                                </div>
                                
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                                    <h4 className="text-lg font-bold text-green-900 mb-4">Competitive Advantages</h4>
                                    <ul className="space-y-2">
                                        {landscape.marketPositioning.competitiveAdvantages?.map((advantage: string, idx: number) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-green-600 font-bold mr-3">✓</span>
                                                <span className="text-gray-700">{advantage}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
                                    <h4 className="text-lg font-bold text-orange-900 mb-4">Vulnerabilities to Address</h4>
                                    <ul className="space-y-2">
                                        {landscape.marketPositioning.vulnerabilities?.map((vuln: string, idx: number) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="text-orange-600 font-bold mr-3">⚠</span>
                                                <span className="text-gray-700">{vuln}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                                    <h4 className="text-lg font-bold text-purple-900 mb-3">Recommended Strategy</h4>
                                    <p className="text-gray-700 text-base">{landscape.marketPositioning.recommendedStrategy}</p>
                                </div>
                            </>
                        )}
                        {landscape.primaryCompetitors?.slice(0, 3).map((competitor: CompetitorProfile, idx: number) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-2xl">{getPositionIcon(competitor.marketPosition)}</span>
                                            <h4 className="text-lg font-bold text-gray-900">{competitor.name}</h4>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getThreatColor(competitor.threatLevel)}`}>
                                                {competitor.threatLevel} Threat
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{competitor.description}</p>
                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                            <span>{competitor.fundingAmount || 'Unknown funding'}</span>
                                            {competitor.teamSize && competitor.teamSize !== 'Unknown' && (
                                                <>
                                                    <span>•</span>
                                                    <span>{competitor.teamSize}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Strategic Insights */}
                {activeTab === 'insights' && (
                    <div className="space-y-6">
                        {/* Strategic Insights */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center">
                                <Award className="h-5 w-5 mr-2" />
                                Strategic Insights & Recommendations
                            </h4>
                            <ol className="space-y-3">
                                {landscape.insights?.map((insight: string, idx: number) => (
                                    <li key={idx} className="flex items-start">
                                        <span className="text-purple-600 font-bold mr-3 text-lg">{idx + 1}.</span>
                                        <span className="text-gray-700">{insight}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Market Landscape */}
                        {landscape.marketLandscape && (
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                                    <Target className="h-5 w-5 mr-2" />
                                    Market Landscape Analysis
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Total Competitors</div>
                                        <div className="text-2xl font-bold text-blue-600">{landscape.marketLandscape.totalCompetitors}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Market Concentration</div>
                                        <div className="text-2xl font-bold text-blue-600 capitalize">{landscape.marketLandscape.marketConcentration}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Barrier to Entry</div>
                                        <div className="text-2xl font-bold text-blue-600 capitalize">{landscape.marketLandscape.barrierToEntry}</div>
                                    </div>
                                    <div className="bg-white rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Market Trend</div>
                                        <div className="text-2xl font-bold text-blue-600 capitalize">{landscape.marketLandscape.marketTrend}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
