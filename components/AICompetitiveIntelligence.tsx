'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';

interface CompetitorProfile {
  name: string;
  description: string;
  website?: string;
  fundingStage?: string;
  fundingAmount?: string;
  foundedYear?: string;
  teamSize?: string;
  keyDifferentiators: string[];
  strengths: string[];
  weaknesses: string[];
  marketPosition: 'leader' | 'challenger' | 'niche' | 'emerging';
  threatLevel: 'high' | 'medium' | 'low';
}

interface CompetitiveAnalysisData {
  primaryCompetitors: CompetitorProfile[];
  marketPositioning: {
    yourPosition: string;
    competitiveAdvantages: string[];
    vulnerabilities: string[];
    recommendedStrategy: string;
  };
  marketLandscape: {
    totalCompetitors: number;
    marketConcentration: 'fragmented' | 'consolidated' | 'emerging';
    barrierToEntry: 'high' | 'medium' | 'low';
    marketTrend: 'growing' | 'stable' | 'declining';
  };
  insights: string[];
  timestamp: string;
}

interface Props {
  companyName: string;
  industry: string;
  productDescription: string;
  targetMarket: string;
  onAnalysisComplete?: (analysis: CompetitiveAnalysisData) => void;
}

export default function AICompetitiveIntelligence({
  companyName,
  industry,
  productDescription,
  targetMarket,
  onAnalysisComplete,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompetitiveAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeCompetitors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/competitive-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industry,
          productDescription,
          targetMarket,
        }),
      });

      if (!response.ok) {
        throw new Error('Competitive analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'leader':
        return 'default';
      case 'challenger':
        return 'secondary';
      case 'niche':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            AI-Powered Competitive Intelligence
          </CardTitle>
          <CardDescription>
            Automatically discover and analyze competitors using Google Search + Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={analyzeCompetitors}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Competitive Landscape...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Run Competitive Analysis
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Market Landscape Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Market Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Total Competitors</div>
                  <div className="text-2xl font-bold">
                    {analysis.marketLandscape.totalCompetitors}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Market Type</div>
                  <div className="text-2xl font-bold capitalize">
                    {analysis.marketLandscape.marketConcentration}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Barrier to Entry</div>
                  <div className="text-2xl font-bold capitalize">
                    {analysis.marketLandscape.barrierToEntry}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Market Trend</div>
                  <div className="text-2xl font-bold capitalize">
                    {analysis.marketLandscape.marketTrend}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Positioning */}
          <Card>
            <CardHeader>
              <CardTitle>Your Competitive Position</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">Market Position</div>
                <p className="text-gray-900">{analysis.marketPositioning.yourPosition}</p>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Competitive Advantages</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.marketPositioning.competitiveAdvantages.map((advantage, i) => (
                    <Badge key={i} variant="default">
                      {advantage}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Vulnerabilities</div>
                <div className="flex flex-wrap gap-2">
                  {analysis.marketPositioning.vulnerabilities.map((vulnerability, i) => (
                    <Badge key={i} variant="destructive">
                      {vulnerability}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-2">Recommended Strategy</div>
                <p className="text-gray-900">{analysis.marketPositioning.recommendedStrategy}</p>
              </div>
            </CardContent>
          </Card>

          {/* Competitor Profiles */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Competitor Profiles</h3>
            {analysis.primaryCompetitors.map((competitor, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{competitor.name}</CardTitle>
                      <CardDescription>{competitor.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPositionColor(competitor.marketPosition)}>
                        {competitor.marketPosition}
                      </Badge>
                      <Badge variant={getThreatColor(competitor.threatLevel)}>
                        {competitor.threatLevel} threat
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {competitor.website && (
                    <div>
                      <span className="text-sm text-gray-500">Website: </span>
                      <a
                        href={competitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {competitor.website}
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {competitor.fundingStage && (
                      <div>
                        <span className="text-gray-500">Stage: </span>
                        <span className="font-medium">{competitor.fundingStage}</span>
                      </div>
                    )}
                    {competitor.fundingAmount && (
                      <div>
                        <span className="text-gray-500">Funding: </span>
                        <span className="font-medium">{competitor.fundingAmount}</span>
                      </div>
                    )}
                    {competitor.foundedYear && (
                      <div>
                        <span className="text-gray-500">Founded: </span>
                        <span className="font-medium">{competitor.foundedYear}</span>
                      </div>
                    )}
                    {competitor.teamSize && (
                      <div>
                        <span className="text-gray-500">Team: </span>
                        <span className="font-medium">{competitor.teamSize}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Strengths</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Weaknesses</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm font-medium mb-2">Key Differentiators</div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {competitor.keyDifferentiators.map((diff, i) => (
                          <li key={i}>• {diff}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Strategic Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.insights.map((insight, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
