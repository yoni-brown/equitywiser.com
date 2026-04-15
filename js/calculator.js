/**
 * calculator.js — HELOC vs Cash-Out Refi comparison engine
 * Handles all financial math, UI wiring, and Chart.js rendering.
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — FINANCIAL MATH PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const Finance = {
  /**
   * Monthly payment for a fully-amortizing loan.
   * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
   */
  payment(principal, annualRate, termMonths) {
    if (principal <= 0 || termMonths <= 0) return 0;
    if (annualRate === 0) return principal / termMonths;
    const r = annualRate / 12;
    return principal * (r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
  },

  /**
   * Remaining balance after `paymentsMade` payments on an amortizing loan.
   */
  remainingBalance(principal, annualRate, termMonths, paymentsMade) {
    if (paymentsMade >= termMonths) return 0;
    if (principal <= 0) return 0;
    if (annualRate === 0) return Math.max(0, principal * (1 - paymentsMade / termMonths));
    const r = annualRate / 12;
    const pmt = this.payment(principal, annualRate, termMonths);
    return Math.max(0, principal * Math.pow(1 + r, paymentsMade)
      - pmt * (Math.pow(1 + r, paymentsMade) - 1) / r);
  },

  /** Format as $1,234 */
  dollar(n, decimals = 0) {
    const sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },

  /** Format as 7.25% */
  pct(n, decimals = 2) {
    return n.toFixed(decimals) + '%';
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — COMPARISON ENGINE
// Computes the full comparison between HELOC and cash-out refi scenarios.
// "Cost of borrowing" = closing costs + all interest paid on the borrowed amount.
// ─────────────────────────────────────────────────────────────────────────────

function computeComparison(raw) {
  // Parse inputs
  const homeValue     = +raw.homeValue;
  const mortBal       = +raw.mortgageBalance;
  const existRate     = +raw.existingRate / 100;
  const existTermMo   = +raw.remainingTermYears * 12;
  const cashOut       = +raw.cashOutAmount;
  const helocRate     = +raw.helocRate / 100;
  const helocDrawMo   = +raw.helocDrawYears * 12;
  const helocRepayMo  = +raw.helocRepayYears * 12;
  const helocClose    = (+raw.helocClosingCosts / 100) * cashOut;  // pct of credit line
  const refiRate      = +raw.refiRate / 100;
  const refiTermMo    = +raw.refiTermYears * 12;
  const refiClosePct  = +raw.refiClosingPct / 100;
  const yearsToStay   = +raw.yearsToStay;
  const taxBracket    = +raw.taxBracket / 100;
  const isHomeImp     = raw.isHomeImprovement === true || raw.isHomeImprovement === 'true';

  // Guard: cap cash-out at 85% CLTV
  const maxCashOut = Math.max(0, homeValue * 0.85 - mortBal);
  const borrow = Math.min(cashOut, maxCashOut);
  const ltv = (mortBal + borrow) / homeValue;

  // ── Existing mortgage payment ────────────────────────
  const existPmt = Finance.payment(mortBal, existRate, existTermMo);

  // ── HELOC scenario ───────────────────────────────────
  const drawPmt   = borrow * (helocRate / 12);                   // interest-only
  const repayPmt  = Finance.payment(borrow, helocRate, helocRepayMo);   // fully amortizing
  const totalDraw  = existPmt + drawPmt;
  const totalRepay = existPmt + repayPmt;
  const paymentShock = repayPmt - drawPmt;                        // jump at repayment start

  // Tax savings on HELOC interest (only if home improvement under TCJA)
  const helocTaxSavingsMo = isHomeImp ? (borrow * helocRate * taxBracket) / 12 : 0;

  // ── Cash-out refi scenario ───────────────────────────
  const refiLoan      = mortBal + borrow;
  const refiClose     = refiLoan * refiClosePct;
  const refiPmt       = Finance.payment(refiLoan, refiRate, refiTermMo);
  const hasPMI        = ltv > 0.80;
  const pmiMonthly    = hasPMI ? refiLoan * getPMIRate(ltv) / 12 : 0;
  const refiEffPmt    = refiPmt + pmiMonthly;
  const rateLockCost  = Finance.payment(mortBal, refiRate, refiTermMo)
                      - Finance.payment(mortBal, existRate, existTermMo);

  // Tax savings on refi cash-out interest
  const refiTaxSavingsMo = isHomeImp ? (borrow * refiRate * taxBracket) / 12 : 0;

  // ── Build cumulative cost of borrowing (interest on $borrow) ─────────────
  // For HELOC: closing costs + interest paid on the credit line (3 rate scenarios)
  // For Refi:  closing costs + interest attributable to the cash-out slice
  // This isolates "what does it cost to access $borrow?"

  const MONTHS = 360;
  const ratesScenarios = {
    heloc:   helocRate,
    heloc2:  helocRate + 0.02,
    heloc4:  helocRate + 0.04,
  };

  const helocCumulative = {};
  for (const [key, rate] of Object.entries(ratesScenarios)) {
    let cost = helocClose;
    const arr = [];
    for (let m = 1; m <= MONTHS; m++) {
      if (m <= helocDrawMo) {
        // Interest-only draw
        cost += borrow * (rate / 12);
      } else {
        // Amortizing repayment
        const mo = m - helocDrawMo;
        if (mo <= helocRepayMo) {
          const bal = Finance.remainingBalance(borrow, rate, helocRepayMo, mo - 1);
          cost += bal * (rate / 12);
        }
        // After full repayment, no further cost
      }
      arr.push(Math.round(cost));
    }
    helocCumulative[key] = arr;
  }

  // Refi: allocate interest to cash-out slice proportionally
  const cashOutShare = borrow / refiLoan;
  let rCost = refiClose;
  const refiCumulative = [];
  for (let m = 1; m <= MONTHS; m++) {
    const bal = Finance.remainingBalance(refiLoan, refiRate, refiTermMo, m - 1);
    rCost += bal * (refiRate / 12) * cashOutShare;
    refiCumulative.push(Math.round(rCost));
  }

  // ── Break-even analysis ───────────────────────────────
  // Find first month where HELOC cumulative cost exceeds refi cumulative cost
  // (i.e., the refi has fully recouped its upfront closing costs)
  let breakEvenMonth = null;
  for (let m = 0; m < MONTHS; m++) {
    if (refiCumulative[m] <= helocCumulative.heloc[m]) {
      breakEvenMonth = m + 1;
      break;
    }
  }

  // ── Totals at key time horizons ───────────────────────
  const HORIZONS = [5, 10, 15, 20, 30];
  const horizonComparison = HORIZONS.map(yr => {
    const idx = Math.min(yr * 12 - 1, MONTHS - 1);
    return {
      years: yr,
      heloc:   helocCumulative.heloc[idx],
      heloc2:  helocCumulative.heloc2[idx],
      heloc4:  helocCumulative.heloc4[idx],
      refi:    refiCumulative[idx],
      diff:    refiCumulative[idx] - helocCumulative.heloc[idx],
    };
  });

  // ── Recommendation at user's holding period ──────────
  const stayIdx = Math.min(yearsToStay * 12 - 1, MONTHS - 1);
  const helocCostAtStay = helocCumulative.heloc[stayIdx];
  const refiCostAtStay  = refiCumulative[stayIdx];
  const recommendation  = helocCostAtStay <= refiCostAtStay ? 'heloc' : 'refi';
  const savings         = Math.abs(helocCostAtStay - refiCostAtStay);
  const savingsYearly   = Math.round(savings / yearsToStay);

  return {
    // Inputs (processed)
    homeValue, mortBal, existRate, existTermMo, borrow, ltv,

    // Existing mortgage
    existPmt,

    // HELOC outputs
    drawPmt, repayPmt, totalDraw, totalRepay,
    paymentShock, helocClose, helocTaxSavingsMo,
    helocRate, helocDrawMo, helocRepayMo,

    // Refi outputs
    refiLoan, refiClose, refiPmt, refiEffPmt,
    hasPMI, pmiMonthly, refiTaxSavingsMo,
    rateLockCost, refiRate,

    // Chart data
    helocCumulative,
    refiCumulative,

    // Analysis
    horizonComparison,
    breakEvenMonth,
    recommendation,
    savings,
    savingsYearly,
    yearsToStay,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — UI CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

let costChart = null;
let paymentChart = null;

function getInputs() {
  const get = id => document.getElementById(id)?.value ?? '';
  return {
    homeValue:          get('homeValue'),
    mortgageBalance:    get('mortgageBalance'),
    existingRate:       get('existingRate'),
    remainingTermYears: get('remainingTermYears'),
    cashOutAmount:      get('cashOutAmount'),
    helocRate:          get('helocRate'),
    helocDrawYears:     get('helocDrawYears'),
    helocRepayYears:    get('helocRepayYears'),
    helocClosingCosts:  get('helocClosingCosts'),
    refiRate:           get('refiRate'),
    refiTermYears:      get('refiTermYears'),
    refiClosingPct:     get('refiClosingPct'),
    yearsToStay:        get('yearsToStay'),
    taxBracket:         get('taxBracket'),
    isHomeImprovement:  document.getElementById('isHomeImprovement')?.checked,
  };
}

function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setElementClass(el, add, remove) {
  if (!el) return;
  el.classList.remove(...remove);
  el.classList.add(...add);
}

function renderResults(r) {
  const F = Finance;
  const isHeloc = r.recommendation === 'heloc';

  // ── Hero summary ──────────────────────────────────
  const winnerLabel = isHeloc ? 'HELOC' : 'Cash-Out Refi';
  setElementText('result-winner', winnerLabel);
  setElementText('result-savings', F.dollar(r.savings));
  setElementText('result-horizon', `over ${r.yearsToStay} years`);
  setElementText('result-subtext',
    isHeloc
      ? `By keeping your ${F.pct(r.existRate * 100)} first mortgage rate and adding a HELOC, you avoid the rate lock-in penalty.`
      : `Despite higher closing costs, the refi rate improves your overall cost of funds over your holding period.`
  );

  // Winner badge
  const badge = document.getElementById('winner-badge');
  setElementClass(badge,
    [isHeloc ? 'badge-heloc' : 'badge-refi'],
    ['badge-heloc', 'badge-refi']
  );

  // ── Monthly payment card — HELOC ──────────────────
  setElementText('heloc-draw-pmt',  F.dollar(r.totalDraw));
  setElementText('heloc-repay-pmt', F.dollar(r.totalRepay));
  setElementText('heloc-exist-pmt', F.dollar(r.existPmt));
  setElementText('heloc-line-pmt-draw',  F.dollar(r.drawPmt));
  setElementText('heloc-close-cost', F.dollar(r.helocClose));
  setElementText('heloc-rate-display', F.pct(r.helocRate * 100));
  setElementText('heloc-shock', `+${F.dollar(r.paymentShock)}/mo at repayment`);
  if (r.helocTaxSavingsMo > 0) {
    setElementText('heloc-tax-savings', `−${F.dollar(r.helocTaxSavingsMo * 12)}/yr tax savings`);
  }

  // ── Monthly payment card — Refi ───────────────────
  setElementText('refi-pmt',        F.dollar(r.refiEffPmt));
  setElementText('refi-close-cost', F.dollar(r.refiClose));
  setElementText('refi-rate-display', F.pct(r.refiRate * 100));
  setElementText('refi-loan-amt',   F.dollar(r.refiLoan));
  {
    const _lockEl = document.getElementById('rate-lock-cost');
    if (_lockEl) {
      if (r.rateLockCost > 1) {
        _lockEl.textContent = '+' + F.dollar(r.rateLockCost) + '/mo extra — cost of giving up your ' + F.pct(r.existRate * 100) + ' rate';
        _lockEl.style.color = 'var(--accent-warm)';
      } else if (r.rateLockCost < -1) {
        _lockEl.textContent = F.dollar(Math.abs(r.rateLockCost)) + '/mo savings — your existing rate is above today\'s';
        _lockEl.style.color = 'var(--accent)';
      } else {
        _lockEl.textContent = 'Rate change minimal at your holding period';
        _lockEl.style.color = 'var(--ink-light)';
      }
    }
  }

  const pmiRow = document.getElementById('pmi-row');
  if (pmiRow) pmiRow.style.display = r.hasPMI ? '' : 'none';
  if (r.hasPMI) {
    setElementText('refi-pmi', `+${F.dollar(r.pmiMonthly)}/mo PMI (LTV ${(r.ltv * 100).toFixed(1)}%)`);
  }
  if (r.refiTaxSavingsMo > 0) {
    setElementText('refi-tax-savings', `−${F.dollar(r.refiTaxSavingsMo * 12)}/yr tax savings`);
  }

  // ── Break-even ────────────────────────────────────
  if (r.breakEvenMonth) {
    const yr = Math.floor(r.breakEvenMonth / 12);
    const mo = r.breakEvenMonth % 12;
    const label = yr > 0 ? `${yr} yr ${mo} mo` : `${mo} mo`;
    setElementText('break-even-label', label);
    setElementText('break-even-subtext',
      `After ${label}, the refi becomes the more cost-effective choice`);
  } else {
    setElementText('break-even-label', 'None');
    setElementText('break-even-subtext', 'The HELOC is cheaper than the refi at every time horizon — no break-even point exists');
  }

  // ── Horizon table ──────────────────────────────────
  const tbody = document.getElementById('horizon-tbody');
  if (tbody) {
    tbody.innerHTML = r.horizonComparison.map(row => {
      const winner  = row.heloc <= row.refi ? 'heloc' : 'refi';
      const diffStr = row.diff >= 0
        ? `HELOC saves ${F.dollar(row.diff)}`
        : `Refi saves ${F.dollar(-row.diff)}`;
      return `
        <tr>
          <td>${row.years} yrs</td>
          <td class="${winner === 'heloc' ? 'winner-cell' : ''}">${F.dollar(row.heloc)}</td>
          <td>${F.dollar(row.heloc2)}</td>
          <td>${F.dollar(row.heloc4)}</td>
          <td class="${winner === 'refi' ? 'winner-cell' : ''}">${F.dollar(row.refi)}</td>
          <td class="diff-cell ${winner === 'heloc' ? 'heloc-wins' : 'refi-wins'}">${diffStr}</td>
        </tr>`;
    }).join('');
  }

  // ── Charts ────────────────────────────────────────
  renderCostChart(r);
  renderPaymentChart(r);

  // Show results section
  const placeholder = document.getElementById('results-placeholder');
  if (placeholder) placeholder.style.display = 'none';
  document.getElementById('results-section').classList.remove('hidden');
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART 1 — Incremental cost of borrowing
//
// Shows ONLY the cost of the new borrowing — what each option adds to your
// monthly bills. Your existing mortgage payment is NOT shown here because it
// stays identical whether you choose a HELOC or refi (the HELOC doesn't touch
// it; the refi replaces it). What matters for the decision is what you're
// paying FOR the $X you pulled out.
//
// Three bars:
//   HELOC draw years  → interest-only on the borrowed amount
//   HELOC repayment   → P+I on the borrowed amount (the payment shock bar)
//   Refi extra cost   → how much more your total mortgage payment is vs. before
//
// The jump from draw→repayment bar is the "payment shock" moment at year 10.
// ─────────────────────────────────────────────────────────────────────────────
function renderCostChart(r) {
  const ctx = document.getElementById('costChart');
  if (!ctx) return;
  if (costChart) costChart.destroy();

  const FONTS = window._chartFonts || {};
  const SANS  = FONTS.SANS  || "'General Sans', system-ui, sans-serif";
  const MONO  = FONTS.MONO  || "'JetBrains Mono', 'Courier New', monospace";
  const SERIF = FONTS.SERIF || "'Gambetta', Georgia, serif";

  // The incremental monthly cost of having borrowed the money:
  const helocDrawCost  = r.drawPmt;                    // interest-only on balance
  const helocRepayCost = r.repayPmt;                   // P+I on balance
  const refiExtraCost  = Math.max(0, r.refiEffPmt - r.existPmt);  // extra vs. before

  const shockAmt  = helocRepayCost - helocDrawCost;
  const shockPct  = Math.round((shockAmt / helocDrawCost) * 100);

  const labels = [
    'HELOC — draw years (1–' + Math.round(r.helocDrawMo/12) + ')',
    'HELOC — repayment (yr ' + (Math.round(r.helocDrawMo/12)+1) + '–' + Math.round((r.helocDrawMo+r.helocRepayMo)/12) + ')',
    'Cash-Out Refi — extra vs. before',
  ];

  const values    = [helocDrawCost, helocRepayCost, refiExtraCost];
  const colors    = ['#2B4A7A', '#1D3557', '#7B2121'];
  const isWinner  = [
    helocDrawCost  < refiExtraCost,
    helocRepayCost < refiExtraCost,
    refiExtraCost  < helocDrawCost,
  ];

  costChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Monthly cost of borrowing',
        data: values,
        backgroundColor: colors,
        borderRadius: 0,
        barPercentage: 0.5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: c => ' ' + Finance.dollar(c.parsed.y) + '/mo — cost of the ' + Finance.dollar(r.borrow) + ' you borrowed',
            afterLabel: c => {
              const idx = c.dataIndex;
              if (idx === 0) return ' Interest-only on ' + Finance.dollar(r.borrow) + ' at ' + Finance.pct(r.helocRate*100);
              if (idx === 1) return ' P+I on ' + Finance.dollar(r.borrow) + ' — ' + Finance.dollar(shockAmt) + ' (' + shockPct + '%) more than draw phase';
              if (idx === 2) return ' Your new refi payment minus your old mortgage payment';
            },
          },
        },
        title: {
          display: true,
          text: [
            'Cost of borrowing ' + Finance.dollar(r.borrow) + ' with each option — your existing $' + Math.round(r.existPmt) + '/mo mortgage is unchanged with a HELOC',
            'HELOC payment shock at year ' + Math.round(r.helocDrawMo/12) + ': +' + Finance.dollar(shockAmt) + '/mo (+' + shockPct + '%) when repayment begins',
          ],
          font: { family: SERIF, size: 12, weight: '400', style: 'italic' },
          color: '#555',
          padding: { bottom: 16 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: SANS, size: 11 }, color: '#555', maxRotation: 0 },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: MONO, size: 10 },
            color: '#777',
            callback: v => Finance.dollar(v) + '/mo',
          },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART 2 — Cumulative HELOC advantage (the decision chart)
// Single line: "how much has HELOC saved vs. Refi cumulatively?"
// Above zero = HELOC is ahead. Below zero = Refi would have been cheaper.
// Zero crossing = break-even point.
// User's holding period marked as a vertical dotted line with annotation.
// Rate shock scenarios shown as dashed lines.
// ─────────────────────────────────────────────────────────────────────────────
function renderPaymentChart(r) {
  const ctx = document.getElementById('paymentChart');
  if (!ctx) return;
  if (paymentChart) paymentChart.destroy();

  const FONTS = window._chartFonts || {};
  const SANS  = FONTS.SANS  || "'General Sans', system-ui, sans-serif";
  const MONO  = FONTS.MONO  || "'JetBrains Mono', 'Courier New', monospace";
  const SERIF = FONTS.SERIF || "'Gambetta', Georgia, serif";

  const STEP = 3; // quarterly
  const labels = [], netBase = [], net2 = [], net4 = [], zeroLine = [];
  const ptRadius = [];
  const holdSample = Math.round(r.yearsToStay * 12 / STEP) - 1;

  for (let m = STEP, i = 0; m <= 360; m += STEP, i++) {
    const yr = m / 12;
    labels.push(yr % 5 === 0 ? 'Yr ' + yr : '');
    const idx = m - 1;
    netBase.push(Math.round(r.refiCumulative[idx] - r.helocCumulative.heloc[idx]));
    net2.push(Math.round(r.refiCumulative[idx] - r.helocCumulative.heloc2[idx]));
    net4.push(Math.round(r.refiCumulative[idx] - r.helocCumulative.heloc4[idx]));
    zeroLine.push(0);
    ptRadius.push(i === holdSample ? 6 : 0);
  }

  // Dollar value at holding period
  const holdIdx = r.yearsToStay * 12 - 1;
  const holdAdv = r.refiCumulative[holdIdx] - r.helocCumulative.heloc[holdIdx];
  const helocWins = holdAdv >= 0;
  const holdLabel = helocWins
    ? 'HELOC ahead by ' + Finance.dollar(holdAdv) + ' at Yr ' + r.yearsToStay
    : 'Refi ahead by ' + Finance.dollar(-holdAdv) + ' at Yr ' + r.yearsToStay;

  // Vertical annotation line at holding period (as extra dataset)
  const holdLineData = Array(labels.length).fill(null);
  const holdLineMin = Math.min(...netBase, ...net4) * 1.15;
  const holdLineMax = Math.max(...netBase) * 1.15;
  holdLineData[holdSample] = holdLineMax;

  paymentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'HELOC cumulative advantage (base rate)',
          data: netBase,
          borderColor: '#1D3557',
          backgroundColor: 'rgba(29,53,87,0.07)',
          borderWidth: 2.5,
          pointRadius: ptRadius,
          pointBackgroundColor: '#1D3557',
          pointBorderColor: '#FDFCF9',
          pointBorderWidth: 2,
          fill: 'origin',
          tension: 0.3,
        },
        {
          label: 'HELOC advantage if rates rise +2%',
          data: net2,
          borderColor: '#888',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [6, 3],
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: 'HELOC advantage if rates rise +4%',
          data: net4,
          borderColor: '#BBB',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderDash: [3, 3],
          pointRadius: 0,
          fill: false,
          tension: 0.3,
        },
        {
          label: '_zero',
          data: zeroLine,
          borderColor: 'rgba(0,0,0,0.2)',
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderDash: [2, 2],
          pointRadius: 0,
          fill: false,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: SANS, size: 11 }, color: '#555', boxWidth: 24, padding: 14,
            filter: item => item.text !== '_zero',
          },
        },
        tooltip: {
          callbacks: {
            label: c => {
              if (c.dataset.label === '_zero') return null;
              const v = c.parsed.y;
              const who = v >= 0 ? 'HELOC ahead' : 'Refi ahead';
              return c.dataset.label + ': ' + Finance.dollar(Math.abs(v)) + ' (' + who + ')';
            },
            afterBody: () => ['  Zero line = break-even'],
          },
        },
        title: {
          display: true,
          text: [
            'Above zero: HELOC is cheaper overall. Below zero: Refi would have been cheaper.',
            'Your year ' + r.yearsToStay + ' dot: ' + holdLabel,
          ],
          font: { family: SERIF, size: 12, weight: '400', style: 'italic' },
          color: '#555',
          padding: { bottom: 14 },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: MONO, size: 10 }, color: '#777', maxRotation: 0 },
        },
        y: {
          ticks: {
            font: { family: MONO, size: 10 },
            color: '#777',
            callback: v => (v >= 0 ? '+' : '') + Finance.dollar(v),
          },
          grid: { color: 'rgba(0,0,0,0.04)' },
        },
      },
    },
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrencyInput(input) {
  input.addEventListener('blur', () => {
    const raw = input.value.replace(/[^0-9.]/g, '');
    const val = parseFloat(raw);
    if (!isNaN(val)) input.value = val.toLocaleString('en-US');
  });
  input.addEventListener('focus', () => {
    input.value = input.value.replace(/[^0-9.]/g, '');
  });
}

function getCleanValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.replace(/[^0-9.]/g, '') : '';
}

// Override getInputs for currency fields
function getInputsFull() {
  const get = id => document.getElementById(id)?.value ?? '';
  const getMoney = id => getCleanValue(id);
  return {
    homeValue:          getMoney('homeValue'),
    mortgageBalance:    getMoney('mortgageBalance'),
    existingRate:       get('existingRate'),
    remainingTermYears: get('remainingTermYears'),
    cashOutAmount:      getMoney('cashOutAmount'),
    helocRate:          get('helocRate'),
    helocDrawYears:     get('helocDrawYears'),
    helocRepayYears:    get('helocRepayYears'),
    helocClosingCosts:  get('helocClosingCosts'),
    refiRate:           get('refiRate'),
    refiTermYears:      get('refiTermYears'),
    refiClosingPct:     get('refiClosingPct'),
    yearsToStay:        get('yearsToStay'),
    taxBracket:         get('taxBracket'),
    isHomeImprovement:  document.getElementById('isHomeImprovement')?.checked,
  };
}

// Each rule: { fieldId, message, test(inputs) }
const VALIDATION_RULES = [
  {
    fieldId: 'homeValue',
    label: 'Current home value',
    test: i => +i.homeValue > 0,
    message: 'What is your home currently worth?',
  },
  {
    fieldId: 'mortgageBalance',
    label: 'Remaining mortgage balance',
    test: i => +i.mortgageBalance > 0,
    message: 'How much do you still owe on your mortgage?',
  },
  {
    fieldId: 'existingRate',
    label: 'Current mortgage rate',
    test: i => +i.existingRate > 0,
    message: 'What interest rate are you currently paying on your mortgage?',
  },
  {
    fieldId: 'remainingTermYears',
    label: 'Years remaining',
    test: i => +i.remainingTermYears >= 1 && +i.remainingTermYears <= 40,
    message: 'How many years are left on your mortgage? (1–40)',
  },
  {
    fieldId: 'cashOutAmount',
    label: 'Amount to borrow',
    test: i => +i.cashOutAmount > 0,
    message: 'How much cash do you need to pull out?',
  },
  {
    fieldId: null,
    label: null,
    test: i => +i.mortgageBalance < +i.homeValue,
    message: 'Your mortgage balance can’t exceed your home value.',
  },
];

function validateInputs(inputs) {
  return VALIDATION_RULES
    .filter(r => !r.test(inputs))
    .map(r => ({ fieldId: r.fieldId, message: r.message }));
}

function clearFieldErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.remove());
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function showErrors(errors) {
  const box = document.getElementById('error-box');
  clearFieldErrors();

  if (errors.length === 0) {
    if (box) box.style.display = 'none';
    return;
  }

  // Highlight each specific field inline
  errors.forEach(({ fieldId, message }) => {
    if (!fieldId) return;
    const input = document.getElementById(fieldId);
    if (!input) return;

    // Add red ring to the input (or its .iw wrapper)
    const wrapper = input.closest('.iw') || input;
    wrapper.classList.add('input-error');

    // Insert a small error hint directly under the field
    const hint = document.createElement('span');
    hint.className = 'field-error';
    hint.textContent = '⚠️ ' + message;
    const field = input.closest('.field');
    if (field) field.appendChild(hint);
  });

  // Also show the summary box if there are cross-field errors (no fieldId)
  const crossErrors = errors.filter(e => !e.fieldId);
  if (box) {
    if (crossErrors.length > 0) {
      box.style.display = '';
      box.innerHTML = crossErrors.map(e => `<p>${e.message}</p>`).join('');
    } else {
      box.style.display = 'none';
    }
  }

  // Scroll to the first broken field
  const firstFieldId = errors.find(e => e.fieldId)?.fieldId;
  if (firstFieldId) {
    const el = document.getElementById(firstFieldId);
    if (el) el.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function onCalculate() {
  const inputs = getInputsFull();
  const errors = validateInputs(inputs);
  showErrors(errors);
  if (errors.length > 0) return;

  try {
    const results = computeComparison(inputs);
    renderResults(results);
    trackEvent('calculate', { recommendation: results.recommendation });
  } catch (err) {
    console.error('Calculation error:', err);
    const box = document.getElementById('error-box');
    if (box) { box.style.display = ''; box.innerHTML = '<p>Something went wrong. Please check your inputs and try again.</p>'; }
  }
}

// Minimal analytics hook (works with GA4 or no-op)
function trackEvent(name, params) {
  if (window.gtag) window.gtag('event', name, params);
}

// Toggle advanced options panel
function toggleAdvanced() {
  const panel = document.getElementById('advanced-panel');
  const btn = document.getElementById('advanced-toggle');
  if (!panel || !btn) return;
  const isOpen = panel.dataset.open === 'true';
  panel.dataset.open = isOpen ? 'false' : 'true';
  panel.style.display = isOpen ? 'none' : 'block';
  btn.setAttribute('aria-expanded', String(!isOpen));
  btn.innerHTML = isOpen ? '&#9660; More options' : '&#9650; Fewer options';
}

// Populate fields with defaults on load
function populateDefaults() {
  const d = DEFAULTS;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };

  // Currency fields: format with commas
  const setCurrency = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val.toLocaleString('en-US');
  };

  // Only pre-fill rates — user enters their own property numbers
  setVal('helocRate',             d.helocRate);
  setVal('helocDrawYears',        d.helocDrawYears);
  setVal('helocRepayYears',       d.helocRepayYears);
  setVal('helocClosingCosts', d.helocClosingCosts);
  setVal('refiRate',              d.refiRate);
  setVal('refiTermYears',         d.refiTermYears);
  setVal('refiClosingPct',        d.refiClosingPct);
  setVal('taxBracket',            d.taxBracket);
  // Default staying horizon to 10 years
  const staySlider = document.getElementById('yearsToStay');
  if (staySlider) { staySlider.value = d.yearsToStay; }
  const stayLabel = document.getElementById('yearsToStayLabel');
  if (stayLabel) stayLabel.textContent = 'How long you plan to stay: ' + d.yearsToStay + ' years';

  const homeImpEl = document.getElementById('isHomeImprovement');
  if (homeImpEl) homeImpEl.checked = d.isHomeImprovement;

  // Update rate staleness note
  const rateNote = document.getElementById('rate-note');
  if (rateNote) rateNote.textContent = `Rates pre-filled as of ${MARKET_RATES.lastUpdated}. Edit to match your quotes.`;
}

// Wire up currency input formatters
function wireCurrencyInputs() {
  ['homeValue', 'mortgageBalance', 'cashOutAmount'].forEach(id => {
    const el = document.getElementById(id);
    if (el) formatCurrencyInput(el);
  });
}

// Slider label sync for yearsToStay (single source of truth)
function wireSlider() {
  const slider = document.getElementById('yearsToStay');
  const label  = document.getElementById('yearsToStayLabel');
  if (!slider || !label) return;
  const updateLabel = () => {
    const yrs = slider.value;
    label.textContent = 'How long you plan to stay: ' + yrs + ' year' + (yrs == 1 ? '' : 's');
  };
  slider.addEventListener('input', updateLabel);
}

// Allow Enter key to trigger calculate
function wireEnterKey() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') onCalculate();
  });
}

// Clear the error state on a field as soon as the user starts correcting it
function wireErrorClear() {
  ['homeValue','mortgageBalance','existingRate','remainingTermYears','cashOutAmount'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const wrapper = el.closest('.iw') || el;
      wrapper.classList.remove('input-error');
      const hint = el.closest('.field')?.querySelector('.field-error');
      if (hint) hint.remove();
    });
  });
}

// ── Set Chart.js global font defaults (Fontshare) ────
function applyChartFontDefaults() {
  if (typeof Chart === 'undefined') return;
  const SANS = "'General Sans', system-ui, sans-serif";
  const MONO = "'JetBrains Mono', 'Courier New', monospace";
  const SERIF = "'Gambetta', Georgia, serif";
  Chart.defaults.font.family = SANS;
  Chart.defaults.font.size = 11;
  Chart.defaults.color = '#777777';
  window._chartFonts = { SANS, MONO, SERIF };
}

// ── Boot ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateDefaults();
  wireCurrencyInputs();
  wireSlider();
  wireEnterKey();
  wireErrorClear();

  const calcBtn = document.getElementById('calculate-btn');
  if (calcBtn) calcBtn.addEventListener('click', onCalculate);

  const advBtn = document.getElementById('advanced-toggle');
  if (advBtn) advBtn.addEventListener('click', toggleAdvanced);

  // Wait for Fontshare fonts, then set chart defaults
  applyChartFontDefaults();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => applyChartFontDefaults());
  }
});
