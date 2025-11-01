'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, TrendingUp, AlertCircle, CheckCircle, Loader2, BarChart3 } from 'lucide-react';
import EnhancedAnalysisResults from './EnhancedAnalysisResults';

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  extractedText?: string;
  documentType?: string;
  errorMessage?: string;
}

interface AnalysisResult {
  success: boolean;
  results?: {
    documentsProcessed: number;
    documentSummaries: Array<{
      filename: string;
      type: string;
      textLength: number;
      confidence: number;
    }>;
    consolidatedData: any;
    analysis: any;
    processingMetadata: {
      processingTime: number;
      documentsProcessed: number;
      totalTextExtracted: number;
      analysisId: string;
      timestamp: string;
    };
  };
  error?: string;
}

export default function MultiDocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'complete'>('upload');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('detailed');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStage, setAnalysisStage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setCurrentStep('analysis');
    setAnalysisProgress(0);
    setAnalysisStage('📄 Extracting text from documents...');

    try {
      const formData = new FormData();
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });

      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, progress: 50 })));

      // Realistic progress updates for ~60 second API response
      // Progress gradually from 0 to 90% over 55 seconds, leaving 10% for final processing
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          // Slow down as we approach 90%
          if (prev >= 90) {
            return prev; // Hold at 90% until API responds
          }
          // Increment by whole numbers only (no decimals)
          if (prev < 30) return Math.min(prev + 2, 30); // Fast start: 2% per 500ms = 7.5s to reach 30%
          if (prev < 60) return Math.min(prev + 1, 60); // Medium: 1% per 500ms = 15s to reach 60%
          if (prev < 80) return Math.min(prev + 1, 80); // Slower: 1% per 500ms = 10s to reach 80%
          return Math.min(prev + 1, 90); // Very slow: 1% per 500ms = 10s to reach 90%
        });
      }, 550); // Update every 550ms

      // Update stages to match realistic API processing time (~60 seconds)
      setTimeout(() => setAnalysisStage('🔍 Extracting data from documents...'), 8000); // 8s
      setTimeout(() => setAnalysisStage('🧠 Analyzing company information with AI...'), 18000); // 18s
      setTimeout(() => setAnalysisStage('📊 Evaluating market opportunity...'), 28000); // 28s
      setTimeout(() => setAnalysisStage('💼 Assessing business model...'), 38000); // 38s
      setTimeout(() => setAnalysisStage('📈 Calculating investment scores...'), 48000); // 48s
      setTimeout(() => setAnalysisStage('✅ Finalizing comprehensive report...'), 56000); // 56s

      console.log('🚀 Starting AI analysis...');

      const response = await fetch('/api/multi-document-analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const result: AnalysisResult = await response.json();

      if (result.success) {
        setFiles(prev => prev.map(f => ({ ...f, status: 'completed' as const, progress: 100 })));
        setAnalysisResult(result);
        setCurrentStep('complete');
        console.log('✅ AI Analysis completed successfully');
      } else {
        setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
        setAnalysisResult(result);
        setCurrentStep('upload');
        console.error('❌ Analysis failed:', result.error);
      }
    } catch (error) {
      console.error('❌ AI Analysis failed:', error);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setCurrentStep('upload');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setAnalysisResult(null);
    setCurrentStep('upload');
    setViewMode('detailed');
    setIsUploading(false);
  };

  const handlePDFDownload = async () => {
    if (!analysisResult?.results) return;

    setIsGeneratingPDF(true);
    try {
      const companyName = analysisResult.results?.consolidatedData?.companyInfo?.name || 'Startup';
      
      console.log('📄 Requesting PDF generation for:', companyName);
      
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisData: analysisResult.results,
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
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity group"
              aria-label="Go to home page"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg group-hover:shadow-xl transition-shadow">
                <img 
                  src="/investIQ.png" 
                  alt="InvestIQ Logo" 
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  InvestIQ
                </h1>
                <p className="text-xs text-gray-500">AI Investment Intelligence</p>
              </div>
            </button>
            <div className="text-sm text-gray-500">
              Powered by Google Gemini 2.0 Flash
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2">AI-Powered Startup Analysis</h2>
            <p className="text-sm text-blue-100">Instant investment scoring and due diligence</p>
          </div>
        </div>
      </div>

      {/* Progress Steps - Modern Design */}
      <div className="bg-white py-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center">
            <div className="flex items-center space-x-12">
              {[
                { step: 'upload', label: 'Upload Documents', icon: Upload, description: 'Select your documents' },
                { step: 'analysis', label: 'AI Analysis', icon: TrendingUp, description: 'Processing insights' },
                { step: 'complete', label: 'Results', icon: CheckCircle, description: 'Investment insights' }
              ].map(({ step, label, icon: Icon, description }, index) => {
                const isActive = currentStep === step;
                const isCompleted = (
                  (currentStep === 'analysis' && step === 'upload') ||
                  (currentStep === 'complete' && ['upload', 'analysis'].includes(step))
                );
                
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center space-y-3">
                      {/* Step Circle */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 text-white shadow-lg' 
                          : isCompleted 
                          ? 'bg-green-500 border-green-400 text-white shadow-md'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive && step === 'analysis' ? 'animate-pulse' : ''}`} />
                      </div>
                      
                      {/* Step Label */}
                      <div className="text-center">
                        <div className={`text-sm font-medium ${
                          isActive ? 'text-gray-900' : isCompleted ? 'text-green-700' : 'text-gray-500'
                        }`}>
                          {label}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {description}
                        </div>
                      </div>
                    </div>
                    
                    {/* Connection Line */}
                    {index < 2 && (
                      <div className={`w-20 h-0.5 transition-colors duration-300 ${
                        (isCompleted || (index === 0 && currentStep !== 'upload')) 
                          ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                          : 'bg-gray-200'
                      }`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Side by Side Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Upload Area - Split Screen Layout */}
        {currentStep === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Side - Title and Key Highlights */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  Transform Startup Documents
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    into Investment Insights
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Upload pitch decks, financial reports, and business documents for AI-powered analysis and professional investment scoring.
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">What You Get:</h3>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Document Analysis</h4>
                    <p className="text-sm text-gray-600">Analyze multiple documents at once for comprehensive insights</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Investment Score (0-100)</h4>
                    <p className="text-sm text-gray-600">Get a data-driven investment score with detailed breakdown</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                    <p className="text-sm text-gray-600">Identify potential risks and red flags automatically</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Sector Benchmarking</h4>
                    <p className="text-sm text-gray-600">Compare against top performers in the sector</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Professional PDF Report</h4>
                    <p className="text-sm text-gray-600">Download a comprehensive investment report</p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>Instant Results</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    <span>AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Upload Feature */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Upload className="h-6 w-6" />
                    <span>Upload Your Documents</span>
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">Start your AI-powered analysis</p>
                </div>
                
                <div className="p-6">
                  <div className="relative group">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group-hover:shadow-lg"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleFileSelect(e.dataTransfer.files);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        Drop files here
                      </h4>
                      <p className="text-gray-600 mb-4">
                        Or <span className="text-blue-600 font-medium cursor-pointer hover:underline">click to browse</span>
                      </p>
                      
                      <div className="flex items-center justify-center space-x-3 text-sm mb-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">PDF</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">DOCX</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">PPTX</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">TXT</span>
                      </div>
                      
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        ⚠️ Total upload size must be less than 4.5MB (Vercel server limitation)
                      </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.docx,.pptx,.txt"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-base font-semibold text-gray-800">Selected Files ({files.length})</h4>
                        {(() => {
                          const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
                          const isWithinLimit = totalSize <= 4.5 * 1024 * 1024;
                          return (
                            <span className={`text-xs font-medium px-3 py-1 rounded-full ${isWithinLimit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {formatFileSize(totalSize)}
                              {isWithinLimit ? ' ✓' : ' (!)'}
                            </span>
                          );
                        })()}
                      </div>
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3 flex-1">
                          <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{file.file.name}</p>
                            <div className="flex items-center space-x-2 text-sm">
                              {file.status === 'error' && file.errorMessage ? (
                                <>
                                  <AlertCircle className="h-3 w-3 text-red-500" />
                                  <span className="text-red-600">{file.errorMessage}</span>
                                </>
                              ) : (
                                <span className="text-gray-500">
                                  {formatFileSize(file.file.size)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors ml-2"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || files.length === 0 || files.some(f => f.status === 'error')}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>
                            {files.some(f => f.status === 'error')
                              ? 'Fix Errors to Continue'
                              : 'Analyze Documents with AI'
                            }
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Progress with Results Preview */}
        {currentStep === 'analysis' && (
          <div className="space-y-6">
            {/* Progress Header - Compact and Sticky */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6 sticky top-0 z-10">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="animate-spin h-10 w-10 border-3 border-white border-t-transparent rounded-full"></div>
                    <div>
                      <h3 className="text-xl font-bold">AI Analysis in Progress</h3>
                      <p className="text-blue-100 text-sm">{analysisStage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{analysisProgress}%</div>
                    <div className="text-xs text-blue-100">Est. {Math.max(1, Math.ceil((100 - analysisProgress) / 10))} min</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-800/50 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${analysisProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-blue-200 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Preview with Loading State */}
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-200">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Investment Analysis Report</h2>
                    <p className="text-gray-600">Generating comprehensive insights from your documents...</p>
                  </div>
                </div>
                
                <div className="p-8 space-y-8">
                  {/* Investment Score Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-gray-200 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Investment Score</h3>
                          <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-center py-6">
                          <div className="h-24 w-24 mx-auto bg-gray-300 rounded-full animate-pulse mb-4"></div>
                          <div className="h-4 w-32 mx-auto bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-gray-200 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                      <div className="relative">
                        <div className="flex items-center justify-center mb-4">
                          <div className="text-4xl">💰</div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-center mb-4">Potential Return</h3>
                        <div className="text-center">
                          <div className="h-10 w-24 mx-auto bg-gray-300 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-32 mx-auto bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-gray-200 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16 animate-pulse"></div>
                      <div className="relative">
                        <div className="flex items-center justify-center mb-4">
                          <div className="text-4xl">⚠️</div>
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-center mb-4">Risk Level</h3>
                        <div className="text-center">
                          <div className="h-10 w-28 mx-auto bg-gray-300 rounded animate-pulse mb-2"></div>
                          <div className="h-3 w-24 mx-auto bg-gray-300 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="border-2 border-blue-100 rounded-2xl p-6 bg-gradient-to-br from-white to-blue-50/30">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="text-2xl">📊</div>
                      <h3 className="text-xl font-bold text-gray-900">Executive Summary</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-11/12"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-10/12"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-9/12"></div>
                    </div>
                  </div>

                  {/* Key Analysis Sections Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key Strengths */}
                    <div className="border-2 border-green-100 rounded-2xl p-6 bg-gradient-to-br from-white to-green-50/30">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="text-xl">📈</div>
                        <h3 className="text-lg font-bold text-gray-900">Key Strengths</h3>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="h-5 w-5 bg-green-300 rounded-full animate-pulse flex-shrink-0 mt-0.5"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-300 rounded animate-pulse w-full"></div>
                              <div className="h-3 bg-gray-300 rounded animate-pulse w-4/5"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Concerns */}
                    <div className="border-2 border-red-100 rounded-2xl p-6 bg-gradient-to-br from-white to-red-50/30">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="text-xl">⚠️</div>
                        <h3 className="text-lg font-bold text-gray-900">Key Concerns</h3>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="h-5 w-5 bg-red-300 rounded-full animate-pulse flex-shrink-0 mt-0.5"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-300 rounded animate-pulse w-full"></div>
                              <div className="h-3 bg-gray-300 rounded animate-pulse w-3/5"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Market Opportunity */}
                    <div className="border-2 border-purple-100 rounded-2xl p-6 bg-gradient-to-br from-white to-purple-50/30">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="text-xl">🌍</div>
                        <h3 className="text-lg font-bold text-gray-900">Market Opportunity</h3>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-3 bg-gray-300 rounded animate-pulse w-full"></div>
                            <div className="h-3 bg-gray-300 rounded animate-pulse w-4/5"></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Competitive Analysis */}
                    <div className="border-2 border-indigo-100 rounded-2xl p-6 bg-gradient-to-br from-white to-indigo-50/30">
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="text-xl">🎯</div>
                        <h3 className="text-lg font-bold text-gray-900">Competitive Analysis</h3>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <div className="h-3 bg-gray-300 rounded animate-pulse w-full"></div>
                            <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Investment Recommendation */}
                  <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="text-2xl">💡</div>
                      <h3 className="text-xl font-bold text-gray-900">Investment Recommendation</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-full"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-11/12"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-10/12"></div>
                    </div>
                  </div>

                  {/* Investment Tip */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl flex-shrink-0">💡</div>
                      <div>
                        <h4 className="font-bold text-lg mb-2">Investment Tip</h4>
                        <p className="text-blue-100 leading-relaxed">
                          {analysisProgress < 30 && "Strong startups typically show clear product-market fit with consistent customer growth and positive unit economics."}
                          {analysisProgress >= 30 && analysisProgress < 60 && "Look for LTV:CAC ratios of 3:1 or higher, indicating sustainable customer acquisition and strong retention metrics."}
                          {analysisProgress >= 60 && analysisProgress < 90 && "Experienced founding teams with domain expertise and complementary skills significantly increase the probability of success."}
                          {analysisProgress >= 90 && "Market timing is critical - entering a rapidly growing market with tailwinds can be as important as the product itself."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {currentStep === 'complete' && analysisResult?.success && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-white" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">Analysis Complete!</h3>
                      <p className="text-green-100">Your investment insights are ready</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex bg-white/20 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('detailed')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'detailed'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Detailed
                      </button>
                      <button
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'summary'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Summary
                      </button>
                    </div>
                    
                    <button
                      onClick={handlePDFDownload}
                      disabled={isGeneratingPDF}
                      className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-white/30"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>
                        {isGeneratingPDF ? 'Generating PDF Report...' : 'Download Professional Report (PDF)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <EnhancedAnalysisResults 
                  analysisData={analysisResult.results} 
                  onNewAnalysis={resetUpload}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
            
            <div className="text-center">
              <button
                onClick={resetUpload}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Analyze New Documents
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {analysisResult?.error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Analysis Failed</h3>
              <p className="text-red-600 mb-8">{analysisResult.error}</p>
              <button
                onClick={resetUpload}
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}