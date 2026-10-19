// GitHub OAuth for Decap CMS. Shared by worker.js (Workers static assets)
// and functions/ (Pages Functions), so the test can run on either host.
//
// Flow (docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps):
//   /auth      -> redirect to GitHub with a random state, also stored in a cookie
//   /callback  -> check state, exchange code for a token, hand the token to the
//                 Decap window with postMessage, limited to this site's origin.
//
// Needs two runtime secrets: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.

const ALLOWED_SCOPES = new Set(["repo", "public_repo"]);
const STATE_COOKIE = "decap_oauth_state";

export async function handleAuth(request, env) {
  if (!env.GITHUB_CLIENT_ID) return text("GITHUB_CLIENT_ID is not set.", 500);

  const url = new URL(request.url);
  const scope = url.searchParams.get("scope") || "repo";
  if (!ALLOWED_SCOPES.has(scope)) return text("Scope not allowed.", 400);

  const state = randomHex(16);
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${url.origin}/callback`);
  authorize.searchParams.set("scope", scope);
  authorize.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${state}; Path=/callback; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
      "Cache-Control": "no-store",
    },
  });
}

export async function handleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = readCookie(request, STATE_COOKIE);

  if (!code || !state || !cookieState || state !== cookieState) {
    return reply(url.origin, "error", { message: "Login check failed. Close this window and try again." });
  }

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));

  if (!data.access_token) {
    return reply(url.origin, "error", { message: data.error_description || "GitHub did not return a token." });
  }
  return reply(url.origin, "success", { token: data.access_token, provider: "github" });
}

// Decap's login window protocol: the popup sends "authorizing:github", Decap answers,
// then the popup sends "authorization:github:<status>:<json>".
function reply(origin, status, content) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><html><body><p>Finishing login…</p><script>
(function () {
  var origin = ${safeJson(origin)};
  var message = ${safeJson(message)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.removeEventListener("message", receive);
    window.opener.postMessage(message, origin);
  }
  window.addEventListener("message", receive);
  window.opener.postMessage("authorizing:github", origin);
})();
</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Set-Cookie": `${STATE_COOKIE}=; Path=/callback; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function text(body, status) {
  return new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

function randomHex(bytes) {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}
