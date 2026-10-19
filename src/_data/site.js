// Build-time values. Nothing here is secret: the Web3Forms key is public by design
// (docs.web3forms.com FAQ), but it is read from a build variable so it is not committed.
export default {
  title: "Feasibility test",
  web3formsKey: process.env.WEB3FORMS_KEY || "",
  // Commit the build ran on, set by Workers Builds. Used by scripts/time-deploy.mjs.
  commit: process.env.WORKERS_CI_COMMIT_SHA || "local",
  builtAt: new Date().toISOString(),
};
