/**
 * Sector-Specific Benchmarks for Investment Analysis
 * 
 * This file contains real-world benchmarks from successful companies
 * across different sectors to provide contextualized scoring.
 */

export interface SectorBenchmark {
  sector: string;
  category: string; // e.g., "Enterprise Software", "Consumer", "HealthTech"
  examples: {
    company: string;
    stage: string;
    keyMetrics: string;
  }[];
  teamBenchmarks: string[];
  marketBenchmarks: string[];
  productBenchmarks: string[];
  tractionBenchmarks: string[];
  financialBenchmarks: string[];
  competitiveBenchmarks: string[];
}

export const SECTOR_BENCHMARKS: Record<string, SectorBenchmark> = {
  "Enterprise SaaS": {
    sector: "Enterprise SaaS",
    category: "Enterprise Software",
    examples: [
      {
        company: "Snowflake",
        stage: "Series B (~2014)",
        keyMetrics: "$20B TAM, ~$10M ARR, 200% YoY growth, strong data engineering team"
      },
      {
        company: "Databricks",
        stage: "Series B (~2015)",
        keyMetrics: "$15M ARR, Apache Spark creators, enterprise contracts, 180% growth"
      },
      {
        company: "HashiCorp",
        stage: "Series B (~2016)",
        keyMetrics: "$20M ARR, open-source traction, DevOps market, technical founders"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Ex-FAANG engineers, previous startup experience, deep domain expertise in enterprise infrastructure",
      "Good Team (11-13/20): Solid technical background, some enterprise experience, building credible product",
      "Adequate Team (8-10/20): Technical skills present but limited enterprise sales experience"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $50B+ TAM, 20%+ CAGR, clear market leader emerging, multi-billion market opportunity",
      "Strong Market (14-16/20): $15-50B TAM, 15-25% CAGR, growing enterprise adoption, clear demand signals",
      "Good Market (11-13/20): $5-15B TAM, 10-20% CAGR, niche but growing market"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Production-ready, enterprise features (SSO, RBAC), API-first, strong integrations",
      "Strong Product (13-15/20): Core platform working, early enterprise features, good technical architecture",
      "Good Product (10-12/20): MVP with paying customers, basic features, technical debt manageable"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): $20M+ ARR, 100-150% growth, 50+ enterprise customers, low churn (<5% annually)",
      "Strong Traction (13-15/20): $10-20M ARR, 80-120% growth, 20-50 customers, reasonable retention (>90%)",
      "Good Traction (10-12/20): $3-10M ARR, 60-100% growth, 10-30 customers, building pipeline"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 70-80%+ gross margin, CAC payback <12 months, LTV/CAC >5x, clear path to profitability",
      "Strong (9-10/15): 65-75% gross margin, CAC payback 12-18 months, LTV/CAC >3x, healthy unit economics",
      "Good (6-8/15): 60-70% gross margin, CAC payback 18-24 months, LTV/CAC >2x, improving efficiency"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Unique data/network effects, proprietary technology, switching costs, clear differentiation",
      "Good Moat (3/5): Technical differentiation, early market position, building defensibility"
    ]
  },

  "Consumer FinTech": {
    sector: "Consumer FinTech",
    category: "Financial Technology",
    examples: [
      {
        company: "Stripe",
        stage: "Series A (~2011)",
        keyMetrics: "10,000+ developers, $2M+ processing volume/day, viral developer adoption"
      },
      {
        company: "Robinhood",
        stage: "Series B (~2014)",
        keyMetrics: "500K+ users, $0 commission model, 1M waitlist, mobile-first trading"
      },
      {
        company: "Chime",
        stage: "Series B (~2016)",
        keyMetrics: "1M+ users, banking-as-a-service, no-fee model, 15-20% MoM growth"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): FinTech veterans, regulatory expertise, previous exits, strong technical + compliance",
      "Good Team (11-13/20): Financial services background, technical capability, understanding of regulations",
      "Adequate Team (8-10/20): Technical skills but learning regulatory landscape"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $100B+ addressable market, clear disruption of traditional banking, regulatory tailwinds",
      "Strong Market (14-16/20): $30-100B market, digital-first adoption, changing consumer behavior",
      "Good Market (11-13/20): $10-30B market, niche financial services, growing digitization"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Banking/payment licenses, SOC2/PCI compliant, seamless UX, mobile-first",
      "Strong Product (13-15/20): Core financial product working, compliance in progress, good user experience",
      "Good Product (10-12/20): MVP with real transactions, working on licenses, basic compliance"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): 1M+ users, $100M+ transaction volume/month, 15%+ MoM growth, strong retention (60-70%)",
      "Strong Traction (13-15/20): 200K-1M users, $20-100M volume/month, 10-15% MoM growth, decent retention (50-60%)",
      "Good Traction (10-12/20): 50K-200K users, $5-20M volume/month, 8-12% MoM growth, building retention"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 40-60% gross margin (net of payment processing), CAC <$20, LTV >$200, clear monetization",
      "Strong (9-10/15): 30-50% gross margin, CAC $20-50, LTV >$100, path to monetization",
      "Good (6-8/15): 20-40% margin, CAC <$100, LTV >$50, testing revenue models"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Network effects, regulatory licenses, brand trust, switching costs",
      "Good Moat (3/5): User base, regulatory progress, product differentiation"
    ]
  },

  "HealthTech": {
    sector: "HealthTech",
    category: "Healthcare Technology",
    examples: [
      {
        company: "Oscar Health",
        stage: "Series B (~2014)",
        keyMetrics: "40K+ members, health insurance licenses, $150M+ premiums, tech-enabled care"
      },
      {
        company: "Ro (Roman Health)",
        stage: "Series B (~2018)",
        keyMetrics: "$50M+ revenue, telehealth pharmacy, 500K+ patients, multi-state licenses"
      },
      {
        company: "Tempus",
        stage: "Series B (~2016)",
        keyMetrics: "Clinical data platform, $25M+ revenue, partnerships with hospitals, genomic sequencing"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): MDs + technologists, regulatory affairs experts, previous FDA approvals, clinical advisors",
      "Good Team (11-13/20): Healthcare background, technical capability, building clinical team",
      "Adequate Team (8-10/20): Technical team learning healthcare, hiring medical advisors"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $50B+ healthcare market, clear clinical need, reimbursement path, regulatory feasibility",
      "Strong Market (14-16/20): $15-50B market, growing digital health adoption, value-based care trend",
      "Good Market (11-13/20): $5-15B market, niche condition, early digital transformation"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): FDA cleared/approved, HIPAA compliant, clinical validation, EHR integration",
      "Strong Product (13-15/20): Clinical testing underway, HIPAA compliant, regulatory path clear, pilot results",
      "Good Product (10-12/20): Working prototype, early clinical data, HIPAA compliant, regulatory strategy"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): 50K+ patients, $20M+ revenue, clinical outcomes published, hospital partnerships, FDA approval",
      "Strong Traction (13-15/20): 10K-50K patients, $5-20M revenue, pilot data strong, regulatory progress, payer interest",
      "Good Traction (10-12/20): 1K-10K patients, $1-5M revenue, early clinical validation, regulatory submission planned"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 60-70%+ gross margin (reimbursement locked), CAC payback <18 months, path to profitability clear",
      "Strong (9-10/15): 50-65% margin, reimbursement strategy, CAC payback <24 months, improving unit economics",
      "Good (6-8/15): 40-60% margin, testing reimbursement, CAC understanding developing"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Regulatory approvals, clinical data, provider relationships, patient outcomes, proprietary algorithms",
      "Good Moat (3/5): Clinical validation, regulatory progress, early partnerships"
    ]
  },

  "B2B SaaS": {
    sector: "B2B SaaS",
    category: "Business Software",
    examples: [
      {
        company: "HubSpot",
        stage: "Series B (~2009)",
        keyMetrics: "$15M ARR, 5K+ customers, inbound marketing, freemium model, 100% YoY growth"
      },
      {
        company: "Slack",
        stage: "Series B (~2014)",
        keyMetrics: "$12M ARR, 500K daily active users, viral adoption, 10% daily growth, enterprise interest"
      },
      {
        company: "Zoom",
        stage: "Series B (~2015)",
        keyMetrics: "$22M ARR, 65M meeting minutes/month, freemium, enterprise contracts, low churn"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): SaaS veterans, enterprise sales experience, previous successful exits, product-led growth expertise",
      "Good Team (11-13/20): SaaS background, building sales team, product experience",
      "Adequate Team (8-10/20): Technical product but learning B2B sales"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $20B+ TAM, clear SMB→Enterprise expansion path, 15%+ CAGR, workflow critical",
      "Strong Market (14-16/20): $8-20B TAM, growing SMB adoption, 12-20% CAGR",
      "Good Market (11-13/20): $3-8B TAM, niche vertical, 10-15% CAGR"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Self-serve onboarding, API/integrations, mobile app, analytics, enterprise features",
      "Strong Product (13-15/20): Core product polished, growing integrations, basic analytics, scaling well",
      "Good Product (10-12/20): Working product, early customers happy, building features"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): $12M+ ARR, 100-150% growth, 2K+ customers, <2% monthly churn, strong NPS (50+)",
      "Strong Traction (13-15/20): $5-12M ARR, 80-120% growth, 500-2K customers, <3% churn, good retention",
      "Good Traction (10-12/20): $1-5M ARR, 60-100% growth, 100-500 customers, <5% churn"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 75-85% gross margin, Magic Number >1.0, CAC payback <12 months, LTV/CAC >4x",
      "Strong (9-10/15): 70-80% margin, Magic Number 0.7-1.0, CAC payback 12-18 months, LTV/CAC >3x",
      "Good (6-8/15): 65-75% margin, Magic Number >0.5, CAC payback <24 months, LTV/CAC >2x"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Network effects, data moat, integrations ecosystem, switching costs, brand",
      "Good Moat (3/5): Product differentiation, early market share, growing integrations"
    ]
  },

  "Consumer Social": {
    sector: "Consumer Social",
    category: "Consumer Internet",
    examples: [
      {
        company: "Instagram",
        stage: "Series A (~2011)",
        keyMetrics: "10M users, 1M daily photos, viral growth, mobile-first, engagement 60+ min/day"
      },
      {
        company: "Discord",
        stage: "Series B (~2017)",
        keyMetrics: "25M users, 130M messages/day, gaming communities, 30% MoM growth"
      },
      {
        company: "TikTok (Musical.ly acquisition)",
        stage: "Early growth (~2017)",
        keyMetrics: "100M users, AI-driven feed, <1 year to 100M, 40%+ DAU/MAU ratio"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Previous viral product success, consumer psychology expertise, growth hacking, design-focused",
      "Good Team (11-13/20): Consumer product background, understanding engagement, mobile-first mentality",
      "Adequate Team (8-10/20): Technical skills, learning consumer behavior"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): Billion+ addressable users, new behavior/demographic, network effects clear, mobile-native",
      "Strong Market (14-16/20): 100M+ addressable users, underserved community, viral potential",
      "Good Market (11-13/20): 10-100M addressable users, niche community, engagement strong"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Viral mechanics, retention cohorts strong (40%+ D30), core loop tight, mobile-native UX",
      "Strong Product (13-15/20): Growing organically, retention decent (25-40% D30), polished experience",
      "Good Product (10-12/20): Early product-market fit, retention improving (15-25% D30)"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): 10M+ users, 15-25% MoM growth, 40%+ DAU/MAU, 45+ min session time, viral K-factor >1",
      "Strong Traction (13-15/20): 1-10M users, 10-20% MoM growth, 30-40% DAU/MAU, 30+ min session time",
      "Good Traction (10-12/20): 100K-1M users, 8-15% MoM growth, 20-30% DAU/MAU, strong engagement in niche"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): Monetization working (ads/subscriptions), $1-5+ ARPU, clear revenue model, unit economics positive",
      "Strong (9-10/15): Testing monetization, early revenue, $0.50-1 ARPU, path clear",
      "Good (6-8/15): Focus on growth, monetization experiments, user willingness to pay signals"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Strong network effects, community lock-in, unique content, viral loops, brand",
      "Good Moat (3/5): Growing user base, community forming, early network effects"
    ]
  },

  "AI/ML Infrastructure": {
    sector: "AI/ML Infrastructure",
    category: "Developer Tools & Infrastructure",
    examples: [
      {
        company: "Hugging Face",
        stage: "Series B (~2021)",
        keyMetrics: "1M+ models hosted, open-source community, enterprise customers, developer platform"
      },
      {
        company: "Scale AI",
        stage: "Series B (~2018)",
        keyMetrics: "$25M+ revenue, data labeling platform, autonomous vehicle customers, AI training data"
      },
      {
        company: "Weights & Biases",
        stage: "Series B (~2020)",
        keyMetrics: "ML experiment tracking, 200K+ users, enterprise adoption, developer-first"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): AI research background (FAIR/DeepMind/OpenAI), published papers, open-source contributors",
      "Good Team (11-13/20): ML engineering experience, understanding AI workflows, technical depth",
      "Adequate Team (8-10/20): Software engineering, learning AI/ML landscape"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $30B+ AI infrastructure market, every company building AI, picks-and-shovels play",
      "Strong Market (14-16/20): $10-30B market, critical AI workflow, enterprise budget allocation",
      "Good Market (11-13/20): $3-10B market, specific AI use case, growing adoption"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Developer-loved, open-source traction, production-grade, integrations with major frameworks",
      "Strong Product (13-15/20): Solving real AI workflow problem, early enterprise adoption, growing ecosystem",
      "Good Product (10-12/20): Working product, AI engineers using it, building integrations"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): 50K+ developers, $15M+ ARR, major AI labs as customers, open-source momentum",
      "Strong Traction (13-15/20): 10K-50K developers, $5-15M ARR, enterprise POCs, community growth",
      "Good Traction (10-12/20): 1K-10K developers, $1-5M ARR, early paid customers"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 70-80% gross margin, developer→enterprise expansion working, efficient growth",
      "Strong (9-10/15): 65-75% margin, freemium→paid conversion, CAC payback <18 months",
      "Good (6-8/15): 60-70% margin, pricing model validated, improving efficiency"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Developer mindshare, ecosystem lock-in, data network effects, open-source moat",
      "Good Moat (3/5): Technical differentiation, early market position, growing adoption"
    ]
  },

  "Hardware/IoT": {
    sector: "Hardware/IoT",
    category: "Hardware & IoT",
    examples: [
      {
        company: "Peloton",
        stage: "Series B (~2014)",
        keyMetrics: "$60M revenue, 50K bikes sold, subscription model, manufacturing scaled, community"
      },
      {
        company: "Ring",
        stage: "Series B (~2016)",
        keyMetrics: "$150M+ revenue, 1M+ devices, consumer electronics, Amazon channels"
      },
      {
        company: "Nest (pre-Google)",
        stage: "Series B (~2012)",
        keyMetrics: "1M+ thermostats sold, $300M+ revenue, Apple channels, smart home category creation"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Hardware veterans (Apple/Nest/Fitbit), supply chain expertise, consumer electronics experience",
      "Good Team (11-13/20): Engineering background, manufacturing partnerships, learning hardware",
      "Adequate Team (8-10/20): Technical skills, early hardware experience, building supply chain"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $20B+ consumer market, clear use case, mass market appeal, IoT connectivity advantage",
      "Strong Market (14-16/20): $5-20B market, specific consumer need, growing smart home/IoT adoption",
      "Good Market (11-13/20): $1-5B market, niche category, enthusiast adoption"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Manufacturing at scale, <2% defect rate, beautiful design, app connectivity seamless, reliability proven",
      "Strong Product (13-15/20): Production units shipping, quality acceptable (<5% defects), app working, supply chain established",
      "Good Product (10-12/20): Working prototypes, early production, supply chain being built, quality improving"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): 100K+ units sold, $30M+ revenue, distribution channels (retail/online), strong reviews (4.5+ stars)",
      "Strong Traction (13-15/20): 20K-100K units, $10-30M revenue, online channels working, good reviews (4+ stars)",
      "Good Traction (10-12/20): 5K-20K units, $2-10M revenue, early customers, building distribution"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 40-50%+ gross margin, hardware + subscription revenue, CAC payback <12 months via LTV",
      "Strong (9-10/15): 35-45% margin, improving with scale, subscription model developing, payback <18 months",
      "Good (6-8/15): 25-40% margin, scaling manufacturing, pricing strategy validated"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Brand, design patents, supply chain advantages, ecosystem lock-in, data network effects",
      "Good Moat (3/5): Product differentiation, early market, brand building"
    ]
  },

  "Marketplace": {
    sector: "Marketplace",
    category: "Marketplace & Platforms",
    examples: [
      {
        company: "Airbnb",
        stage: "Series B (~2011)",
        keyMetrics: "1M nights booked, 50K listings, international expansion, trust & safety built"
      },
      {
        company: "DoorDash",
        stage: "Series B (~2015)",
        keyMetrics: "300+ cities, $100M+ GMV/month, restaurant partnerships, delivery logistics scaled"
      },
      {
        company: "Faire",
        stage: "Series B (~2019)",
        keyMetrics: "10K+ retailers, 5K+ brands, $100M+ GMV, wholesale marketplace, Net Revenue Retention >150%"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Marketplace experience (eBay/Uber/Airbnb), operations expertise, two-sided market understanding",
      "Good Team (11-13/20): Operations background, understanding supply/demand dynamics, scaling experience",
      "Adequate Team (8-10/20): Technical foundation, learning marketplace mechanics"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $50B+ GMV potential, fragmented supply, inefficient incumbents, clear pain point both sides",
      "Strong Market (14-16/20): $10-50B GMV potential, growing category, digital transformation opportunity",
      "Good Market (11-13/20): $2-10B GMV potential, niche vertical, established offline market"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Liquidity achieved (80%+ success rate), payments integrated, trust & safety robust, mobile apps",
      "Strong Product (13-15/20): Growing liquidity (60-80% success), payments working, basic trust/safety, supply growing",
      "Good Product (10-12/20): Early liquidity (40-60% success), marketplace mechanics working, building trust"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): $100M+ GMV/year, 50K+ active buyers, strong take rate (15-20%), repeat rate >50%",
      "Strong Traction (13-15/20): $20-100M GMV/year, 10K-50K buyers, reasonable take rate (10-15%), repeat >40%",
      "Good Traction (10-12/20): $5-20M GMV/year, 2K-10K buyers, 8-12% take rate, building repeat"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 65-75% gross margin (after costs), CAC payback <6 months, Net Revenue Retention >120%",
      "Strong (9-10/15): 55-70% margin, CAC payback <12 months, NRR >100%, path to profitability clear",
      "Good (6-8/15): 45-60% margin, CAC payback <18 months, improving unit economics"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Strong network effects, supply-side exclusivity, brand trust, data advantages",
      "Good Moat (3/5): Growing network effects, supply relationships, early market position"
    ]
  },

  "Climate Tech": {
    sector: "Climate Tech",
    category: "Climate & Sustainability",
    examples: [
      {
        company: "Rivian",
        stage: "Series B (~2015)",
        keyMetrics: "Electric vehicles, manufacturing partnership (Normal, IL), Amazon investment, skateboard platform"
      },
      {
        company: "Impossible Foods",
        stage: "Series B (~2015)",
        keyMetrics: "Plant-based meat, $50M+ revenue, Burger King partnership, manufacturing scaled, FDA approval"
      },
      {
        company: "Redwood Materials",
        stage: "Series B (~2021)",
        keyMetrics: "Battery recycling, ex-Tesla CTO, Panasonic/Amazon partnerships, circular economy model"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Climate tech veterans, manufacturing/operations experience, regulatory expertise, mission-driven",
      "Good Team (11-13/20): Engineering background, climate domain knowledge, building partnerships",
      "Adequate Team (8-10/20): Technical skills, passionate about climate, learning industry"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $50B+ market, regulatory tailwinds, corporate sustainability commitments, carbon reduction verified",
      "Strong Market (14-16/20): $10-50B market, growing ESG focus, subsidy/incentive programs, proven carbon impact",
      "Good Market (11-13/10): $2-10B market, early regulations, climate benefit clear"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): At scale production, cost-competitive with alternatives, carbon impact measured (tons CO2e), certifications",
      "Strong Product (13-15/20): Pilot production, approaching cost parity, carbon impact quantified, partnerships forming",
      "Good Product (10-12/20): Working prototype, carbon benefit modeled, technology validated"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): $30M+ revenue, Fortune 500 partnerships, production scaled, carbon credits/offsets generating revenue",
      "Strong Traction (13-15/20): $5-30M revenue, corporate pilots, manufacturing partnerships, regulatory approvals progressing",
      "Good Traction (10-12/20): $1-5M revenue, early customers, demonstration projects, building pipeline"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 35-50% gross margin (climate premium acceptable), unit economics proven, subsidies/incentives secured",
      "Strong (9-10/15): 25-40% margin, path to cost parity, government support, improving with scale",
      "Good (6-8/15): 15-35% margin, technology cost curve steep, scaling will improve economics"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Proprietary technology, manufacturing scale, partnerships/contracts, regulatory approvals, IP portfolio",
      "Good Moat (3/5): Technical differentiation, early partnerships, climate impact verified"
    ]
  },

  "E-commerce/DTC": {
    sector: "E-commerce/DTC",
    category: "E-commerce & Direct-to-Consumer",
    examples: [
      {
        company: "Warby Parker",
        stage: "Series B (~2012)",
        keyMetrics: "$30M+ revenue, home try-on model, vertical integration, brand building, customer love"
      },
      {
        company: "Glossier",
        stage: "Series B (~2016)",
        keyMetrics: "$50M+ revenue, social-first brand, community of 1M+, influencer strategy, beauty direct"
      },
      {
        company: "Allbirds",
        stage: "Series B (~2016)",
        keyMetrics: "$50M+ revenue, sustainable shoes, DTC margins, retail expansion starting, brand heat"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): DTC/retail veterans, brand building expertise, supply chain mastery, design-forward",
      "Good Team (11-13/20): E-commerce experience, understanding brand, building supply chain",
      "Adequate Team (8-10/20): Digital marketing skills, learning DTC, product focus"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $10B+ category, incumbents vulnerable, demographic shift, social media driven",
      "Strong Market (14-16/20): $3-10B category, online shift accelerating, brand differentiation matters",
      "Good Market (11-13/20): $1-3B category, niche but passionate audience, DTC advantage"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Unique value prop, design awards, reviews (4.5+ stars), repeat purchase rate >40%, NPS >60",
      "Strong Product (13-15/20): Strong differentiation, good reviews (4+ stars), repeat >30%, building brand love",
      "Good Product (10-12/20): Product-market fit, decent reviews (3.5+ stars), repeat >20%"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): $30M+ revenue, 40-50% YoY growth, CAC payback <6 months, LTV >$200, brand awareness growing",
      "Strong Traction (13-15/20): $10-30M revenue, 50-80% growth, CAC payback <9 months, LTV >$100, social traction",
      "Good Traction (10-12/20): $3-10M revenue, 60-100% growth, CAC payback <12 months, building customer base"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 55-65% gross margin, EBITDA positive or near, efficient marketing (CAC/LTV <0.3), inventory turns >6x",
      "Strong (9-10/15): 50-60% margin, clear path to profitability, CAC/LTV <0.5, inventory management solid",
      "Good (6-8/15): 45-55% margin, efficient for stage, scaling marketing, inventory improving"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Strong brand, community, repeat customers, vertical integration, data on customers",
      "Good Moat (3/5): Brand building, early loyal customers, product differentiation"
    ]
  },

  "EdTech": {
    sector: "EdTech",
    category: "Education Technology",
    examples: [
      {
        company: "Coursera",
        stage: "Series B (~2013)",
        keyMetrics: "5M+ students, university partnerships (Stanford, Yale), certification programs, freemium model"
      },
      {
        company: "Duolingo",
        stage: "Series B (~2015)",
        keyMetrics: "100M+ users, gamification model, 30+ languages, freemium→premium conversion, engagement high"
      },
      {
        company: "Outschool",
        stage: "Series B (~2020)",
        keyMetrics: "$50M+ revenue, 10K+ teachers, 300K+ classes, marketplace model, parent/student NPS >70"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Education background, ed-tech experience, understanding pedagogy + engagement, mission-driven",
      "Good Team (11-13/20): Product/tech background, learning education sector, teacher/parent feedback loops",
      "Adequate Team (8-10/10): Technical skills, passion for education, building education expertise"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $50B+ education market, proven digital shift, global scalability, demographics favorable",
      "Strong Market (14-16/20): $10-50B market, COVID-accelerated adoption, clear learner need",
      "Good Market (11-13/20): $2-10B market, niche education segment, growing online penetration"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): Learning outcomes proven, engagement >20 hours/month, completion rates >40%, NPS >50",
      "Strong Product (13-15/20): Strong engagement (10-20 hrs/month), completion >25%, teacher/parent satisfaction high",
      "Good Product (10-12/20): Product working, engagement decent (5-10 hrs/month), learning happening"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): 1M+ learners, $15M+ revenue, 15%+ MoM growth, retention >60%, word-of-mouth strong",
      "Strong Traction (13-15/20): 200K-1M learners, $5-15M revenue, 10-15% MoM growth, retention >50%",
      "Good Traction (10-12/20): 50K-200K learners, $1-5M revenue, 8-12% MoM growth, building retention"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 60-75% gross margin, CAC payback <9 months, LTV >$300, freemium conversion >5%",
      "Strong (9-10/15): 55-70% margin, CAC payback <12 months, LTV >$150, conversion >3%",
      "Good (6-8/15): 50-65% margin, CAC payback <18 months, monetization strategy clear"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Learning data/personalization, content library, teacher/institution relationships, brand trust",
      "Good Moat (3/5): Content differentiation, early user base, engagement mechanics"
    ]
  },

  "Cybersecurity": {
    sector: "Cybersecurity",
    category: "Security & Compliance",
    examples: [
      {
        company: "CrowdStrike",
        stage: "Series B (~2013)",
        keyMetrics: "$30M+ ARR, endpoint protection, cloud-native, Fortune 500 customers, <5% churn"
      },
      {
        company: "SentinelOne",
        stage: "Series B (~2016)",
        keyMetrics: "$20M+ ARR, AI-powered endpoint, 100+ enterprise customers, replacing legacy AV"
      },
      {
        company: "Lacework",
        stage: "Series B (~2019)",
        keyMetrics: "$15M+ ARR, cloud security, DevSecOps, multi-cloud support, strong NRR >130%"
      }
    ],
    teamBenchmarks: [
      "Strong Team (14-16/20): Security veterans (Symantec/Palo Alto/Mandiant), SOC experience, threat research background",
      "Good Team (11-13/20): Security engineering experience, enterprise software background, building threat intel",
      "Adequate Team (8-10/20): Technical security skills, learning enterprise security sales"
    ],
    marketBenchmarks: [
      "Exceptional Market (17-19/20): $50B+ security market, growing attack surface, regulatory requirements, C-level priority",
      "Strong Market (14-16/20): $15-50B market, emerging threat category, compliance drivers",
      "Good Market (11-13/20): $5-15B market, specific security need, budget allocation"
    ],
    productBenchmarks: [
      "Exceptional Product (16-18/20): SOC2/FedRAMP certified, threat detection proven, integrations with SIEMs, automated response",
      "Strong Product (13-15/20): Core detection working, enterprise features, compliance progress, API integrations",
      "Good Product (10-12/20): Working security product, early threat detection, building integrations"
    ],
    tractionBenchmarks: [
      "Exceptional Traction (16-18/20): $20M+ ARR, 120-150% growth, 100+ enterprise customers, <5% churn, expanding within accounts",
      "Strong Traction (13-15/20): $8-20M ARR, 100-140% growth, 30-100 customers, <8% churn, good expansion",
      "Good Traction (10-12/20): $3-8M ARR, 80-120% growth, 10-30 customers, building pipeline"
    ],
    financialBenchmarks: [
      "Exceptional (11-13/15): 75-85% gross margin, Magic Number >1.0, NRR >130%, efficient growth",
      "Strong (9-10/15): 70-80% margin, Magic Number >0.7, NRR >115%, CAC payback <18 months",
      "Good (6-8/15): 65-75% margin, reasonable efficiency, improving unit economics"
    ],
    competitiveBenchmarks: [
      "Strong Moat (4-5/5): Threat intelligence network effects, SOC integration, switching costs, compliance certifications",
      "Good Moat (3/5): Technical differentiation, early enterprise adoption, building threat data"
    ]
  }
};

/**
 * Get sector-specific benchmarks based on classification
 */
export function getSectorBenchmarks(sector: string): SectorBenchmark | null {
  // Direct match - AI should return exact sector name
  return SECTOR_BENCHMARKS[sector] || null;
}

/**
 * Get list of all available sectors
 */
export function getAllSectors(): string[] {
  return Object.keys(SECTOR_BENCHMARKS);
}

/**
 * Format benchmark guidance into a prompt string
 */
export function formatBenchmarkGuidance(benchmark: SectorBenchmark): string {
  const guidance = `
SECTOR-SPECIFIC BENCHMARKS: ${benchmark.sector}

Real-World Examples:
${benchmark.examples.map((ex, i) => `${i + 1}. ${ex.company} (${ex.stage}): ${ex.keyMetrics}`).join('\n')}

SCORING GUIDANCE FOR THIS SECTOR:

TEAM (max 20 points):
${benchmark.teamBenchmarks.join('\n')}

MARKET (max 20 points):
${benchmark.marketBenchmarks.join('\n')}

PRODUCT (max 20 points):
${benchmark.productBenchmarks.join('\n')}

TRACTION (max 20 points):
${benchmark.tractionBenchmarks.join('\n')}

FINANCIAL (max 15 points):
${benchmark.financialBenchmarks.join('\n')}

COMPETITIVE POSITION (max 5 points):
${benchmark.competitiveBenchmarks.join('\n')}

CALIBRATION: Compare the startup you're analyzing to the examples above within the ${benchmark.sector} sector. 
Use these sector-specific benchmarks to determine appropriate scores for each category.
`;

  return guidance;
}
