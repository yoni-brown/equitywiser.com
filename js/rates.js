/**
 * rates.js — Market rate defaults & constants
 * Update monthly. Sources: Freddie Mac PMMS, Fed H.15, Bankrate.
 * Last updated: April 2026
 */

const MARKET_RATES = {
  heloc:    { average: 7.02, prime: 6.75 },
  refi30yr: { average: 6.37 },
  refi15yr: { average: 5.74 },
  cashOutPremium: 0.25,   // cash-out refi is ~0.25% above conforming
  lastUpdated: 'April 9, 2026',
  source: 'Freddie Mac PMMS & Bankrate',
};

// PMI rate tiers (annual, as decimal) by LTV + approximate credit score
function getPMIRate(ltv) {
  if (ltv <= 0.80) return 0;
  if (ltv <= 0.85) return 0.005;   // 0.50% annual
  if (ltv <= 0.90) return 0.0075;  // 0.75% annual
  return 0.010;                     // 1.00% annual
}

// Calculator defaults — designed to illustrate the typical rate-lock-in scenario
const DEFAULTS = {
  homeValue:          450000,
  mortgageBalance:    285000,
  existingRate:       3.75,     // pandemic-era lock-in
  remainingTermYears: 26,
  cashOutAmount:      60000,
  helocRate:          7.25,     // prime + 0.50 margin
  helocDrawYears:     10,
  helocRepayYears:    20,
  helocClosingCosts:  0,   // percentage of credit line
  refiRate:           6.62,     // 30yr + cash-out premium
  refiTermYears:      30,
  refiClosingPct:     3.0,
  yearsToStay:        10,
  taxBracket:         22,
  isHomeImprovement:  true,
};
