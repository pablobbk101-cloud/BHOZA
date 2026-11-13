// Cloudflare Workers entry (the project deploys as a Worker with static assets).
// Static files in dist/ are served directly; only /api/* reaches this code (see run_worker_first in wrangler.jsonc).
import { onRequestPost } from '../functions/api/contact.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: { allow: 'POST' } });
      return onRequestPost({ request, env });
    }
    return env.ASSETS.fetch(request);
  },
};
