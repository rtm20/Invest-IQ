'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, MessageCircle, Lightbulb, TrendingUp } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
}

interface DueDiligenceContext {
  companyName: string;
  documents: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  analysisResults?: any;
  competitiveAnalysis?: any;
  conversationHistory: ChatMessage[];
}

interface Props {
  context: DueDiligenceContext;
  onMessageSent?: (message: ChatMessage) => void;
}

export default function AIDueDiligenceChatbot({ context, onMessageSent }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(context.conversationHistory || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [concerns, setConcerns] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const askQuestion = async (question: string) => {
    if (!question.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/due-diligence-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ask',
          question,
          context: {
            ...context,
            conversationHistory: [...messages, userMessage],
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = data.message;

      setMessages((prev) => [...prev, assistantMessage]);
      
      if (onMessageSent) {
        onMessageSent(assistantMessage);
      }

      // Get follow-up suggestions
      await getSuggestions();
    } catch (err) {
      console.error('Error asking question:', err);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    try {
      const response = await fetch('/api/due-diligence-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest',
          context: {
            ...context,
            conversationHistory: messages,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Error getting suggestions:', err);
    }
  };

  const analyzeConcerns = async () => {
    try {
      const response = await fetch('/api/due-diligence-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-concerns',
          context: {
            ...context,
            conversationHistory: messages,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConcerns(data.concerns);
      }
    } catch (err) {
      console.error('Error analyzing concerns:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    askQuestion(suggestion);
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'secondary';
    if (confidence >= 0.7) return 'default';
    if (confidence >= 0.5) return 'warning';
    return 'destructive';
  };

  const getConfidenceLabel = (confidence?: number) => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.7) return 'High Confidence';
    if (confidence >= 0.5) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Real-time AI Due Diligence Assistant
          </CardTitle>
          <CardDescription>
            Ask questions about {context.companyName}. Powered by RAG (Retrieval Augmented Generation)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Start by asking a question about {context.companyName}</p>
                  <p className="text-sm mt-2">Try: "What are the main risks?" or "How strong is the team?"</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        {message.confidence !== undefined && (
                          <Badge variant={getConfidenceColor(message.confidence)} className="text-xs">
                            {getConfidenceLabel(message.confidence)}
                          </Badge>
                        )}
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Sources: </span>
                            {message.sources.join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                placeholder="Ask a question about the startup..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Questions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggested Follow-up Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={loading}
                  className="text-left"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyze Concerns */}
      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Conversation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeConcerns}
              disabled={loading}
            >
              Analyze Investor Concerns
            </Button>

            {concerns && (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Primary Concerns</div>
                  <div className="flex flex-wrap gap-2">
                    {concerns.primaryConcerns.map((concern: string, i: number) => (
                      <Badge key={i} variant="destructive">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Positive Signals</div>
                  <div className="flex flex-wrap gap-2">
                    {concerns.positiveSignals.map((signal: string, i: number) => (
                      <Badge key={i} variant="default">
                        {signal}
                      </Badge>
                    ))}
                  </div>
                </div>

                {concerns.unansweredQuestions.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Unanswered Questions</div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {concerns.unansweredQuestions.map((question: string, i: number) => (
                        <li key={i}>• {question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
