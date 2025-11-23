# 🚀 Invest-IQ - Google AI Hackathon 2025 TOP 10 FINALIST

**AI-Powered Investment Due Diligence Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Google Cloud AI](https://img.shields.io/badge/Google%20Cloud-AI%20Powered-blue)](https://cloud.google.com/ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

<img width="1423" height="905" alt="image" src="https://github.com/user-attachments/assets/d1e14060-ea6a-4844-8335-f28a9fadc5cb" />

**🏆 TOP 10 Finalist - Google Cloud Gen AI Exchange Hackathon 2025**
*Team: The Tourists | Leader: Ritesh Meena*

## 🎯 **Project Overview**

Invest-IQ is an enterprise-grade investment analysis platform that revolutionizes startup due diligence using **Google Cloud's Gemini AI, Vision API, and Custom Search**. Automatically analyze pitch decks, discover competitors, generate investment memos, and chat with an AI due diligence assistant - all powered by real Google Cloud AI services.

### 🏆 **Why Invest-IQ Stands Out**

- ✅ **No Hardcoded Data**: 100% AI-generated insights with transparent error handling
- ✅ **3 Killer AI Features**: Competitive Intelligence, Investment Memo Generator, Due Diligence Chatbot
- ✅ **Real Competitor Discovery**: Google Custom Search + AI validation filters out conferences/articles
- ✅ **Production-Ready**: Deployed on Vercel with complete error handling
- ✅ **Professional PDFs**: AI-generated investment memos and analysis reports

## 🤖 **Google AI Services Integration**

### **1. Google Vertex AI (Gemini 2.0 Flash)**
- **Model**: `gemini-2.0-flash` (latest experimental model with enhanced capabilities)
- **Document Analysis**: Extract company info, financials, team data from pitch decks
- **Competitor Analysis**: Batch process competitor profiles in single API call
- **Investment Memos**: Generate 12-section VC-style memos with JSON structured data
- **Due Diligence Chat**: Context-aware conversational AI for investor questions
- **Rate Limit Optimization**: Reduced API calls by 70% through batching + retry logic

### **2. Google Vision API**
- **Document OCR**: Extract text from PDF, DOCX, PPTX, images
- **Multi-format Support**: PDF, JPEG, PNG, GIF, WebP, BMP, TIFF, DOCX
- **High Accuracy**: Production-grade text recognition for financial documents
- **Fallback System**: Primary extraction method for all document types

### **3. Google Custom Search API**
- **Competitor Discovery**: Automatically find competitors using industry + market queries
- **AI Validation**: Filters out conferences, events, and article titles
- **Smart Filtering**: Excludes "HR Tech 2025", "Top 10 lists", "Funded by YC" results
- **Real Companies Only**: AI validates each search result is an actual competitor

### **4. Google Cloud Storage** (Optional)
- **Secure File Handling**: Encrypted document storage
- **Signed URLs**: Temporary access for processed documents
- **Scalable Architecture**: Handle thousands of document uploads

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Google Cloud Account with billing enabled
- Service account with Vertex AI and Vision API access

### **1. Clone & Install**
```bash
git clone https://github.com/rtm20/Invest-IQ.git
cd Invest-IQ
npm install
```

### **2. Google Cloud Setup**
See [GOOGLE_SERVICES_SETUP.md](./docs/GOOGLE_SERVICES_SETUP.md) for detailed instructions.

Quick setup:
```bash
# Enable required APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable customsearch.googleapis.com

# Create service account and download key
gcloud iam service-accounts create invest-iq-service
gcloud iam service-accounts keys create google-cloud-key.json \
  --iam-account=invest-iq-service@PROJECT_ID.iam.gserviceaccount.com

# Grant permissions
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:invest-iq-service@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### **3. Environment Variables**
Create `.env.local`:
```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CUSTOM_SEARCH_API_KEY=your-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### **4. Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

### **5. Deploy to Vercel**
```bash
npm install -g vercel
vercel deploy --prod
```

## 🎨 **Key Features**

### **1. 📊 Multi-Document Analysis**
- Upload multiple files (PDF, DOCX, PPTX, TXT)
- AI extracts and consolidates data from all documents
- Comprehensive scoring: Team (20pts), Market (20pts), Product (20pts), Traction (20pts), Financial (15pts), Competitive (5pts)
- Download professional analysis report PDF

### **2. 🎯 AI Competitive Intelligence**
- **Auto-Discovery**: Google Custom Search finds competitors automatically
- **AI Validation**: Filters out conferences, events, and articles
- **Deep Analysis**: Funding, team size, key differentiators, strengths, weaknesses
- **Market Positioning**: Your position vs competitors with strategic insights
- **5 Strategic Recommendations**: AI-generated competitive strategy

### **3. 📝 Investment Memo Generator**
- **12-Section VC Memo**: Executive summary, company overview, market analysis, business model, team assessment, traction, financials, risks, thesis, deal terms, recommendation
- **Professional PDF**: Branded investment committee memo with color-coded sections
- **AI-Generated Content**: No templates - 100% AI-written based on your data
- **Fixed PDF Rendering**: Light colored backgrounds, visible text, proper recommendation colors

### **4. 💬 AI Due Diligence Chatbot**
- Context-aware Q&A about analyzed companies
- Ask about financials, team, market, competitors
- Natural language responses with evidence citations
- Session history and follow-up questions

### **5. 🛡️ No Fallback Data**
- **Removed all hardcoded data**: No dummy competitors, fake memos, or placeholder metrics
- **Transparent Errors**: Shows proper error messages instead of fake data
- **Production-Ready**: Real error handling for API failures

## 🏗️ **Architecture**

```
Frontend (Next.js 14)
    ↓
API Routes (/app/api)
    ↓
┌─────────────────────────────────────┐
│  Google Cloud AI Services           │
│  ├── Vertex AI (Gemini 1.5 Flash)  │
│  ├── Vision API (Document OCR)     │
│  └── Custom Search API             │
└─────────────────────────────────────┘
    ↓
AI Processing Pipeline
    ├── Document Consolidation
    ├── Competitor Discovery & Analysis
    ├── Investment Memo Generation
    └── Due Diligence Chatbot
```

### **Key Technical Decisions**

1. **Batch API Calls**: Reduced competitor analysis from 5 calls → 1 call
2. **Retry Logic**: Exponential backoff for 429 rate limit errors (2s, 4s, 8s)
3. **Stable Models**: Using `gemini-1.5-flash-002` (60 RPM) instead of experimental models (2 RPM)
4. **Vision API Fallback**: All document types use Vision API for reliability
5. **No Fallback Data**: Errors propagate to UI instead of showing fake data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Google Cloud Account (free tier)
- Google Cloud CLI installed

### 1. Clone & Install
```bash
git clone <repo-url>
cd ai-startup-analyst
npm install
```

### 2. Google Cloud Setup
```bash
# Create new project
gcloud projects create ai-startup-analyst-demo

# Set project
gcloud config set project ai-startup-analyst-demo

# Enable APIs
gcloud services enable vision.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable firestore.googleapis.com

# Create service account
gcloud iam service-accounts create ai-analyst-service
gcloud projects add-iam-policy-binding ai-startup-analyst-demo \
  --member="serviceAccount:ai-analyst-service@ai-startup-analyst-demo.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
gcloud projects add-iam-policy-binding ai-startup-analyst-demo \
  --member="serviceAccount:ai-analyst-service@ai-startup-analyst-demo.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Download key
gcloud iam service-accounts keys create google-cloud-key.json \
  --iam-account=ai-analyst-service@ai-startup-analyst-demo.iam.gserviceaccount.com
```

### 3. Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your Google Cloud project details
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📁 **Project Structure**

```
invest-iq/
├── app/                           # Next.js 14 app directory
│   ├── page.tsx                   # Home page with multi-document upload
│   ├── layout.tsx                 # Root layout
│   └── api/                       # API routes
│       ├── multi-document-analyze/ # Main analysis endpoint
│       ├── competitive-intelligence/ # Competitor discovery
│       ├── generate-memo/         # Investment memo generation
│       └── generate-memo-pdf/     # PDF export
├── components/                    # React components
│   ├── MultiDocumentUpload.tsx    # Main upload interface
│   ├── CompetitiveLandscape.tsx   # Competitor display
│   ├── InvestmentMemoViewer.tsx   # Memo display
│   ├── AIDueDiligenceChatbot.tsx  # Chat interface
│   └── ui/                        # Reusable UI components
├── lib/                           # Core business logic
│   ├── google-cloud.ts            # Google Cloud service wrapper
│   ├── ai-competitive-intelligence.ts # Competitor analysis
│   ├── investment-memo-generator.ts   # Memo generation
│   ├── memo-pdf-generator.ts      # PDF creation (jsPDF)
│   └── enhanced-ai-analyzer.ts    # Document analysis
├── docs/                          # Documentation
│   ├── GOOGLE_SERVICES_SETUP.md   # Setup guide
│   ├── FALLBACK_DATA_REMOVAL_COMPLETE.md # No dummy data
│   └── COMPETITIVE_INTELLIGENCE_FIX.md   # Search improvements
└── google-cloud-key.json          # Service account key (gitignored)
```

## 🔧 Google Cloud Free Tier Usage

This project is optimized for Google Cloud's generous free tier:

- **Cloud Functions**: 2M invocations/month
- **Cloud Storage**: 5GB storage  
- **Cloud Vision**: 1,000 requests/month
- **Vertex AI**: Limited free tier for Gemini
- **Firestore**: 50K reads, 20K writes/day

## 🎯 Demo Scenarios

### 1. Upload Pitch Deck
- Drag & drop PDF/PPTX file
- Watch real-time processing stages
- Get complete analysis in <2 minutes

### 2. Risk Analysis
- Upload problematic deck with red flags
- See AI-detected inconsistencies
- Review risk assessment matrix

### 3. Benchmarking
- Compare startup metrics vs industry
- View percentile rankings
- Get investment recommendations

## 🧠 AI Capabilities

### Document Processing
- **OCR Extraction**: Cloud Vision API for text/image processing
- **Structure Analysis**: Identify slides, sections, financial tables
- **Multi-format Support**: PDF, PPTX, DOCX, TXT

### Startup Analysis  
- **Financial Metrics**: Revenue, growth, burn rate, runway
- **Team Assessment**: Founder backgrounds, experience gaps
- **Market Analysis**: TAM/SAM validation, competitive positioning
- **Risk Detection**: Inconsistencies, unrealistic claims, red flags

### Investment Insights
- **Scoring**: 0-100 investment recommendation score
- **Benchmarking**: Industry comparisons and percentiles  
- **Due Diligence**: Key questions and next steps
- **Executive Summary**: Investor-ready 2-3 sentence insights

## 🔧 **Recent Improvements (Nov 2025)**

### **Competitive Intelligence Fixes**
- ✅ Added AI validation layer to filter out conferences and articles
- ✅ Improved search query: excludes "conference", "event", "summit", "news"
- ✅ Validates that search results are actual companies before analysis
- ✅ Removed fallback data that created fake competitors

### **PDF Generation Fixes**
- ✅ Fixed colored boxes: now use light backgrounds with dark visible text
- ✅ Fixed red flags: changed from emoji (🚩) to bullet points (▲) to avoid encoding issues
- ✅ Fixed recommendation colors: PASS = Orange (not red), INVEST = Green

### **Data Integrity**
- ✅ Removed ALL hardcoded fallback data (~200 lines)
- ✅ Removed fake competitor names, dummy memos, placeholder metrics
- ✅ Errors now propagate to UI with proper messages instead of showing fake data
- ✅ Fixed TypeScript interface mismatches between API and UI

### **API Optimization**
- ✅ Reduced API calls by 70% through batching
- ✅ Added exponential backoff retry logic for rate limits
- ✅ Using latest Gemini 2.0 Flash model for enhanced AI capabilities

## 🚀 **Deployment**

### **Production (Vercel)**
```bash
# Deploy to production
vercel --prod
```

**Live Demo**: https://invest-iq.vercel.app

### **Environment Variables (Vercel)**
Set these in your Vercel project settings:
```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_CUSTOM_SEARCH_API_KEY=your-api-key
GOOGLE_SEARCH_ENGINE_ID=your-search-engine-id
```

### **Service Account Setup**
Upload `google-cloud-key.json` content to Vercel environment variable:
```
GOOGLE_APPLICATION_CREDENTIALS_JSON=<paste entire JSON content>
```

## 📊 **Performance Metrics**

- **Processing Speed**: <15 seconds for multi-document analysis
- **API Efficiency**: 70% reduction in API calls through batching
- **Competitor Discovery**: 5 validated competitors in <12 seconds
- **Memo Generation**: Complete 12-section memo in <20 seconds
- **PDF Export**: Professional PDF in <3 seconds

## 🤝 **Team**

**The Tourists** - Google AI Hackathon 2025 TOP 10 Finalist
- **Team Leader**: Ritesh Meena
- **Project**: Invest-IQ - AI-Powered Investment Due Diligence
- **Event**: Google Cloud Gen AI Exchange Hackathon 2025
- **Status**: TOP 10 Finalist (Finale: Nov 29, 2025)

## 📜 **License**

MIT License - see LICENSE file for details.

## 🙏 **Acknowledgments**

- Google Cloud AI team for Gemini, Vision API, and Custom Search
- Vercel for seamless deployment and hosting
- Next.js team for an amazing framework
- Open source community for inspiration and tools

---

**Built with ❤️ for the Google Cloud Gen AI Exchange Hackathon 2025**

*Showcasing how Gemini AI, Vision API, and Custom Search can transform investment due diligence.*

**Live Demo**: https://invest-iq.vercel.app

