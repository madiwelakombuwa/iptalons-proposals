// This schema is a confidentiality boundary, not a copy of the editor object.
// Apply it on both write and read so legacy KV snapshots are safe to serve.
const record = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
const text = (value: unknown, max = 20000) => typeof value === 'string' ? value.slice(0, max) : '';
const number = (value: unknown, fallback = 0) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const services = new Set(['csr', 'redbook', 'consulting', 'supplemental']);

export function publicProposal(value: unknown): Record<string, unknown> {
  const p = record(value), prospect = record(p.prospect);
  return {
    name: text(p.name, 300), proposalNumber: text(p.proposalNumber, 100),
    tier: text(p.tier, 30), created: text(p.created, 40), validUntil: text(p.validUntil, 40),
    introLetter: text(p.introLetter), savingsAnalysis: text(p.savingsAnalysis),
    savingsEstimate: Math.max(0, number(p.savingsEstimate)), paymentTerms: text(p.paymentTerms),
    prospect: { name: text(prospect.name, 300), contact: text(prospect.contact, 300), title: text(prospect.title, 300) },
    items: (Array.isArray(p.items) ? p.items : []).slice(0, 100).map(record)
      .filter(item => services.has(String(item.serviceId)))
      .map(item => ({
        serviceId: String(item.serviceId), qty: Math.max(0, number(item.qty)),
        unitPrice: Math.max(0, number(item.unitPrice)),
        bundleDiscount: Math.min(100, Math.max(0, number(item.bundleDiscount))),
      })),
  };
}

export function safeSourceUrl(value: unknown): string {
  try {
    const url = new URL(String(value));
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}
