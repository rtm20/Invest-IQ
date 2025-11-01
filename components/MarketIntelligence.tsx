'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, MapPin, DollarSign, Rocket, Activity, Globe, AlertCircle } from 'lucide-react';

interface MarketStats {
  location: string;
  hotSectors: string[];
  avgSeriesA: string;
  recentExits: number;
  marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  fundingVelocity: string;
  news: Array<{ headline: string; summary: string; source?: string }>;
  dataSource?: string;
}

export default function MarketIntelligence() {
  const [marketData, setMarketData] = useState<MarketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRealMarketData() {
      try {
        setLoading(true);
        
        // Get user location from IP
        let locationData = { city: 'Global' };
        try {
          const locationResponse = await fetch('https://ipapi.co/json/');
          locationData = await locationResponse.json();
        } catch (err) {
          console.log('Location detection skipped');
        }
        
        // Get funding statistics from our backend
        const fundingResponse = await fetch('/api/funding-stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sector: 'technology' })
        });
        const fundingData = await fundingResponse.json();
        
        // Get market news from our secure backend proxy
        const newsResponse = await fetch('/api/market-news?category=technology');
        const newsData = await newsResponse.json();
        
        if (fundingData.success) {
          setMarketData({
            location: locationData.city || 'Global',
            hotSectors: fundingData.data.hotSubSectors || [],
            avgSeriesA: fundingData.data.avgSeriesA || 'N/A',
            recentExits: fundingData.data.recentExits || 0,
            marketSentiment: 'Neutral',
            fundingVelocity: fundingData.data.fundingVelocity || 'N/A',
            news: newsData.success ? newsData.news : [],
            dataSource: fundingData.data.source
          });
        } else {
          // If funding stats fail, still show what we can
          setMarketData({
            location: locationData.city || 'Global',
            hotSectors: [],
            avgSeriesA: 'N/A',
            recentExits: 0,
            marketSentiment: 'Neutral',
            fundingVelocity: 'N/A',
            news: newsData.success ? newsData.news : [],
            dataSource: 'Live Market Data'
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Market data fetch error:', err);
        setError('Unable to fetch live market data');
        setLoading(false);
      }
    }
    
    fetchRealMarketData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading live market data...</span>
        </div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          <h3 className="text-xl font-bold text-gray-900">Market Intelligence</h3>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-sm text-gray-700">
            Live market data temporarily unavailable. This feature requires API access to real-time market intelligence providers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Globe className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Live Market Pulse</h3>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{marketData.location}</span>
        </div>
      </div>

      {/* Market Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Hot Sectors */}
        {marketData.hotSectors.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-800 uppercase">Hot Sectors</span>
            </div>
            <div className="space-y-1">
              {marketData.hotSectors.map((sector, idx) => (
                <div key={idx} className="text-sm font-medium text-gray-800">{sector}</div>
              ))}
            </div>
          </div>
        )}

        {/* Average Series A */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold text-green-800 uppercase">Avg Series A</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{marketData.avgSeriesA}</div>
        </div>

        {/* Recent Exits */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Rocket className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-800 uppercase">Recent Exits</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{marketData.recentExits}</div>
          <div className="text-xs text-gray-600 mt-1">This quarter</div>
        </div>

        {/* Funding Velocity */}
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-800 uppercase">Velocity</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{marketData.fundingVelocity}</div>
          <div className="text-xs text-gray-600 mt-1">vs last quarter</div>
        </div>
      </div>

      {/* Trending News */}
      {marketData.news.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <span>📰</span>
            <span>Latest Market News</span>
          </h4>
          <div className="space-y-2">
            {marketData.news.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-sm">
                <span className="text-blue-600">•</span>
                <p className="text-gray-700">{item.headline}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Source Attribution */}
      {marketData.dataSource && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Data Source: {marketData.dataSource} • Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
