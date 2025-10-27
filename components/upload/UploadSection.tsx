'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudArrowUpIcon, 
  DocumentTextIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAnalysisStore, useDocumentStore } from '@/store';
import { documentProcessor } from '@/lib/document-processor-client';
import toast from 'react-hot-toast';

interface UploadSectionProps {
  onAnalysisComplete: () => void;
}

export function UploadSection({ onAnalysisComplete }: UploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  
  const { setLoading, setProcessingStage: setGlobalStage, addAnalysis } = useAnalysisStore();
  const { addToUploadQueue } = useDocumentStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    const validFiles = acceptedFiles.filter(file => {
      const isValidType = allowedTypes.includes(file.type) || 
        file.name.toLowerCase().endsWith('.pdf') ||
        file.name.toLowerCase().endsWith('.pptx') ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.txt');
      
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      
      if (!isValidType) {
        toast.error(`${file.name}: Unsupported file type. Please upload PDF, PPTX, DOCX, or TXT files.`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: File too large. Maximum size is 50MB.`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      addToUploadQueue(validFiles);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  }, [addToUploadQueue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }

    setIsProcessing(true);
    setLoading(true);
    
    try {
      const mainFile = uploadedFiles[0];
      
      // Stage 1: Upload and process document with real API
      setProcessingStage('Uploading and processing document...');
      setGlobalStage('uploading');

      console.log('🚀 Starting real document upload and processing...');
      
      const formData = new FormData();
      formData.append('file', mainFile);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload completed:', uploadResult);

      // Stage 2: Extract data from real AI analysis
      setProcessingStage('Analyzing with Google Cloud AI...');
      setGlobalStage('analyzing');

      if (!uploadResult.success || !uploadResult.analysis) {
        throw new Error('Upload succeeded but analysis failed');
      }

      const realAnalysis = uploadResult.analysis;
      console.log('✅ Real AI analysis completed:', realAnalysis);

      // Stage 3: Generate insights
      setProcessingStage('Generating investment insights...');
      setGlobalStage('generating');

      const insights = uploadResult.insights || {};
      console.log('✅ Insights generated:', insights);

      // Create analysis result from real API data
      const realAnalysisResult = {
        id: uploadResult.processing?.analysisId || `analysis-${Date.now()}`,
        companyName: realAnalysis.companyInfo?.name || 'Unknown Company',
        industry: realAnalysis.companyInfo?.industry || 'Unknown',
        stage: 'seed' as const,
        documents: [{
          id: uploadResult.document?.id || `doc-${Date.now()}`,
          name: uploadResult.document?.name || mainFile.name,
          type: 'other' as const,
          url: uploadResult.document?.url || '',
          uploadedAt: new Date(uploadResult.document?.uploadedAt || Date.now()),
          processed: uploadResult.document?.processed || true,
          extractedText: uploadResult.extractedText || '',
          pageCount: uploadResult.document?.metadata?.pageCount || 1,
          size: uploadResult.document?.size || mainFile.size,
        }],
        extractedData: {
          companyInfo: {
            name: realAnalysis.companyInfo?.name || 'Unknown Company',
            tagline: realAnalysis.companyInfo?.tagline || '',
            description: realAnalysis.companyInfo?.description || '',
            website: realAnalysis.companyInfo?.website || '',
            location: realAnalysis.companyInfo?.location || '',
            founded: realAnalysis.companyInfo?.founded || '',
            industry: realAnalysis.companyInfo?.industry || 'Unknown',
            businessModel: realAnalysis.companyInfo?.businessModel || '',
          },
          financials: {
            currentRevenue: realAnalysis.financialMetrics?.currentRevenue || 0,
            revenueGrowthRate: realAnalysis.financialMetrics?.revenueGrowthRate || 0,
            grossMargin: realAnalysis.financialMetrics?.grossMargin || 0,
            burnRate: realAnalysis.financialMetrics?.burnRate || 0,
            runway: realAnalysis.financialMetrics?.runway || 0,
            cashRaised: realAnalysis.financialMetrics?.cashRaised || 0,
            valuation: realAnalysis.financialMetrics?.valuation || 0,
            employees: realAnalysis.financialMetrics?.employees || 0,
            customersCount: realAnalysis.financialMetrics?.customers || 0,
            arr: realAnalysis.financialMetrics?.arr || 0,
            mrr: realAnalysis.financialMetrics?.mrr || 0,
          },
          team: {
            founders: realAnalysis.teamInfo?.founders || [],
            totalEmployees: realAnalysis.teamInfo?.totalEmployees || 0,
            keyHires: realAnalysis.teamInfo?.keyHires || [],
            advisors: realAnalysis.teamInfo?.advisors || []
          },
          market: {
            tam: realAnalysis.marketInfo?.tam || 0,
            sam: realAnalysis.marketInfo?.sam || 0,
            som: realAnalysis.marketInfo?.som || 0,
            marketGrowthRate: realAnalysis.marketInfo?.marketGrowthRate || 0,
            competitors: realAnalysis.marketInfo?.competitors || [],
            marketPosition: realAnalysis.marketInfo?.marketPosition || '',
          },
          product: {
            description: realAnalysis.companyInfo?.description || '',
            stage: 'launched' as const,
            differentiators: [],
            technology: [],
          },
          traction: {
            users: realAnalysis.financialMetrics?.customers || 0,
            customers: realAnalysis.financialMetrics?.customers || 0,
            revenue: realAnalysis.financialMetrics?.currentRevenue || 0,
            partnerships: [],
            milestones: []
          }
        },
        metrics: {
          revenueMultiple: realAnalysis.financialMetrics?.valuation && realAnalysis.financialMetrics?.currentRevenue ? 
            (realAnalysis.financialMetrics.valuation / realAnalysis.financialMetrics.currentRevenue) : 0,
          growthRate: realAnalysis.financialMetrics?.revenueGrowthRate || 0,
          burnMultiple: 0,
          grossMarginPercent: realAnalysis.financialMetrics?.grossMargin || 0,
          ltvratio: 0,
          monthsOfRunway: realAnalysis.financialMetrics?.runway || 0,
          capitalEfficiency: 0,
          unitEconomics: {
            cac: 0,
            ltv: 0,
            paybackPeriod: 0,
            churnRate: 0,
          }
        },
        riskFlags: realAnalysis.riskFlags?.map((risk: any, index: number) => ({
          id: risk.id || `risk-${index}`,
          type: risk.type || 'unknown' as const,
          severity: risk.severity || 'medium' as const,
          title: risk.title || 'Risk Identified',
          description: risk.description || '',
          evidence: risk.evidence || [],
          confidence: risk.confidence || 50,
          impact: risk.impact || '',
          recommendation: risk.recommendation || ''
        })) || [],
        benchmarks: [],
        recommendation: {
          decision: realAnalysis.recommendation?.decision || 'hold' as const,
          score: realAnalysis.recommendation?.score || 50,
          reasoning: realAnalysis.recommendation?.reasoning || [],
          keyStrengths: realAnalysis.recommendation?.keyStrengths || [],
          keyWeaknesses: realAnalysis.recommendation?.keyWeaknesses || [],
          investmentThesis: realAnalysis.recommendation?.investmentThesis || '',
          suggestedValuation: realAnalysis.recommendation?.suggestedValuation || 0,
          suggestedCheck: realAnalysis.recommendation?.suggestedCheck || 0,
          nextSteps: realAnalysis.recommendation?.nextSteps || []
        },
        confidence: realAnalysis.confidence || 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'completed' as const,
      };

      // Add real analysis to store
      addAnalysis(realAnalysisResult);
      
      setGlobalStage('completed');
      toast.success(`Analysis completed! Company: ${realAnalysisResult.companyName}`);
      onAnalysisComplete();
      
    } catch (error) {
      console.error('Analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Analysis failed: ${errorMessage}`);
      setGlobalStage('error');
    } finally {
      setIsProcessing(false);
      setLoading(false);
      setProcessingStage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Area */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold text-gray-900">Upload Startup Documents</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload pitch decks, financial models, or other startup documents for AI analysis
          </p>
        </div>
        
        <div className="card-body">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Drop files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500">
                  Supports PDF, PPTX, DOCX, TXT • Max 50MB per file
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
          </div>
          
          <div className="card-body">
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center space-x-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Processing...</p>
                <p className="text-sm text-gray-600">{processingStage}</p>
              </div>
            </div>
            
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${
                    processingStage.includes('Uploading') ? '25%' :
                    processingStage.includes('Extracting') ? '50%' :
                    processingStage.includes('Analyzing') ? '75%' :
                    processingStage.includes('Generating') ? '90%' : '100%'
                  }` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={startAnalysis}
          disabled={uploadedFiles.length === 0 || isProcessing}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Start AI Analysis'}
        </button>
        
        {uploadedFiles.length > 0 && !isProcessing && (
          <button
            onClick={() => setUploadedFiles([])}
            className="btn-secondary"
          >
            Clear Files
          </button>
        )}
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Document Processing</h3>
          <p className="text-sm text-gray-600">
            Extract text and data from pitch decks using Google Cloud Vision API
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-sm text-gray-600">
            Analyze startup metrics and generate insights using Gemini Pro
          </p>
        </div>

        <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Risk Detection</h3>
          <p className="text-sm text-gray-600">
            Identify potential red flags and investment risks automatically
          </p>
        </div>
      </div>
    </div>
  );
}
