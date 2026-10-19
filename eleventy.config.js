export default function (eleventyConfig) {
  // Self-host the Decap bundle so /admin loads no third-party script.
  eleventyConfig.addPassthroughCopy({
    "node_modules/decap-cms/dist/decap-cms.js": "admin/decap-cms.js",
  });
  eleventyConfig.addPassthroughCopy("src/admin/config.yml");
  eleventyConfig.addPassthroughCopy("src/media");
  eleventyConfig.addPassthroughCopy("src/_headers");

  eleventyConfig.addFilter("label", (code, list) => (list && list[code]) || code);

  return {
    dir: { input: "src", output: "_site" },
  };
}
