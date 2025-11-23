// API Route: AI Due Diligence Assistant Chat
import { NextRequest, NextResponse } from 'next/server';
import { aiDueDiligenceAssistant, DueDiligenceContext } from '@/lib/ai-due-diligence-assistant';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

export async function POST(request: NextRequest) {
  try {
    console.log('💬 AI Due Diligence Assistant API called');

    const body = await request.json();
    const { action, question, context } = body;

    // Validate required fields
    if (!action || !context) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['action', 'context'],
        },
        { status: 400 }
      );
    }

    const dueDiligenceContext: DueDiligenceContext = context;

    switch (action) {
      case 'ask': {
        if (!question) {
          return NextResponse.json(
            { error: 'Question is required for ask action' },
            { status: 400 }
          );
        }

        console.log(`❓ Question: ${question}`);
        const answer = await aiDueDiligenceAssistant.askQuestion(
          question,
          dueDiligenceContext
        );

        console.log('✅ Answer generated');
        return NextResponse.json({
          success: true,
          message: answer,
        });
      }

      case 'suggest': {
        console.log('💡 Generating follow-up suggestions');
        const suggestions = await aiDueDiligenceAssistant.suggestFollowUpQuestions(
          dueDiligenceContext
        );

        console.log('✅ Suggestions generated');
        return NextResponse.json({
          success: true,
          suggestions,
        });
      }

      case 'analyze-concerns': {
        console.log('🔍 Analyzing investor concerns');
        const concerns = await aiDueDiligenceAssistant.analyzeInvestorConcerns(
          dueDiligenceContext
        );

        console.log('✅ Concerns analyzed');
        return NextResponse.json({
          success: true,
          concerns,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', validActions: ['ask', 'suggest', 'analyze-concerns'] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Due diligence assistant API error:', error);

    return NextResponse.json(
      {
        error: 'Due diligence assistant failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
