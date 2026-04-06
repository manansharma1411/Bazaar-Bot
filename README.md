# Bazaar Bot

Bazaar Bot is a simple market-aware negotiation assistant.

You enter:
- a product name
- the quoted or paid price
- a location

The app then gives you:
- an estimated market price
- a suggested negotiation target
- a negotiation script
- a price trend chart
- live shopping offers when live pricing is enabled

## What This Project Contains

`frontend/`

- Static website UI
- Product, price, and location inputs
- Result cards, chart, and live offer display

`backend/files/`

- Express backend
- Product catalog and fallback pricing logic
- Live pricing integration
- AI-enhanced analysis endpoint

## How It Works

Bazaar Bot has two pricing modes:

1. Live pricing mode
   When a live pricing API key is configured, the backend tries to fetch current shopping prices for the requested product and location.

2. Fallback mode
   If live pricing is not configured, or live results are unavailable, the backend uses the local product dataset and internal market estimation logic.

The frontend shows which mode was used in the output:

- `Source: Live API`
- `Source: Stored fallback data`

## Features

- Product search with autocomplete
- Location-aware pricing
- Negotiation verdicts like fair price, overpriced, or great deal
- Suggested bargaining steps
- Ready-to-use seller negotiation script
- Price history visualization
- Optional AI advice endpoint
- Optional live shopping price integration

## Project Structure

```text
Next Gen/
  frontend/
    index.html
    style.css
    script (1).js
    logo.png

  backend/
    files/
      server.js
      package.json
      .env.example
      data/
        products.js
```

## Requirements

- Node.js
- npm
- PowerShell or any terminal

If `npm` is blocked in PowerShell, you can use `npm.cmd` instead.

## Installation

Open a terminal and go to the backend folder:

```powershell
cd "D:\Python\Next Gen\backend\files"
```

Install dependencies:

```powershell
npm.cmd install
```

Start the server:

```powershell
npm.cmd start
```

Then open:

[http://localhost:3000](http://localhost:3000)

## Development Mode

For auto-reload during development:

```powershell
cd "D:\Python\Next Gen\backend\files"
npm.cmd run dev
```

## Environment Variables

Create a local `.env`-style setup using the values from [`backend/files/.env.example`](/D:/Python/Next%20Gen/backend/files/.env.example).

Available variables:

```env
AI_API_KEY=your_api_key_here
AI_MODEL=gpt-4o-mini
AI_API_URL=https://api.openai.com/v1/chat/completions
LIVE_PRICING_API_KEY=your_serpapi_key_here
LIVE_PRICING_ENGINE=google_shopping
LIVE_PRICING_URL=https://serpapi.com/search.json
```

## Running With Live Pricing

To enable live pricing in PowerShell:

```powershell
cd "D:\Python\Next Gen\backend\files"
$env:LIVE_PRICING_API_KEY="your_serpapi_key_here"
npm.cmd start
```

With live pricing enabled:

- Bazaar Bot tries to fetch current Google Shopping results
- The app shows live offer information when available
- The backend still falls back safely to stored catalog data if needed

## Running With AI Analysis

To enable AI advice:

```powershell
cd "D:\Python\Next Gen\backend\files"
$env:AI_API_KEY="your_api_key_here"
npm.cmd start
```

## Main API Endpoints

`POST /api/analyze`

- Returns pricing analysis
- Uses live pricing when configured
- Falls back to stored data when needed

`POST /api/analyze-ai`

- Returns the same pricing analysis
- Adds AI-generated negotiation advice when AI is configured

`GET /api/products`

- Returns autocomplete suggestions from the local product catalog

`GET /api/config`

- Shows whether AI and live pricing are enabled

## Example Flow

1. Enter a product like `iPhone 15` or `potato 1kg`
2. Enter the quoted price
3. Enter a city like `Delhi` or `Mumbai`
4. Click `Analyze`
5. Review the market estimate, location, source, and negotiation advice

## Notes

- Live pricing depends on the external API being available and returning usable results.
- Some hyperlocal products may still fall back to stored data.
- The frontend is served by the Express backend.
- The root `frontend/` folder is the active UI used by the backend.

## Troubleshooting

If `node` or `npm` is not recognized:

- Install Node.js
- Restart the terminal

If PowerShell blocks `npm`:

```powershell
npm.cmd install
npm.cmd start
```

If live pricing is not showing:

- Make sure `LIVE_PRICING_API_KEY` is set
- Check `GET /api/config`
- Look at the output source label in the UI

## License

MIT
