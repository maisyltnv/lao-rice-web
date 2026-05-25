// Format price to Lao Kip (LAK) format
export function formatLAK(amount: number): string {
  return new Intl.NumberFormat('lo-LA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace(/,/g, '.') + ' ₭';
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
