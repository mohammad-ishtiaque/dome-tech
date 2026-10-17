// Cloudflare Pages Function: finishes the GitHub login and hands the token to the content manager.
// Requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET (set in Cloudflare Pages → Settings).
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookie = (request.headers.get("Cookie") || "").match(/(?:^|;\s*)cms_state=([^;]+)/);

  if (!code || !state || !cookie || cookie[1] !== state) return finish("error", { message: "Login could not be verified. Please try again." }, url.origin);

  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "digital-dome-cms" },
    body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) return finish("error", { message: data.error_description || "GitHub did not return a token." }, url.origin);

  return finish("success", { token: data.access_token, provider: "github" }, url.origin);
}

// Decap CMS login handshake: the popup announces itself, then posts the result to the opener.
function finish(status, payload, origin) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const html = `<!doctype html><meta charset="utf-8"><title>Signing in…</title><p>Signing in…</p><script>
(function () {
  var origin = ${JSON.stringify(origin)};
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage(${JSON.stringify(message)}, origin);
    window.removeEventListener("message", receive, false);
  }
  window.addEventListener("message", receive, false);
  window.opener && window.opener.postMessage("authorizing:github", origin);
})();
</script>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": "cms_state=; Path=/api; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
  });
}
