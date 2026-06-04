// Format price to Lao Kip (LAK) format
export function formatLAK(amount: number): string {
  return formatLakAmount(amount) + ' ₭';
}

/** Integer LAK with dot thousands — e.g. 1230000 → "1.230.000" */
export function formatLakAmount(amount: number): string {
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("lo-LA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(Math.round(amount))
    .replace(/,/g, ".");
}

/** Parse formatted LAK input back to integer */
export function parseLakAmount(value: string): number {
  const raw = value.replace(/[^\d]/g, "").trim();
  if (!raw) return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

/** Format while typing — keeps only digits, adds thousand dots */
export function formatLakInput(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return formatLakAmount(Number(digits));
}

// Convert CNY to LAK based on exchange rate
export function convertCNYtoLAK(cnyAmount: number, exchangeRate: number): number {
  return Math.round(cnyAmount * exchangeRate);
}

// Calculate selling price with margin
export function calculateSellingPrice(costCNY: number, marginPercent: number, exchangeRate: number): number {
  const costLAK = convertCNYtoLAK(costCNY, exchangeRate);
  return Math.round(costLAK * (1 + marginPercent / 100));
}

// Format date in Lao
export function formatDateLao(date: Date): string {
  return new Intl.DateTimeFormat('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
