'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, FileText, TrendingUp, AlertCircle, CheckCircle, Loader2, BarChart3, Building2 } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'analysis' | 'complete'>('upload');
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
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
    setCurrentStep('processing');

    try {
      // Create FormData
      const formData = new FormData();
      files.forEach(fileItem => {
        formData.append('files', fileItem.file);
      });

      // Update files to processing status
      setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, progress: 50 })));

      console.log('🚀 Uploading files for analysis...');

      // Send to multi-document analysis API
      const response = await fetch('/api/multi-document-analyze', {
        method: 'POST',
        body: formData,
      });

      const result: AnalysisResult = await response.json();

      if (result.success) {
        setFiles(prev => prev.map(f => ({ ...f, status: 'completed' as const, progress: 100 })));
        setAnalysisResult(result);
        setCurrentStep('complete');
        console.log('✅ Analysis completed successfully');
      } else {
        setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
        setAnalysisResult(result);
        setCurrentStep('analysis');
        console.error('❌ Analysis failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      setAnalysisResult({
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      setCurrentStep('analysis');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setFiles([]);
    setAnalysisResult(null);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="h-5 w-5 text-blue-500" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <div className="h-2 w-2 bg-gray-400 rounded-full" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-2 w-2 bg-gray-400 rounded-full" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRecommendationColor = (recommendation: string | undefined | null) => {
    const rec = typeof recommendation === 'string' ? recommendation.toLowerCase() : '';
    switch (rec) {
      case 'invest': return 'text-green-600 bg-green-50 border-green-200';
      case 'maybe': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'pass': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  AI Startup Analyst
                </h1>
                <p className="text-sm text-gray-600 font-medium">Powered by Google Gemini 2.5 Pro</p>
              </div>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Upload multiple documents for <span className="text-blue-600 font-semibold">comprehensive AI-powered startup evaluation</span> 
              with investment-grade analysis and insights
            </p>
            <div className="flex justify-center items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Real-time AI Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Multi-document Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Investment Grade Reports</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Progress Steps */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 rounded-full">
            <div className={`h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out ${
              currentStep === 'upload' ? 'w-0' :
              currentStep === 'processing' ? 'w-1/4' :
              currentStep === 'analysis' ? 'w-1/2' :
              currentStep === 'complete' ? 'w-full' : 'w-0'
            }`}></div>
          </div>
          
          {/* Progress Steps */}
          <div className="relative flex justify-between">
            {[
              { step: 'upload', label: 'Upload Documents', icon: Upload, color: 'blue' },
              { step: 'processing', label: 'Processing', icon: Loader2, color: 'purple' },
              { step: 'analysis', label: 'AI Analysis', icon: TrendingUp, color: 'indigo' },
              { step: 'complete', label: 'Results', icon: CheckCircle, color: 'green' }
            ].map(({ step, label, icon: Icon, color }, index) => {
              const isActive = currentStep === step;
              const isCompleted = ['processing', 'analysis', 'complete'].includes(currentStep) && 
                               ['upload', 'processing', 'analysis'].slice(0, index).every(s => s !== currentStep);
              
              return (
                <div key={step} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-br from-${color}-500 to-${color}-600 text-white scale-110 shadow-${color}-500/30` 
                      : isCompleted 
                      ? `bg-gradient-to-br from-green-500 to-green-600 text-white`
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    <Icon className={`h-5 w-5 ${isActive && step === 'processing' ? 'animate-spin' : ''}`} />
                  </div>
                  <div className={`mt-3 text-center transition-all duration-300 ${
                    isActive ? `text-${color}-700 font-semibold` : 
                    isCompleted ? 'text-green-700 font-medium' : 'text-gray-500'
                  }`}>
                    <div className="text-sm font-medium">{label}</div>
                    {isActive && (
                      <div className="text-xs text-gray-500 mt-1">
                        {step === 'upload' && 'Select your documents'}
                        {step === 'processing' && 'Extracting content...'}
                        {step === 'analysis' && 'AI analyzing data...'}
                        {step === 'complete' && 'Analysis ready'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Upload Area */}
      {currentStep === 'upload' && (
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          {/* Premium File Drop Zone */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div
              className="relative bg-white/70 backdrop-blur-lg border-2 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-blue-400 hover:bg-white/80 transition-all duration-300 cursor-pointer group-hover:shadow-2xl group-hover:scale-[1.02]"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileSelect(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg mb-6">
                <Upload className="h-10 w-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Drop your startup documents here
              </h3>
              <p className="text-lg text-gray-600 mb-4 max-w-md mx-auto">
                Or <span className="text-blue-600 font-semibold cursor-pointer hover:underline">click to browse</span> your files
              </p>
              
              {/* Supported Formats */}
              <div className="flex justify-center space-x-4 mb-6">
                {['PDF', 'DOCX', 'PPTX', 'TXT'].map((format) => (
                  <div key={format} className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                    {format}
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>✨ AI-powered text extraction • 🔒 Secure processing • ⚡ Real-time analysis</p>
                <p>Maximum file size: 50MB per document</p>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.txt"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {/* Modern File List */}
          {files.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-6 w-6 text-blue-500 mr-2" />
                  Selected Documents ({files.length})
                </h4>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Total: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="group relative bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 hover:text-red-600"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {getFileIcon(fileItem.file.name)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate text-sm mb-1">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          {formatFileSize(fileItem.file.size)}
                        </p>
                        
                        {/* Status & Progress */}
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(fileItem.status)}
                          <span className={`text-xs font-medium ${
                            fileItem.status === 'completed' ? 'text-green-600' : 
                            fileItem.status === 'processing' ? 'text-blue-600' : 
                            fileItem.status === 'error' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {fileItem.status === 'completed' ? 'Ready' :
                             fileItem.status === 'processing' ? 'Processing...' :
                             fileItem.status === 'error' ? 'Error' : 'Waiting'}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        {fileItem.status === 'processing' && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${fileItem.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium Upload Button */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0}
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-2xl shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-3">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-lg">Analyzing Documents...</span>
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-6 w-6" />
                        <span className="text-lg">
                          Analyze {files.length} Document{files.length !== 1 ? 's' : ''} with AI
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Premium Processing Status */}
      {(currentStep === 'processing' || currentStep === 'analysis') && (
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-gray-200">
            
            {/* Animated Processing Icon */}
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-spin opacity-20"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  {currentStep === 'processing' ? (
                    <FileText className="h-8 w-8 text-blue-600" />
                  ) : (
                    <TrendingUp className="h-8 w-8 text-indigo-600" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900">
                  {currentStep === 'processing' ? 'Processing Documents' : 'AI Analysis in Progress'}
                </h3>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  {currentStep === 'processing' 
                    ? 'Extracting and consolidating data from your startup documents using advanced AI'
                    : 'Gemini 2.5 Pro is generating comprehensive investment insights and recommendations'
                  }
                </p>
              </div>

              {/* Processing Animation */}
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Premium Processing Steps */}
            <div className="mt-12 space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 text-center mb-6">Document Processing Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="flex-shrink-0">
                      {getStatusIcon(fileItem.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {fileItem.file.name}
                      </p>
                      <p className={`text-sm ${
                        fileItem.status === 'completed' ? 'text-green-600' : 
                        fileItem.status === 'processing' ? 'text-blue-600' : 
                        fileItem.status === 'error' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {fileItem.status === 'completed' ? '✅ Extraction complete' :
                         fileItem.status === 'processing' ? '⚡ Processing...' :
                         fileItem.status === 'error' ? '❌ Error occurred' : '⏳ Waiting'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {currentStep === 'complete' && analysisResult?.success && (
        <div className="space-y-6">
          {/* Premium Success Header */}
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center space-y-6">
              
              {/* Success Animation */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-30"></div>
                <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full w-full h-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-4xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Analysis Complete!
                </h3>
                <p className="text-xl text-gray-700">
                  Successfully analyzed <span className="font-bold text-blue-600">{analysisResult.results?.documentsProcessed} documents</span> in{' '}
                  <span className="font-bold text-purple-600">{Math.round((analysisResult.results?.processingMetadata.processingTime || 0) / 1000)}s</span>
                </p>
              </div>
              
              {/* Premium View Mode Toggle */}
              <div className="inline-flex p-1 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    viewMode === 'summary' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  📊 Summary View
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center ${
                    viewMode === 'detailed' 
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  🔍 Detailed Analysis
                </button>
              </div>
            </div>
          </div>

          {/* Premium Analysis Results */}
          {analysisResult.results && viewMode === 'detailed' && (
            <div className="relative overflow-hidden">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 rounded-3xl opacity-60"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-white/40 via-transparent to-white/60 rounded-3xl"></div>
              
              {/* Content */}
              <div className="relative p-8 backdrop-blur-sm">
                <EnhancedAnalysisResults 
                  analysisData={analysisResult.results} 
                  onNewAnalysis={resetUpload}
                />
              </div>
            </div>
          )}

          {/* Premium Summary Results */}
          {analysisResult.results && viewMode === 'summary' && (
            <div className="relative">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-3xl opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-white/60 via-transparent to-white/40 rounded-3xl"></div>
              
              {/* Content */}
              <div className="relative p-8 space-y-8 backdrop-blur-sm">
              {/* Premium Top Level Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Investment Recommendation */}
                <div className="group relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 rounded-2xl transition-all duration-300 group-hover:from-green-200 group-hover:via-blue-200 group-hover:to-purple-200"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-white/50 via-transparent to-white/80 rounded-2xl"></div>
                  
                  <div className="relative bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Investment Decision</h4>
                    <div className={`inline-flex px-6 py-3 rounded-2xl text-xl font-black border-2 shadow-lg transform transition-all duration-300 hover:scale-105 ${
                      getRecommendationColor(analysisResult.results.analysis?.recommendation?.decision)
                    }`}>
                      {(analysisResult.results.analysis?.recommendation?.decision || 
                        analysisResult.results.analysis?.recommendation || 
                        'PENDING').toUpperCase()}
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {analysisResult.results.analysis?.recommendation?.score || 
                         analysisResult.results.analysis?.overallScore || 'N/A'}/100
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Investment Score</div>
                    </div>
                  </div>
                </div>

                {/* Premium Company Info */}
                <div className="group relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-2xl transition-all duration-300 group-hover:from-blue-200 group-hover:via-indigo-200 group-hover:to-purple-200"></div>
                  <div className="absolute inset-0 bg-gradient-to-tl from-white/50 via-transparent to-white/80 rounded-2xl"></div>
                  
                  <div className="relative bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Company Overview</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {analysisResult.results.consolidatedData?.companyInfo?.name || 'Company Name'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {analysisResult.results.consolidatedData?.companyInfo?.industry || 'Industry'}
                      </div>
                      {analysisResult.results.consolidatedData?.companyInfo?.tagline && (
                        <div className="text-sm text-blue-600 italic">
                          "{analysisResult.results.consolidatedData.companyInfo.tagline}"
                        </div>
                      )}
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Business Model:</span>
                        <span className="text-right max-w-xs">
                          {analysisResult.results.consolidatedData?.companyInfo?.businessModel?.substring(0, 50) || 'N/A'}
                          {analysisResult.results.consolidatedData?.companyInfo?.businessModel?.length > 50 && '...'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span>{analysisResult.results.consolidatedData?.companyInfo?.location || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Founded:</span>
                        <span>{analysisResult.results.consolidatedData?.companyInfo?.founded || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Website:</span>
                        <span>{analysisResult.results.consolidatedData?.companyInfo?.website || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Confidence */}
                <div className="bg-white border rounded-lg p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Analysis Quality</h4>
                  <div className="text-3xl font-bold text-blue-600">
                    {analysisResult.results.consolidatedData?.confidence || 
                     analysisResult.results.analysis?.confidence || 85}%
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Confidence Level</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Based on {analysisResult.results.documentsProcessed} documents
                  </div>
                </div>
              </div>

              {/* Detailed Analysis Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Insights */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                    Analysis Insights
                  </h4>
                  <div className="space-y-4">
                    {/* Analysis Status */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-blue-900">Analysis Status</h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          analysisResult.results.analysis?.confidence >= 70 ? 'bg-green-100 text-green-800' :
                          analysisResult.results.analysis?.confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {analysisResult.results.analysis?.confidence || 50}% Confidence
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">
                        Successfully extracted {Math.round((analysisResult.results.processingMetadata?.totalTextExtracted || 0) / 1000)}K characters from {analysisResult.results.documentsProcessed} documents.
                      </p>
                    </div>

                    {/* Investment Reasoning */}
                    {analysisResult.results.analysis?.recommendation?.reasoning && (
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Analysis Notes:</h5>
                        <ul className="space-y-2">
                          {analysisResult.results.analysis.recommendation.reasoning.map((reason: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                                {idx + 1}
                              </span>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Data Quality Notice */}
                    {analysisResult.results.analysis?.recommendation?.decision === 'hold' && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h6 className="font-medium text-yellow-800">Analysis Limitation</h6>
                            <p className="text-sm text-yellow-700 mt-1">
                              This analysis is based on limited data extraction. For a more comprehensive evaluation, 
                              consider providing additional documents or clearer document formats.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Description & Business Model */}
                {analysisResult.results.consolidatedData?.companyInfo && (
                  <div className="bg-white border rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      Business Overview
                    </h4>
                    <div className="space-y-4 text-sm">
                      {analysisResult.results.consolidatedData.companyInfo.description && (
                        <div>
                          <h5 className="font-semibold mb-2">Company Description:</h5>
                          <p className="text-gray-700 leading-relaxed">
                            {analysisResult.results.consolidatedData.companyInfo.description}
                          </p>
                        </div>
                      )}
                      
                      {analysisResult.results.consolidatedData.companyInfo.businessModel && (
                        <div>
                          <h5 className="font-semibold mb-2">Business Model:</h5>
                          <p className="text-gray-700 leading-relaxed">
                            {analysisResult.results.consolidatedData.companyInfo.businessModel}
                          </p>
                        </div>
                      )}

                      {analysisResult.results.consolidatedData.companyInfo.industry && (
                        <div>
                          <h5 className="font-semibold mb-2">Industry Focus:</h5>
                          <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {analysisResult.results.consolidatedData.companyInfo.industry}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Analysis Status & Next Steps */}
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Analysis Status</h4>
                  <div className="space-y-4">
                    {/* Investment Decision */}
                    <div>
                      <h5 className="font-semibold mb-2">Investment Decision:</h5>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border ${
                        getRecommendationColor(analysisResult.results.analysis?.recommendation?.decision)
                      }`}>
                        {(analysisResult.results.analysis?.recommendation?.decision || 'PENDING').toUpperCase()}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        Score: {analysisResult.results.analysis?.recommendation?.score || 'N/A'}/100
                      </div>
                    </div>

                    {/* Investment Thesis */}
                    {analysisResult.results.analysis?.recommendation?.investmentThesis && (
                      <div>
                        <h5 className="font-semibold mb-2">Investment Thesis:</h5>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {analysisResult.results.analysis.recommendation.investmentThesis}
                        </p>
                      </div>
                    )}

                    {/* Next Steps */}
                    {analysisResult.results.analysis?.recommendation?.nextSteps?.length > 0 && (
                      <div>
                        <h5 className="font-semibold mb-2">Recommended Next Steps:</h5>
                        <ul className="space-y-1">
                          {analysisResult.results.analysis.recommendation.nextSteps.map((step: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start">
                              <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                                {idx + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              {(analysisResult.results.analysis?.executiveSummary || 
                analysisResult.results.analysis?.recommendation?.investmentThesis) && (
                <div className="bg-white border rounded-lg p-6 col-span-full">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-indigo-500 mr-2" />
                    Executive Summary
                  </h4>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {analysisResult.results.analysis.executiveSummary || 
                       analysisResult.results.analysis.recommendation?.investmentThesis ||
                       'Comprehensive analysis completed. Review the detailed sections above for investment insights.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Document Processing Summary */}
              <div className="bg-white border rounded-lg p-6 col-span-full">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Processing Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{analysisResult.results.documentsProcessed}</div>
                    <div className="text-sm text-gray-600">Documents Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((analysisResult.results.processingMetadata?.totalTextExtracted || 0) / 1000)}K
                    </div>
                    <div className="text-sm text-gray-600">Characters Extracted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((analysisResult.results.processingMetadata?.processingTime || 0) / 1000)}s
                    </div>
                    <div className="text-sm text-gray-600">Processing Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">
                      {analysisResult.results.documentSummaries?.reduce((sum, doc) => sum + doc.confidence, 0) / 
                       (analysisResult.results.documentSummaries?.length || 1)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Confidence</div>
                  </div>
                </div>
                
                {/* Document Details */}
                <div className="mt-6">
                  <h5 className="font-semibold mb-3">Processed Documents:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.results.documentSummaries?.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm">{doc.filename}</div>
                            <div className="text-xs text-gray-500">
                              {doc.type} • {(doc.textLength / 1000).toFixed(1)}K chars
                            </div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          doc.confidence >= 80 ? 'bg-green-100 text-green-800' :
                          doc.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {doc.confidence}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Summary View */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Upload More Documents
                </button>
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(analysisResult.results, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `startup-analysis-${Date.now()}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download Analysis Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>

      {/* Error Display */}
      {analysisResult?.error && (
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analysis Failed</h3>
            <p className="text-red-600">{analysisResult.error}</p>
          </div>
          <button
            onClick={resetUpload}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}