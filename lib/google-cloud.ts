// Real Google Cloud Services Integration
import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { VertexAI } from '@google-cloud/vertexai';
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Environment configuration
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_PROJECT_ID || 'ai-startup-analyst-hackathon';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

// Helper function to get Google Cloud credentials
function getGoogleCloudCredentials() {
  // Priority:
  // 1. JSON credentials string
  // 2. Individual environment variables
  // 3. Local credentials file
  // 4. Application Default Credentials

  // Check for JSON credentials first
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      return {
        credentials: parsed,
        projectId: parsed.project_id || projectId,
      };
    } catch (e) {
      // Try base64 decode
      try {
        const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_JSON, 'base64').toString();
        const parsed = JSON.parse(decoded);
        return {
          credentials: parsed,
          projectId: parsed.project_id || projectId,
        };
      } catch (e2) {
        console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', e2);
      }
    }
  }

  // Fallback to individual credential fields
  if (process.env.GOOGLE_CLIENT_EMAIL && 
      process.env.GOOGLE_PRIVATE_KEY && 
      process.env.GOOGLE_PROJECT_ID) {
    
    // Convert literal \n to actual newlines in private key if needed
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    return {
      credentials: {
        type: process.env.GOOGLE_TYPE || 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: privateKey,
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: process.env.GOOGLE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
        token_uri: process.env.GOOGLE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL
      },
      projectId: process.env.GOOGLE_PROJECT_ID,
    };
  }

  // Check for JSON credentials
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    try {
      const parsed = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
      return {
        credentials: parsed,
        projectId: parsed.project_id || projectId,
      };
    } catch (e) {
      // Try base64 decode
      try {
        const decoded = Buffer.from(process.env.GOOGLE_CREDENTIALS_JSON, 'base64').toString();
        const parsed = JSON.parse(decoded);
        return {
          credentials: parsed,
          projectId: parsed.project_id || projectId,
        };
      } catch (e2) {
        throw new Error('Invalid GOOGLE_CREDENTIALS_JSON format');
      }
    }
  }

  // Check for local credentials file
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId,
    };
  }

  // Fall back to Application Default Credentials
  return {};
}

// Initialize Google Cloud clients
let storage: Storage;
let visionClient: ImageAnnotatorClient;
let vertex_ai: VertexAI;

try {
  // Get Google Cloud credentials using our helper function
  const clientOptions = getGoogleCloudCredentials();

  // Initialize Storage client
  storage = new Storage({
    projectId: clientOptions.projectId || projectId,
    ...(clientOptions.keyFilename ? { keyFilename: clientOptions.keyFilename } : {}),
    ...(clientOptions.credentials ? { credentials: clientOptions.credentials } : {}),
  });

  // Initialize Vision API client
  visionClient = new ImageAnnotatorClient(
    clientOptions.keyFilename || clientOptions.credentials ? clientOptions : undefined
  );

  // Initialize Vertex AI for Gemini
  vertex_ai = new VertexAI({
    project: projectId,
    location: location,
    ...(clientOptions.credentials ? { credentials: clientOptions.credentials } : {})
  });

  console.log('✅ Google Cloud services initialized successfully');
} catch (error) {
  console.error('❌ Google Cloud initialization error:', error);
  throw new Error(`Failed to initialize Google Cloud services: ${error}`);
}

// Cloud Storage Service
export const cloudStorage = {
  /**
   * Upload a file to Google Cloud Storage
   */
  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string
  ): Promise<{
    fileName: string;
    url: string;
    bucket: string;
    size: number;
  }> {
    try {
      const bucketName = process.env.GOOGLE_CLOUD_BUCKET || 'ai-startup-analyst-docs';
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(fileName);

      console.log(`📤 Uploading file to Cloud Storage: ${fileName}`);

      // Upload the file
      await file.save(buffer, {
        metadata: {
          contentType,
          metadata: {
            uploadedAt: new Date().toISOString(),
          }
        },
        public: false,
        validation: 'md5',
      });

      // Generate signed URL for temporary access (24 hours)
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 24 * 60 * 60 * 1000,
      });

      console.log(`✅ File uploaded successfully: ${fileName}`);

      return {
        fileName,
        url,
        bucket: bucketName,
        size: buffer.length,
      };
    } catch (error) {
      console.error('❌ Cloud Storage error:', error);
      throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Delete a file from Cloud Storage
   */
  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const bucketName = process.env.GOOGLE_CLOUD_BUCKET || 'ai-startup-analyst-docs';
      const bucket = storage.bucket(bucketName);
      await bucket.file(fileName).delete();
      console.log(`🗑️ File deleted: ${fileName}`);
      return true;
    } catch (error) {
      console.error('❌ File deletion error:', error);
      return false;
    }
  }
};

// Vision API Service
export const visionService = {
  /**
   * Extract text from various document formats
   */
  async extractTextFromDocument(buffer: Buffer, filename?: string): Promise<string> {
    try {
      const fileType = filename ? this.getFileType(filename) : 'unknown';
      console.log(`🔍 Extracting text from ${fileType} document...`);

      // Use appropriate parser based on file type
      switch (fileType) {
        case 'pdf':
          return await this.extractTextFromPDF(buffer);
        
        case 'docx':
          return await this.extractTextFromDocx(buffer);
        
        case 'txt':
          return buffer.toString('utf8');
        
        case 'pptx':
          // For PPTX, still use Vision API as it's image-heavy
          return await this.extractTextWithVisionAPI(buffer);
        
        default:
          // Default to Vision API for unknown types
          return await this.extractTextWithVisionAPI(buffer);
      }
    } catch (error) {
      console.error('❌ Text extraction error:', error);
      
      // Fallback to Vision API if other methods fail
      try {
        console.log('🔄 Trying Vision API as fallback...');
        return await this.extractTextWithVisionAPI(buffer);
      } catch (visionError) {
        console.error('❌ Vision API fallback also failed:', visionError);
        return ''; // Return empty string instead of throwing
      }
    }
  },

  /**
   * Extract text using Vision API (for images, PPTX, or fallback)
   */
  async extractTextWithVisionAPI(buffer: Buffer): Promise<string> {
    try {
      console.log('🔍 Extracting text using Google Vision API...');

      const [result] = await visionClient.documentTextDetection({
        image: {
          content: buffer.toString('base64'),
        },
      });

      const fullTextAnnotation = result.fullTextAnnotation;
      
      if (!fullTextAnnotation?.text) {
        console.log('⚠️ No text found with document detection, trying basic text detection...');
        
        // Fallback to regular text detection
        const [textResult] = await visionClient.textDetection({
          image: {
            content: buffer.toString('base64'),
          },
        });
        
        const extractedText = textResult.textAnnotations?.[0]?.description || '';
        console.log(`✅ Text extracted (Vision API fallback): ${extractedText.length} characters`);
        return extractedText;
      }

      console.log(`✅ Text extracted (Vision API): ${fullTextAnnotation.text.length} characters`);
      return fullTextAnnotation.text;
    } catch (error) {
      console.error('❌ Vision API error:', error);
      throw new Error(`Vision API extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get file type from filename
   */
  getFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    return ext || 'unknown';
  },

  /**
   * Extract text from DOCX files using mammoth
   */
  async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      console.log('📄 Processing DOCX with mammoth parser...');
      
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      
      console.log(`✅ DOCX text extracted: ${text.length} characters`);
      return text;
    } catch (error) {
      console.error('❌ DOCX processing error:', error);
      throw new Error(`DOCX text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Extract text from PDF files using pdf-parse
   */
  async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      console.log('📄 Processing PDF with pdf-parse...');
      
      const pdfData = await pdfParse(buffer);
      const text = pdfData.text;
      
      console.log(`✅ PDF text extracted: ${text.length} characters`);
      
      // If pdf-parse didn't extract much text, fallback to Vision API
      if (text.length < 50) {
        console.log('⚠️ PDF text extraction yielded minimal text, trying Vision API...');
        return await this.extractTextWithVisionAPI(buffer);
      }
      
      return text;
    } catch (error) {
      console.error('❌ PDF processing error:', error);
      
      // Fallback to Vision API if pdf-parse fails
      try {
        console.log('🔄 Fallback to Vision API for PDF...');
        return await this.extractTextWithVisionAPI(buffer);
      } catch (visionError) {
        console.error('❌ PDF Vision API fallback failed:', visionError);
        throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }
};

// Gemini AI Service
export const geminiService = {
  /**
   * Analyze startup data using Gemini Pro
   */
  async analyzeStartupData(
    text: string,
    analysisType: 'company' | 'financial' | 'team' | 'market' | 'risk' | 'recommendation'
  ): Promise<any> {
    try {
      console.log(`🤖 Analyzing ${analysisType} data with Gemini AI...`);

      const model = vertex_ai.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.3,
          topP: 0.8,
        },
      });

      const prompt = this.getAnalysisPrompt(text, analysisType);
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      console.log(`✅ Gemini analysis completed for ${analysisType}`);
      
      return this.parseGeminiResponse(responseText, analysisType);
    } catch (error) {
      console.error('❌ Gemini AI analysis error:', error);
      throw new Error(`AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Generate executive summary using Gemini
   */
  async generateSummary(analysisData: any): Promise<string> {
    try {
      console.log('📝 Generating executive summary with Gemini...');

      const model = vertex_ai.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.4,
        },
      });

      const prompt = `
Based on the following startup analysis data, generate a comprehensive executive summary 
that highlights the key investment opportunity, risks, and recommendation:

${JSON.stringify(analysisData, null, 2)}

Please provide a clear, concise executive summary (200-300 words) suitable for investors that covers:
1. Business overview and value proposition
2. Key financial metrics and traction
3. Market opportunity
4. Team strengths
5. Main risks and mitigations
6. Investment recommendation

Format as plain text, not JSON.
`;

      const result = await model.generateContent(prompt);
      const summary = result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'Executive summary generation failed. Please review individual analysis sections.';

      console.log('✅ Executive summary generated');
      return summary;
    } catch (error) {
      console.error('❌ Summary generation error:', error);
      return 'Executive summary generation failed. Please review individual analysis sections.';
    }
  },

  /**
   * Get analysis prompt based on type
   */
  getAnalysisPrompt(text: string, analysisType: string): string {
    const basePrompt = `Analyze the following startup document text and extract relevant information. 
Return your response as valid JSON only, no additional text or explanation.

Document content:
${text.substring(0, 8000)} // Limit text length for API efficiency

`;

    const prompts = {
      company: basePrompt + `
Extract company information and return ONLY valid JSON with this exact structure:
{
  "companyInfo": {
    "name": "string",
    "tagline": "string", 
    "description": "string",
    "website": "string",
    "location": "string",
    "founded": "string",
    "industry": "string",
    "businessModel": "string"
  },
  "confidence": 85
}

IMPORTANT: Return ONLY the JSON object. No additional text or explanations.`,
      
      financial: basePrompt + `
Extract financial information and return ONLY valid JSON with this exact structure:
{
  "financialMetrics": {
    "currentRevenue": 0,
    "revenueGrowthRate": 0,
    "grossMargin": 0,
    "burnRate": 0,
    "runway": 0,
    "cashRaised": 0,
    "valuation": 0,
    "employees": 0,
    "customers": 0,
    "arr": 0,
    "mrr": 0
  },
  "unitEconomics": {
    "cac": 0,
    "ltv": 0,
    "paybackPeriod": 0,
    "churnRate": 0
  },
  "confidence": 85
}

IMPORTANT: Return ONLY the JSON object. No additional text or explanations.`,
      
      team: basePrompt + `
Extract team information and return ONLY valid JSON with this exact structure:
{
  "founders": [
    {
      "name": "string",
      "role": "string",
      "background": "string",
      "previousCompanies": ["string"],
      "education": "string",
      "yearsExperience": 0
    }
  ],
  "totalEmployees": 0,
  "keyHires": [
    {
      "name": "string",
      "role": "string", 
      "background": "string"
    }
  ],
  "advisors": [
    {
      "name": "string",
      "background": "string"
    }
  ],
  "confidence": 85
}

IMPORTANT: Return ONLY the JSON object. No additional text or explanations.`,
      
      market: basePrompt + `
Extract market information and return ONLY valid JSON with this exact structure:
{
  "marketInfo": {
    "tam": 0,
    "sam": 0,
    "som": 0,
    "marketGrowthRate": 0,
    "competitors": ["string"],
    "marketPosition": "string"
  },
  "confidence": 85
}

IMPORTANT: Return ONLY the JSON object. No additional text or explanations.`,
      
      risk: basePrompt + `
Identify risks and return ONLY valid JSON with this exact structure:
{
  "riskFlags": [
    {
      "id": "string",
      "type": "market",
      "severity": "medium",
      "title": "string",
      "description": "string",
      "evidence": ["string"],
      "confidence": 85,
      "impact": "string",
      "recommendation": "string"
    }
  ],
  "confidence": 85
}

IMPORTANT: Return ONLY the JSON object. No additional text or explanations.`,
      
      recommendation: basePrompt + `
CRITICAL: Provide investment recommendation and return ONLY valid JSON with this exact structure. Keep all strings concise (max 150 chars each):
{
  "recommendation": {
    "decision": "buy",
    "score": 75,
    "reasoning": ["Brief reason 1", "Brief reason 2", "Brief reason 3"],
    "keyStrengths": ["Strength 1", "Strength 2", "Strength 3"],
    "keyWeaknesses": ["Weakness 1", "Weakness 2"],
    "investmentThesis": "Concise investment thesis (max 200 chars)",
    "suggestedValuation": 0,
    "suggestedCheck": 0,
    "nextSteps": ["Step 1", "Step 2", "Step 3"]
  },
  "confidence": 85
}

IMPORTANT: Return ONLY the JSON object. No additional text, explanations, or formatting. Ensure all braces are properly closed.`
    };

    return prompts[analysisType as keyof typeof prompts] || basePrompt;
  },

  /**
   * Parse Gemini AI response
   */
  parseGeminiResponse(responseText: string, analysisType: string): any {
    try {
      // Clean the response text
      let cleanText = responseText.trim();
      
      // Remove markdown code blocks if present
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Try to fix incomplete JSON by finding the last complete object
      if (cleanText.includes('{') && !cleanText.endsWith('}')) {
        // Find the last complete JSON object
        let lastCompleteJson = '';
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < cleanText.length; i++) {
          const char = cleanText[i];
          
          if (escapeNext) {
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
          }
          
          if (!inString) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              if (braceCount === 0) {
                lastCompleteJson = cleanText.substring(0, i + 1);
              }
            }
          }
        }
        
        if (lastCompleteJson && lastCompleteJson.length > 10) {
          cleanText = lastCompleteJson;
          console.log('🔧 Fixed incomplete JSON response');
        } else {
          // If we can't find a complete JSON object, try to close the JSON manually
          if (cleanText.includes('{')) {
            // Count unclosed braces and strings
            let openBraces = 0;
            let inString = false;
            let lastQuotePos = -1;
            
            for (let i = 0; i < cleanText.length; i++) {
              const char = cleanText[i];
              
              if (char === '"' && (i === 0 || cleanText[i-1] !== '\\')) {
                inString = !inString;
                if (inString) lastQuotePos = i;
              }
              
              if (!inString) {
                if (char === '{') openBraces++;
                if (char === '}') openBraces--;
              }
            }
            
            // If we're in an unterminated string, close it
            if (inString && lastQuotePos !== -1) {
              cleanText = cleanText.substring(0, lastQuotePos + 1) + '"';
            }
            
            // Close any unclosed braces
            while (openBraces > 0) {
              cleanText += '}';
              openBraces--;
            }
            
            console.log('🔧 Attempted to repair incomplete JSON');
          }
        }
      }
      
      // Try to parse as JSON
      const parsed = JSON.parse(cleanText);
      console.log(`✅ Successfully parsed ${analysisType} response`);
      return parsed;
    } catch (error) {
      console.error(`❌ Failed to parse ${analysisType} response:`, error);
      console.log('📊 Response Stats:');
      console.log('  - Length:', responseText.length);
      console.log('  - Has opening brace:', responseText.includes('{'));
      console.log('  - Has closing brace:', responseText.includes('}'));
      console.log('  - Ends with brace:', responseText.trim().endsWith('}'));
      console.log('📝 Raw response preview:');
      console.log(responseText.substring(0, 400) + (responseText.length > 400 ? '\n...[TRUNCATED]' : ''));
      
      // Try to identify the issue
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      console.log('🧹 Cleaned preview:');
      console.log(cleaned.substring(0, 400) + (cleaned.length > 400 ? '\n...[TRUNCATED]' : ''));
      
      // Return default structure based on analysis type
      const defaults = {
        company: { 
          companyInfo: {
            name: 'Unknown Company',
            industry: 'Unknown',
            description: 'Could not extract company information'
          }, 
          confidence: 50 
        },
        financial: { 
          financialMetrics: {
            currentRevenue: 0,
            revenueGrowthRate: 0,
            grossMargin: 0
          }, 
          unitEconomics: {
            cac: 0,
            ltv: 0,
            paybackPeriod: 0,
            churnRate: 0
          }, 
          confidence: 50 
        },
        team: { 
          founders: [], 
          totalEmployees: 0, 
          keyHires: [], 
          advisors: [], 
          confidence: 50 
        },
        market: { 
          marketInfo: {
            tam: 0,
            sam: 0,
            som: 0,
            marketGrowthRate: 0,
            competitors: [],
            marketPosition: 'Unknown'
          }, 
          confidence: 50 
        },
        risk: { 
          riskFlags: [{
            id: 'parse-error',
            type: 'technical',
            severity: 'low',
            title: 'Analysis Parsing Error',
            description: 'Could not parse AI response',
            evidence: ['Response parsing failed'],
            confidence: 50,
            impact: 'Limited analysis available',
            recommendation: 'Retry analysis with different document'
          }], 
          confidence: 50 
        },
        recommendation: { 
          recommendation: { 
            decision: 'hold', 
            score: 50,
            reasoning: ['Insufficient data for recommendation'],
            keyStrengths: [],
            keyWeaknesses: [],
            investmentThesis: 'Unable to generate recommendation due to parsing error',
            suggestedValuation: 0,
            suggestedCheck: 0,
            nextSteps: ['Retry analysis', 'Provide clearer documentation']
          }, 
          confidence: 50 
        }
      };
      
      return defaults[analysisType as keyof typeof defaults] || { confidence: 50 };
    }
  }
};

// Health check function
export const healthCheck = {
  async checkServices(): Promise<{
    storage: boolean;
    vision: boolean;
    vertexAI: boolean;
    overall: boolean;
  }> {
    const results = {
      storage: false,
      vision: false,
      vertexAI: false,
      overall: false,
    };

    try {
      console.log('🔍 Running Google Cloud services health check...');

      // Test Cloud Storage
      await storage.getBuckets({ maxResults: 1 });
      results.storage = true;
      console.log('✅ Cloud Storage: OK');
    } catch (error) {
      console.error('❌ Cloud Storage health check failed:', error);
    }

    try {
      // Test Vision API with a simple image
      const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const buffer = Buffer.from(testImageBase64.split(',')[1], 'base64');
      
      await visionClient.textDetection({
        image: { content: buffer.toString('base64') }
      });
      results.vision = true;
      console.log('✅ Vision API: OK');
    } catch (error) {
      console.error('❌ Vision API health check failed:', error);
    }

    try {
      // Test Vertex AI
      const model = vertex_ai.getGenerativeModel({
        model: 'gemini-2.5-pro'
      });
      
      const result = await model.generateContent('Hello, this is a test.');
      // Check if we got a valid response
      if (result.response.candidates?.[0]?.content?.parts?.[0]?.text) {
        results.vertexAI = true;
        console.log('✅ Vertex AI (Gemini): OK');
      }
    } catch (error) {
      console.error('❌ Vertex AI health check failed:', error);
    }

    results.overall = results.storage && results.vision && results.vertexAI;
    
    if (results.overall) {
      console.log('🎉 All Google Cloud services are operational!');
    } else {
      console.log('⚠️ Some Google Cloud services are not available');
    }

    return results;
  }
};
