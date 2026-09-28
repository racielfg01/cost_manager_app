export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " CUP"
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("es-CU", {
    style: "decimal",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-CU", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100)
}
