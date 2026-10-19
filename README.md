# Feasibility test kit

Throwaway site for the four go/no-go tests. No client data, no secrets in the repo.

- Eleventy 3.1.7 builds `src/` into `_site/`.
- Decap CMS 3.17.1 at `/admin`, self-hosted (`/admin/decap-cms.js`), GitHub backend, branch `test-site`.
- GitHub login helper in `oauth/github.js`, used by either host:
  - Workers static assets: `worker.js` + `wrangler.jsonc` (only `/auth` and `/callback` run code).
  - Pages Functions: `functions/auth.js`, `functions/callback.js`.
- Contact form posts to Web3Forms. The key comes from the build variable `WEB3FORMS_KEY`.

## Setup (Sonja, about 20 minutes)

Do not paste any secret or password into the chat.

1. **Cloudflare project.** Pick one route.
   - **Workers (Cloudflare's advice for new projects):** Workers & Pages → Create → Import a repository → `blaquekaktus/test`.
     Name: `feasibility-test` (matches `wrangler.jsonc`). Build command: `npm run build`. Deploy command: `npx wrangler deploy`.
     Production branch: `test-site`.
   - **Pages:** Workers & Pages → Create → Pages → Connect to Git → `blaquekaktus/test`.
     Production branch: `test-site`. Build command: `npm run build`. Output directory: `_site`.
   Note the site address it gives you (`https://….workers.dev` or `https://….pages.dev`).
2. **GitHub OAuth app** (signed in as `blaquekaktus`): Settings → Developer settings → OAuth Apps → New OAuth App.
   Homepage URL: the site address. Callback URL: the site address + `/callback`. Create a client secret.
3. **Secrets in Cloudflare:**
   - Workers: Worker → Settings → Variables and Secrets → add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`, both as type *Secret*.
   - Pages: Settings → Variables and Secrets → add the same two; mark the client secret as encrypted.
4. **Web3Forms:** on web3forms.com, enter the test inbox address. The access key arrives by email.
   Add it as `WEB3FORMS_KEY`: Workers → Settings → Build → Variables; Pages → Variables and Secrets. Then retry the latest build.
5. **Test editor account:** in `blaquekaktus/test` → Settings → Collaborators, invite the new GitHub account. Accept the invite while signed in as that account.

Then send Claude the site address.

## The four tests

Use a private browser window signed in to GitHub as the **new** account.

1. **Login and edit.** Open `<site>/admin/` → Login with GitHub → approve → open *Test listing* → change the price → Publish.
   Write down every step that was unclear. Note the access GitHub asks for on the approval screen.
2. **Publish to live, three times.** Change the description and Publish. Claude times it from the commit to the live page,
   or run `npm run time-deploy -- <site>` yourself straight after Publish.
3. **Photos.** Add photos to the listing: one large phone photo (JPEG), one PNG, one GIF, and one HEIC from an iPhone if you have one.
   Publish. Claude checks size and format of what reached the repo.
4. **Form.** Send the form at `<site>/contact/`. Check the test inbox and its spam folder.
