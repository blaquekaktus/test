// Test 2 timer: seconds from the latest commit on the branch to the moment the
// live site serves a build of that commit.
//
//   node scripts/time-deploy.mjs https://feasibility-test.<account>.workers.dev
//
// Run it right after pressing Publish in /admin. Reads the commit from the public
// GitHub API and the built commit from <meta name="build-commit"> on the home page.

const site = process.argv[2];
const repo = process.argv[3] || "blaquekaktus/test";
const branch = process.argv[4] || "test-site";
if (!site) {
  console.error("Usage: node scripts/time-deploy.mjs <site-url> [owner/repo] [branch]");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const res = await fetch(`https://api.github.com/repos/${repo}/commits/${branch}`, {
  headers: { Accept: "application/vnd.github+json", "User-Agent": "time-deploy" },
});
if (!res.ok) throw new Error(`GitHub API ${res.status}`);
const commit = await res.json();
const sha = commit.sha;
const committedAt = new Date(commit.commit.committer.date);
console.log(`Commit ${sha.slice(0, 7)} at ${committedAt.toISOString()}: ${commit.commit.message.split("\n")[0]}`);

const deadline = Date.now() + 20 * 60 * 1000;
while (Date.now() < deadline) {
  const page = await fetch(`${site.replace(/\/$/, "")}/?t=${Date.now()}`, { cache: "no-store" })
    .then((r) => r.text())
    .catch(() => "");
  const live = (page.match(/name="build-commit" content="([^"]+)"/) || [])[1];
  if (live === sha) {
    const seconds = Math.round((Date.now() - committedAt.getTime()) / 1000);
    console.log(`Live after ${seconds} s (${(seconds / 60).toFixed(1)} min)`);
    process.exit(0);
  }
  await sleep(5000);
}
console.log("Not live after 20 minutes.");
process.exit(2);
