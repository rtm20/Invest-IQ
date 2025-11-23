// Real-time AI Due Diligence Assistant
// Interactive Q&A chatbot using RAG (Retrieval Augmented Generation)

import { geminiService } from './google-cloud';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[]; // Document sources cited
  confidence?: number; // Confidence score 0-100
}

export interface DueDiligenceContext {
  companyName: string;
  documents: {
    name: string;
    content: string;
    type: 'pitch_deck' | 'financial' | 'team' | 'other';
  }[];
  analysisResults?: any;
  competitiveAnalysis?: any;
  conversationHistory: ChatMessage[];
}

class AIDueDiligenceAssistant {
  /**
   * Ask a question about the startup using RAG
   */
  async askQuestion(
    question: string,
    context: DueDiligenceContext
  ): Promise<ChatMessage> {
    try {
      console.log('🤔 Processing due diligence question:', question);

      // Step 1: Retrieve relevant information from documents
      const relevantInfo = await this.retrieveRelevantInfo(question, context);

      // Step 2: Generate answer using Gemini with retrieved context
      const answer = await this.generateAnswer(question, relevantInfo, context);

      // Step 3: Create chat message
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: answer.content,
        timestamp: new Date().toISOString(),
        sources: answer.sources,
        confidence: answer.confidence,
      };

      console.log('✅ Generated answer with confidence:', answer.confidence);
      return message;
    } catch (error) {
      console.error('❌ Question processing failed:', error);
      
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your question. Please try rephrasing or ask something else.',
        timestamp: new Date().toISOString(),
        confidence: 0,
      };
    }
  }

  /**
   * Retrieve relevant information from documents (RAG)
   */
  private async retrieveRelevantInfo(
    question: string,
    context: DueDiligenceContext
  ): Promise<{
    relevantChunks: { content: string; source: string; relevance: number }[];
    analysisData: string;
  }> {
    try {
      console.log('🔍 Retrieving relevant information...');

      // Extract key entities and intent from question
      const queryAnalysis = await this.analyzeQuery(question);

      // Search through documents for relevant information
      const relevantChunks: { content: string; source: string; relevance: number }[] = [];

      for (const doc of context.documents) {
        const chunks = this.chunkDocument(doc.content, doc.name);
        
        for (const chunk of chunks) {
          const relevance = this.calculateRelevance(
            question,
            chunk.content,
            queryAnalysis
          );
          
          if (relevance > 0.3) { // Threshold for relevance
            relevantChunks.push({
              content: chunk.content,
              source: chunk.source,
              relevance,
            });
          }
        }
      }

      // Sort by relevance and take top 5
      relevantChunks.sort((a, b) => b.relevance - a.relevance);
      const topChunks = relevantChunks.slice(0, 5);

      // Also include relevant analysis data
      let analysisData = '';
      if (context.analysisResults) {
        analysisData = JSON.stringify(context.analysisResults, null, 2);
      }

      console.log(`✅ Retrieved ${topChunks.length} relevant chunks`);
      return { relevantChunks: topChunks, analysisData };
    } catch (error) {
      console.error('❌ Information retrieval failed:', error);
      return { relevantChunks: [], analysisData: '' };
    }
  }

  /**
   * Analyze user query to understand intent
   */
  private async analyzeQuery(question: string): Promise<{
    intent: string;
    entities: string[];
    category: string;
  }> {
    try {
      const prompt = `Analyze this investor's due diligence question:

Question: "${question}"

Identify:
1. Intent: What is the investor trying to understand? (risk assessment, financial viability, team capability, market opportunity, etc.)
2. Key entities: What specific things are they asking about? (revenue, founders, market size, competitors, etc.)
3. Category: What category does this fall into? (financial, team, market, product, risks, traction, etc.)

Respond in JSON format:
{
  "intent": "Brief description of what they want to know",
  "entities": ["entity1", "entity2"],
  "category": "category name"
}

RETURN ONLY THE JSON OBJECT, NO ADDITIONAL TEXT.`;

      const response = await this.callGemini(prompt, 500, 0.2);
      
      // Robust JSON extraction: find object boundaries
      const firstBrace = response.indexOf('{');
      const lastBrace = response.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = response.substring(firstBrace, lastBrace + 1);
        try {
          const analysis = JSON.parse(jsonStr);
          return analysis;
        } catch (parseError) {
          console.error('JSON parse error in query analysis:', parseError);
          console.error('Extracted JSON:', jsonStr.substring(0, 200));
        }
      }

      throw new Error('Failed to parse query analysis');
    } catch (error) {
      console.error('❌ Query analysis failed:', error);
      return {
        intent: 'General inquiry',
        entities: [],
        category: 'general',
      };
    }
  }

  /**
   * Chunk document into smaller pieces for retrieval
   */
  private chunkDocument(
    content: string,
    docName: string,
    chunkSize: number = 1000
  ): { content: string; source: string }[] {
    const chunks: { content: string; source: string }[] = [];
    
    // Split by paragraphs first
    const paragraphs = content.split(/\n\n+/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          source: docName,
        });
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        source: docName,
      });
    }
    
    return chunks;
  }

  /**
   * Calculate relevance score between question and content
   */
  private calculateRelevance(
    question: string,
    content: string,
    queryAnalysis: { intent: string; entities: string[]; category: string }
  ): number {
    const questionLower = question.toLowerCase();
    const contentLower = content.toLowerCase();
    
    let score = 0;
    
    // Check for exact question keywords
    const questionWords = questionLower.split(/\s+/).filter(w => w.length > 3);
    const matchedWords = questionWords.filter(word => contentLower.includes(word));
    score += (matchedWords.length / questionWords.length) * 0.4;
    
    // Check for entities
    const matchedEntities = queryAnalysis.entities.filter(entity =>
      contentLower.includes(entity.toLowerCase())
    );
    score += (matchedEntities.length / Math.max(queryAnalysis.entities.length, 1)) * 0.4;
    
    // Check for category-specific keywords
    const categoryKeywords = this.getCategoryKeywords(queryAnalysis.category);
    const categoryMatches = categoryKeywords.filter(keyword =>
      contentLower.includes(keyword.toLowerCase())
    );
    score += (categoryMatches.length / Math.max(categoryKeywords.length, 1)) * 0.2;
    
    return Math.min(score, 1.0);
  }

  /**
   * Get category-specific keywords
   */
  private getCategoryKeywords(category: string): string[] {
    const keywordMap: { [key: string]: string[] } = {
      financial: ['revenue', 'cost', 'profit', 'margin', 'burn', 'runway', 'valuation'],
      team: ['founder', 'CEO', 'CTO', 'team', 'experience', 'hire', 'advisor'],
      market: ['market', 'TAM', 'SAM', 'customer', 'segment', 'growth'],
      product: ['product', 'feature', 'technology', 'platform', 'solution'],
      risks: ['risk', 'challenge', 'concern', 'competition', 'threat'],
      traction: ['growth', 'user', 'customer', 'revenue', 'MRR', 'ARR'],
    };
    
    return keywordMap[category] || [];
  }

  /**
   * Generate answer using Gemini with retrieved context
   */
  private async generateAnswer(
    question: string,
    retrievedInfo: {
      relevantChunks: { content: string; source: string; relevance: number }[];
      analysisData: string;
    },
    context: DueDiligenceContext
  ): Promise<{
    content: string;
    sources: string[];
    confidence: number;
  }> {
    try {
      console.log('🤖 Generating answer with Gemini...');

      // Build context for Gemini
      const contextText = `
Company: ${context.companyName}

=== RELEVANT DOCUMENT EXCERPTS ===
${retrievedInfo.relevantChunks
  .map(
    (chunk, i) =>
      `[${i + 1}] From "${chunk.source}" (Relevance: ${(chunk.relevance * 100).toFixed(0)}%):\n${chunk.content}`
  )
  .join('\n\n')}

=== ANALYSIS DATA ===
${retrievedInfo.analysisData}

=== CONVERSATION HISTORY ===
${context.conversationHistory
  .slice(-5) // Last 5 messages for context
  .map(msg => `${msg.role}: ${msg.content}`)
  .join('\n')}
`;

      const prompt = `You are an expert investment analyst helping an investor with due diligence on ${context.companyName}.

The investor asks: "${question}"

Based on the following context, provide a detailed, accurate answer:

${contextText}

IMPORTANT INSTRUCTIONS:
1. Answer directly and professionally, as if you're a senior analyst
2. Cite specific sources using [Source Name] when referencing information
3. If information is not available in the documents, clearly state "Based on the provided documents, this information is not available"
4. Provide quantitative data when available (numbers, percentages, dates)
5. Flag any concerns or red flags you notice
6. Keep your answer focused and concise (2-4 paragraphs)
7. End with a brief actionable insight if relevant

Your answer:`;

      const response = await this.callGemini(prompt, 800, 0.3);

      // Extract cited sources
      const sources = [...new Set(
        retrievedInfo.relevantChunks.map(chunk => chunk.source)
      )];

      // Calculate confidence based on relevance scores
      const avgRelevance = retrievedInfo.relevantChunks.length > 0
        ? retrievedInfo.relevantChunks.reduce((sum, chunk) => sum + chunk.relevance, 0) /
          retrievedInfo.relevantChunks.length
        : 0;
      
      const confidence = Math.round(avgRelevance * 100);

      console.log('✅ Answer generated successfully');
      return {
        content: response.trim(),
        sources,
        confidence,
      };
    } catch (error) {
      console.error('❌ Answer generation failed:', error);
      return {
        content: 'I apologize, but I encountered an error generating an answer. Please try again.',
        sources: [],
        confidence: 0,
      };
    }
  }

  /**
   * Suggest follow-up questions based on conversation
   */
  async suggestFollowUpQuestions(
    context: DueDiligenceContext
  ): Promise<string[]> {
    try {
      const recentMessages = context.conversationHistory.slice(-3);
      
      const prompt = `You are helping an investor with due diligence on ${context.companyName}.

Recent conversation:
${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Suggest 3 relevant follow-up questions the investor might want to ask next. Focus on:
- Deeper dive into mentioned topics
- Related risk areas
- Important details not yet covered
- Financial or operational clarifications

Respond as a JSON array of strings:
["Question 1?", "Question 2?", "Question 3?"]

RETURN ONLY THE JSON ARRAY, NO ADDITIONAL TEXT.`;

      const response = await this.callGemini(prompt, 300, 0.5);

      // Robust JSON extraction: find array boundaries
      const firstBracket = response.indexOf('[');
      const lastBracket = response.lastIndexOf(']');
      
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        const jsonStr = response.substring(firstBracket, lastBracket + 1);
        try {
          const suggestions = JSON.parse(jsonStr);
          return suggestions;
        } catch (parseError) {
          console.error('JSON parse error in suggestions:', parseError);
          console.error('Extracted JSON:', jsonStr.substring(0, 200));
        }
      }

      throw new Error('Failed to parse suggestions');
    } catch (error) {
      console.error('❌ Suggestion generation failed:', error);
      return [
        'What are the key financial metrics?',
        'Who are the main competitors?',
        'What are the biggest risks?',
      ];
    }
  }

  /**
   * Analyze sentiment and concerns from conversation
   */
  async analyzeInvestorConcerns(
    context: DueDiligenceContext
  ): Promise<{
    primaryConcerns: string[];
    positiveSignals: string[];
    unansweredQuestions: string[];
  }> {
    try {
      const prompt = `Analyze this investor's due diligence conversation for ${context.companyName}.

Conversation history:
${context.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Identify:
1. Primary concerns the investor has raised
2. Positive signals or areas of interest
3. Questions that may not have been fully answered

Respond in JSON format:
{
  "primaryConcerns": ["Concern 1", "Concern 2"],
  "positiveSignals": ["Signal 1", "Signal 2"],
  "unansweredQuestions": ["Question 1", "Question 2"]
}

RETURN ONLY THE JSON OBJECT, NO ADDITIONAL TEXT.`;

      const response = await this.callGemini(prompt, 600, 0.3);
      
      // Robust JSON extraction: find object boundaries
      const firstBrace = response.indexOf('{');
      const lastBrace = response.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = response.substring(firstBrace, lastBrace + 1);
        try {
          const concerns = JSON.parse(jsonStr);
          return concerns;
        } catch (parseError) {
          console.error('JSON parse error in concern analysis:', parseError);
          console.error('Extracted JSON:', jsonStr.substring(0, 200));
        }
      }

      throw new Error('Failed to parse concern analysis');
    } catch (error) {
      console.error('❌ Concern analysis failed:', error);
      return {
        primaryConcerns: [],
        positiveSignals: [],
        unansweredQuestions: [],
      };
    }
  }

  /**
   * Helper: Call Gemini AI
   */
  private async callGemini(prompt: string, maxTokens: number = 2000, temperature: number = 0.3): Promise<string> {
    try {
      const analysis = await geminiService.analyzeStartupData(prompt, 'company');
      return typeof analysis === 'string' ? analysis : JSON.stringify(analysis);
    } catch (error) {
      console.error('❌ Gemini call failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiDueDiligenceAssistant = new AIDueDiligenceAssistant();
