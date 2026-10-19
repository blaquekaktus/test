// Workers static assets entry. Only /auth and /callback reach this code
// (run_worker_first in wrangler.jsonc); every other request is served from _site
// as a static asset.
import { handleAuth, handleCallback } from "./oauth/github.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/auth") return handleAuth(request, env);
    if (pathname === "/callback") return handleCallback(request, env);
    return env.ASSETS.fetch(request);
  },
};
