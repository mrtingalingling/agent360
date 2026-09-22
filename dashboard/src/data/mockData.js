// Agent Operations Telemetry & State Mock Store

export const INITIAL_AGENTS = [
  {
    id: 'core-assistant',
    name: 'Gemini Enterprise Core Assistant',
    role: 'Orchestrator & Multi-Agent Dispatcher',
    model: 'gemini-1.5-pro',
    status: 'active',
    color: '#38bdf8', // Sky blue
    totalRuns: 14280,
    avgLatency: 1.42, // seconds
    costEstimate: 84.62, // USD
    tokens: {
      total: 14850000,
      input: 9240000,
      output: 2610000,
      cached: 2150000,
      reasoning: 850000,
    },
    errors: {
      hallucinationRate: 1.4, // %
      hallucinationCount: 200,
      groundingScore: 0.98,
      repromptRate: 3.2, // %
      repromptCount: 457,
      avgRepromptsPerQuery: 1.15,
      repromptReasons: [
        { reason: 'Ambiguous user request intent', count: 182, percentage: 39.8 },
        { reason: 'Downstream agent schema mismatch', count: 145, percentage: 31.7 },
        { reason: 'Context window boundary truncation', count: 86, percentage: 18.8 },
        { reason: 'Tool timeout / retried payload', count: 44, percentage: 9.7 },
      ],
      hallucinationExamples: [
        { claim: 'Asserted non-existent API parameter `timeout_ms` for inventory tool', detectedAt: '12m ago', confidence: 0.94, severity: 'Medium' },
        { claim: 'Fabricated internal SKU 4492-X in product routing table', detectedAt: '1h ago', confidence: 0.89, severity: 'High' }
      ]
    },
    workforce: {
      employeeTitle: 'Enterprise Systems Coordinator',
      hourlyWageBenchmark: 65,
      humanMinutesPerTask: 8,
      tasksCompleted: 14280,
      humanLaborHoursSaved: 1904,
      humanLaborValueSaved: 123760,
      valuePreserved: 15000,
      totalEconomicValue: 138760,
      netROI: 1639.8,
      firstTimeRightRate: 92.4,
      autonomousResolutionRate: 98.2,
      escalationRate: 1.8,
      costPerWorkUnit: 0.0059,
      humanCostPerWorkUnit: 8.67,
      speedupMultiplier: 338,
      performanceGrade: 'A',
      coachingNotes: 'Exceptional routing accuracy and low latency. Candidate for 1.5 Flash evaluation to reduce token cost by 40%.',
      competencies: [
        { name: 'Intent Classification', score: 98 },
        { name: 'Routing Accuracy', score: 96 },
        { name: 'Policy Adherence', score: 99 },
        { name: 'Turnaround Speed', score: 94 }
      ],
      escalationReasons: [
        { reason: 'Ambiguous multi-department intent', count: 180, pct: 70 },
        { reason: 'Unauthorized access attempt', count: 77, pct: 30 }
      ]
    },
    skills: [
      { id: 'sk-core-1', name: 'route_to_specialized_agent', description: 'Evaluates user intent and dynamically dispatches tasks to registered domain subagents', enabled: true, riskLevel: 'low', runs: 14280 },
      { id: 'sk-core-2', name: 'context_window_summarizer', description: 'Compresses multi-turn conversation memory before downstream delegation', enabled: true, riskLevel: 'low', runs: 8450 },
      { id: 'sk-core-3', name: 'schema_validator', description: 'Enforces strict JSON schema validation on subagent input payloads', enabled: true, riskLevel: 'low', runs: 12900 },
      { id: 'sk-core-4', name: 'enterprise_auth_check', description: 'Validates caller IAM token and principal permissions before delegating', enabled: true, riskLevel: 'medium', runs: 14280 },
    ],
    rules: [
      { id: 'rl-core-1', name: 'Deterministic Agent Routing', description: 'Always route through verified Agent Registry contracts; never invent synthetic URIs.', enforced: true, category: 'safety' },
      { id: 'rl-core-2', name: 'PII Scrubbing Before Dispatch', description: 'Automatically scrub customer credit card numbers and SSNs before routing payloads to subagents.', enforced: true, category: 'privacy' },
      { id: 'rl-core-3', name: 'Clarification on Ambiguity', description: 'If classification confidence falls below 80%, ask user clarifying questions rather than guessing.', enforced: true, category: 'business' },
      { id: 'rl-core-4', name: 'Least-Privilege Subagent Execution', description: 'Downstream subagent identities are granted minimal access necessary for the specific task.', enforced: true, category: 'safety' },
    ],
    fineTuneConfig: {
      model: 'gemini-1.5-pro',
      temperature: 0.3,
      topP: 0.85,
      topK: 40,
      maxOutputTokens: 4096,
      groundingMode: 'strict',
      hallucinationThreshold: 0.85,
      requireCitations: true,
      maxReprompts: 2,
      repromptStrategy: 'schema-reminder',
      systemPrompt: 'You are the primary enterprise coordinator. Always route requests to specialized subagents using deterministic JSON schemas. Never fabricate agent endpoints or tool schemas. When unsure, ask clarifying questions before delegating.',
    }
  },
  {
    id: 'price-match',
    name: 'NovaSmart Price Match Agent',
    role: 'Real-time Competitive Pricing & DB Matcher',
    model: 'gemini-1.5-flash',
    status: 'active',
    color: '#34d399', // Emerald
    totalRuns: 28410,
    avgLatency: 0.88,
    costEstimate: 42.15,
    tokens: {
      total: 21450000,
      input: 14200000,
      output: 4100000,
      cached: 2800000,
      reasoning: 350000,
    },
    errors: {
      hallucinationRate: 4.8, // Higher risk because of numeric prices
      hallucinationCount: 1364,
      groundingScore: 0.91,
      repromptRate: 6.9,
      repromptCount: 1960,
      avgRepromptsPerQuery: 1.48,
      repromptReasons: [
        { reason: 'Price discrepancy with competitor feed', count: 882, percentage: 45.0 },
        { reason: 'Missing item condition / promo code', count: 549, percentage: 28.0 },
        { reason: 'Unparseable currency symbol formatting', count: 353, percentage: 18.0 },
        { reason: 'Out-of-bounds discount calculation (>25%)', count: 176, percentage: 9.0 },
      ],
      hallucinationExamples: [
        { claim: 'Quoted BestBuy price $49.99 instead of grounded $59.99 from competitor DB', detectedAt: '5m ago', confidence: 0.98, severity: 'High' },
        { claim: 'Asserted expired summer flash discount was active', detectedAt: '28m ago', confidence: 0.91, severity: 'Medium' }
      ]
    },
    workforce: {
      employeeTitle: 'Automated Pricing & Competitor Auditor',
      hourlyWageBenchmark: 55,
      humanMinutesPerTask: 12,
      tasksCompleted: 28410,
      humanLaborHoursSaved: 5682,
      humanLaborValueSaved: 312510,
      valuePreserved: 64000,
      totalEconomicValue: 376510,
      netROI: 8931.6,
      firstTimeRightRate: 88.3,
      autonomousResolutionRate: 97.1,
      escalationRate: 2.9,
      costPerWorkUnit: 0.0015,
      humanCostPerWorkUnit: 11.00,
      speedupMultiplier: 818,
      performanceGrade: 'A+',
      coachingNotes: 'Top fleet ROI producer. Price scraping cache hit rate is 68%. High volume superstar.',
      competencies: [
        { name: 'SKU Grounding', score: 92 },
        { name: 'Speed / Latency', score: 99 },
        { name: 'Margin Compliance', score: 97 },
        { name: 'Barcode Generation', score: 98 }
      ],
      escalationReasons: [
        { reason: 'Competitor out-of-stock dispute', count: 512, pct: 62 },
        { reason: 'Wholesale cost margin trigger', count: 312, pct: 38 }
      ]
    },
    skills: [
      { id: 'sk-pm-1', name: 'query_competitor_db', description: 'Queries live competitor retail pricing from the BigQuery competitor_data dataset', enabled: true, riskLevel: 'medium', runs: 28410 },
      { id: 'sk-pm-2', name: 'verify_sku_match', description: 'Matches exact product UPC/EAN specifications between NovaSmart and external vendors', enabled: true, riskLevel: 'low', runs: 26900 },
      { id: 'sk-pm-3', name: 'calculate_discount_delta', description: 'Computes matching discount percentage, rebate difference, and tax adjustment', enabled: true, riskLevel: 'low', runs: 24100 },
      { id: 'sk-pm-4', name: 'generate_match_coupon', description: 'Generates single-use checkout barcode token for authorized price match approval', enabled: true, riskLevel: 'high', runs: 18200 },
    ],
    rules: [
      { id: 'rl-pm-1', name: '25% Maximum Discount Ceiling', description: 'Strict rule: Under no circumstances can automated price match exceed 25% off NovaSmart retail MSRP.', enforced: true, category: 'business' },
      { id: 'rl-pm-2', name: 'Mandatory Row-Level DB Grounding', description: 'Every quoted price and retailer URL must directly cite an authenticated row from competitor_data.', enforced: true, category: 'safety' },
      { id: 'rl-pm-3', name: 'Competitor In-Stock Verification', description: 'Price match is valid only if competitor SKU stock status is confirmed IN_STOCK.', enforced: true, category: 'business' },
      { id: 'rl-pm-4', name: 'Wholesale Margin Floor Protection', description: 'Reject price matches that would drop unit revenue below product acquisition cost.', enforced: true, category: 'safety' },
    ],
    fineTuneConfig: {
      model: 'gemini-1.5-flash',
      temperature: 0.1,
      topP: 0.70,
      topK: 20,
      maxOutputTokens: 2048,
      groundingMode: 'strict',
      hallucinationThreshold: 0.92,
      requireCitations: true,
      maxReprompts: 3,
      repromptStrategy: 'deterministic-fallback',
      systemPrompt: 'You verify and calculate price match guarantees against authorized retailer datasets. STRICT RULE: Every price, rebate, and URL MUST directly cite a row from competitor_data. Never calculate discounts exceeding max policy limit.',
    }
  },
  {
    id: 'deep-research',
    name: 'Deep Research Agent',
    role: 'Comprehensive Multimodal Synthesis & Analysis',
    model: 'gemini-1.5-pro',
    status: 'warning',
    color: '#a855f7', // Purple
    totalRuns: 4250,
    avgLatency: 5.64, // Heavy reasoning latency
    costEstimate: 118.90,
    tokens: {
      total: 34100000,
      input: 18500000,
      output: 6800000,
      cached: 4100000,
      reasoning: 4700000, // Very high reasoning tokens
    },
    errors: {
      hallucinationRate: 2.9,
      hallucinationCount: 123,
      groundingScore: 0.93,
      repromptRate: 9.4, // Complex search queries trigger reprompting
      repromptCount: 399,
      avgRepromptsPerQuery: 2.10,
      repromptReasons: [
        { reason: 'Search query yielded 0 results; reformulated query', count: 167, percentage: 41.9 },
        { reason: 'Conflicting citation dates in source corpus', count: 120, percentage: 30.1 },
        { reason: 'Citation anchor target unreachable', count: 72, percentage: 18.0 },
        { reason: 'Reasoning depth exceeded step budget', count: 40, percentage: 10.0 },
      ],
      hallucinationExamples: [
        { claim: 'Cited 2026 Q3 earnings report prior to official fiscal release', detectedAt: '44m ago', confidence: 0.96, severity: 'High' },
        { claim: 'Synthesized synthetic market CAGR of 18.4% not present in SEC 10-K', detectedAt: '2h ago', confidence: 0.88, severity: 'Medium' }
      ]
    },
    workforce: {
      employeeTitle: 'Senior Strategic Intelligence Analyst',
      hourlyWageBenchmark: 110,
      humanMinutesPerTask: 180,
      tasksCompleted: 4250,
      humanLaborHoursSaved: 12750,
      humanLaborValueSaved: 1402500,
      valuePreserved: 0,
      totalEconomicValue: 1402500,
      netROI: 11794.6,
      firstTimeRightRate: 87.7,
      autonomousResolutionRate: 96.5,
      escalationRate: 3.5,
      costPerWorkUnit: 0.0280,
      humanCostPerWorkUnit: 330.00,
      speedupMultiplier: 1915,
      performanceGrade: 'A',
      coachingNotes: 'Produces high-value market dossiers in seconds. Consider caching web search embeddings to curb CoT token usage.',
      competencies: [
        { name: 'Multi-Hop Synthesis', score: 96 },
        { name: 'Citation Integrity', score: 94 },
        { name: 'Reasoning Depth', score: 98 },
        { name: 'Output Brevity', score: 86 }
      ],
      escalationReasons: [
        { reason: 'Contradictory regulatory sources', count: 88, pct: 59 },
        { reason: 'Exceeded maximum 8-hop budget', count: 61, pct: 41 }
      ]
    },
    skills: [
      { id: 'sk-dr-1', name: 'web_knowledge_search', description: 'Performs deep multi-hop web and knowledge graph searches', enabled: true, riskLevel: 'low', runs: 4250 },
      { id: 'sk-dr-2', name: 'academic_corpus_reader', description: 'Extracts methodology and metrics from published whitepapers and filings', enabled: true, riskLevel: 'low', runs: 2840 },
      { id: 'sk-dr-3', name: 'extract_policy_citations', description: 'Isolates direct verbatim quotes and validates source document timestamps', enabled: true, riskLevel: 'low', runs: 4100 },
      { id: 'sk-dr-4', name: 'synthesize_research_report', description: 'Compiles multi-section executive reports with structured reference appendices', enabled: true, riskLevel: 'medium', runs: 4250 },
    ],
    rules: [
      { id: 'rl-dr-1', name: 'Verifiable Primary Citations', description: 'All factual claims and market statistics must include a verified, reachable link or document ID.', enforced: true, category: 'safety' },
      { id: 'rl-dr-2', name: 'Historical Date Sanity Check', description: 'Flag any document citation published more than 18 months ago as historical reference only.', enforced: true, category: 'business' },
      { id: 'rl-dr-3', name: 'Two-Source Corroboration Rule', description: 'Unverified market growth projections or unannounced product claims require 2 independent sources.', enforced: true, category: 'safety' },
      { id: 'rl-dr-4', name: 'Recursive Step Budget Limit', description: 'Limit exploratory search chains to a maximum of 8 hops to prevent reasoning latency runaway.', enforced: true, category: 'business' },
    ],
    fineTuneConfig: {
      model: 'gemini-1.5-pro',
      temperature: 0.4,
      topP: 0.90,
      topK: 50,
      maxOutputTokens: 8192,
      groundingMode: 'strict',
      hallucinationThreshold: 0.90,
      requireCitations: true,
      maxReprompts: 4,
      repromptStrategy: 'chain-of-thought',
      systemPrompt: 'Conduct structured multi-step research. Formulate an investigative plan, query internal and external knowledge graphs, verify publication dates, and flag any unverified or disputed claims.',
    }
  },
  {
    id: 'customer-support',
    name: 'Storefront Support & Orders Agent',
    role: 'Customer Service, Returns & Account Inquiries',
    model: 'gemini-1.5-flash',
    status: 'active',
    color: '#f59e0b', // Amber
    totalRuns: 31200,
    avgLatency: 1.15,
    costEstimate: 36.40,
    tokens: {
      total: 26800000,
      input: 16400000,
      output: 3900000,
      cached: 6100000, // Very high cache utilization
      reasoning: 400000,
    },
    errors: {
      hallucinationRate: 2.1,
      hallucinationCount: 655,
      groundingScore: 0.96,
      repromptRate: 4.6,
      repromptCount: 1435,
      avgRepromptsPerQuery: 1.22,
      repromptReasons: [
        { reason: 'Customer order ID format typo', count: 689, percentage: 48.0 },
        { reason: 'Return policy exception edge case', count: 402, percentage: 28.0 },
        { reason: 'Delivery address confirmation failed validation', count: 215, percentage: 15.0 },
        { reason: 'Payment gateway status pending retry', count: 129, percentage: 9.0 },
      ],
      hallucinationExamples: [
        { claim: 'Told customer returns are valid for 90 days instead of 30 days standard', detectedAt: '18m ago', confidence: 0.95, severity: 'Medium' }
      ]
    },
    workforce: {
      employeeTitle: 'Tier-1 Customer Experience Specialist',
      hourlyWageBenchmark: 35,
      humanMinutesPerTask: 10,
      tasksCompleted: 31200,
      humanLaborHoursSaved: 5200,
      humanLaborValueSaved: 182000,
      valuePreserved: 8500,
      totalEconomicValue: 190500,
      netROI: 5232.5,
      firstTimeRightRate: 91.5,
      autonomousResolutionRate: 94.8,
      escalationRate: 5.2,
      costPerWorkUnit: 0.0011,
      humanCostPerWorkUnit: 5.83,
      speedupMultiplier: 522,
      performanceGrade: 'A',
      coachingNotes: 'Fastest turnaround and lowest unit cost. Hand-offs occur mainly during edge-case return exceptions.',
      competencies: [
        { name: 'Brand Empathy', score: 97 },
        { name: 'Policy Execution', score: 96 },
        { name: 'Resolution Speed', score: 99 },
        { name: 'RMA Accuracy', score: 95 }
      ],
      escalationReasons: [
        { reason: 'Customer requests human manager', count: 912, pct: 56 },
        { reason: 'Over-limit refund / concession request', count: 710, pct: 44 }
      ]
    },
    skills: [
      { id: 'sk-cs-1', name: 'lookup_order', description: 'Queries NovaSmart order database for order status, tracking, and item records', enabled: true, riskLevel: 'low', runs: 31200 },
      { id: 'sk-cs-2', name: 'process_rma_return', description: 'Generates prepaid return label and RMA tracking number for eligible purchases', enabled: true, riskLevel: 'medium', runs: 9850 },
      { id: 'sk-cs-3', name: 'inventory_availability', description: 'Checks local store and regional fulfillment center stock levels for replacements', enabled: true, riskLevel: 'low', runs: 18400 },
      { id: 'sk-cs-4', name: 'issue_courtesy_credit', description: 'Credits customer account up to authorized threshold for shipping delays', enabled: true, riskLevel: 'high', runs: 1240 },
    ],
    rules: [
      { id: 'rl-cs-1', name: 'Strict 30-Day Return Window', description: 'Refuse automatic RMA generation if order purchase date exceeds 30 calendar days.', enforced: true, category: 'business' },
      { id: 'rl-cs-2', name: 'Order Ownership Verification', description: 'Validate customer phone number or billing postal code before disclosing tracking addresses.', enforced: true, category: 'privacy' },
      { id: 'rl-cs-3', name: '$15 Courtesy Credit Ceiling', description: 'Never authorize courtesy goodwill concessions exceeding $15 without supervisor handoff.', enforced: true, category: 'safety' },
      { id: 'rl-cs-4', name: 'Empathetic & Professional Tone', description: 'Maintain polite, helpful enterprise brand tone without arguing with customer.', enforced: true, category: 'business' },
    ],
    fineTuneConfig: {
      model: 'gemini-1.5-flash',
      temperature: 0.2,
      topP: 0.80,
      topK: 30,
      maxOutputTokens: 1024,
      groundingMode: 'strict',
      hallucinationThreshold: 0.88,
      requireCitations: false,
      maxReprompts: 2,
      repromptStrategy: 'schema-reminder',
      systemPrompt: 'Assist NovaSmart customers with order status, tracking, and return processing. Adhere strictly to the NovaSmart 30-day refund policy. Never promise compensation without supervisor clearance.',
    }
  },
  {
    id: 'promo-shadow',
    name: 'Promo Strategy Shadow Agent',
    role: 'Algorithmic Markdown & Promo Code Generation',
    model: 'gemini-1.5-flash',
    status: 'degraded', // Flagged due to higher hallucination & reprompts
    color: '#ec4899', // Pink
    totalRuns: 16800,
    avgLatency: 2.10,
    costEstimate: 51.30,
    tokens: {
      total: 19200000,
      input: 11900000,
      output: 4800000,
      cached: 1700000,
      reasoning: 800000,
    },
    errors: {
      hallucinationRate: 7.2, // High hallucination rate!
      hallucinationCount: 1210,
      groundingScore: 0.86,
      repromptRate: 11.8, // High reprompt loop rate
      repromptCount: 1982,
      avgRepromptsPerQuery: 2.45,
      repromptReasons: [
        { reason: 'Negative margin calculation detected; rejected promo', count: 872, percentage: 44.0 },
        { reason: 'Promo code format collision with legacy coupon code', count: 535, percentage: 27.0 },
        { reason: 'Customer tier eligibility check mismatch', count: 357, percentage: 18.0 },
        { reason: 'Unbounded inventory allocation requested', count: 218, percentage: 11.0 },
      ],
      hallucinationExamples: [
        { claim: 'Generated 40% discount on restricted flagship GPU line without margin clearance', detectedAt: '8m ago', confidence: 0.99, severity: 'Critical' },
        { claim: 'Claimed free shipping applies to freight oversized pallets', detectedAt: '1h ago', confidence: 0.92, severity: 'Medium' }
      ]
    },
    workforce: {
      employeeTitle: 'Promotions & Margin Strategy Specialist',
      hourlyWageBenchmark: 60,
      humanMinutesPerTask: 25,
      tasksCompleted: 16800,
      humanLaborHoursSaved: 7000,
      humanLaborValueSaved: 420000,
      valuePreserved: 32000,
      totalEconomicValue: 452000,
      netROI: 8810.9,
      firstTimeRightRate: 81.0,
      autonomousResolutionRate: 91.2,
      escalationRate: 8.8,
      costPerWorkUnit: 0.0030,
      humanCostPerWorkUnit: 25.00,
      speedupMultiplier: 714,
      performanceGrade: 'C-',
      coachingNotes: 'Underperforming quality threshold. High reprompt loop frequency and risk of margin erosion. Requires rule enforcement.',
      coachingDirective: {
        headline: 'Negative Margin Risk & Reprompt Loop Inefficiency',
        severity: 'critical',
        problemSummary: 'Flagged Grade C- due to unenforced Margin Floor guardrail and loose temperature (0.6), resulting in 7.2% hallucination rate and 11.8% reprompt loops.',
        recommendedActions: [
          'Enforce "Absolute Margin Floor Protection" guardrail (Currently Disabled)',
          'Enforce "Flagship SKU Exclusion List" rule (Currently Disabled)',
          'Lower sampling temperature from 0.6 to 0.2 for deterministic discount bounds',
          'Switch grounding mode from Permissive to Strict'
        ],
        presetPatch: {
          ruleIdsToEnforce: ['rl-ps-1', 'rl-ps-2'],
          temperature: 0.2,
          groundingMode: 'strict',
          maxReprompts: 2,
          systemPromptUpdate: 'You generate personalized promotional offers and markdown strategies. Evaluate customer lifetime value. STRICTLY ENFORCE wholesale margin floors. NEVER authorize discounts exceeding margin bounds or on restricted flagship SKUs.'
        }
      },
      competencies: [
        { name: 'Margin Compliance', score: 68 },
        { name: 'Customer LTV Optimization', score: 84 },
        { name: 'Promo Generation Speed', score: 92 },
        { name: 'Inventory Guardrails', score: 71 }
      ],
      escalationReasons: [
        { reason: 'Negative margin safety block', count: 872, pct: 59 },
        { reason: 'Tier exclusion override request', count: 606, pct: 41 }
      ]
    },
    skills: [
      { id: 'sk-ps-1', name: 'fetch_margin_rules', description: 'Reads real-time wholesale cost and margin floors from novasmart_pricing dataset', enabled: true, riskLevel: 'medium', runs: 16800 },
      { id: 'sk-ps-2', name: 'evaluate_customer_ltv', description: 'Calculates historical spending tier and churn risk for personalized discounts', enabled: true, riskLevel: 'low', runs: 14200 },
      { id: 'sk-ps-3', name: 'generate_promo_token', description: 'Mints cryptographic single-use promo code with expiration timestamp', enabled: true, riskLevel: 'high', runs: 11900 },
      { id: 'sk-ps-4', name: 'inventory_clearance_query', description: 'Identifies overstocked SKUs eligible for higher markdown thresholds', enabled: true, riskLevel: 'low', runs: 8900 },
    ],
    rules: [
      { id: 'rl-ps-1', name: 'Absolute Margin Floor Protection', description: 'CRITICAL: Block any promotional discount that would generate negative gross profit margin.', enforced: false, category: 'safety' },
      { id: 'rl-ps-2', name: 'Flagship SKU Exclusion List', description: 'Automated promotions cannot be issued on restricted hardware, consoles, or flagship GPUs.', enforced: false, category: 'business' },
      { id: 'rl-ps-3', name: 'Single-Use Token Enforcement', description: 'All generated promotional vouchers must expire after 24 hours and permit only 1 checkout redemption.', enforced: true, category: 'safety' },
      { id: 'rl-ps-4', name: 'Daily Budget Quota Limit ($5,000)', description: 'Halt automated coupon generation if daily aggregate promotional cost exceeds $5,000.', enforced: true, category: 'business' },
    ],
    fineTuneConfig: {
      model: 'gemini-1.5-flash',
      temperature: 0.6,
      topP: 0.95,
      topK: 60,
      maxOutputTokens: 2048,
      groundingMode: 'permissive',
      hallucinationThreshold: 0.70,
      requireCitations: false,
      maxReprompts: 5,
      repromptStrategy: 'chain-of-thought',
      systemPrompt: 'You generate personalized promotional offers and markdown strategies. Evaluate customer lifetime value and optimize conversion rate.',
    }
  },
  {
    id: 'workspace-agent',
    name: 'Workspace Presentation & Docs Agent',
    role: 'Executive Briefs, Slide Decks & Document Synthesis',
    model: 'gemini-1.5-pro',
    status: 'active',
    color: '#6366f1', // Indigo
    totalRuns: 6950,
    avgLatency: 3.82,
    costEstimate: 68.20,
    tokens: {
      total: 18600000,
      input: 11200000,
      output: 4900000,
      cached: 1400000,
      reasoning: 1100000,
    },
    errors: {
      hallucinationRate: 2.6,
      hallucinationCount: 180,
      groundingScore: 0.95,
      repromptRate: 5.1,
      repromptCount: 354,
      avgRepromptsPerQuery: 1.30,
      repromptReasons: [
        { reason: 'Slide layout JSON template parse error', count: 145, percentage: 41.0 },
        { reason: 'Exceeded maximum slide character count', count: 106, percentage: 30.0 },
        { reason: 'Color palette contrast accessibility warning', count: 64, percentage: 18.0 },
        { reason: 'Invalid spreadsheet reference range', count: 39, percentage: 11.0 },
      ],
      hallucinationExamples: [
        { claim: 'Included fictional stakeholder quote from "VP of Logistics"', detectedAt: '3h ago', confidence: 0.93, severity: 'Medium' }
      ]
    },
    workforce: {
      employeeTitle: 'Executive Communications & Slide Designer',
      hourlyWageBenchmark: 75,
      humanMinutesPerTask: 60,
      tasksCompleted: 6950,
      humanLaborHoursSaved: 6950,
      humanLaborValueSaved: 521250,
      valuePreserved: 12000,
      totalEconomicValue: 533250,
      netROI: 7817.9,
      firstTimeRightRate: 92.3,
      autonomousResolutionRate: 97.8,
      escalationRate: 2.2,
      costPerWorkUnit: 0.0098,
      humanCostPerWorkUnit: 75.00,
      speedupMultiplier: 942,
      performanceGrade: 'A',
      coachingNotes: 'High executive utility. Successfully generates presentations in Google Slides with zero manual formatting needed.',
      competencies: [
        { name: 'Slide Layout Accuracy', score: 96 },
        { name: 'Data Grounding', score: 98 },
        { name: 'A2A Protocol Conformance', score: 99 },
        { name: 'Visual Hierarchy', score: 93 }
      ],
      escalationReasons: [
        { reason: 'Multi-sheet workbook schema ambiguity', count: 98, pct: 64 },
        { reason: 'Custom font & template override', count: 55, pct: 36 }
      ]
    },
    skills: [
      { id: 'sk-wa-1', name: 'create_presentation', description: 'Generates structured Google Slides decks via A2A protocol from outline data', enabled: true, riskLevel: 'low', runs: 6950 },
      { id: 'sk-wa-2', name: 'parse_telemetry_table', description: 'Transforms raw CSV/BigQuery telemetry tables into visual slides charts', enabled: true, riskLevel: 'low', runs: 5120 },
      { id: 'sk-wa-3', name: 'generate_executive_summary', description: 'Synthesizes bulleted 1-page C-suite briefings with key performance indicators', enabled: true, riskLevel: 'low', runs: 6950 },
      { id: 'sk-wa-4', name: 'wcag_contrast_audit', description: 'Verifies color palette contrast ratios meet WCAG AA standards before deck generation', enabled: true, riskLevel: 'low', runs: 6200 },
    ],
    rules: [
      { id: 'rl-wa-1', name: 'Slide Character Budget Cap', description: 'Enforce maximum 140 characters per bullet point to prevent unreadable, cramped slides.', enforced: true, category: 'business' },
      { id: 'rl-wa-2', name: 'Google Workspace A2A Compliance', description: 'All generated decks must strictly adhere to the A2A v0.3 HTTP JSON slide specification.', enforced: true, category: 'safety' },
      { id: 'rl-wa-3', name: 'Zero Fictitious Attribution', description: 'Never invent stakeholder quotations, titles, or corporate endorsement claims.', enforced: true, category: 'safety' },
      { id: 'rl-wa-4', name: 'Financial Number Grounding', description: 'Any fiscal metric or revenue number must directly cite a linked Google Sheet or report.', enforced: true, category: 'safety' },
    ],
    fineTuneConfig: {
      model: 'gemini-1.5-pro',
      temperature: 0.35,
      topP: 0.85,
      topK: 40,
      maxOutputTokens: 6144,
      groundingMode: 'balanced',
      hallucinationThreshold: 0.85,
      requireCitations: true,
      maxReprompts: 3,
      repromptStrategy: 'schema-reminder',
      systemPrompt: 'Synthesize briefings and Google Slides presentations. Structure slide outputs into valid A2A JSON slide specs. Ensure all charts and assertions derive directly from provided source material.',
    }
  }
];

// Generate Multi-Metric historical timeline points (Speed, Quality, Value)
export function generateTimelineData(points = 30) {
  const result = [];
  const now = Date.now();
  const intervalMs = 60 * 1000 * 2; // 2 minute steps

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now - i * intervalMs);
    const timeLabel = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add jitter and realistic occasional latency & quality spikes
    const isPromoSpike = i % 7 === 0;
    const isResearchSpike = i % 5 === 0;

    // Lens 1: Speed - TTR Latency in seconds
    const speed_core = +(1.2 + Math.sin(i * 0.4) * 0.3 + (i % 11 === 0 ? 0.9 : 0)).toFixed(2);
    const speed_price = +(0.8 + Math.cos(i * 0.5) * 0.2 + (i % 9 === 0 ? 0.7 : 0)).toFixed(2);
    const speed_research = +(4.8 + Math.sin(i * 0.3) * 1.1 + (isResearchSpike ? 2.4 : 0)).toFixed(2);
    const speed_support = +(1.05 + Math.cos(i * 0.6) * 0.2 + (i % 8 === 0 ? 0.5 : 0)).toFixed(2);
    const speed_promo = +(1.9 + Math.sin(i * 0.5) * 0.5 + (isPromoSpike ? 2.8 : 0)).toFixed(2);
    const speed_workspace = +(3.5 + Math.cos(i * 0.4) * 0.8 + (i % 10 === 0 ? 1.5 : 0)).toFixed(2);

    // Lens 2: Quality - First-Time Right Rate (%)
    const quality_core = +(94 + Math.sin(i * 0.3) * 3).toFixed(1);
    const quality_price = +(97 + Math.cos(i * 0.4) * 2).toFixed(1);
    const quality_research = +(88 + Math.sin(i * 0.5) * 4 - (isResearchSpike ? 10 : 0)).toFixed(1);
    const quality_support = +(96 + Math.cos(i * 0.5) * 2).toFixed(1);
    const quality_promo = +(76 + Math.sin(i * 0.4) * 4 - (isPromoSpike ? 18 : 0)).toFixed(1);
    const quality_workspace = +(91 + Math.cos(i * 0.3) * 3).toFixed(1);

    // Lens 3: Economic Value - Value Created ($/min)
    const value_core = Math.round(28 + Math.sin(i * 0.2) * 5);
    const value_price = Math.round(52 + Math.cos(i * 0.3) * 8);
    const value_research = Math.round(145 + Math.sin(i * 0.4) * 20);
    const value_support = Math.round(42 + Math.cos(i * 0.4) * 6);
    const value_promo = Math.round(Math.max(4, 14 + Math.sin(i * 0.5) * 4 - (isPromoSpike ? 8 : 0)));
    const value_workspace = Math.round(68 + Math.cos(i * 0.3) * 10);

    result.push({
      time: timeLabel,
      timestamp: timestamp.getTime(),
      
      // Default / backward-compatible keys (latency seconds)
      'core-assistant': speed_core,
      'price-match': speed_price,
      'deep-research': speed_research,
      'customer-support': speed_support,
      'promo-shadow': speed_promo,
      'workspace-agent': speed_workspace,

      // Multi-lens breakdown mappings
      speed: {
        'core-assistant': speed_core,
        'price-match': speed_price,
        'deep-research': speed_research,
        'customer-support': speed_support,
        'promo-shadow': speed_promo,
        'workspace-agent': speed_workspace
      },
      quality: {
        'core-assistant': quality_core,
        'price-match': quality_price,
        'deep-research': quality_research,
        'customer-support': quality_support,
        'promo-shadow': quality_promo,
        'workspace-agent': quality_workspace
      },
      value: {
        'core-assistant': value_core,
        'price-match': value_price,
        'deep-research': value_research,
        'customer-support': value_support,
        'promo-shadow': value_promo,
        'workspace-agent': value_workspace
      },

      anomalyDetected: isPromoSpike || isResearchSpike,
      anomalyAgent: isPromoSpike ? 'Promo Strategy Shadow Agent' : isResearchSpike ? 'Deep Research Agent' : null,
      anomalyReason: isPromoSpike ? 'Reprompting Loop (3 retries) & Quality Dip' : isResearchSpike ? 'Deep reasoning expansion' : null,
    });
  }
  return result;
}

// Generate Sankey Data for Sankey Breakdown
export function generateSankeyData(agents = INITIAL_AGENTS) {
  const nodes = [
    // Stage 0: Client Ingress
    { id: 'web-storefront', name: 'Web Storefront Portal', stage: 0, color: '#38bdf8' },
    { id: 'mobile-app', name: 'Mobile Client & Chat', stage: 0, color: '#818cf8' },
    { id: 'internal-api', name: 'Enterprise B2B / A2A API', stage: 0, color: '#c084fc' },

    // Stage 1: Agents
    ...agents.map((a) => ({
      id: a.id,
      name: a.name,
      stage: 1,
      color: a.color
    })),

    // Stage 2: Token Types
    { id: 'tok-input', name: 'Input Prompt Tokens', stage: 2, color: '#6366f1' },
    { id: 'tok-output', name: 'Output Generation Tokens', stage: 2, color: '#10b981' },
    { id: 'tok-cached', name: 'Context Cached Tokens', stage: 2, color: '#f59e0b' },
    { id: 'tok-reasoning', name: 'Reasoning (CoT) Tokens', stage: 2, color: '#ec4899' },

    // Stage 3: Execution Outcomes
    { id: 'out-success', name: 'Clean Success (First Pass)', stage: 3, color: '#10b981' },
    { id: 'out-reprompt', name: 'Reprompt Loop Resolved', stage: 3, color: '#f97316' },
    { id: 'out-hallucination', name: 'Hallucination Intercepted', stage: 3, color: '#ef4444' },
    { id: 'out-refusal', name: 'Guardrail Policy Refusal', stage: 3, color: '#64748b' }
  ];

  const agentOffset = 3;
  const tokenOffset = agentOffset + agents.length;
  const outcomeOffset = tokenOffset + 4;

  const links = [];

  // 1. Ingress to Agents links
  agents.forEach((agent, idx) => {
    const aNode = agentOffset + idx;
    if (agent.id === 'core-assistant') {
      links.push({ source: 0, target: aNode, value: 5.2, label: '5.2M tokens' });
      links.push({ source: 1, target: aNode, value: 6.8, label: '6.8M tokens' });
      links.push({ source: 2, target: aNode, value: 2.8, label: '2.8M tokens' });
    } else if (agent.id === 'price-match') {
      links.push({ source: 0, target: aNode, value: 14.5, label: '14.5M tokens' });
      links.push({ source: 1, target: aNode, value: 6.9, label: '6.9M tokens' });
    } else if (agent.id === 'deep-research') {
      links.push({ source: 1, target: aNode, value: 18.0, label: '18.0M tokens' });
      links.push({ source: 2, target: aNode, value: 16.1, label: '16.1M tokens' });
    } else if (agent.id === 'customer-support') {
      links.push({ source: 0, target: aNode, value: 15.8, label: '15.8M tokens' });
      links.push({ source: 1, target: aNode, value: 11.0, label: '11.0M tokens' });
    } else if (agent.id === 'promo-shadow') {
      links.push({ source: 0, target: aNode, value: 10.2, label: '10.2M tokens' });
      links.push({ source: 2, target: aNode, value: 9.0, label: '9.0M tokens' });
    } else {
      links.push({ source: 2, target: aNode, value: 18.6, label: '18.6M tokens' });
    }
  });

  // 2. Agents to Token Types
  agents.forEach((agent, idx) => {
    const aNode = agentOffset + idx;
    const t = agent.tokens;
    const scale = 1000000;
    links.push({ source: aNode, target: tokenOffset + 0, value: +(t.input / scale).toFixed(1), label: `${(t.input / scale).toFixed(1)}M Input` });
    links.push({ source: aNode, target: tokenOffset + 1, value: +(t.output / scale).toFixed(1), label: `${(t.output / scale).toFixed(1)}M Output` });
    links.push({ source: aNode, target: tokenOffset + 2, value: +(t.cached / scale).toFixed(1), label: `${(t.cached / scale).toFixed(1)}M Cached` });
    links.push({ source: aNode, target: tokenOffset + 3, value: +(t.reasoning / scale).toFixed(1), label: `${(t.reasoning / scale).toFixed(1)}M Reasoning` });
  });

  // 3. Token Types to Operational Outcomes
  links.push({ source: tokenOffset + 0, target: outcomeOffset + 0, value: 58.4, label: '58.4M Clean Processed' });
  links.push({ source: tokenOffset + 0, target: outcomeOffset + 1, value: 12.1, label: '12.1M Required Reprompt' });
  links.push({ source: tokenOffset + 0, target: outcomeOffset + 3, value: 4.5, label: '4.5M Filtered' });

  links.push({ source: tokenOffset + 1, target: outcomeOffset + 0, value: 21.8, label: '21.8M Clean Generations' });
  links.push({ source: tokenOffset + 1, target: outcomeOffset + 2, value: 4.6, label: '4.6M Hallucination Intercepted' });

  links.push({ source: tokenOffset + 2, target: outcomeOffset + 0, value: 16.5, label: '16.5M Fast Cache Hits' });
  links.push({ source: tokenOffset + 2, target: outcomeOffset + 1, value: 1.6, label: '1.6M Cache Invalidation' });

  links.push({ source: tokenOffset + 3, target: outcomeOffset + 0, value: 6.2, label: '6.2M Verified Reasoning' });
  links.push({ source: tokenOffset + 3, target: outcomeOffset + 1, value: 1.8, label: '1.8M Chain-of-Thought Backtrack' });

  return { nodes, links };
}

// Recent sample execution traces for detail drill-down
export const MOCK_TRACES = [
  {
    id: 'tr-98401',
    agentId: 'price-match',
    timestamp: 'Just now',
    prompt: 'Check competitive price for Sony WH-1000XM5 from Target & Best Buy',
    latency: 0.79,
    tokens: { total: 840, input: 560, output: 190, cached: 90, reasoning: 0 },
    status: 'success',
    reprompts: 0,
    groundingConfidence: 0.99,
    toolCalls: ['query_competitor_db', 'verify_sku_match'],
    hallucinationAlert: false,
  },
  {
    id: 'tr-98400',
    agentId: 'promo-shadow',
    timestamp: '2m ago',
    prompt: 'Synthesize 30% flash discount coupon for premier loyalty accounts',
    latency: 3.42,
    tokens: { total: 2450, input: 1400, output: 750, cached: 0, reasoning: 300 },
    status: 'reprompt_loop',
    reprompts: 3,
    groundingConfidence: 0.74,
    toolCalls: ['fetch_margin_rules', 'generate_promo_token'],
    hallucinationAlert: true,
    hallucinationDetails: 'Model initially asserted margin clearance without validating SKU tier; reprompt forced recalculation',
  },
  {
    id: 'tr-98399',
    agentId: 'deep-research',
    timestamp: '4m ago',
    prompt: 'Perform multi-source competitive breakdown of retail omnichannel returns policy',
    latency: 6.85,
    tokens: { total: 7200, input: 4100, output: 1900, cached: 800, reasoning: 1200 },
    status: 'success',
    reprompts: 1,
    groundingConfidence: 0.96,
    toolCalls: ['web_knowledge_search', 'extract_policy_citations', 'synthesize_matrix'],
    hallucinationAlert: false,
  },
  {
    id: 'tr-98398',
    agentId: 'core-assistant',
    timestamp: '6m ago',
    prompt: 'Route user query: "I want to exchange the drone I bought 2 weeks ago"',
    latency: 1.15,
    tokens: { total: 1120, input: 820, output: 210, cached: 90, reasoning: 0 },
    status: 'success',
    reprompts: 0,
    groundingConfidence: 0.98,
    toolCalls: ['route_to_agent(customer-support)'],
    hallucinationAlert: false,
  },
  {
    id: 'tr-98397',
    agentId: 'customer-support',
    timestamp: '8m ago',
    prompt: 'Process RMA request for order #NS-89211 with expedited shipping',
    latency: 1.34,
    tokens: { total: 1450, input: 920, output: 380, cached: 150, reasoning: 0 },
    status: 'success',
    reprompts: 0,
    groundingConfidence: 0.97,
    toolCalls: ['lookup_order', 'create_return_label'],
    hallucinationAlert: false,
  },
  {
    id: 'tr-98396',
    agentId: 'workspace-agent',
    timestamp: '11m ago',
    prompt: 'Generate 4-slide executive briefing on Q3 agent operational costs and token utilization',
    latency: 4.12,
    tokens: { total: 4950, input: 3200, output: 1450, cached: 300, reasoning: 400 },
    status: 'success',
    reprompts: 1,
    groundingConfidence: 0.95,
    toolCalls: ['parse_telemetry_table', 'create_slides_deck'],
    hallucinationAlert: false,
  }
];
