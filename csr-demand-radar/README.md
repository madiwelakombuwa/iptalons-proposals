# IPTalons CSR - Demand Radar (Cloudflare Worker)

Deploy with Claude Code desktop: open this folder and say "deploy this to Cloudflare Workers", or run:

    npx wrangler deploy

First run triggers `wrangler login` (browser, no token). Serves ./public/index.html at
https://iptalons-csr-radar.<your-subdomain>.workers.dev

Update data: edit the LEADS array near the bottom of public/index.html, then redeploy.
