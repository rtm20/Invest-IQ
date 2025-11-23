# 🚀 Google Services Setup for Competitor Analysis

## Overview
Since you have **Google Cloud credits**, we can leverage Google's powerful APIs for FREE competitor research!

## 🎯 APIs We'll Use:

### 1. Google Custom Search JSON API
**Purpose:** Find competitor information from web  
**Cost:** 100 queries/day FREE, then $5 per 1000 queries  
**Setup:**

```bash
1. Go to: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
2. Enable "Custom Search API"
3. Create API Key: https://console.cloud.google.com/apis/credentials
4. Create Programmable Search Engine: https://programmablesearchengine.google.com/
   - Search the entire web
   - Get your Search Engine ID
5. Add to .env.local:
   GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 2. Google Gemini AI (Already Set Up!)
**Purpose:** Analyze and structure competitor data  
**Cost:** Already included in your GCP credits  
**Status:** ✅ Already configured

### 3. Google Knowledge Graph API (Optional)
**Purpose:** Get structured company information  
**Cost:** 100,000 queries/day FREE  
**Setup:**

```bash
1. Enable: https://console.cloud.google.com/apis/library/kgsearch.googleapis.com
2. Use same API key as Custom Search
3. Add to .env.local:
   GOOGLE_KNOWLEDGE_GRAPH_API_KEY=your_api_key_here
```

## 📝 Quick Setup Steps:

### Step 1: Enable APIs in GCP Console
```bash
# Go to your project:
https://console.cloud.google.com/apis/library?project=ai-startup-analyst-hackathon

# Enable these:
✅ Custom Search API
✅ Knowledge Graph Search API (optional)
✅ Gemini API (already enabled)
```

### Step 2: Create API Key
```bash
# Go to:
https://console.cloud.google.com/apis/credentials?project=ai-startup-analyst-hackathon

# Click "Create Credentials" → "API Key"
# Copy the key
```

### Step 3: Create Custom Search Engine
```bash
# Go to:
https://programmablesearchengine.google.com/controlpanel/create

# Settings:
- Name: "Startup Competitor Search"
- What to search: "Search the entire web"
- Click "Create"
- Copy your "Search engine ID"
```

### Step 4: Update .env.local
```bash
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSy...your_key
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5...your_id
```

### Step 5: Deploy
```bash
vercel deploy --prod
```

## 🎯 How It Works:

### Flow Diagram:
```
User uploads pitch deck for "TechCorp" in "AI/ML" sector
    ↓
Backend searches: "top AI/ML startups funding valuation"
    ↓
Google Custom Search returns 5 results
    ↓
Gemini AI analyzes search results
    ↓
Extracts: company names, funding, metrics
    ↓
UI displays real competitor data ✅
```

### Example API Response:
```json
{
  "success": true,
  "competitors": [
    {
      "name": "OpenAI",
      "fundingRaised": "$13.5B",
      "valuation": "$157B",
      "revenueGrowth": "Not Disclosed",
      "employees": "1000+",
      "keyHighlight": "Leading AI research company behind ChatGPT",
      "dataQuality": "partial"
    }
  ],
  "dataSource": "Google Search + Gemini AI Analysis"
}
```

## 💰 Cost Analysis:

| Service | Free Tier | Cost After | Your Usage |
|---------|-----------|------------|------------|
| Custom Search | 100/day | $5/1000 | ~10-20/day |
| Gemini AI | Included in credits | Pay-as-you-go | Already using |
| Knowledge Graph | 100k/day | FREE forever | Optional |

**Estimated Monthly Cost:** $0-5 (well within free tier)

## 🔍 What Data We Can Find:

### ✅ Available from Google Search:
- Company names in the sector
- Recent funding announcements
- Valuation information from news
- Employee count from LinkedIn/company sites
- Key milestones and achievements
- Partnerships and acquisitions

### ⚠️ May Not Be Available:
- Private company detailed financials
- Real-time revenue numbers
- Confidential metrics
- Non-public company data

### 🎯 Data Quality Levels:
- **Full:** Complete metrics from recent news/reports
- **Partial:** Some metrics available, others estimated
- **Estimated:** Gemini AI estimation based on context

## 🚀 Alternative Approach (If You Don't Want to Set Up APIs):

Use **Document-Based Comparison** instead:
1. Upload multiple company pitch decks
2. Gemini AI extracts metrics from each
3. Compare side-by-side automatically
4. **100% real data** from actual documents
5. **No external APIs needed!**

## 📊 Testing:

### Test with API:
```bash
curl -X POST http://localhost:3000/api/competitor-analysis \
  -H "Content-Type: application/json" \
  -d '{"industry":"AI/ML","companyName":"MyStartup"}'
```

### Expected Response (with API):
- 1-3 real competitors found
- Metrics extracted from search results
- Clear data quality indicators

### Expected Response (without API):
- Message: "Upload competitor documents for AI analysis"
- Alternative solution shown
- No fake data displayed

## ✅ Benefits of This Approach:

1. **Uses Your GCP Credits** - Free for you!
2. **Real Data** - From Google Search results
3. **AI-Powered** - Gemini structures the data
4. **Transparent** - Shows data quality level
5. **Graceful Fallback** - Works without API too
6. **Hackathon Ready** - Impressive live demo

## 🎓 For Hackathon Judges:

### With APIs Configured:
"Our platform uses Google Custom Search + Gemini AI to automatically find and analyze competitors in real-time, extracting metrics from public sources."

### Without APIs:
"Users can upload competitor pitch decks, and our AI compares them side-by-side using document analysis - no fake data, everything from real documents."

**Both approaches are legitimate and impressive!** 🚀

---

**Next Steps:**
1. Enable Google Custom Search API (5 min setup)
2. Get API key and Search Engine ID
3. Add to .env.local
4. Deploy
5. Test with real sector names

Or skip APIs and use document-based comparison (already working!)
