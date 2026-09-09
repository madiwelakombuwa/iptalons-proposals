const share = window.__SHARE__;
const root = document.getElementById("root");
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(value) || 0);
const serviceNames = { csr: "Certified Secure Researcher™", redbook: "RedBook™", consulting: "Subject-Matter-Expert Consulting", supplemental: "Supplemental Program Support" };

if (!share || !share.proposal) {
  root.innerHTML = `<main class="inactive"><div><div class="leaf">🍃</div><h1>This proposal link is no longer active</h1><p>Please contact IPTalons, Inc. at (972) 422-9169 for a fresh copy.</p></div></main>`;
} else {
  const p = share.proposal;
  const prospect = p.prospect || {};
  const items = Array.isArray(p.items) ? p.items : [];
  const rows = items.map((item) => {
    const qty = Math.max(0, Number(item.qty) || 0);
    const unit = Math.max(0, Number(item.unitPrice) || 0);
    const discount = Math.min(100, Math.max(0, Number(item.bundleDiscount) || 0));
    const subtotal = qty * unit * (1 - discount / 100);
    return { ...item, qty, unit, discount, subtotal };
  });
  const total = rows.reduce((sum, item) => sum + item.subtotal, 0);
  const lineItems = rows.length ? rows.map((item) => `<tr><td>${esc(serviceNames[item.serviceId] || "Research Security Service")}${item.discount ? `<small>${item.discount}% bundle discount</small>` : ""}</td><td>${esc(item.qty)}</td><td>${money(item.unit)}</td><td>${money(item.subtotal)}</td></tr>`).join("") : `<tr><td colspan="4">Pricing will be finalized with the approved scope of work.</td></tr>`;
  const paragraph = (value) => esc(value).split(/\n\n+/).filter(Boolean).map((text) => `<p>${text.replace(/\n/g, "<br>")}</p>`).join("");
  const page = (content, number = "") => `<section class="page"><div class="rail"></div><div class="content">${content}</div>${number ? `<footer><img src="/p/_assets/logo.webp" alt="IPTalons"><span>CONFIDENTIAL</span><span>${number}</span></footer>` : ""}</section>`;
  root.innerHTML = `
    <nav><span><strong>IPTalons, Inc.</strong> · Proposal for ${esc(prospect.name || "your institution")}</span><button type="button" onclick="window.print()">Print / PDF</button></nav>
    ${page(`<img class="logo" src="/p/_assets/logo.webp" alt="IPTalons"><div class="hero"><b>Science</b><b>Research</b><b>Innovation</b></div><div class="company"><strong>IPTalons, Inc.</strong><br>6060 N. Central Expressway, Suite 500<br>Dallas, TX 75206<br>(972) 422-9169<br>www.iptalons.com</div><div class="recipient"><strong>${esc(prospect.contact || "Recipient")}</strong><br>${esc(prospect.title || "Research Security Leader")}<br>${esc(prospect.name || "Institution")}</div><div class="date">${esc(p.created || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))}</div>`) }
    ${page(`<h1>Introduction</h1><div class="eyebrow">Our customers are our number one priority.</div>${paragraph(p.introLetter || "Thank you for the opportunity to support your research security program.")}<div class="signature">Allen Phelps<span>Allen L. Phelps<br>CEO, IPTalons, Inc.</span></div>`, "1")}
    ${page(`<h1>Proposed Research Security Services</h1><p>This proposal combines the services selected for ${esc(prospect.name || "your institution")} into one coordinated research security program.</p><div class="service-list">${rows.map((item) => `<article><h2>${esc(serviceNames[item.serviceId] || "Research Security Service")}</h2><p>Quantity: ${esc(item.qty)}${item.discount ? ` · Bundle discount: ${esc(item.discount)}%` : ""}</p></article>`).join("") || `<article><h2>Scope under review</h2><p>The final service scope will be confirmed before execution.</p></article>`}</div>${p.savingsAnalysis ? `<h2>Estimated savings</h2>${paragraph(p.savingsAnalysis)}<div class="callout">Estimated annual savings: ${money(p.savingsEstimate)}</div>` : ""}`, "2")}
    ${page(`<h1>Your Investment</h1><table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Subtotal</th></tr></thead><tbody>${lineItems}</tbody></table><div class="total"><span>Total annual subscription costs</span><strong>${money(total)}</strong></div><h2>Payment Terms</h2>${paragraph(p.paymentTerms || "Payment terms will be stated in the executed agreement.")}<p class="valid">Proposal ${esc(p.proposalNumber || "")} · Valid until ${esc(p.validUntil || "the date stated by IPTalons")}</p>`, "3")}
    ${page(`<h1>Let's Work Together</h1><p>This proposal and the final approved scope of work describe the services to be provided. Any modification must be agreed in writing by both parties.</p><div class="sign-grid"><div><div class="sign-line"></div><strong>Allen Phelps</strong><br>Chief Executive Officer<br>IPTalons, Inc.</div><div><div class="sign-line"></div><strong>${esc(prospect.contact || "Authorized representative")}</strong><br>${esc(prospect.title || "Title")}<br>${esc(prospect.name || "Institution")}</div></div>`, "4")}`;
}
