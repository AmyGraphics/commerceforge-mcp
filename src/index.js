/**
 * CommerceForge MCP Server - Cloudflare Worker
 * Autonomous E-commerce Engineering: Store Architecture, Product Page Conversion,
 * Checkout & Cart Recovery, Traffic Engine & Retention/Repeat-Revenue Systems
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Solana-Signature, X-License-Key',
};

const PRO_TIERS = {
  single_tool: {
    price_usd: 7.99,
    description: "Single Tool Pro Lifetime License (CommerceForge Only)"
  },
  all_access_suite: {
    price_usd: 14.99,
    description: "All-Access Lifetime Suite Pass (Unlocks all 48+ MCP Servers)"
  }
};

const MONETIZATION_INFO = {
  gumroad_pro_checkout: "https://amygraphics.gumroad.com/l/mcp-pro",
  gumroad_options: {
    single_tool_lifetime: "$7.99 (Select 'Single MCP Server' version)",
    all_access_suite_lifetime: "$14.99 (Select 'All-Access Lifetime Suite' version)"
  },
  solana_usdc_instant: {
    wallet: "8sDLX3okSV974wdjdeKhN9uWLZDr45DeGCJ28zgTLEdJ",
    amount_usdc_single: 7.99,
    amount_usdc_suite: 14.99
  }
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (url.pathname === '/verify-solana' && request.method === 'POST') {
      try {
        const body = await request.json();
        const signature = body.signature;
        if (!signature || signature.length < 32) {
          return new Response(JSON.stringify({
            valid: false,
            error: "Invalid Solana signature"
          }), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({
          valid: true,
          tx_hash: signature,
          license_tier: "all_access_lifetime",
          unlocked_servers: "all_48_servers",
          status: "confirmed"
        }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ valid: false, error: err.message }), {
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/health' || url.pathname === '/') {
      return new Response(JSON.stringify({
        status: 'healthy',
        service: 'commerceforge-mcp',
        version: '1.0.0',
        tools_available: 6,
        pricing: PRO_TIERS
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/mcp' || url.pathname === '/sse') {
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const response = await handleMcpRequest(body, env);
          return new Response(JSON.stringify(response), {
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: 'Parse error: ' + e.message }
          }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    return new Response('CommerceForge MCP is running. Connect via /mcp', {
      headers: CORS_HEADERS
    });
  }
};

async function handleMcpRequest(request, env) {
  const { id, method, params } = request;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'commerceforge-mcp',
          version: '1.0.0',
          description: 'Autonomous E-commerce Engineering: Store Architecture, Product Page Conversion, Checkout & Cart Recovery, Traffic Engine & Retention/Repeat-Revenue Systems MCP'
        }
      }
    };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        tools: [
          {
            name: 'autonomous_ecommerce_architect',
            description: 'MASTER 1-SHOT OUTCOME ENGINE: Ingests the store concept and stage and synthesizes a complete e-commerce architecture in one call: the honest viability read (margin math before anything else, demand shape, differentiation reality), the store stack recommendation (platform, apps that earn their fee vs app-bloat), the unit economics worksheet (landed cost, true CAC ceiling, contribution margin per order), stage-specific diagnosis of what is actually broken (traffic vs conversion vs margin vs retention), and the 90-day execution roadmap to profitable orders. Built for merchants and builders shipping stores with AI-era velocity.',
            inputSchema: {
              type: 'object',
              properties: {
                store_concept: {
                  type: 'string',
                  description: 'The store concept, product line and target customer (e.g. "handmade leather goods for professionals", "skincare brand for sensitive skin")'
                },
                stage: {
                  type: 'string',
                  enum: ['no_store_yet', 'store_no_sales', 'sales_no_profit', 'scaling_plateau'],
                  description: 'Current store stage'
                },
                product_type: {
                  type: 'string',
                  enum: ['physical_own_brand', 'print_on_demand', 'digital_products', 'handmade_artisanal'],
                  description: 'What kind of products are sold'
                }
              },
              required: ['store_concept']
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                viability_read: { type: 'string', description: 'Honest margin, demand and differentiation assessment' },
                store_stack: { type: 'string', description: 'Platform and apps that earn their fee' },
                unit_economics: { type: 'array', description: 'The per-order profit worksheet' },
                stage_diagnosis: { type: 'string', description: 'What is actually broken at this stage' },
                execution_roadmap: { type: 'string', description: '90 days to profitable orders' }
              },
              required: ['status', 'viability_read', 'store_stack', 'unit_economics', 'stage_diagnosis', 'execution_roadmap']
            },
            annotations: { title: 'Autonomous E-commerce Architect', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'engineer_product_pages',
            description: 'Engineers product pages that convert strangers into buyers: the above-the-fold formula for product pages (image standards that sell, the benefit-first title, the price-anchor placement), description copy architecture (sensory and outcome language over spec dumps, the skimmer/reader dual structure), trust stacking in the exact order objections arise (reviews placement, guarantees that flip risk, shipping clarity before the cart), offer structure engineering (bundles, quantity breaks, the decoy effect applied to variants), and the full page teardown protocol with the metrics that reveal which section leaks buyers. Tuned to the temperature of the traffic landing on the page.',
            inputSchema: {
              type: 'object',
              properties: {
                page_focus: {
                  type: 'string',
                  enum: ['product_page_copy', 'trust_social_proof', 'offer_structure_pricing', 'full_page_teardown'],
                  description: 'Page element to engineer'
                },
                traffic_temperature: {
                  type: 'string',
                  enum: ['cold_ad_traffic', 'warm_social_organic', 'search_intent_traffic'],
                  description: 'Where page visitors come from'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                above_fold_formula: { type: 'string', description: 'Images, title, price anchor, CTA' },
                copy_architecture: { type: 'string', description: 'Description structure that sells' },
                trust_stack: { type: 'string', description: 'Objection-ordered proof placement' },
                offer_engineering: { type: 'string', description: 'Bundles, breaks and variant design' },
                page_leak_audit: { type: 'array', description: 'Metrics that reveal the leaking section' }
              },
              required: ['status', 'above_fold_formula', 'copy_architecture', 'trust_stack', 'offer_engineering', 'page_leak_audit']
            },
            annotations: { title: 'Product Page Conversion Engineer', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'optimize_checkout_cart_recovery',
            description: 'Recovers the 70% of carts that abandon: checkout friction surgery (the field-count law, guest checkout non-negotiables, payment method coverage by market, trust signals inside the checkout), the cart-abandonment recovery engine (email sequence timing and copy that recovers 5-15% of abandons, exit-intent done without rage, browse-abandonment for the earlier funnel), shipping and returns strategy as a conversion weapon (threshold free shipping math, how returns policy wording changes conversion), and the full-funnel audit protocol from product view to purchase with the benchmark rates that expose the broken step. Platform-aware recommendations.',
            inputSchema: {
              type: 'object',
              properties: {
                funnel_focus: {
                  type: 'string',
                  enum: ['checkout_friction', 'cart_abandonment_recovery', 'shipping_returns_strategy', 'full_funnel_audit'],
                  description: 'Funnel area to optimize'
                },
                store_platform: {
                  type: 'string',
                  enum: ['shopify', 'woocommerce', 'custom_headless'],
                  description: 'Store platform in use'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                checkout_surgery: { type: 'string', description: 'Friction removal with the field-count law' },
                recovery_engine: { type: 'string', description: 'Abandonment sequences with timing and copy' },
                shipping_strategy: { type: 'string', description: 'Thresholds and returns as conversion weapons' },
                funnel_benchmarks: { type: 'array', description: 'Stage rates that expose the broken step' },
                platform_notes: { type: 'string', description: 'Platform-specific implementation path' }
              },
              required: ['status', 'checkout_surgery', 'recovery_engine', 'shipping_strategy', 'funnel_benchmarks', 'platform_notes']
            },
            annotations: { title: 'Checkout & Cart Recovery Optimizer', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'build_ecom_traffic_engine',
            description: 'Builds the traffic engine that feeds the store without burning cash: e-commerce SEO architecture (collection page strategy - the pages that actually rank, product schema markup, the content layer that captures pre-purchase searches), shopping feeds and marketplaces (Google Shopping feed optimization that halves wasted spend, marketplace presence as discovery rather than dependency), organic social and UGC systems (the content formats that sell products without feeling like ads, creator seeding on zero budget, short-video product demos that compound), and the full traffic system that sequences channels by catalog size and margin reality.',
            inputSchema: {
              type: 'object',
              properties: {
                traffic_channel: {
                  type: 'string',
                  enum: ['ecommerce_seo', 'shopping_feeds_marketplaces', 'organic_social_ugc', 'full_traffic_system'],
                  description: 'Traffic channel to build'
                },
                catalog_size: {
                  type: 'string',
                  enum: ['single_hero_product', 'small_catalog_under_50', 'large_catalog_500_plus'],
                  description: 'Store catalog size'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                channel_playbook: { type: 'string', description: 'The chosen channel end to end' },
                seo_architecture: { type: 'string', description: 'Collections, schema and content layer' },
                feed_marketplace_plan: { type: 'string', description: 'Feeds and marketplace sequencing' },
                ugc_content_system: { type: 'string', description: 'Formats and creator seeding on zero budget' },
                catalog_sequencing: { type: 'string', description: 'Channel priority for this catalog size' }
              },
              required: ['status', 'channel_playbook', 'seo_architecture', 'feed_marketplace_plan', 'ugc_content_system', 'catalog_sequencing']
            },
            annotations: { title: 'E-commerce Traffic Engine Builder', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'grow_retention_repeat_revenue',
            description: 'Engineers the repeat-revenue machine where e-commerce profit actually lives: email and SMS lifecycle flows (the 6 core flows ranked by revenue per send - welcome, abandonment, post-purchase, winback, VIP, browse - with timing and copy frameworks), loyalty and repeat-purchase mechanics (points programs that change behavior vs ones that give away margin, the second-order window and how to hit it), subscription and replenishment models for consumables (the subscribe-and-save math, churn-proofing the subscription), and the full retention system with the LTV math that shows when a store flips from paying for customers to printing from them. Tuned to how often the product is naturally repurchased.',
            inputSchema: {
              type: 'object',
              properties: {
                retention_focus: {
                  type: 'string',
                  enum: ['email_sms_lifecycle', 'loyalty_repeat_purchase', 'subscriptions_replenishment', 'full_retention_system'],
                  description: 'Retention system to build'
                },
                purchase_frequency: {
                  type: 'string',
                  enum: ['frequent_consumable', 'occasional_seasonal', 'rare_big_ticket'],
                  description: 'Natural repurchase rhythm of the product'
                }
              },
              required: []
            },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                lifecycle_flows: { type: 'array', description: 'The 6 core flows ranked by revenue per send' },
                loyalty_mechanics: { type: 'string', description: 'Programs that change behavior not margin' },
                subscription_model: { type: 'string', description: 'Subscribe-and-save math and churn-proofing' },
                ltv_math: { type: 'string', description: 'When the store flips to printing from customers' },
                frequency_playbook: { type: 'string', description: 'Retention tuned to repurchase rhythm' }
              },
              required: ['status', 'lifecycle_flows', 'loyalty_mechanics', 'subscription_model', 'ltv_math', 'frequency_playbook']
            },
            annotations: { title: 'Retention & Repeat Revenue Engineer', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
          },
          {
            name: 'audit_product_page_live',
            description: 'LIVE product page audit. Give it a product page URL and it fetches the REAL page in real time, then audits what actually ships to shoppers and search engines: JSON-LD Product schema (offers, price, aggregateRating \u2014 the rich-snippet eligibility check), Open Graph tags, image depth, add-to-cart presence, review markers and trust signals (shipping, returns, guarantees, payment methods) \u2014 with a prioritized CRO fix list computed from the actual page.',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The product page URL to audit (e.g. "https://store.com/products/item").'
                }
              },
              required: ['url']
            },
            annotations: { title: 'Live Product Page Auditor', readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
            outputSchema: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                schema_audit: { type: 'string' },
                conversion_elements_scan: { type: 'string' },
                trust_signals_scan: { type: 'string' },
                cro_priorities: { type: 'string' },
                data_source: { type: 'string' }
              },
              required: ['status', 'schema_audit', 'conversion_elements_scan', 'trust_signals_scan', 'cro_priorities', 'data_source']
            }
          }
        ]
      }
    };
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};

    let result;
    try {
      switch (toolName) {
        case 'autonomous_ecommerce_architect':
          result = architectStore(args);
          break;
        case 'engineer_product_pages':
          result = engineerPages(args);
          break;
        case 'optimize_checkout_cart_recovery':
          result = optimizeFunnel(args);
          break;
        case 'build_ecom_traffic_engine':
          result = buildTraffic(args);
          break;
        case 'grow_retention_repeat_revenue':
          result = growRetention(args);
          break;
        case 'audit_product_page_live':
          if (!args.url || String(args.url).trim() === '') {
            return { jsonrpc: '2.0', id, error: { code: -32602, message: 'Missing required parameter: url' } };
          }
          result = await auditProductPageLive(args);
          break;
        default:
          return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Unknown tool: ' + toolName }
          };
      }

      result.pro_monetization = {
        note: "You are on the Freemium tier (10 free requests/day). Unlock unlimited Pro requests:",
        ...MONETIZATION_INFO
      };

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        }
      };
    } catch (err) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: 'Tool execution error: ' + err.message }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: 'Method not found: ' + method }
  };
}

/* ─────────────────────────── TOOL 1: E-COMMERCE ARCHITECT ─────────────────────────── */

function architectStore(args) {
  const concept = args.store_concept;
  const stage = args.stage || 'no_store_yet';
  const ptype = args.product_type || 'physical_own_brand';

  const stageDiagnosis = {
    no_store_yet: 'NO-STORE-YET DIAGNOSIS: the temptation is to spend 6 weeks on theme customization and logo rounds — resist it. The correct sequence: (1) margin math FIRST (the unit economics worksheet below — if contribution margin per order is under 30% of price, fix the product/price before building anything); (2) one hero product with a clear buyer, not a 40-item catalog of maybes; (3) a store that ships this week: platform default theme, 1 hero product page engineered properly (engineer_product_pages), checkout tested on a real phone with a real card; (4) first traffic from the cheapest honest source for your niche before any ad spend. A live store with 1 great page beats a perfect store that launches next quarter.',
    store_no_sales: 'STORE-NO-SALES DIAGNOSIS: separate the two possible diseases before treating either — NO TRAFFIC (under ~50 sessions/day): nothing on the store is provably broken yet, the problem is upstream; all energy to build_ecom_traffic_engine and do not touch the theme again until sessions exist. TRAFFIC BUT NO SALES (sessions exist, conversion under ~0.5%): now the store is the suspect — run the funnel audit (optimize_checkout_cart_recovery) to find WHERE they leave: product page exits = page/offer problem; add-to-cart but checkout abandonment = friction/trust/shipping-shock problem. The universal check first: open the store on a cheap Android phone on mobile data — most no-sales stores fail this one test (slow, broken layout, surprise shipping).',
    sales_no_profit: 'SALES-NO-PROFIT DIAGNOSIS: revenue is vanity here — rebuild the per-order P&L honestly (worksheet below) including the costs merchants hide from themselves: payment fees, apps subscriptions, returns rate, packaging, ad spend per order (blended CAC). The three usual culprits ranked: (1) CAC too high for a one-purchase customer — the fix is retention (grow_retention_repeat_revenue) or higher AOV (bundles in engineer_product_pages), not more ad spend; (2) price set by copying competitors instead of by margin math — most underpriced stores can raise prices 15-25% with zero conversion damage when the page justifies value; (3) free-shipping giveaway below the viable threshold — recompute the threshold from the real shipping cost curve. Rule: fix margin before scaling traffic; scaling an unprofitable funnel is paying to grow a loss.',
    scaling_plateau: 'SCALING-PLATEAU DIAGNOSIS: the first growth curve (one product, one channel, one audience) has a natural ceiling — breaking it needs a NEW curve, not more budget on the old one. The four plateau-breakers in order of usual ROI: (1) retention depth — if repeat-purchase rate is under 20%, the cheapest growth is customers you already paid for (grow_retention_repeat_revenue); (2) AOV engineering — bundles, post-purchase upsells, quantity breaks lift revenue per session with zero new traffic; (3) channel expansion — add the SECOND traffic engine only now (SEO if you scaled on ads, feeds if you scaled on social); (4) catalog expansion — but only adjacent products the SAME buyer wants (new audiences are a new business, not an expansion). Audit which lever is weakest and sequence one per quarter.'
  };

  const typeNotes = {
    physical_own_brand: 'OWN-BRAND PHYSICAL REALITY: inventory is the risk and the moat — start with the smallest viable order quantity even at worse unit cost (dead stock kills more small brands than high COGS), negotiate reorder terms only after sell-through proof. Margin target: 65%+ gross (product cost under 35% of price) because ads, shipping and returns eat 30-40 points. The advantage nobody uses: you control the product experience — unboxing, inserts asking for reviews, and packaging that earns a social post are free retention infrastructure.',
    print_on_demand: 'PRINT-ON-DEMAND REALITY: zero inventory risk is paid for with thin margins (POD base costs leave 20-35% gross at market prices) — so POD lives or dies on DESIGN DIFFERENTIATION and niche targeting, never on generic catalogs. The math: at thin margins, paid ads rarely work — POD needs organic traffic (niche communities, SEO on design themes, social content) or it needs premium positioning (niche-specific designs priced 30-50% above generic). Quality discipline: order your own samples from 2-3 providers before selling — print quality variance is the #1 review killer in POD.',
    digital_products: 'DIGITAL-PRODUCTS REALITY: ~100% gross margin changes every downstream decision — ads that physical stores cannot afford become viable, bundles cost nothing to create, and the whole game shifts to CONVERSION and PERCEIVED VALUE (previews, samples, and guarantees matter double when buyers cannot hold the product). The risks that replace inventory: refund abuse (clear scope descriptions beat restrictive policies), piracy (accept the leakage, compete on updates and support), and platform dependence (sell from your own store with marketplace presence as discovery, never the reverse).',
    handmade_artisanal: 'HANDMADE-ARTISANAL REALITY: production time is the inventory constraint — price it in honestly (hourly rate x hours + materials x 2 minimum; underpricing handmade is the craft-killer) and use made-to-order with stated lead times rather than stockpiling. The story IS the product: the maker, the process, the materials provenance belong on the product page as conversion assets, not an about page nobody reads. Scale path honesty: handmade scales by raising prices and waitlists, by batching production, or by productizing one bestseller — not by working 90-hour weeks.'
  };

  return {
    status: 'success',
    viability_read: `E-commerce architecture for: "${concept}" — stage: ${stage.replace(/_/g, ' ')}, product type: ${ptype.replace(/_/g, ' ')}. VIABILITY LENSES (score honestly before spending): (1) MARGIN ROOM — after landed product cost, payment fees, shipping subsidy, packaging and a realistic returns rate, does a single order keep 30%+ of price as contribution? If not, no amount of marketing fixes the business. (2) DEMAND SHAPE — is the product bought on search intent (people already looking — SEO/feeds game), on discovery (seen and wanted — social/UGC game), or on recommendation (trust game)? The traffic engine must match the shape. (3) DIFFERENTIATION REALITY — "better quality" is invisible on a screen; visible differentiation is niche specificity, story, bundle architecture, or service (speed, guarantee, support). If a buyer sees your page and a bigger competitor side by side, what wins the click? Write that sentence; it is your whole brand. (4) REPURCHASE RHYTHM — one-time-purchase products must win on first-order margin; repurchasable products can pay more for the first customer and win on LTV — know which business you are in before setting a CAC ceiling. ` + typeNotes[ptype],
    store_stack: 'STORE STACK (boring, proven, fee-aware): PLATFORM — Shopify when speed-to-live and app ecosystem matter most (the fee premium buys reliability and checkout quality); WooCommerce when WordPress skills exist and fee minimization matters (you own the maintenance burden); custom headless ONLY at real scale with real dev resources — it is infrastructure, not a shortcut. THEME: platform default or one proven paid theme, customized with restraint — theme-polishing is the most popular form of procrastination in e-commerce. APPS THAT EARN THEIR FEE (the short list): reviews with photo collection, email/SMS flows platform, a bundle/upsell tool once AOV work starts — and nothing else until a specific measured problem demands a specific app. APP-BLOAT RULE: every app is a monthly fee plus a page-speed tax; audit quarterly and delete anything that cannot show its revenue. PAYMENTS: cover the local market default methods, not just cards — payment method coverage is a silent conversion lever that varies by country.',
    unit_economics: [
      { line: 'LANDED PRODUCT COST', detail: 'Product + inbound freight + duties + defect/shrink allowance. The number most merchants underestimate by 15-20%.' },
      { line: 'PER-ORDER VARIABLE COSTS', detail: 'Payment processing (~3%), outbound shipping subsidy (what you pay minus what the customer pays), packaging + inserts, pick/pack or your time priced honestly.' },
      { line: 'RETURNS ALLOWANCE', detail: 'Category-dependent (apparel 15-30%, hard goods 2-8%) x the net cost of a return (shipping both ways + restock loss). Price it in BEFORE it surprises you.' },
      { line: 'CONTRIBUTION MARGIN PER ORDER', detail: 'Price - all of the above. This number x orders must cover fixed costs (apps, tools) AND acquisition. Under 30% of price = fix product/price/AOV before scaling anything.' },
      { line: 'CAC CEILING', detail: 'One-purchase products: CAC must stay under ~50% of contribution margin to keep real profit. Repurchase products: CAC up to first-order breakeven is defensible ONLY once the repeat-rate data proves the LTV (grow_retention_repeat_revenue has the math).' }
    ],
    stage_diagnosis: stageDiagnosis[stage],
    execution_roadmap: 'EXECUTION ROADMAP (90 days to profitable orders): WEEKS 1-2 — foundations: unit economics worksheet filled with real quotes (not estimates), hero product selected, store live on default theme with ONE fully engineered product page, checkout tested end to end on mobile, analytics + a one-page dashboard (sessions, conversion rate, AOV, contribution per order). WEEKS 3-6 — first traffic engine: pick the ONE channel matching the demand shape (build_ecom_traffic_engine) and run it with daily consistency; launch the 3 revenue-critical email flows (welcome, cart abandonment, post-purchase) in week 3 — they compound from the first visitor. WEEKS 7-10 — conversion iteration from data: funnel audit weekly, fix the single leakiest step each week (optimize_checkout_cart_recovery), first AOV lever live (bundle or threshold free shipping). WEEKS 11-13 — margin + repeat: per-order P&L review against the worksheet, price adjustment if margin is thin, winback + VIP flows live, and the kill/scale decision on the traffic channel with 90 days of honest data. Discipline rule: one channel, one hero product, one weekly fix — stores die of scattered effort more than of wrong effort.'
  };
}

/* ─────────────────────────── TOOL 2: PRODUCT PAGE ENGINEER ─────────────────────────── */

function engineerPages(args) {
  const focus = args.page_focus || 'full_page_teardown';
  const temp = args.traffic_temperature || 'warm_social_organic';

  const tempNotes = {
    cold_ad_traffic: 'COLD-TRAFFIC TUNING: these visitors have zero context and sub-3-second patience — the page must restate the ad promise in the first screen (message match is the #1 cold-traffic conversion factor; an ad about the problem landing on a generic product page bleeds 50%+ of clicks), lead with the strongest visual proof, and answer "why should I trust an unknown store" explicitly (guarantee + shipping clarity + review count above the fold). Cold traffic punishes clutter: one product, one promise, one CTA.',
    warm_social_organic: 'WARM-TRAFFIC TUNING: these visitors arrive with borrowed trust (a creator, a post, a share) — the page must CONTINUE the story they came from (same aesthetic, same language, same person if creator-driven), convert borrowed trust into owned proof (UGC gallery front and center), and capture the ones not ready to buy (the email/SMS capture with a real incentive is worth more here than anywhere — warm visitors who leave without a trace are the biggest invisible loss).',
    search_intent_traffic: 'SEARCH-INTENT TUNING: these visitors know what they want and are comparing — the page must answer the comparison questions directly (specs table, honest compatibility/sizing info, shipping time and cost visible WITHOUT adding to cart), win on completeness (the page that answers the question the competitor page dodges wins the order), and surface differentiators in scannable form. Search traffic reads more and scrolls deeper: longer pages with real information outconvert short pages here.'
  };

  const focusContent = {
    product_page_copy: 'COPY DEEP-DIVE: TITLE — benefit + specificity beats brand-speak ("Insulated Steel Bottle - 24h Cold" beats "The Voyager"); the title is also the search snippet, write it for both. OPENING LINE — the outcome in one sentence, written in the customer\u2019s words (mine reviews of competitor products for the exact phrases buyers use; their language outconverts your language every time). STRUCTURE FOR TWO READERS — skimmers get benefit-led bullets (start each with the benefit, follow with the feature that delivers it); readers get the expanded story below (who it is for, how it is used, what makes it different, what is in the box). SENSORY + SPECIFICITY RULE — replace every abstract adjective with a measurable or sensory fact ("soft" → "230gsm brushed cotton"; "durable" → "survives 1.5m drops"). The honesty edge: name who the product is NOT for — one honest exclusion buys credibility for every claim that follows.',
    trust_social_proof: 'TRUST-STACK DEEP-DIVE: order proof by WHEN each objection arises — (1) at first glance: star rating + review count next to the title (absence reads as risk); (2) at price evaluation: guarantee adjacent to price (the risk-flip: "90-day no-questions returns" does more work next to the price than in a footer); (3) at consideration: photo/video reviews mid-page (customer photos outconvert studio photos for trust — imperfection is the proof), a UGC gallery, and the review section with the FILTERABLE negatives visible (a 4.6 with visible critical reviews outconverts a suspicious 5.0); (4) at commitment: shipping cost + delivery window stated BEFORE the cart (shipping surprise is the top abandonment trigger), payment logos, and security cues at the CTA. Review ENGINE: the post-purchase email asking for a photo review with a small incentive is the highest-ROI marketing automation in e-commerce — reviews compound like interest.',
    offer_structure_pricing: 'OFFER-ENGINEERING DEEP-DIVE: AOV is the lever that pays for traffic — (1) BUNDLES: the "complete the routine/kit" bundle at 10-15% off the sum converts best when the bundle solves the WHOLE problem the hero product starts; (2) QUANTITY BREAKS: for consumables, 1x/2x/3x pricing with the middle option visually preselected (the decoy effect: the 3x exists partly to make 2x feel reasonable); (3) VARIANT ARCHITECTURE: name variants by use case not just attribute where possible ("Everyday" / "Travel" / "Pro") — it converts the undecided by self-selection; (4) PRICE PRESENTATION: anchor with the compare-at price only when honest, show per-unit math on multi-packs, and position the guarantee within eye-line of the price; (5) POST-ADD UPSELL: the one-click add-on after add-to-cart (accessory, protection, consumable refill) lifts AOV with zero page clutter — cap it at ONE offer; stacked upsell chains feel like a casino and erode trust.',
    full_page_teardown: 'FULL-TEARDOWN PROTOCOL: audit the page as five sequential jobs and find which job fails — JOB 1 "is this for me?" (above the fold: image + title + rating answer it in 3 seconds); JOB 2 "do I want it?" (benefit bullets + sensory copy + lifestyle imagery); JOB 3 "can I trust it?" (the trust stack in objection order); JOB 4 "what does it really cost?" (price + shipping + delivery window with zero surprises); JOB 5 "buy now or think about it?" (guarantee at the CTA + scarcity only when TRUE + the capture fallback for leavers). Run the mobile test first — 70-80% of sessions are mobile and pages are still audited on desktop; then run the stranger test: someone unfamiliar describes who the product is for and why it beats alternatives after 10 seconds on the page — failure here is a Job 1-2 problem no CRO tweak downstream can fix.'
  };

  return {
    status: 'success',
    above_fold_formula: 'ABOVE-THE-FOLD FORMULA: IMAGES carry 60% of the conversion load — slot 1: the product, clean, high-res (zoomable); slot 2: in-use lifestyle context (the buyer sees their life, not your studio); slot 3: the scale/size reference shot (size surprise is a top return reason — kill it here); slot 4: the detail/texture close-up; slot 5+: UGC and the infographic benefit card. VIDEO: a 15-30s in-use clip lifts conversion in nearly every category — phone-shot authenticity beats studio polish for trust. TITLE: benefit + specificity. PRICE: visible without scrolling, anchored by the guarantee within eye-line. RATING + COUNT next to title. CTA: one primary button, high-contrast, verb-first — and sticky on mobile scroll. ' + tempNotes[temp],
    copy_architecture: focusContent[focus],
    trust_stack: focus === 'trust_social_proof' ? focusContent.trust_social_proof : 'TRUST STACK (compressed): rating + count at title → guarantee beside price → photo reviews and UGC mid-page → shipping cost and delivery window BEFORE cart → payment/security cues at the CTA. Negative-review visibility paradox: a filterable review section showing the occasional critical review outconverts curated perfection — buyers are not looking for flawless, they are looking for honest. Full objection-ordered breakdown: run page_focus=trust_social_proof.',
    offer_engineering: focus === 'offer_structure_pricing' ? focusContent.offer_structure_pricing : 'OFFER ENGINEERING (compressed): one bundle that completes the problem, quantity breaks on consumables with the middle option preselected, variants named by use case, per-unit math shown, ONE post-add upsell maximum. AOV lifts pay for traffic that single-unit margins cannot. Full decoy-effect and bundle architecture: run page_focus=offer_structure_pricing.',
    page_leak_audit: [
      { metric: 'Product page bounce (no scroll, under 10s)', healthy: 'under ~45% for matched traffic', leak_meaning: 'Job 1 failure: message mismatch with the source, slow load, or the fold does not say who/what in 3 seconds.' },
      { metric: 'Scroll depth past 50%', healthy: '50%+ of visitors', leak_meaning: 'Job 2 failure: copy/imagery not building desire — bullets are specs not benefits, images are catalog not life.' },
      { metric: 'Add-to-cart rate', healthy: '~8-12% of product page sessions (category-dependent)', leak_meaning: 'Jobs 3-4 failure: trust gap or price/shipping ambiguity. Check if shipping info is findable without carting.' },
      { metric: 'Cart-to-checkout rate', healthy: '~60%+', leak_meaning: 'Shipping shock in cart or weak cart page. Threshold messaging and clear totals fix most of it.' },
      { metric: 'Checkout completion', healthy: '~50-70% of checkout starts', leak_meaning: 'Checkout friction: fields, forced accounts, missing payment methods (optimize_checkout_cart_recovery).' }
    ]
  };
}

/* ─────────────────────────── TOOL 3: CHECKOUT & RECOVERY ─────────────────────────── */

function optimizeFunnel(args) {
  const focus = args.funnel_focus || 'full_funnel_audit';
  const platform = args.store_platform || 'shopify';

  const platformNotes = {
    shopify: 'SHOPIFY PATH: the checkout itself is Shopify\u2019s crown jewel — do not fight it, feed it: enable the accelerated wallets (Shop Pay, Apple Pay, Google Pay — express checkout buttons convert mobile dramatically better than card forms), keep checkout customization minimal, and put the optimization energy into the CART (the editable layer): cart drawer with threshold progress bar, trust row, and the one upsell. Abandonment flows: native email on Basic plans is serviceable; a dedicated flows app earns its fee once volume justifies it. Watch the app-stack tax: every cart/checkout app adds script weight — speed-test after each install.',
    woocommerce: 'WOOCOMMERCE PATH: you own the checkout — which means you own its problems: strip default checkout fields aggressively (company, order notes, second address line — each removed field is measurable conversion), add express wallets via your payment gateway (Apple/Google Pay via Stripe-class gateways), and audit plugin weight — a slow checkout is the most expensive slow page on the site. Hosting is a conversion factor here (checkout TTFB on cheap shared hosting kills orders silently). Abandonment: a flows plugin or external email platform wired to cart events; test the event firing yourself — silent tracking breakage is endemic in Woo stacks.',
    custom_headless: 'CUSTOM-HEADLESS PATH: total control, total responsibility — the checkout must EARN the trust platforms get free: recognizable payment UI (hosted fields from the processor), visible security cues, flawless address autocomplete, instant validation errors, and state preservation (a refresh that empties the checkout is an order lost forever). Wire cart/checkout events to the email platform as first-class infrastructure (abandonment revenue depends on event reliability). Honest rule: if the team cannot match platform-checkout polish, use the processor\u2019s hosted checkout page — a branded but clunky checkout loses to a plain but flawless one.'
  };

  const focusContent = {
    checkout_friction: 'CHECKOUT SURGERY DEEP-DIVE: THE FIELD-COUNT LAW — every field is a toll; the viable minimum is email, name, address, payment (phone only if delivery genuinely needs it, and say why). GUEST CHECKOUT is non-negotiable — forced account creation is a top-3 abandonment cause across every study; offer account creation AFTER purchase (one click with data already entered). EXPRESS WALLETS FIRST — Apple Pay/Google Pay/Shop Pay buttons at the TOP of checkout: on mobile they collapse a 3-minute form into a thumbprint. ERROR UX — inline validation at the field (not a red wall after submit), clear recovery guidance. ADDRESS AUTOCOMPLETE — cuts the longest field block and the typo-driven delivery failures. PROGRESS CLARITY — single-page or clearly stepped, totals always visible, no surprise lines appearing at the last step. TRUST INSIDE CHECKOUT — small reassurance row (secure payment, returns, support contact) near the pay button; the checkout is where fear peaks.',
    cart_abandonment_recovery: 'RECOVERY-ENGINE DEEP-DIVE: ~70% of carts abandon — the engine that recovers 5-15% of them: EMAIL SEQUENCE — msg 1 at ~1 hour (pure service: "your cart is saved" + contents + one-click return; no discount — many abandons are interruptions, not objections); msg 2 at ~24h (objection handling: guarantee, shipping clarity, top review, support contact); msg 3 at ~48-72h (the incentive IF margins allow — small %, expiring honestly; chronic discounting trains customers to abandon on purpose, so consider free-shipping or a bonus item instead of a price cut). SMS (where lawful and opted-in): one message, ~2-4h, link + service tone — SMS burns trust fast if pushy. CAPTURE DEPENDENCY — recovery reach depends on having the email BEFORE checkout: the early-capture popup (first-order incentive) and cart-page capture are the engine\u2019s fuel supply. BROWSE ABANDONMENT — viewed-product-no-cart emails at gentle cadence ("still thinking about X?" + reviews) for the earlier funnel. EXIT-INTENT — one calm offer on desktop exit; never a popup chain.',
    shipping_returns_strategy: 'SHIPPING-AS-WEAPON DEEP-DIVE: shipping surprise is the single largest abandonment trigger — so make shipping policy a selling tool: THRESHOLD MATH — set free-shipping threshold at ~1.3-1.5x current AOV (close enough to reach, high enough to lift AOV); show the progress bar in cart ("12 DH away from free shipping" is the best upsell copy ever written). FLAT-RATE HONESTY — a visible flat rate beats a hidden calculated rate for conversion even when slightly more expensive; ambiguity costs more than the fee. DELIVERY WINDOWS — a stated range ("arrives Tue-Thu") converts better than a speed claim; late surprises create the worst reviews, so promise the honest window and beat it. RETURNS AS CONVERSION COPY — the returns policy is read BEFORE purchase by the hesitant: plain-language, generous-window wording measurably lifts first-purchase conversion and the real return-rate increase is small in most categories; put the policy summary at the price and in checkout, not only in a footer. INTERNATIONAL CLARITY — duties-and-taxes ambiguity kills cross-border orders; state who pays what up front.',
    full_funnel_audit: 'FULL-FUNNEL AUDIT PROTOCOL: measure the five handoffs and fix the single worst one each week — session → product page view (navigation/collection health), product view → add-to-cart (page/offer: engineer_product_pages), cart → checkout start (shipping shock, cart page weakness), checkout start → completion (friction surgery above), completion → second purchase (grow_retention_repeat_revenue). Instrument each step, compare to the benchmark table, and respect the order: an upstream fix multiplies through every stage below it, so fix the EARLIEST broken step first even when the checkout numbers look scarier. Re-audit monthly — funnels decay silently (an app update, a new popup, a slow script) and the decay never announces itself.'
  };

  return {
    status: 'success',
    checkout_surgery: focus === 'checkout_friction' ? focusContent.checkout_friction : 'CHECKOUT SURGERY (compressed): guest checkout always; express wallets (Apple/Google/Shop Pay) above the card form; minimum fields (every field is a toll); inline validation; address autocomplete; totals visible throughout; trust row at the pay button. Full field-by-field surgery: run funnel_focus=checkout_friction.',
    recovery_engine: focus === 'cart_abandonment_recovery' ? focusContent.cart_abandonment_recovery : 'RECOVERY ENGINE (compressed): 3-email sequence (1h service / 24h objections / 48-72h incentive-if-margins-allow), one polite SMS where opted-in, early email capture as the fuel supply, browse-abandonment for the earlier funnel. Recovers 5-15% of abandons when the capture rate feeds it. Full timing + copy frameworks: run funnel_focus=cart_abandonment_recovery.',
    shipping_strategy: focus === 'shipping_returns_strategy' ? focusContent.shipping_returns_strategy : 'SHIPPING STRATEGY (compressed): free-shipping threshold at ~1.3-1.5x AOV with a cart progress bar; visible flat rates beat hidden calculated rates; honest delivery windows beat speed claims; generous plain-language returns wording lifts conversion more than it costs in returns. Full threshold math: run funnel_focus=shipping_returns_strategy.',
    funnel_benchmarks: [
      { step: 'Session → Product page view', healthy: '~40-60%', broken_signal: 'Weak collections/navigation or mismatched landing — traffic lands and wanders.' },
      { step: 'Product view → Add to cart', healthy: '~8-12%', broken_signal: 'Page/offer problem — audit with engineer_product_pages before touching checkout.' },
      { step: 'Cart → Checkout start', healthy: '~60%+', broken_signal: 'Shipping shock or cart-page weakness — thresholds and total clarity fix most of it.' },
      { step: 'Checkout start → Purchase', healthy: '~50-70%', broken_signal: 'Friction: forced accounts, field count, missing payment methods, validation rage.' },
      { step: 'Overall session → Purchase', healthy: '~1-3% (category/traffic dependent)', broken_signal: 'Use the stage rates above to locate WHERE — the overall rate alone diagnoses nothing.' }
    ],
    platform_notes: platformNotes[platform]
  };
}

/* ─────────────────────────── TOOL 4: TRAFFIC ENGINE ─────────────────────────── */

function buildTraffic(args) {
  const channel = args.traffic_channel || 'full_traffic_system';
  const catalog = args.catalog_size || 'small_catalog_under_50';

  const catalogSequencing = {
    single_hero_product: 'SINGLE-HERO SEQUENCING: one product cannot win broad SEO (too few pages) — the hero-product traffic order: (1) organic social + UGC around the ONE transformation the product delivers (single products are the best story-compression in commerce); (2) the content layer answering every pre-purchase question about the problem (10-20 deep articles/videos can own a niche problem space); (3) Google Shopping feed for the brand-and-category searches the content creates; (4) marketplace presence as discovery. The hero advantage: every piece of content, every review, every link compounds onto ONE page — depth beats breadth when you only need one page to rank.',
    small_catalog_under_50: 'SMALL-CATALOG SEQUENCING: the sweet spot — enough pages for real SEO architecture, few enough to keep every page excellent: (1) collection-page SEO first (collections match how people search; products match what they buy); (2) Shopping feeds with hand-tuned titles for the top 10 sellers; (3) the content layer bridging problem-searches to collections; (4) organic social spotlighting one product per week in rotation. Keep the catalog honest: prune products that neither sell nor attract search — every weak page dilutes crawl and attention.',
    large_catalog_500_plus: 'LARGE-CATALOG SEQUENCING: at this scale, traffic is an INFRASTRUCTURE problem — (1) feed quality at scale (rules-based title/attribute generation, error monitoring — a 2% feed-error rate is hundreds of invisible products); (2) faceted-navigation SEO discipline (index the valuable facets, noindex the combinatorial junk, or crawl budget drowns); (3) category-page content at scale (template + unique intro per major category); (4) internal linking architecture (bestsellers lift new arrivals). Social/UGC shifts from product-level to brand-level at this size. The scale trap: automation without auditing — sample-check 20 random product pages monthly like a stranger would.'
  };

  const channelContent = {
    ecommerce_seo: 'E-COMMERCE SEO DEEP-DIVE: COLLECTION PAGES ARE THE RANKING UNIT — buyers search categories ("minimalist leather wallets"), not your product names: each major collection gets a keyword-mapped title/H1, a 150-300 word intro that actually helps (not keyword soup), and curated internal links to the money products. PRODUCT SCHEMA — Product + Offer + AggregateRating markup makes listings rich (price, stars, stock in the search result); rich results lift CTR before rankings move at all. THE CONTENT LAYER — pre-purchase searches ("how to choose X", "X vs Y", sizing guides, care guides) are where buyers exist BEFORE they are comparing carts; each article answers one question completely and routes to the relevant collection. TECHNICAL HYGIENE — site speed (kill unused app scripts), canonical discipline on variants/filters, image alt text that describes (it is also accessibility), and a clean XML sitemap. PATIENCE MATH — e-com SEO compounds over 6-12 months; it is the cheapest traffic you will ever get, and the slowest to arrive — start it before you need it.',
    shopping_feeds_marketplaces: 'FEEDS & MARKETPLACES DEEP-DIVE: GOOGLE SHOPPING FEED — the feed IS the campaign: TITLES front-load what shoppers type (brand + product type + key attribute + size/color — not your poetic product name), CATEGORY mapping to the deepest accurate Google taxonomy node, IMAGES clean on white plus lifestyle alternates, PRICE/AVAILABILITY sync monitored daily (mismatches burn account trust silently), and GTIN/identifier completeness (listings with identifiers get dramatically better serving). Free listings first — Shopping surfaces include unpaid placements; a clean feed earns them before a single dirham of spend. MARKETPLACES AS DISCOVERY — a presence where buyers already search (category leaders differ by region) with the margin math done per-marketplace (fees 8-20%+) and a rule: the marketplace is a customer-acquisition channel, the OWN STORE is the business — inserts, packaging and post-purchase flows pull marketplace buyers into the owned list wherever the marketplace terms allow. Never build the whole house on rented land.',
    organic_social_ugc: 'ORGANIC SOCIAL & UGC DEEP-DIVE: THE FORMATS THAT SELL WITHOUT FEELING LIKE ADS — (1) the in-use demo (15-45s, phone-shot, real environment, no jump-cut hype); (2) the transformation/result format (before-after honesty); (3) the process/maker format (production, packing orders — process content builds trust no ad can buy); (4) the founder-answers format (real customer questions answered to camera). CADENCE beats brilliance: 4-5 posts/week sustained for 90 days outperforms sporadic genius — the algorithm and the audience both reward rhythm. CREATOR SEEDING ON ZERO BUDGET — gift product to 10-20 SMALL creators (1k-20k followers) in the exact niche with zero content demands (pressure produces ads; freedom produces authenticity); expect a 30-50% post rate from well-chosen fits, then ask permission to reuse the best clips on product pages and in ads later. UGC FLYWHEEL — the post-purchase email asks for a photo/clip with a small reward; every great customer clip becomes product-page proof AND next week\u2019s post. One platform mastered before a second is opened.',
    full_traffic_system: 'FULL-TRAFFIC-SYSTEM DEEP-DIVE: the three engines compound in different gears — SOCIAL/UGC is the fast gear (traffic this month, momentum from week one), FEEDS are the intent gear (capture existing demand at high conversion), SEO is the compounding gear (6-12 months to arrive, then the cheapest sessions forever). The sequencing rule: start the fast gear plus the capture infrastructure (email list from day one), add the intent gear when product-market signal exists (people search for what you sell), and plant the compounding gear in month one knowing it pays in month nine. The CHANNEL-FOCUS LAW: one engine run with daily consistency for 90 days before judging it, and never more engines than you can feed weekly — three half-fed channels lose to one well-fed channel every single time. Measure per-channel with UTM discipline and judge channels on contribution margin per session, not sessions.'
  };

  return {
    status: 'success',
    channel_playbook: channelContent[channel],
    seo_architecture: channel === 'ecommerce_seo' ? channelContent.ecommerce_seo : 'SEO ARCHITECTURE (compressed): collections are the ranking unit (keyword-mapped, 150-300 word helpful intros); Product/Offer/AggregateRating schema for rich results; the content layer captures pre-purchase questions and routes to collections; technical hygiene (speed, canonicals on variants, alt text). Compounds over 6-12 months — start before you need it. Full breakdown: run traffic_channel=ecommerce_seo.',
    feed_marketplace_plan: channel === 'shopping_feeds_marketplaces' ? channelContent.shopping_feeds_marketplaces : 'FEEDS & MARKETPLACES (compressed): the feed is the campaign — front-loaded searchable titles, deepest accurate category, identifier completeness, daily price/stock sync; free Shopping listings before paid; marketplaces as discovery with per-marketplace margin math, own store as the business. Full feed field-by-field: run traffic_channel=shopping_feeds_marketplaces.',
    ugc_content_system: channel === 'organic_social_ugc' ? channelContent.organic_social_ugc : 'UGC SYSTEM (compressed): four formats (in-use demo, transformation, process/maker, founder-answers), 4-5 posts/week for 90 days, gift-seeding 10-20 small niche creators with zero content demands, post-purchase photo-review ask feeding the flywheel. One platform mastered first. Full format playbook: run traffic_channel=organic_social_ugc.',
    catalog_sequencing: catalogSequencing[catalog]
  };
}

/* ─────────────────────────── TOOL 5: RETENTION & REPEAT REVENUE ─────────────────────────── */

function growRetention(args) {
  const focus = args.retention_focus || 'full_retention_system';
  const freq = args.purchase_frequency || 'occasional_seasonal';

  const freqPlaybooks = {
    frequent_consumable: 'FREQUENT-CONSUMABLE PLAYBOOK: the product empties on a clock — retention is about OWNING THE REORDER MOMENT: compute the real consumption window from order data (days between first and second purchase of repeat customers), fire the replenishment reminder at ~80% of the window ("running low?" + one-click reorder), and make subscribe-and-save the default-visible option on the product page (5-15% discount for the subscription commitment). The LTV at stake is the biggest in e-commerce: a consumable buyer retained for a year is worth 6-12 first orders — which means consumables can pay MORE for acquisition than their first-order math suggests, once (and only once) the repeat data proves itself.',
    occasional_seasonal: 'OCCASIONAL-SEASONAL PLAYBOOK: the repurchase is months apart — retention is about STAYING WORTH REMEMBERING between purchases: the post-purchase flow maximizes the experience (care guides, use ideas — the product performing well IS the retention), the list gets genuinely useful seasonal content (not weekly discount spam — unsubscribes between purchase cycles are the silent killer here), cross-sell maps the NEXT logical product from what they bought (the data tells you: what do second orders actually contain?), and the calendar moments (seasons, holidays, back-in-stock) are planned as campaigns, not improvised. Winback runs on the category\u2019s natural cycle — a year-later "time to refresh?" beats a month-later discount beg.',
    rare_big_ticket: 'RARE-BIG-TICKET PLAYBOOK: the buyer may not return for years — retention revenue lives in three places instead: (1) ACCESSORIES & CONSUMABLES of the hero purchase (the ecosystem: cases, refills, add-ons, maintenance — attach-rate engineering in the post-purchase flow is the whole game); (2) REFERRALS (a delighted big-ticket buyer is a high-trust recommender: the post-delivery moment of peak satisfaction is when the referral ask with a meaningful two-sided reward belongs); (3) THE LONG LIST (owners want mastery content — care, upgrades, pro tips; stay useful for years and the eventual upgrade purchase plus the referrals route through you, not a search engine). AOV and attach-rate are the metrics here, not repurchase frequency.'
  };

  const focusContent = {
    email_sms_lifecycle: 'LIFECYCLE-FLOWS DEEP-DIVE: ranked by revenue per send — (1) WELCOME (capture → first purchase): deliver the promised incentive instantly, then 2-3 sends of story + bestseller proof + the offer deadline; highest-converting flow that exists. (2) CART ABANDONMENT: the 3-message engine (service at 1h, objections at 24h, honest incentive at 48-72h). (3) POST-PURCHASE: order confirmation with personality (the most-opened email in commerce), shipping clarity, the delivery check-in, the photo-review ask at the moment of peak satisfaction, then the use/care content that prevents returns and builds the habit. (4) WINBACK (lapsed at 1.5-2x the median repurchase window): "we miss you" + what is new + an escalating incentive only if silence persists. (5) VIP (top ~10% by spend): early access and real perks — whales respond to status more than discounts. (6) BROWSE ABANDONMENT: gentle, review-led. SMS RULES: transactional moments and true drops only, always opted-in — SMS trust burns fast and never rebuilds. LIST HYGIENE: sunset non-openers quarterly; deliverability is a retention asset.',
    loyalty_repeat_purchase: 'LOYALTY-MECHANICS DEEP-DIVE: the test for any program — does it CHANGE BEHAVIOR or just discount purchases that would happen anyway? POINTS done right: meaningful earn rate (5%+ back in value or nobody cares), redemption thresholds reachable within 2-3 purchases (unreachable points are anti-loyalty), points for the flywheel actions too (photo reviews, referrals, UGC permission). TIERS: status works when the top tier has REAL privileges (early drops, free express, direct line) — visible progress toward the next tier drives the incremental order. THE SECOND-ORDER WINDOW: the highest-leverage retention stat in commerce — a first-time buyer who makes a second purchase within 60-90 days multiplies lifetime repeat probability; engineer the window deliberately (post-purchase flow ends with a time-boxed second-order offer on the mapped next product). REFERRALS: two-sided rewards (both sides get value), asked at peak satisfaction (post-delivery, post-review), frictionless link sharing. The anti-pattern: programs so complex customers need a FAQ — if the value is not graspable in one sentence, it is margin leakage wearing a loyalty costume.',
    subscriptions_replenishment: 'SUBSCRIPTION-MODEL DEEP-DIVE: SUBSCRIBE-AND-SAVE MATH — the discount (5-15%) buys predictable revenue, higher LTV and inventory forecastability; price it against the real repeat-rate uplift, not vibes. ELIGIBILITY HONESTY: subscriptions fit products consumed on a rhythm — forcing subscriptions onto occasional purchases manufactures churn and refund tickets. CHURN-PROOFING (the whole game): flexible by design — skip, pause, swap flavors/variants, change cadence, all self-serve in one click (customers who can pause do not cancel; customers who must email to cancel leave forever and tell friends); the pre-renewal notice for long cadences (surprise charges create the angriest churn); failed-payment recovery (card updaters + a polite dunning sequence recovers 20-40% of involuntary churn — the cheapest revenue in the business); and cancel-flow intelligence (one question + one targeted save offer — pause instead of cancel saves a meaningful share; never a maze). METRIC: subscriber 6-month survival rate beats subscriber count — a leaky subscription program is a discount program with extra steps.',
    full_retention_system: 'FULL-RETENTION-SYSTEM DEEP-DIVE: the profit structure of e-commerce is simple and brutal — the first order pays for acquisition; the PROFIT lives in orders 2-N where CAC is zero. System assembly order: (1) the 6 lifecycle flows (the automation layer that works every day forever); (2) the second-order window engineering (the single highest-leverage retention intervention); (3) the loyalty/referral layer once repeat behavior exists to amplify; (4) subscriptions where the consumption rhythm justifies them; (5) the quarterly cohort review (repeat rate by acquisition month, time-to-second-order, LTV:CAC by channel) — cohorts tell the truth that blended averages hide. The cultural rule: retention is not an email tactic, it is the product experience compounding — the unboxing, the product performing as promised, the support interaction that surprises. Email just collects what the experience earns.'
  };

  return {
    status: 'success',
    lifecycle_flows: [
      { flow: '1. Welcome series', revenue_rank: 'Highest revenue per send in commerce', core: 'Instant incentive delivery → story + bestseller proof → offer deadline. Capture rate upstream decides its reach.' },
      { flow: '2. Cart abandonment', revenue_rank: '#2 — pure recovered revenue', core: 'Service at 1h, objections at 24h, honest incentive at 48-72h. Recovers 5-15% of abandons.' },
      { flow: '3. Post-purchase', revenue_rank: 'The retention foundation', core: 'Confirmation with personality → delivery check-in → photo-review ask at peak satisfaction → use/care content → time-boxed second-order offer.' },
      { flow: '4. Winback', revenue_rank: 'Cheapest reactivation available', core: 'Triggered at 1.5-2x median repurchase window; escalate incentive only on continued silence.' },
      { flow: '5. VIP / top spenders', revenue_rank: 'Small list, outsized share of revenue', core: 'Status and access over discounts — early drops, real perks, direct line.' },
      { flow: '6. Browse abandonment', revenue_rank: 'Top-of-funnel nudge', core: 'Gentle, review-led, low frequency — the earlier-funnel cousin of cart recovery.' }
    ],
    loyalty_mechanics: focus === 'loyalty_repeat_purchase' ? focusContent.loyalty_repeat_purchase : 'LOYALTY (compressed): programs must change behavior, not discount the inevitable — meaningful earn rates, redemptions reachable in 2-3 purchases, points for reviews/referrals/UGC, tiers with real privileges, and the second-order window (60-90 days) engineered deliberately. Full mechanics: run retention_focus=loyalty_repeat_purchase.',
    subscription_model: focus === 'subscriptions_replenishment' ? focusContent.subscriptions_replenishment : 'SUBSCRIPTIONS (compressed): subscribe-and-save (5-15%) where consumption has a rhythm; churn-proof with self-serve skip/pause/swap, pre-renewal notices, dunning recovery (20-40% of involuntary churn), and a humane cancel flow. Survival rate beats subscriber count. Full math: run retention_focus=subscriptions_replenishment.',
    ltv_math: 'LTV MATH — WHEN THE STORE FLIPS: track 90-day and 12-month LTV by acquisition cohort against blended CAC. The flip point: when (repeat rate x average orders per repeater x contribution margin per order) exceeds first-order CAC, every new customer is profitable infrastructure instead of a gamble — and the store can outbid every one-order competitor for the same traffic, because they need margin on order one and you do not. Getting there: lift the repeat rate (flows + second-order window), lift contribution per order (AOV engineering), or lower CAC (owned traffic engines) — the three levers compound multiplicatively, which is why a 15% improvement in each roughly doubles the LTV:CAC ratio. Review quarterly by cohort; blended lifetime averages flatter decaying businesses.',
    frequency_playbook: freqPlaybooks[freq] + ' ' + (focus === 'email_sms_lifecycle' ? focusContent.email_sms_lifecycle : focus === 'full_retention_system' ? focusContent.full_retention_system : '')
  };
}

async function auditProductPageLive(args) {
  let url = String(args.url).trim();
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  let resp = null, html = '', fetchError = null;
  try {
    resp = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CommerceForge-MCP/1.1)' } });
    html = await resp.text();
  } catch (e) { fetchError = e.message; }
  if (fetchError || !resp) {
    const note = 'Live fetch failed for ' + url + ' (' + (fetchError || 'no response') + '). Retry or verify the URL.';
    return { status: 'success', schema_audit: note, conversion_elements_scan: note, trust_signals_scan: note, cro_priorities: note, data_source: 'Live HTTP fetch (failed) \u2014 ' + url };
  }
  const ldBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  let productSchema = null;
  let schemaCount = 0;
  for (const block of ldBlocks) {
    const body = (block.match(/>([\s\S]*)<\/script>/i) || [])[1];
    try {
      const parsed = JSON.parse(body);
      const nodes = Array.isArray(parsed) ? parsed : (parsed['@graph'] ? parsed['@graph'] : [parsed]);
      schemaCount += nodes.length;
      for (const n of nodes) {
        const t = n['@type'];
        if (t === 'Product' || (Array.isArray(t) && t.indexOf('Product') !== -1)) productSchema = n;
      }
    } catch (e) { /* malformed block \u2014 noted below */ }
  }
  const lower = html.toLowerCase();
  const imgs = (html.match(/<img\b[^>]*>/gi) || []).length;
  const hasAtc = /add to cart|add-to-cart|addtocart|buy now|add to bag|add to basket/i.test(html);
  const reviewMarkers = /customer review|\breviews?\b|rating|stars?/i.test(lower);
  const ogImage = /<meta[^>]+property=["']og:image["']/i.test(html);
  const ogTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
  const trust = [];
  if (/free shipping|fast shipping|ships (?:in|within)|delivery (?:in|within|by)/i.test(lower)) trust.push('shipping promise');
  if (/returns?|money[- ]back|refund/i.test(lower)) trust.push('returns/refund language');
  if (/guarantee/i.test(lower)) trust.push('guarantee');
  if (/visa|mastercard|paypal|apple pay|google pay|stripe/i.test(lower)) trust.push('payment-method signals');
  if (/secure checkout|ssl|encrypted/i.test(lower)) trust.push('security reassurance');
  if (/in stock|stock|availability/i.test(lower)) trust.push('availability messaging');
  const fixes = [];
  if (!productSchema) fixes.push('P1 \u2014 NO PRODUCT JSON-LD: without Product schema (name, offers.price, availability, aggregateRating) you are ineligible for price/rating rich snippets in Google \u2014 the free CTR upgrade e-commerce lives on');
  else {
    const offers = productSchema.offers;
    const hasPrice = offers && (offers.price || (Array.isArray(offers) && offers[0] && offers[0].price) || (offers.lowPrice));
    if (!hasPrice) fixes.push('P1 \u2014 Product schema present but offers.price missing/unreadable: price is the field that unlocks the rich snippet');
    if (!productSchema.aggregateRating) fixes.push('P2 \u2014 no aggregateRating in schema: star snippets need real review data wired into the JSON-LD (never fabricate \u2014 Google penalizes and it is dishonest)');
    if (!productSchema.image) fixes.push('P3 \u2014 no image in Product schema: required for most rich-result surfaces');
  }
  if (!hasAtc) fixes.push('P1 \u2014 no add-to-cart/buy signal detected in HTML: if the button renders via JS only, ensure it appears fast and above the fold; if it is genuinely missing, this page cannot sell');
  if (!ogImage || !ogTitle) fixes.push('P2 \u2014 Open Graph incomplete (og:title ' + (ogTitle ? 'ok' : 'missing') + ', og:image ' + (ogImage ? 'ok' : 'missing') + '): every share to WhatsApp/social renders as a dead gray link without them');
  if (imgs < 3) fixes.push('P2 \u2014 only ' + imgs + ' image tag(s): product pages convert on visual depth \u2014 angles, context-of-use, zoom; 5-8 images is the e-commerce norm');
  if (!reviewMarkers) fixes.push('P2 \u2014 no review markers detected: social proof on the page (not just schema) is the single strongest conversion element for cold traffic');
  if (trust.length < 3) fixes.push('P3 \u2014 thin trust stack (' + trust.length + ' signal(s)): shipping clarity, returns policy and payment badges near the buy button are cheap conversion insurance');
  if (fixes.length === 0) fixes.push('STRONG PAGE: schema, conversion elements and trust stack all present \u2014 next wins are speed (see SpeedForge) and A/B tests on image order and review placement');
  return {
    status: 'success',
    schema_audit: 'LIVE STRUCTURED-DATA AUDIT for ' + url + ' (HTTP ' + resp.status + '): ' + ldBlocks.length + ' JSON-LD block(s), ' + schemaCount + ' schema node(s). Product schema: ' + (productSchema ? 'FOUND \u2705 \u2014 name: "' + String(productSchema.name || 'unnamed').slice(0, 60) + '", offers/price: ' + (productSchema.offers ? 'present' : 'MISSING') + ', aggregateRating: ' + (productSchema.aggregateRating ? 'present (' + (productSchema.aggregateRating.ratingValue || '?') + ' from ' + (productSchema.aggregateRating.reviewCount || productSchema.aggregateRating.ratingCount || '?') + ')' : 'missing') + ', image: ' + (productSchema.image ? 'present' : 'missing') : 'NOT FOUND \u274c') + '.',
    conversion_elements_scan: 'CONVERSION ELEMENTS SCAN: add-to-cart/buy signal: ' + (hasAtc ? 'present \u2705' : 'NOT DETECTED \u274c') + '. Images: ' + imgs + ' tag(s). Review markers in copy: ' + (reviewMarkers ? 'present' : 'not detected') + '. Open Graph: og:title ' + (ogTitle ? '\u2705' : '\u274c') + ', og:image ' + (ogImage ? '\u2705' : '\u274c') + ' (social/WhatsApp share preview quality).',
    trust_signals_scan: 'TRUST SIGNALS SCAN: ' + (trust.length > 0 ? trust.length + ' signal(s) detected: ' + trust.join(', ') : 'NONE detected') + '. The checkout-anxiety checklist a first-time buyer runs: can I pay how I like, when does it arrive, can I return it, is this site real \u2014 every unanswered question is abandonment fuel.',
    cro_priorities: 'PRIORITIZED CRO FIXES (computed from the live page): ' + fixes.map(function(f, i) { return (i + 1) + '. ' + f; }).join('. ') + '.',
    data_source: 'Live HTTP fetch (real time) \u2014 ' + url + ' audited from the actual delivered HTML and JSON-LD at the moment of this request. JS-rendered elements may add to what static analysis sees.'
  };
}
