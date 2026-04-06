
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const products = require("./data/products");

const app = express();
const PORT = process.env.PORT || 3000;

const frontendDir = path.resolve(__dirname, "..", "..", "frontend");
const fallbackPublicDir = path.join(__dirname, "public");
const staticDir = fs.existsSync(frontendDir) ? frontendDir : fallbackPublicDir;

const AI_API_URL = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";

const LIVE_PRICING_URL = process.env.LIVE_PRICING_URL || "https://serpapi.com/search.json";
const LIVE_PRICING_API_KEY = process.env.LIVE_PRICING_API_KEY || process.env.SERPAPI_API_KEY || "";
const LIVE_PRICING_ENGINE = process.env.LIVE_PRICING_ENGINE || "google_shopping";

app.use(cors());
app.use(express.json());
app.use(express.static(staticDir));

const categoryKeywords = {
  electronics_mobile: ["phone", "mobile", "iphone", "samsung", "oneplus", "charger", "earbuds"],
  electronics_computers: ["laptop", "computer", "monitor", "ssd", "keyboard", "mouse", "router", "tablet"],
  electronics_home: ["tv", "camera", "console", "speaker", "projector", "printer"],
  appliances: ["ac", "fridge", "refrigerator", "washing", "microwave", "mixer", "fan", "geyser", "heater", "cooler"],
  vegetables: ["potato", "onion", "tomato", "carrot", "cabbage", "capsicum", "okra", "spinach"],
  fruits: ["apple", "banana", "mango", "orange", "grapes", "guava", "papaya", "pomegranate"],
  groceries: ["rice", "dal", "oil", "sugar", "tea", "coffee", "flour", "salt", "masala", "spice"],
  dairy: ["milk", "paneer", "curd", "cheese", "yogurt", "butter", "lassi"],
  bakery: ["bread", "bun", "cake", "cookie", "biscuit", "croissant"],
  beverages: ["juice", "cola", "coffee", "drink", "shake", "water"],
  snacks: ["chips", "namkeen", "khakhra", "nachos", "wafer", "popcorn"],
  personal_care: ["soap", "shampoo", "toothpaste", "face wash", "lotion", "perfume", "lipstick"],
  fashion_men: ["shirt", "jeans", "trouser", "kurta", "hoodie", "jogger"],
  fashion_women: ["saree", "kurti", "dress", "lehenga", "dupatta", "leggings"],
  footwear: ["shoe", "sneaker", "sandal", "slipper", "boot"],
  furniture: ["chair", "table", "bed", "sofa", "wardrobe", "bookshelf"],
  stationery: ["notebook", "paper", "pen", "pencil", "calculator", "stapler"],
  sports: ["bat", "football", "basketball", "racket", "yoga", "dumbbell", "protein"],
  hardware: ["hammer", "drill", "screw", "lock", "bulb", "extension"],
  automotive: ["helmet", "engine oil", "car cover", "bike cover", "inflator"],
  pet_supplies: ["dog", "cat", "pet", "litter", "leash"],
};

const locationProfiles = {
  india: { label: "India (National Average)", multiplier: 1 },
  delhi: { label: "Delhi", multiplier: 1.06 },
  mumbai: { label: "Mumbai", multiplier: 1.1 },
  bengaluru: { label: "Bengaluru", multiplier: 1.08 },
  bangalore: { label: "Bengaluru", multiplier: 1.08 },
  chennai: { label: "Chennai", multiplier: 1.04 },
  hyderabad: { label: "Hyderabad", multiplier: 1.03 },
  kolkata: { label: "Kolkata", multiplier: 0.98 },
  pune: { label: "Pune", multiplier: 1.04 },
  ahmedabad: { label: "Ahmedabad", multiplier: 0.97 },
  jaipur: { label: "Jaipur", multiplier: 0.95 },
  lucknow: { label: "Lucknow", multiplier: 0.94 },
  chandigarh: { label: "Chandigarh", multiplier: 1.02 },
  kochi: { label: "Kochi", multiplier: 1.01 },
  indore: { label: "Indore", multiplier: 0.95 },
  surat: { label: "Surat", multiplier: 0.96 },
};

function titleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function resolveLocation(location) {
  const normalized = String(location || "").trim().toLowerCase();
  if (!normalized) {
    return { key: "india", ...locationProfiles.india, source: "default" };
  }

  if (locationProfiles[normalized]) {
    return { key: normalized, ...locationProfiles[normalized], source: "exact" };
  }

  const partialMatch = Object.entries(locationProfiles).find(([key]) => key.includes(normalized) || normalized.includes(key));
  if (partialMatch) {
    return { key: partialMatch[0], ...partialMatch[1], source: "close" };
  }

  return {
    key: normalized,
    label: location.trim(),
    multiplier: 1,
    source: "custom",
  };
}

function findProduct(query) {
  const q = String(query || "").toLowerCase().trim();
  if (!q) return null;

  if (products[q]) {
    return { key: q, data: products[q], matchType: "exact" };
  }

  for (const key of Object.keys(products)) {
    if (key.startsWith(q) || q.startsWith(key)) {
      return { key, data: products[key], matchType: "close" };
    }
  }

  const queryWords = q.split(" ").filter((word) => word.length > 2);
  let bestScore = 0;
  let bestMatch = null;

  for (const key of Object.keys(products)) {
    const keyWords = key.split(" ");
    const matches = queryWords.filter((word) => keyWords.some((item) => item.includes(word) || word.includes(item))).length;
    const score = matches / Math.max(queryWords.length, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = key;
    }
  }

  if (bestScore >= 0.5 && bestMatch) {
    return { key: bestMatch, data: products[bestMatch], matchType: "fuzzy" };
  }

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => q.includes(keyword))) {
      const entries = Object.entries(products).filter(([, value]) => value.category === category);
      if (entries.length) {
        const [key, data] = entries[Math.floor(Math.random() * entries.length)];
        return { key, data, matchType: "category_fallback" };
      }
    }
  }

  return null;
}
function generatePriceHistory(basePrice, months = 12) {
  const history = [];
  const now = new Date();
  let price = basePrice * (0.85 + Math.random() * 0.1);

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const label = date.toLocaleString("en-IN", { month: "short", year: "2-digit" });
    const isSaleSeason = [9, 10, 0].includes(date.getMonth());
    const change = isSaleSeason ? -Math.random() * 0.08 : (Math.random() - 0.45) * 0.08;
    price = Math.max(price * (1 + change), basePrice * 0.6);
    history.push({ label, price: Math.round(price) });
  }

  history[history.length - 1].price = Math.round(basePrice);
  return history;
}

function buildNegotiation(marketPrice, userPrice) {
  const diff = userPrice - marketPrice;
  const diffPct = ((diff / marketPrice) * 100).toFixed(1);
  const minPrice = Math.round(marketPrice * 0.88);
  const maxPrice = Math.round(marketPrice * 1.1);
  const sweetSpot = Math.round(marketPrice * 0.95);

  let strategy = {};
  let script = "";

  if (userPrice > marketPrice * 1.1) {
    strategy = {
      verdict: "Overpriced",
      verdictClass: "overpriced",
      action: `You are paying ${Math.abs(diffPct)}% above market rate`,
      tip: `Try to bring it down to Rs ${sweetSpot.toLocaleString("en-IN")} - Rs ${marketPrice.toLocaleString("en-IN")}`,
      steps: [
        `Counter-offer at Rs ${minPrice.toLocaleString("en-IN")}`,
        `Target around Rs ${sweetSpot.toLocaleString("en-IN")}`,
        "Mention competing sellers and local alternatives",
      ],
    };
    script = `I checked current market listings and similar options are around Rs ${marketPrice.toLocaleString("en-IN")}. Can you match that or come closer to Rs ${sweetSpot.toLocaleString("en-IN")}?`;
  } else if (userPrice < marketPrice * 0.88) {
    strategy = {
      verdict: "Great Deal",
      verdictClass: "great-deal",
      action: `You are ${Math.abs(diffPct)}% below the estimated market rate`,
      tip: "This looks strong. Try adding delivery or accessories instead of pushing price much lower.",
      steps: [
        `This is already below the typical floor of Rs ${minPrice.toLocaleString("en-IN")}`,
        "Ask for warranty, delivery, or add-ons",
        "Close the deal quickly if the seller is genuine",
      ],
    };
    script = "The price looks good. If you can include delivery or one extra benefit, I can confirm the purchase right away.";
  } else {
    const adjustPct = Math.max(1, Math.round(((marketPrice - userPrice) / userPrice) * 100));
    strategy = {
      verdict: "Fair Price",
      verdictClass: "fair",
      action: userPrice >= marketPrice ? "You are close to the going market rate" : `Try negotiating down by about ${adjustPct}%`,
      tip: `A practical target is Rs ${sweetSpot.toLocaleString("en-IN")}`,
      steps: [
        `Open near Rs ${minPrice.toLocaleString("en-IN")}`,
        `Aim to settle near Rs ${sweetSpot.toLocaleString("en-IN")}`,
        "Use same-day closing or bundle purchase as leverage",
      ],
    };
    script = `I have checked comparable listings and a fair deal looks closer to Rs ${sweetSpot.toLocaleString("en-IN")}. If you can do that, I can finalize today.`;
  }

  return { strategy, script, minPrice, maxPrice, sweetSpot };
}

function buildDeterministicSummary(analysis) {
  return {
    summary: `${analysis.matchedProduct} is estimated around Rs ${analysis.marketPrice.toLocaleString("en-IN")} in ${analysis.location}.`,
    bargainingTips: analysis.strategy.steps,
    sellerMessage: analysis.script,
    confidence: analysis.matchType === "live_api" ? "high" : analysis.matchType === "exact" ? "high" : "medium",
    source: analysis.dataSource,
  };
}

function normalizeLiveOffers(payload) {
  const direct = Array.isArray(payload?.shopping_results) ? payload.shopping_results : [];
  const categorized = Array.isArray(payload?.categorized_shopping_results)
    ? payload.categorized_shopping_results.flatMap((entry) => entry.shopping_results || [])
    : [];

  const seen = new Set();
  return [...direct, ...categorized]
    .map((item) => ({
      title: item.title || "",
      source: item.source || "Unknown",
      extracted_price: Number(item.extracted_price),
      price: item.price || "",
      delivery: item.delivery || "",
      rating: item.rating || null,
      link: item.product_link || item.link || "",
      product_id: item.product_id || `${item.title}-${item.source}-${item.price}`,
    }))
    .filter((item) => Number.isFinite(item.extracted_price) && item.extracted_price > 0)
    .filter((item) => {
      if (seen.has(item.product_id)) return false;
      seen.add(item.product_id);
      return true;
    })
    .slice(0, 8);
}

async function fetchLiveMarketData(product, locationInfo) {
  if (!LIVE_PRICING_API_KEY) {
    return null;
  }

  const url = new URL(LIVE_PRICING_URL);
  url.searchParams.set("engine", LIVE_PRICING_ENGINE);
  url.searchParams.set("q", product);
  url.searchParams.set("location", locationInfo.label);
  url.searchParams.set("gl", "in");
  url.searchParams.set("hl", "en");
  url.searchParams.set("google_domain", "google.com");
  url.searchParams.set("api_key", LIVE_PRICING_API_KEY);
  url.searchParams.set("no_cache", "true");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Live pricing API failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const offers = normalizeLiveOffers(payload);

  if (!offers.length) {
    return null;
  }

  const topOffers = offers.slice(0, 5);
  const prices = topOffers.map((offer) => offer.extracted_price);
  const marketPrice = Math.round(prices.reduce((sum, value) => sum + value, 0) / prices.length);
  const minMarket = Math.round(Math.min(...prices));
  const maxMarket = Math.round(Math.max(...prices));

  return {
    matchedProduct: offers[0].title || titleCase(product),
    marketPrice,
    minMarket,
    maxMarket,
    matchType: "live_api",
    liveOffers: topOffers,
    dataSource: "live_api",
    provider: "serpapi_google_shopping",
  };
}
function buildFallbackAnalysis(product, parsedPrice, locationInfo) {
  const match = findProduct(product);

  let marketPrice;
  let matchedProduct;
  let category;
  let matchType;

  if (match) {
    marketPrice = match.data.price;
    matchedProduct = titleCase(match.key);
    category = match.data.category;
    matchType = match.matchType;
  } else {
    const allPrices = Object.values(products).map((item) => item.price);
    marketPrice = Math.round(allPrices.reduce((sum, value) => sum + value, 0) / allPrices.length);
    matchedProduct = titleCase(product);
    category = "misc";
    matchType = "generic_fallback";
  }

  marketPrice = Math.round(marketPrice * locationInfo.multiplier);
  const minMarket = Math.round(marketPrice * 0.88);
  const maxMarket = Math.round(marketPrice * 1.12);
  const priceHistory = generatePriceHistory(marketPrice);
  const { strategy, script, sweetSpot } = buildNegotiation(marketPrice, parsedPrice);

  return {
    success: true,
    query: product,
    matchedProduct,
    matchType,
    category,
    marketPrice,
    minMarket,
    maxMarket,
    sweetSpot,
    userPrice: parsedPrice,
    location: locationInfo.label,
    locationKey: locationInfo.key,
    locationMultiplier: locationInfo.multiplier,
    locationSource: locationInfo.source,
    priceHistory,
    strategy,
    script,
    liveOffers: [],
    dataSource: "catalog_fallback",
    provider: "local_catalog",
  };
}

async function buildAnalysisPayload(product, parsedPrice, location) {
  const locationInfo = resolveLocation(location);
  const fallback = buildFallbackAnalysis(product, parsedPrice, locationInfo);

  try {
    const liveData = await fetchLiveMarketData(product, locationInfo);
    if (!liveData) {
      return fallback;
    }

    const category = findProduct(product)?.data?.category || fallback.category;
    const priceHistory = generatePriceHistory(liveData.marketPrice);
    const { strategy, script, sweetSpot } = buildNegotiation(liveData.marketPrice, parsedPrice);

    return {
      success: true,
      query: product,
      matchedProduct: liveData.matchedProduct,
      matchType: liveData.matchType,
      category,
      marketPrice: liveData.marketPrice,
      minMarket: liveData.minMarket,
      maxMarket: liveData.maxMarket,
      sweetSpot,
      userPrice: parsedPrice,
      location: locationInfo.label,
      locationKey: locationInfo.key,
      locationMultiplier: locationInfo.multiplier,
      locationSource: locationInfo.source,
      priceHistory,
      strategy,
      script,
      liveOffers: liveData.liveOffers,
      dataSource: liveData.dataSource,
      provider: liveData.provider,
    };
  } catch (error) {
    return {
      ...fallback,
      livePricingError: error.message,
    };
  }
}

async function getAiNegotiationAdvice(analysis) {
  if (!AI_API_KEY) {
    return buildDeterministicSummary(analysis);
  }

  const prompt = `
Return valid JSON only with keys:
summary
bargainingTips
sellerMessage
confidence
source

Product: ${analysis.matchedProduct}
Category: ${analysis.category}
Location: ${analysis.location}
User price: ${analysis.userPrice}
Estimated market price: ${analysis.marketPrice}
Market range: ${analysis.minMarket} to ${analysis.maxMarket}
Data source: ${analysis.dataSource}
Verdict: ${analysis.strategy.verdict}
Reason: ${analysis.strategy.action}
  `.trim();

  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a negotiation assistant for Indian market purchases. Return JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI API request failed: ${response.status} ${text}`);
  }

  const payload = await response.json();
  const rawContent = payload?.choices?.[0]?.message?.content;
  if (!rawContent) {
    throw new Error("AI API response did not include content.");
  }

  const parsed = JSON.parse(rawContent);
  return {
    summary: parsed.summary || buildDeterministicSummary(analysis).summary,
    bargainingTips: Array.isArray(parsed.bargainingTips) && parsed.bargainingTips.length
      ? parsed.bargainingTips.slice(0, 3)
      : analysis.strategy.steps,
    sellerMessage: parsed.sellerMessage || analysis.script,
    confidence: parsed.confidence || "medium",
    source: parsed.source || "ai_api",
  };
}
app.post("/api/analyze", async (req, res) => {
  const { product, userPrice, location } = req.body;

  if (!product || !userPrice) {
    return res.status(400).json({ error: "Product name and price are required." });
  }

  const parsedPrice = parseFloat(userPrice);
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Please enter a valid price." });
  }

  try {
    const analysis = await buildAnalysisPayload(product, parsedPrice, location);
    return res.json(analysis);
  } catch (error) {
    return res.status(500).json({ error: "Analysis failed.", details: error.message });
  }
});

app.post("/api/analyze-ai", async (req, res) => {
  const { product, userPrice, location } = req.body;

  if (!product || !userPrice) {
    return res.status(400).json({ error: "Product name and price are required." });
  }

  const parsedPrice = parseFloat(userPrice);
  if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "Please enter a valid price." });
  }

  try {
    const analysis = await buildAnalysisPayload(product, parsedPrice, location);
    const aiAdvice = await getAiNegotiationAdvice(analysis);
    return res.json({
      ...analysis,
      aiAdvice,
      aiEnabled: Boolean(AI_API_KEY),
      aiModel: AI_API_KEY ? AI_MODEL : null,
    });
  } catch (error) {
    return res.status(502).json({ error: "AI analysis failed.", details: error.message });
  }
});

app.get("/api/config", (req, res) => {
  res.json({
    aiEnabled: Boolean(AI_API_KEY),
    aiModel: AI_API_KEY ? AI_MODEL : null,
    livePricingEnabled: Boolean(LIVE_PRICING_API_KEY),
    livePricingProvider: LIVE_PRICING_API_KEY ? "serpapi_google_shopping" : null,
    livePricingEngine: LIVE_PRICING_ENGINE,
  });
});

app.get("/api/products", (req, res) => {
  const q = String(req.query.q || "").toLowerCase();
  const results = Object.keys(products)
    .filter((key) => key.includes(q))
    .slice(0, 8)
    .map((key) => ({
      name: titleCase(key),
      key,
      category: products[key].category,
      price: products[key].price,
    }));

  res.json(results);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(staticDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Bazaar Bot is live at http://localhost:${PORT}`);
  console.log(`Products in database: ${Object.keys(products).length}`);
  console.log(`Live pricing: ${LIVE_PRICING_API_KEY ? "enabled" : "disabled"}`);
});
