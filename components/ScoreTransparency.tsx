'use client';

import React, { useState } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
  factors: Array<{
    name: string;
    points: number;
    maxPoints: number;
    achieved: boolean;
    description: string;
  }>;
}

interface ScoreTransparencyProps {
  overallScore: number;
  breakdown: ScoreBreakdown[];
  industryAverage?: number;
}

export default function ScoreTransparency({ overallScore, breakdown, industryAverage = 70 }: ScoreTransparencyProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Info className="h-6 w-6 text-blue-600" />
          <h3 className="text-2xl font-bold text-gray-900">Investment Score Calculation</h3>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Overall Investment Score</h4>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-bold text-blue-600">{overallScore}</span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">vs Industry Avg</div>
            <div className={`text-2xl font-bold ${overallScore > industryAverage ? 'text-green-600' : 'text-gray-600'}`}>
              {overallScore > industryAverage ? '+' : ''}{(overallScore - industryAverage).toFixed(0)}
              {overallScore > industryAverage && ' ⬆️'}
            </div>
          </div>
        </div>
        
        {/* Star Rating */}
        <div className="mt-4 flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-2xl">
              {i < Math.floor(overallScore / 20) ? '⭐' : '☆'}
            </span>
          ))}
          <span className="ml-3 text-sm text-gray-600">
            {overallScore >= 80 ? 'Strong Invest' : overallScore >= 60 ? 'Consider' : 'Reject'}
          </span>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Score Breakdown</h4>
        
        {breakdown.map((category) => {
          const isExpanded = expandedCategory === category.category;
          const percentage = (category.score / category.maxScore) * 100;
          
          return (
            <div key={category.category} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.category)}
                className="w-full p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-semibold text-gray-800">{category.category}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      Weight: {category.weight}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-2xl font-bold ${getScoreColor(category.score, category.maxScore)}`}>
                      {category.score}/{category.maxScore}
                    </span>
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${getProgressColor(category.score, category.maxScore)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-5 bg-white border-t border-gray-200">
                  <div className="space-y-3">
                    {category.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-lg ${factor.achieved ? 'text-green-600' : 'text-gray-400'}`}>
                              {factor.achieved ? '✓' : '○'}
                            </span>
                            <span className="font-medium text-gray-800">{factor.name}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-7">{factor.description}</p>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`font-semibold ${factor.achieved ? 'text-green-600' : 'text-gray-400'}`}>
                            {factor.achieved ? '+' : ''}{factor.points}/{factor.maxPoints} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weightage Explanation */}
      <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <h4 className="font-semibold text-gray-800 mb-4">Score Component Weights</h4>
        <div className="space-y-2">
          {breakdown.map((cat) => (
            <div key={cat.category} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{cat.category}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${cat.weight}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-800 w-12 text-right">{cat.weight}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Methodology Note */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Methodology:</strong> Our investment scoring algorithm analyzes multiple dimensions including team quality, market opportunity, 
          product innovation, traction metrics, financial health, and competitive advantages. Each factor is weighted based on its correlation 
          with successful startup outcomes from historical data. Scores are normalized against industry benchmarks and adjusted for stage-specific expectations.
        </p>
      </div>
    </div>
  );
}
