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
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setCurrentStep('analysis');

    try {
      const formData = new FormData();
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });

      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, progress: 50 })));

      console.log('🚀 Starting AI analysis...');

      const response = await fetch('/api/multi-document-analyze', {
        method: 'POST',
        body: formData,
      });

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
    setViewMode('summary');
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-2 shadow-lg">
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
            </div>
            <div className="text-sm text-gray-500">
              Powered by Google Gemini 2.0 Flash
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Transform Startup Documents<br />
              <span className="text-blue-200">into Investment Insights</span>
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload pitch decks, financial reports, and business documents for AI-powered 
              due diligence analysis and professional investment scoring
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Multi-document Analysis</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium">Investment Scoring</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm font-medium">Risk Assessment</span>
              </div>
            </div>
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

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Upload Area */}
        {currentStep === 'upload' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="relative group">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group-hover:shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileSelect(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                      Drop your startup documents here
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Or <span className="text-blue-600 font-medium cursor-pointer hover:underline">click to browse</span> your files
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-6">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">PDF</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">DOCX</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">PPTX</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">TXT</span>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        <span>AI-powered text extraction</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        <span>Secure processing</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        <span>Real-time analysis</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-4">Maximum file size: 50MB per document</p>
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
                  <div className="mt-8 space-y-3">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Selected Documents</h4>
                    {files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-800">{file.file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    ))}
                    
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || files.length === 0}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-5 w-5" />
                          <span>Analyze Documents with AI</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Progress */}
        {currentStep === 'analysis' && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6"></div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">AI Analysis in Progress</h3>
              <p className="text-gray-600 mb-8">
                Our AI is analyzing your documents to extract key insights and generate investment scores...
              </p>
              
              <div className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <span className="font-medium text-gray-700">{file.file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {file.status === 'processing' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                      {file.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {file.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                      <span className={`text-sm font-medium ${
                        file.status === 'completed' ? 'text-green-600' : 
                        file.status === 'error' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {file.status === 'completed' ? 'Analyzed' : 
                         file.status === 'error' ? 'Failed' : 'Processing...'}
                      </span>
                    </div>
                  </div>
                ))}
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
                        onClick={() => setViewMode('summary')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          viewMode === 'summary'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Summary
                      </button>
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