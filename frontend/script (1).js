// ============================================================
// BAZAAR BOT — script.js
// Frontend logic: API calls, chart rendering, UI updates
// ============================================================

// ─── State ──────────────────────────────────────────────────
let priceChartInstance = null;
let autocompleteTimer = null;
let abortController = null;
let currentScript = "";

// ─── Loading Messages ────────────────────────────────────────
const loadingMessages = [
  "Analyzing market trends...",
  "Scanning bazaar prices...",
  "Calculating negotiation strategy...",
  "Consulting 350+ product database...",
  "Generating smart insights...",
];

// ─── DOM References ──────────────────────────────────────────
const productInput     = document.getElementById("product-input");
const priceInput       = document.getElementById("price-input");
const locationInput    = document.getElementById("location-input");
const analyzeBtn       = document.getElementById("analyze-btn");
const loadingCard      = document.getElementById("loading-card");
const loadingMsg       = document.getElementById("loading-msg");
const resultsSection   = document.getElementById("results-section");
const errorCard        = document.getElementById("error-card");
const errorMsg         = document.getElementById("error-msg");
const autocompleteList = document.getElementById("autocomplete-list");

// ─── Utility: Format Indian Rupee ────────────────────────────
function formatINR(amount) {
  return "₹" + Number(Math.round(amount)).toLocaleString("en-IN");
}

// ─── Utility: Show/hide sections ─────────────────────────────
function showLoading() {
  loadingCard.style.display = "flex";
  resultsSection.style.display = "none";
  errorCard.style.display = "none";
  analyzeBtn.classList.add("loading");

  // Cycle through loading messages
  let msgIdx = 0;
  loadingMsg.textContent = loadingMessages[0];
  window._loadingInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % loadingMessages.length;
    loadingMsg.textContent = loadingMessages[msgIdx];
  }, 900);
}

function hideLoading() {
  loadingCard.style.display = "none";
  analyzeBtn.classList.remove("loading");
  clearInterval(window._loadingInterval);
}

function showError(msg) {
  errorCard.style.display = "flex";
  errorMsg.textContent = msg;
  resultsSection.style.display = "none";
}

// ─── Main: Analyze Product ────────────────────────────────────
async function analyzeProduct() {
  const product = productInput.value.trim();
  const userPrice = parseFloat(priceInput.value);
  const location = locationInput.value.trim();

  // ── Input validation ──
  if (!product) {
    productInput.focus();
    productInput.style.borderColor = "var(--red)";
    setTimeout(() => (productInput.style.borderColor = ""), 1500);
    return;
  }
  if (!userPrice || userPrice <= 0) {
    priceInput.focus();
    priceInput.style.borderColor = "var(--red)";
    setTimeout(() => (priceInput.style.borderColor = ""), 1500);
    return;
  }

  closeAutocomplete();
  showLoading();

  try {
    // ── Call backend API ──
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, userPrice, location }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = "Analysis failed. Try again.";
      try {
        const errObj = JSON.parse(errText);
        errMsg = errObj.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Analysis failed. Try again.");
    }

    hideLoading();
    renderResults(data);

  } catch (err) {
    hideLoading();
    showError(err.message || "Network error. Is the server running?");
  }
}

// ─── Render Results ───────────────────────────────────────────
function renderResults(data) {
  const {
    matchedProduct, matchType, category,
    marketPrice, minMarket, maxMarket, sweetSpot,
    userPrice, location, dataSource, liveOffers, priceHistory, strategy, script,
  } = data;

  // ── Match bar ──
  const matchLabels = {
    exact:            "✅ Exact match",
    close:            "🔍 Close match",
    fuzzy:            "🧩 Approximate match",
    category_fallback:"📂 Category estimate",
    generic_fallback: "💡 Generic estimate (product not in database)",
  };
  const matchBar = document.getElementById("match-bar");
  matchBar.innerHTML = `${matchLabels[matchType] || "🔎 Matched"}: <strong>${matchedProduct}</strong> &nbsp;·&nbsp; Category: <strong style="text-transform:capitalize">${category}</strong>`;

  // ── Price values ──
  document.getElementById("market-price-val").textContent = formatINR(marketPrice);
  document.getElementById("location-label").textContent = `Location: ${location || "India (National Average)"}`;
  document.getElementById("data-source-label").textContent = `Source: ${dataSource === "live_api" ? "Live API" : "Stored fallback data"}`;
  document.getElementById("market-range").textContent = `Range: ${formatINR(minMarket)} – ${formatINR(maxMarket)}`;
  document.getElementById("user-price-val").textContent = formatINR(userPrice);
  document.getElementById("sweet-spot-val").textContent = formatINR(sweetSpot);

  // ── Verdict card ──
  const verdictCard   = document.getElementById("verdict-card");
  const verdictIcon   = document.getElementById("verdict-icon");
  const verdictTitle  = document.getElementById("verdict-title");
  const verdictAction = document.getElementById("verdict-action");
  const verdictTip    = document.getElementById("verdict-tip");

  verdictCard.className = `verdict-card ${strategy.verdictClass}`;
  verdictIcon.textContent = strategy.verdict.split(" ")[0]; // emoji
  verdictTitle.textContent = strategy.verdict;
  verdictAction.textContent = strategy.action;
  verdictTip.textContent = strategy.tip;

  // ── Negotiation steps ──
  const stepsList = document.getElementById("steps-list");
  stepsList.innerHTML = "";
  strategy.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });

  // ── Negotiation script ──
  currentScript = script;
  document.getElementById("script-text").textContent = script;
  const liveOffersCard = document.getElementById("live-offers-card");
  const liveOffersList = document.getElementById("live-offers-list");
  liveOffersList.innerHTML = "";
  if (Array.isArray(liveOffers) && liveOffers.length) {
    liveOffers.forEach((offer) => {
      const li = document.createElement("li");
      const title = offer.title || "Comparable listing";
      const source = offer.source ? ` - ${offer.source}` : "";
      const delivery = offer.delivery ? ` - ${offer.delivery}` : "";
      li.textContent = `${title} - ${formatINR(offer.extracted_price)}${source}${delivery}`;
      liveOffersList.appendChild(li);
    });
    liveOffersCard.style.display = "block";
  } else {
    liveOffersCard.style.display = "none";
  }

  // ── Price chart ──
  renderChart(priceHistory, userPrice);

  // ── Show results ──
  resultsSection.style.display = "block";
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Chart: Price History ──────────────────────────────────────
function renderChart(history, userPrice) {
  const ctx = document.getElementById("priceChart").getContext("2d");

  // Destroy previous chart if exists
  if (priceChartInstance) {
    priceChartInstance.destroy();
  }

  const labels = history.map((h) => h.label);
  const prices = history.map((h) => h.price);
  const userLine = history.map(() => userPrice); // flat line for user price

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 260);
  gradient.addColorStop(0, "rgba(74,222,128,0.3)");
  gradient.addColorStop(1, "rgba(74,222,128,0)");

  priceChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Market Price",
          data: prices,
          borderColor: "#4ade80",
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.45,       // smooth curve
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#4ade80",
          pointBorderColor: "#0a1f0f",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
        {
          label: "Your Price",
          data: userLine,
          borderColor: "#fbbf24",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [6, 4],  // dashed line
          tension: 0,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#112b18",
          borderColor: "rgba(74,222,128,0.3)",
          borderWidth: 1,
          titleColor: "#86efac",
          bodyColor: "#f0fdf4",
          padding: 12,
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label;
              const val = formatINR(ctx.parsed.y);
              return ` ${label}: ${val}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(74,222,128,0.06)" },
          ticks: { color: "#4b8660", font: { size: 11 } },
          border: { color: "rgba(74,222,128,0.1)" },
        },
        y: {
          grid: { color: "rgba(74,222,128,0.06)" },
          ticks: {
            color: "#4b8660",
            font: { size: 11 },
            callback: (v) => formatINR(v),
          },
          border: { color: "rgba(74,222,128,0.1)" },
        },
      },
    },
  });
}

// ─── Copy Script to Clipboard ─────────────────────────────────
function copyScript() {
  if (!currentScript) return;
  navigator.clipboard.writeText(currentScript).then(() => {
    const btn = document.querySelector(".copy-btn");
    const original = btn.textContent;
    btn.textContent = "✅ Copied!";
    btn.style.color = "var(--accent)";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.color = "";
    }, 2000);
  });
}

// ─── Autocomplete ─────────────────────────────────────────────
function closeAutocomplete() {
  autocompleteList.classList.remove("open");
  autocompleteList.innerHTML = "";
}

productInput.addEventListener("input", () => {
  clearTimeout(autocompleteTimer);
  if (abortController) {
    abortController.abort();
  }
  
  const q = productInput.value.trim();
  if (q.length < 2) { closeAutocomplete(); return; }

  autocompleteTimer = setTimeout(async () => {
    try {
      abortController = new AbortController();
      const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`, {
        signal: abortController.signal
      });
      const items = await res.json();

      if (!items.length) { closeAutocomplete(); return; }

      autocompleteList.innerHTML = "";
      items.forEach((item) => {
        const div = document.createElement("div");
        div.className = "autocomplete-item";
        div.innerHTML = `
          <div>
            <span class="ac-name">${item.name}</span>
            <span class="ac-cat" style="margin-left:8px">${item.category}</span>
          </div>
          <span class="ac-price">${formatINR(item.price)}</span>
        `;
        div.addEventListener("click", () => {
          productInput.value = item.name;
          priceInput.value = item.price;
          closeAutocomplete();
          priceInput.focus();
        });
        autocompleteList.appendChild(div);
      });
      autocompleteList.classList.add("open");
    } catch (e) {
      closeAutocomplete();
    }
  }, 280);
});

// Close autocomplete on outside click
document.addEventListener("click", (e) => {
  if (!e.target.closest(".input-group")) closeAutocomplete();
});

// ─── Keyboard: Enter to analyze ──────────────────────────────
[productInput, priceInput, locationInput].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") analyzeProduct();
    if (e.key === "Escape") closeAutocomplete();
  });
});

// ─── Keyboard: Arrow navigation in autocomplete ──────────────
let acSelectedIdx = -1;
productInput.addEventListener("keydown", (e) => {
  const items = autocompleteList.querySelectorAll(".autocomplete-item");
  if (!items.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    acSelectedIdx = Math.min(acSelectedIdx + 1, items.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    acSelectedIdx = Math.max(acSelectedIdx - 1, 0);
  } else {
    acSelectedIdx = -1;
  }

  items.forEach((item, i) => {
    item.style.background = i === acSelectedIdx ? "rgba(74,222,128,0.1)" : "";
  });
});

