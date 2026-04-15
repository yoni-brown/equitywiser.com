# Equity Wiser — HELOC vs. Cash-Out Refi Calculator
### Complete Build, Launch & Growth Strategy

---

## 🚀 QUICK START (GitHub Pages in 5 minutes)

1. Create a new GitHub repository (e.g., `heloc-calculator` or `equitywiser`)
2. Upload all files, preserving the folder structure:
   ```
   index.html
   css/styles.css
   js/rates.js
   js/calculator.js
   ```
3. Go to **Settings → Pages → Source → Deploy from branch → main → / (root) → Save**
4. Site is live at `https://yourusername.github.io/heloc-calculator/`
5. For a custom domain: add a `CNAME` file containing just your domain (e.g., `equitywiser.com`)

That's it. No build step. No Node.js. No dependencies to install.

---

## 📁 File Structure

```
heloc-calculator/
├── index.html              # Main page (SEO, calculator UI, content, FAQ)
├── css/
│   └── styles.css          # All styling — editorial finance aesthetic
├── js/
│   ├── rates.js            # Market rate defaults & constants (update monthly)
│   └── calculator.js       # Financial engine + Chart.js rendering + UI wiring
├── CNAME                   # (optional) your custom domain
└── README.md               # This file
```

---

## 📋 MULTI-STEP BUILD & LAUNCH STRATEGY

### ─── PHASE 0: Foundation (Before Going Live)
*Estimated time: 1–2 days*

**Step 1 — Customize the site identity**
- [ ] Find/replace `Equity Wiser` with your brand name throughout
- [ ] Replace `equitywiser.com` in `index.html` meta tags and schema
- [ ] Update the footer © year and brand name
- [ ] Add a real `og-image.png` (1200×630px) for social sharing

**Step 2 — Set up your custom domain**
- Purchase your domain (recommended: `helocvsrefi.com`, `equitywiser.com`, or similar)
- In your GitHub repo, create a `CNAME` file with just your domain
- In your DNS settings, add a CNAME record pointing to `yourusername.github.io`
- GitHub Pages handles the HTTPS certificate automatically

**Step 3 — Set up Google Analytics 4**
- Create a GA4 property at analytics.google.com
- Uncomment and update the GA4 snippet in `index.html` with your measurement ID (`G-XXXXXXXXXX`)
- Set up a conversion event for `calculate` (already tracked in `calculator.js`)

**Step 4 — Set up Google Search Console**
- Add your site at search.google.com/search-console
- Verify via the HTML tag method (add meta tag to `<head>`)
- Submit your sitemap (create `sitemap.xml` — see below)

---

### ─── PHASE 1: Affiliate Setup (Days 2–7)
*Apply to all programs before launch so you're earning from day one*

**Priority order:**

| Program | Where to Apply | Estimated Payout | Network |
|---|---|---|---|
| **LendingTree** | lendingtree.com/about/partner-with-us/ | $70–85/lead | Direct or CJ |
| **Figure** | figure.com/partner-heloc/affiliates-and-apis/ | $75–150/funded HELOC | Direct |
| **SoFi** | impact.com (search SoFi) | $100–150/lead | Impact |
| **Bankrate** | affiliate-center.bankrate.com | 40% rev share | Direct |

**After approval:**
- Replace the placeholder affiliate URLs in `index.html`'s CTA section with your tracked affiliate links
- Each CTA card has `onclick="trackEvent('cta_click', {partner:'...'})` — this fires GA4 events automatically
- Add UTM parameters to all affiliate links: `?utm_source=equitywiser&utm_medium=calculator&utm_campaign=heloc-cta`

---

### ─── PHASE 2: SEO Technical Foundation (Week 1)

**Create `sitemap.xml`:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://equitywiser.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Create `robots.txt`:**
```
User-agent: *
Allow: /
Sitemap: https://equitywiser.com/sitemap.xml
```

**Create `.nojekyll`** (empty file — prevents GitHub Pages from trying to process your files with Jekyll):
```
(empty file — just touch .nojekyll)
```

**Schema verification:**
- Test your JSON-LD schema at search.google.com/test/rich-results
- Verify both WebApplication and FAQPage schemas pass
- Fix any errors before submitting sitemap

**Core Web Vitals targets:**
- LCP (Largest Contentful Paint): < 2.5s
- INP (Interaction to Next Paint): < 200ms
- CLS (Cumulative Layout Shift): < 0.1
- Test at pagespeed.web.dev after launch

---

### ─── PHASE 3: Content Expansion (Weeks 2–8)
*Add supporting pages to capture high-volume keywords*

**Priority pages to add (create as separate HTML files):**

| Page | File | Target Keyword | Est. Monthly Searches |
|---|---|---|---|
| HELOC vs Refi Guide | `/heloc-vs-cash-out-refinance/` | "heloc vs cash out refinance" | 8,000–15,000 |
| HELOC Calculator | `/heloc-calculator/` | "heloc calculator" | 20,000–40,000 |
| Cash-Out Refi Calculator | `/cash-out-refinance-calculator/` | "cash out refinance calculator" | 15,000–30,000 |
| Current HELOC Rates | `/heloc-rates/` | "heloc rates 2026" | 5,000–10,000 |
| HELOC Pros & Cons | `/heloc-pros-cons/` | "heloc pros and cons" | 3,000–6,000 |

**Content format guidelines:**
- Minimum 2,000 words per supporting page
- Include a calculator widget (link back to main tool or embed)
- Add FAQPage schema on every page with FAQ section
- Update monthly with current rate data
- Add "Last updated: [date]" prominently on rate pages

**Rate data update workflow (monthly):**
1. Check Freddie Mac PMMS (freddiemac.com/pmms) every Thursday
2. Check Bankrate HELOC rates page for current average
3. Update `js/rates.js` with new values
4. Update the rate ticker in `index.html` top bar
5. Update the hero stats section
6. Commit and push — GitHub Pages deploys automatically in ~1 minute

---

### ─── PHASE 4: Authority Building (Months 2–6)

**Link building targets:**
- Personal finance bloggers (DINK finance, early retirement, house hacking)
- Real estate investor forums (BiggerPockets, Reddit r/realestateinvesting)
- Home improvement communities (Reddit r/HomeImprovement, r/DIY)
- Local real estate agent websites (resource pages)
- Mortgage broker blogs (guest post opportunities)

**Press & citation opportunities:**
- Bankrate.com — "tip" submissions for rate articles
- NerdWallet expert panels
- Local news financial columns
- Podcast appearances (personal finance podcasts often need calculator demos)

**Reddit strategy** (high ROI, free):
- Search r/personalfinance for "HELOC" and "cash out refinance" posts monthly
- Provide genuinely helpful answers referencing your calculator when relevant
- Do NOT spam — be a helpful community member first
- Target: r/personalfinance, r/RealEstate, r/FirstTimeHomeBuyer, r/HomeImprovement

---

### ─── PHASE 5: Conversion Optimization (Ongoing)

**Lead capture sequence:**
1. After results display, show "Email My Results" button (free email capture)
2. Use a free service like Mailchimp or ConvertKit
3. Automate a 3-email sequence: results recap → rate watch alert → "Ready to apply?" CTA
4. Email list = direct marketing channel independent of affiliate programs

**A/B test ideas (free with GA4):**
- CTA button text: "Compare Rates →" vs "Get My Free Quote →" vs "See Real Rates →"
- CTA card order (rotate which affiliate appears first)
- "Email my results" placement (below winner card vs. below charts)

**Analytics to monitor:**
- `calculate` event rate (% of visitors who click Calculate)
- `cta_click` rate by partner (which affiliate gets most clicks)
- Scroll depth (do users reach the educational content?)
- Time on page (>3 min = engaged user)
- Bounce rate from organic vs paid traffic

---

## 💰 REVENUE PROJECTIONS

| Metric | Conservative | Realistic | Optimistic |
|---|---|---|---|
| Monthly organic visitors (Month 6) | 2,000 | 8,000 | 20,000 |
| Calculator engagement rate | 35% | 50% | 65% |
| CTA click rate | 8% | 15% | 25% |
| Lead completion rate (at affiliate) | 5% | 10% | 15% |
| Revenue per lead | $70 | $85 | $100 |
| **Monthly revenue** | **$196** | **$5,100** | **$48,750** |

*Months 1–3 will see minimal traffic while Google indexes and trusts the site. Month 4+ is when organic growth accelerates if content and technical SEO are solid.*

---

## 🔧 TECHNICAL NOTES

**How the calculation works:**
The calculator isolates the "cost of borrowing" for each scenario:
- **HELOC**: HELOC closing costs + all interest paid on the credit line (draw period interest-only, then repayment period P+I)
- **Refi**: Closing costs + interest attributable to the cash-out slice (proportional to cash-out/total loan)
- This answers: "What does it actually cost to access $X?"

**To add live rate feeds (optional upgrade):**
```javascript
// In rates.js, replace static defaults with:
async function fetchLiveRates() {
  const FRED_KEY = 'your-fred-api-key'; // free at fred.stlouisfed.org
  const r = await fetch(
    `https://api.stlouisfed.org/fred/series/observations?series_id=MORTGAGE30US&api_key=${FRED_KEY}&sort_order=desc&limit=1&file_type=json`
  );
  const data = await r.json();
  const rate = parseFloat(data.observations[0].value);
  DEFAULTS.refiRate = (rate + 0.25).toFixed(2);
  MARKET_RATES.refi30yr.average = rate / 100;
}
```
Note: FRED doesn't have a HELOC rate series. For HELOC, derive from Prime + 0.5% margin.

**Chart.js CDN used:**
`https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js`
No API key required. Works offline after initial cache.

**Upgrading to a paid hosting plan:**
If traffic grows and GitHub Pages limitations (100GB/month bandwidth, no server-side logic) become issues, migrate to:
- **Cloudflare Pages** (free, faster global CDN, better analytics) — same Git-push workflow
- **Netlify** (free tier generous, form handling, A/B testing built in)
- **Vercel** (free tier, excellent performance, adds serverless functions for live rate fetching)

---

## 📊 COMPLIANCE CHECKLIST

Before going live, verify:
- [ ] Affiliate disclosure is visible above the CTA section (`Advertiser Disclosure` text)
- [ ] "Not financial advice" disclaimer is in the footer
- [ ] All affiliate links use `rel="noopener sponsored"` (already in the HTML)
- [ ] Calculator results display "estimates" language
- [ ] FTC disclosure appears before users see affiliate links
- [ ] Privacy policy page created (required for GA4 data collection)
- [ ] Terms of service page created

**State licensing note:** If you scale to collecting user contact information and selling leads to specific lenders, you may require a mortgage broker license in some states. Consult a mortgage regulatory attorney before implementing lead-capture forms. Pure calculator tools (compute → affiliate link) have been operated at scale by major sites without licensing requirements, but state regulations vary.

---

## 🗓️ CONTENT CALENDAR (First 90 Days)

| Week | Task |
|---|---|
| Week 1 | Launch, submit sitemap, apply to affiliate programs |
| Week 2 | Write HELOC vs. Refi guide page (3,000 words) |
| Week 3 | Write HELOC calculator page + embed tool |
| Week 4 | Write Cash-Out Refi calculator page |
| Week 5–6 | Start Reddit engagement, 10 helpful comments/week |
| Week 7–8 | Write "HELOC Rates 2026" page, update monthly |
| Week 9–10 | Outreach to 20 personal finance bloggers for links |
| Week 11–12 | Add email capture, set up Mailchimp sequence |
| Monthly | Update rates.js with current market rates |

---

## 📞 GETTING HELP

- **GitHub Pages docs**: docs.github.com/pages
- **FRED API** (free rate data): fred.stlouisfed.org/docs/api/fred/
- **Schema testing**: search.google.com/test/rich-results
- **Core Web Vitals**: pagespeed.web.dev
- **Affiliate questions**: Contact LendingTree partner team or use Impact.com dashboard

---

*Built with vanilla HTML, CSS, and JavaScript. Zero dependencies to install. Update rates.js monthly and push to GitHub — your site updates in under 60 seconds.*
