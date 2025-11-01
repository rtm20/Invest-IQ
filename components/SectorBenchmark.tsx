'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, AlertCircle, Loader2 } from 'lucide-react';

interface SectorBenchmarkProps {
  sector: string;
  companyName: string;
  companyMetrics: {
    fundingRaised: string;
    valuation: string;
    revenueGrowth: string;
    employees: number;
  };
}

export default function SectorBenchmark({ sector, companyName, companyMetrics }: SectorBenchmarkProps) {
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    async function fetchCompetitors() {
      try {
        setDebugInfo(`Calling API with sector: ${sector}, company: ${companyName}`);
        console.log('🔍 Fetching competitors for:', { sector, companyName });
        
        const response = await fetch('/api/competitor-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry: sector, companyName })
        });
        
        const data = await response.json();
        console.log('📊 API Response:', data);
        setDebugInfo(`API Status: ${response.status}, Success: ${data.success}, Competitors: ${data.competitors?.length || 0}`);
        
        if (data.success && data.competitors) {
          setCompetitors(data.competitors);
        } else if (data.error) {
          setError(data.details || data.message || data.error);
        }
      } catch (err) {
        console.error('❌ Failed to fetch competitors:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setDebugInfo(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCompetitors();
  }, [sector, companyName]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 border border-gray-200">
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600 mt-4">Searching for competitors using Google...</span>
          {debugInfo && (
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded max-w-md">
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mt-6 border-2 border-orange-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <h3 className="text-2xl font-bold text-gray-900">Sector Benchmarking</h3>
          </div>
          <p className="text-gray-600">Compare with top performers in {sector}</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-lg">
          <div className="text-xs text-gray-600">Your Sector</div>
          <div className="text-sm font-semibold text-blue-600">{sector}</div>
        </div>
      </div>

      {/* Your Company Card */}
      <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-300">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Your Startup</div>
            <h4 className="text-xl font-bold text-gray-900">{companyName}</h4>
          </div>
          <div className="text-4xl">🎯</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Funding</div>
            <div className="text-lg font-semibold text-gray-800">{companyMetrics.fundingRaised}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Valuation</div>
            <div className="text-lg font-semibold text-gray-800">{companyMetrics.valuation}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Growth</div>
            <div className="text-lg font-semibold text-green-600">{companyMetrics.revenueGrowth}</div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Team Size</div>
            <div className="text-lg font-semibold text-gray-800">{companyMetrics.employees}</div>
          </div>
        </div>
      </div>

      {/* Results */}
      {competitors.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Found {competitors.length} Competitors via Google Search</h4>
          {competitors.map((comp: any, idx: number) => (
            <div key={idx} className="p-4 border-2 border-gray-200 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">{comp.name}</div>
              <div className="text-sm text-gray-600">{comp.keyHighlight}</div>
              <div className="mt-2 flex gap-4 text-xs">
                <span>💰 {comp.fundingRaised}</span>
                <span>📊 {comp.valuation}</span>
                <span>👥 {comp.employees}</span>
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-4">
            Data source: Google Custom Search + Gemini AI Analysis
          </div>
        </div>
      ) : (
        <div className="p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <div className="flex items-start space-x-3">
            <Trophy className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Competitive Analysis</h4>
              <p className="text-sm text-gray-700 mb-3">
                No competitors found via Google Search. To enable competitive benchmarking:
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Set up Google Custom Search API (100 free queries/day)</li>
                <li>• Or upload competitor pitch decks for AI-powered document comparison</li>
                <li>• All data from real sources - no fake information</li>
              </ul>
              {error && (
                <div className="mt-4 p-3 bg-red-50 rounded text-xs text-red-700 border border-red-200">
                  <strong>Error:</strong> {error}
                </div>
              )}
              {debugInfo && (
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                  {debugInfo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
