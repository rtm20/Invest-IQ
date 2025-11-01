import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '../../../lib/google-cloud';

/**
 * Dedicated API for calculating investment scores
 * Separate from main analysis to ensure reliability
 * Uses focused Gemini prompt for accurate scoring
 */
export async function POST(request: NextRequest) {
  try {
    const { consolidatedData, analysisText } = await request.json();
    
    console.log('🎯 Calculating investment scores with dedicated Gemini call...');
    
    const scorePrompt = `
You are an expert venture capital analyst. Based on the following startup data, calculate detailed investment scores.

STARTUP DATA:
${JSON.stringify(consolidatedData, null, 2)}

${analysisText ? `\nADDITIONAL CONTEXT:\n${analysisText}` : ''}

Calculate scores for 6 categories. Each category has specific factors with max points.
Return ONLY valid JSON with this EXACT structure:

{
  "founderAnalysis": {
    "score": 0,
    "breakdown": {
      "founderExperience": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Specific assessment based on data"
      },
      "teamComposition": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Specific assessment"
      },
      "advisoryBoard": {
        "points": 0,
        "maxPoints": 3,
        "assessment": "Specific assessment"
      },
      "trackRecord": {
        "points": 0,
        "maxPoints": 3,
        "assessment": "Specific assessment"
      }
    }
  },
  "marketAnalysis": {
    "score": 0,
    "breakdown": {
      "marketSize": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Specific assessment"
      },
      "marketTiming": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Specific assessment"
      },
      "competitionLevel": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Specific assessment"
      }
    }
  },
  "productAnalysis": {
    "score": 0,
    "breakdown": {
      "innovationLevel": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Specific assessment"
      },
      "productMarketFit": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Specific assessment"
      },
      "scalability": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Specific assessment"
      }
    }
  },
  "tractionAnalysis": {
    "score": 0,
    "breakdown": {
      "customerGrowth": {
        "points": 0,
        "maxPoints": 8,
        "assessment": "Specific assessment"
      },
      "revenueGrowth": {
        "points": 0,
        "maxPoints": 7,
        "assessment": "Specific assessment"
      },
      "keyPartnerships": {
        "points": 0,
        "maxPoints": 5,
        "assessment": "Specific assessment"
      }
    }
  },
  "financialAnalysis": {
    "score": 0,
    "breakdown": {
      "unitEconomics": {
        "points": 0,
        "maxPoints": 6,
        "assessment": "Specific assessment"
      },
      "burnRate": {
        "points": 0,
        "maxPoints": 5,
        "assessment": "Specific assessment"
      },
      "revenueModel": {
        "points": 0,
        "maxPoints": 4,
        "assessment": "Specific assessment"
      }
    }
  },
  "competitiveAnalysis": {
    "score": 0,
    "breakdown": {
      "uniqueValueProp": {
        "points": 0,
        "maxPoints": 2,
        "assessment": "Specific assessment"
      },
      "defensibility": {
        "points": 0,
        "maxPoints": 3,
        "assessment": "Specific assessment"
      }
    }
  }
}

CRITICAL SCORING RULES:
1. Category score = sum of all factor points in that category (out of 100)
2. Points must NOT exceed maxPoints for each factor
3. If data is missing for a factor, give 0-30% of maxPoints based on available context
4. Base scores on ACTUAL data provided, not assumptions
5. Be conservative - insufficient data = lower scores

SCORING FORMULA TO VERIFY:
- Team Quality (founderAnalysis.score): max 20 points (8+6+3+3)
- Market Opportunity (marketAnalysis.score): max 20 points (8+6+6)
- Product Innovation (productAnalysis.score): max 20 points (8+6+6)
- Traction & Growth (tractionAnalysis.score): max 20 points (8+7+5)
- Financial Health (financialAnalysis.score): max 15 points (6+5+4)
- Competitive Advantage (competitiveAnalysis.score): max 5 points (2+3)

Overall Score = (Team*20% + Market*20% + Product*20% + Traction*20% + Financial*15% + Competitive*5%) * 5

Return ONLY the JSON object, no markdown, no explanation.
`;

    const scores = await geminiService.analyzeStartupData(scorePrompt, 'recommendation');
    
    // Validate the response
    if (!scores.founderAnalysis || !scores.marketAnalysis) {
      throw new Error('Invalid score structure returned from Gemini');
    }
    
    // Calculate category scores from breakdowns
    const calculateCategoryScore = (breakdown: any) => {
      let total = 0;
      for (const factor of Object.values(breakdown)) {
        if (factor && typeof factor === 'object' && 'points' in factor) {
          total += (factor as any).points || 0;
        }
      }
      return total;
    };
    
    // Ensure category scores match breakdown totals
    scores.founderAnalysis.score = calculateCategoryScore(scores.founderAnalysis.breakdown);
    scores.marketAnalysis.score = calculateCategoryScore(scores.marketAnalysis.breakdown);
    scores.productAnalysis.score = calculateCategoryScore(scores.productAnalysis.breakdown);
    scores.tractionAnalysis.score = calculateCategoryScore(scores.tractionAnalysis.breakdown);
    scores.financialAnalysis.score = calculateCategoryScore(scores.financialAnalysis.breakdown);
    scores.competitiveAnalysis.score = calculateCategoryScore(scores.competitiveAnalysis.breakdown);
    
    // Calculate overall score
    const overallScore = Math.round(
      (scores.founderAnalysis.score * 0.20) +
      (scores.marketAnalysis.score * 0.20) +
      (scores.productAnalysis.score * 0.20) +
      (scores.tractionAnalysis.score * 0.20) +
      (scores.financialAnalysis.score * 0.15) +
      (scores.competitiveAnalysis.score * 0.05)
    ) * 5; // Multiply by 5 to get score out of 100
    
    console.log('✅ Scores calculated successfully');
    console.log(`Overall: ${overallScore}, Team: ${scores.founderAnalysis.score}, Market: ${scores.marketAnalysis.score}`);
    
    return NextResponse.json({
      success: true,
      scores: {
        ...scores,
        overallScore
      }
    });
    
  } catch (error) {
    console.error('❌ Score calculation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to calculate scores',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
