'use client';

import { useState } from 'react';

interface CompressionStats {
  fileName: string;
  fileType: string;
  originalSizeMB: string;
  compressedSizeMB: string;
  compressionRatio: string;
  compressionMethod: string;
  spaceSavedMB: string;
  spaceSavedPercent: string;
  compressionTimeMs: number;
  wasCompressed: boolean;
  underLimit: boolean;
  googleVisionAPILimit: string;
}

export default function TestCompressionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    compressionStats?: CompressionStats;
    message?: string;
    error?: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const testCompression = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/test-compression', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2">
            🗜️ File Compression Test
          </h1>
          <p className="text-blue-200 mb-8">
            Upload a file to see how our compression system optimizes it for Google Cloud Vision API
          </p>

          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                Select a file to test
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff"
                className="block w-full text-sm text-gray-300
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-500 file:text-white
                  hover:file:bg-blue-600
                  file:cursor-pointer cursor-pointer"
              />
              {file && (
                <p className="mt-2 text-sm text-green-300">
                  ✓ Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Test Button */}
            <button
              onClick={testCompression}
              disabled={!file || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 
                hover:from-blue-600 hover:to-purple-700 
                disabled:from-gray-500 disabled:to-gray-600
                text-white font-semibold py-3 px-6 rounded-lg
                transition-all duration-200 transform hover:scale-105
                disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? '🔄 Testing Compression...' : '🧪 Test Compression'}
            </button>

            {/* Results */}
            {result && (
              <div className="mt-6 space-y-4">
                {result.success && result.compressionStats ? (
                  <>
                    {/* Success Message */}
                    <div className={`p-4 rounded-lg ${
                      result.compressionStats.wasCompressed 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-blue-500/20 border border-blue-500/50'
                    }`}>
                      <p className="text-white font-medium">{result.message}</p>
                    </div>

                    {/* Compression Stats */}
                    <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                      <h3 className="text-xl font-semibold text-white mb-4">
                        📊 Compression Statistics
                      </h3>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Original Size */}
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-blue-200">Original Size</p>
                          <p className="text-2xl font-bold text-white">
                            {result.compressionStats.originalSizeMB} MB
                          </p>
                        </div>

                        {/* Compressed Size */}
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-green-200">Compressed Size</p>
                          <p className="text-2xl font-bold text-green-400">
                            {result.compressionStats.compressedSizeMB} MB
                          </p>
                        </div>

                        {/* Space Saved */}
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-purple-200">Space Saved</p>
                          <p className="text-2xl font-bold text-purple-400">
                            {result.compressionStats.spaceSavedPercent}%
                          </p>
                          <p className="text-xs text-gray-400">
                            ({result.compressionStats.spaceSavedMB} MB)
                          </p>
                        </div>

                        {/* Compression Ratio */}
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-yellow-200">Compression Ratio</p>
                          <p className="text-2xl font-bold text-yellow-400">
                            {result.compressionStats.compressionRatio}x
                          </p>
                        </div>
                      </div>

                      {/* Method and Details */}
                      <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Method:</span>
                          <span className="text-white font-medium">
                            {result.compressionStats.compressionMethod}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Processing Time:</span>
                          <span className="text-white font-medium">
                            {result.compressionStats.compressionTimeMs}ms
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">API Limit:</span>
                          <span className="text-white font-medium">
                            {result.compressionStats.googleVisionAPILimit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Under Limit:</span>
                          <span className={`font-medium ${
                            result.compressionStats.underLimit 
                              ? 'text-green-400' 
                              : 'text-red-400'
                          }`}>
                            {result.compressionStats.underLimit ? '✅ Yes' : '❌ No'}
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress Bar */}
                      {result.compressionStats.wasCompressed && (
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-gray-300 mb-2">Compression Progress</p>
                          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-500"
                              style={{ width: `${result.compressionStats.spaceSavedPercent}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1 text-right">
                            Reduced by {result.compressionStats.spaceSavedPercent}%
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-200">
                      ❌ Error: {result.error || 'Unknown error occurred'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-200 mb-2">ℹ️ About Compression</h4>
            <ul className="text-sm text-blue-100 space-y-1">
              <li>• Google Cloud Vision API has a 4.5 MB limit for inline content</li>
              <li>• Our system automatically compresses files over 4 MB</li>
              <li>• PDFs are optimized, images are resized and quality-adjusted</li>
              <li>• Text content is preserved - no information loss</li>
              <li>• Compression happens automatically during document analysis</li>
            </ul>
          </div>
        </div>

        {/* Console Log Instructions */}
        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-sm text-gray-300">
            💡 <strong>Pro Tip:</strong> Open your browser's Developer Console (F12) to see detailed 
            compression logs from both the client and server side.
          </p>
        </div>
      </div>
    </div>
  );
}
