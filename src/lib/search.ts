export function sanitizeDashboardSearchTerm(value: unknown) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[%*,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
