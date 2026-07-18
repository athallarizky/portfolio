# RCA — VPS First Deploy: Firewall, Nginx SSL, and Asset Routing

> **Date:** 2026-07-18 · **Severity:** Medium · **Component:** VPS/Nginx
> **Status:** ✅ Resolved (firewall), ✅ Resolved (nginx assets), ✅ Resolved (SSL overwrite), ✅ Resolved (sed delimiter)

## 1. Summary

Three independent issues blocked the first VPS deploy of `athallarizky.com`:

1. Tencent Lighthouse firewall blocked port 443 at the provider level — ufw was open but traffic never reached nginx.
2. Nginx config overwrite (`cp`) erased certbot's SSL directives, taking the site offline after a config update.
3. PayloadCMS admin panel rendered blank because Next.js static assets (`/_next/static/*`) were routed to the frontend (Astro:4321) instead of the backend (Next.js:3000).
4. Sed substitution failed during provisioning because `openssl rand -base64` output contained `/` characters that clashed with sed's delimiter.

## 2. Impact

- `https://athallarizky.com` inaccessible for ~15 min (firewall)
- `/admin` blank for ~5 min while diagnosing 404 errors (missing route)
- SSL broken for ~3 min after config overwrite (certbot reinstall)
- Provisioning script aborted mid-run (sed error), requiring re-run

## 3. Symptoms (observed)

| Issue | Signal |
|-------|--------|
| Firewall | `curl` on VPS (localhost) works; external `curl` times out; `dig` resolves correct IP |
| Nginx SSL loss | "This site can't be reached" after config update; `cat /etc/nginx/sites-available/portfolio \| head` shows only `listen 80` |
| Admin blank | DevTools shows 404 for `/_next/static/chunks/*.js` and `*.css` |
| Sed crash | `sed: -e expression #1, char 40: unknown option to 's'` with `PAYLOAD_SECRET` assignment |

## 4. Timeline

| # | Attempt | Outcome | Verdict |
|---|---------|---------|---------|
| 1 | Open `athallarizky.com` in browser | Loading forever | Symptom |
| 2 | Check PM2, nginx, ufw — all running | All local checks green | Red herring |
| 3 | Test `curl localhost:4321` — works | Frontend serving locally | Red herring |
| 4 | `dig +short athallarizky.com` — resolves VPS IP | DNS is correct | Red herring |
| 5 | Discovered Tencent Lighthouse firewall lacks port 443 | HTTPS traffic blocked at provider | **The cause** |
| 6 | Added port 443 to Lighthouse firewall | Site loads | Real fix |
| 7 | `/admin` blank — DevTools shows 404 for `/_next/static/*` | Next.js assets hitting frontend | **The cause** |
| 8 | Added `location /_next` to nginx config, pushed to GitHub | Fix ready | — |
| 9 | VPS: `git pull` → `cp` overwrote nginx config | SSL directives gone; site down | Red herring (side-effect of fix delivery) |
| 10 | Ran `certbot --nginx` → option 1 (reinstall) | SSL restored | Real fix |
| 11 | Refreshed `/admin` | PayloadCMS admin loads | Verified |
| 12 | Provisioning: sed error on `PAYLOAD_SECRET` | Script aborted at step 5 | **The cause** |
| 13 | Changed sed delimiter from `/` to `#` | Script completes cleanly | Real fix |

## 5. Root cause

**Issue 1 — Firewall:** Tencent Lighthouse has its own firewall tab separate from ufw. The provisioning script only configured ufw, not the provider-level firewall. Port 443 was never allowed at the Lighthouse level.

**Issue 2 — SSL overwrite:** `cp scripts/nginx/portfolio.conf /etc/nginx/sites-available/portfolio` overwrites the file entirely. The repo template only has `listen 80` — certbot added `listen 443 ssl` and `ssl_certificate` directives at install time, which were lost on overwrite. The provisioning script's `cp` step and manual config updates share this flaw.

**Issue 3 — Asset routing:** Nginx `location /` (catch-all) matched `/_next/static/*` before the more specific `/admin` or `/api` blocks could catch it. Since `/` proxies to frontend (:4321) and `/_next` assets belong to backend (:3000), all admin JS/CSS returned 404.

**Issue 4 — Sed delimiter:** `openssl rand -base64 32` produces `[A-Za-z0-9+/=]`, including `/`. Sed's default delimiter is also `/`, so `s/PAYLOAD_SECRET=.*/PAYLOAD_SECRET=<base64>/` breaks when the base64 string contains `/`.

## 6. The fix

```diff
# scripts/nginx/portfolio.conf — added /_next route BEFORE catch-all /
+ location /_next {
+     proxy_pass http://127.0.0.1:3000;
+     ...
+ }

# scripts/setup-vps.sh — changed sed delimiter
- sed -i "s/PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$SECRET/" .env
+ sed -i "s#PAYLOAD_SECRET=.*#PAYLOAD_SECRET=$SECRET#" .env

# Lighthouse Console → Firewall tab → manually added:
#   TCP 443 — ALLOW — 0.0.0.0/0
```

## 7. Verification

| Check | Before | After |
|-------|--------|-------|
| `curl https://athallarizky.com` | Timeout | HTML 200 |
| `/admin` | Blank (404 for static assets) | PayloadCMS login renders |
| `nginx -t` after config update | SSL directives missing | `listen 443` + `ssl_certificate` present |
| `scripts/setup-vps.sh` step 5 | sed error, aborted | Clean completion |

## 8. Why it was hard to find (contributing factors)

- **Firewall vs ufw:** All local checks (`nginx -t`, `pm2 status`, `ufw status`) passed, creating false confidence. The external firewall is invisible from inside the VPS.
- **SSL disappearance:** `git pull` + manual `cp` felt like a natural fix-delivery pattern. No warning that certbot had mutated the config file.
- **Asset 404:** The `/admin` page HTML loaded (from backend), but all JS/CSS failed. This created the misleading impression that routing was "mostly working."
- **Lighthouse vs CVM:** `AGENTS.md` had a note about CVM Security Groups, but this VPS is Lighthouse — different firewall UX entirely.

## 9. Lessons & action items

- [ ] Add `# certbot-managed — do not overwrite` comment to nginx config once certbot modifies it
- [ ] Add `location /_next` to nginx template permanently (✅ done — commit `05cdac2`)
- [ ] Fix sed delimiter permanently (✅ done — commit `7228ce9`)
- [ ] Update `AGENTS.md` / deploy docs to mention Lighthouse firewall for port 443
- [ ] Consider a scripted nginx update flow: `sed`-based line addition instead of wholesale `cp` overwrite

## 10. References

- Nginx config: `scripts/nginx/portfolio.conf` (commit `05cdac2` for `/_next` route)
- Provisioning script: `scripts/setup-vps.sh` (commit `7228ce9` for sed fix)
- Tencent Lighthouse: Firewall tab in instance detail page
