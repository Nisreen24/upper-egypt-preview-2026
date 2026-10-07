/** Static Tailwind build (replaces the CDN runtime). Rebuild after editing classes: npm run css */
module.exports = { content: ["./*.html", "./*.js"], theme: { extend: {} }, corePlugins: { preflight: true } };
