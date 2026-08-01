import { readFile, writeFile } from "node:fs/promises"

function replaceOnce(source, search, replacement, label) {
  const first = source.indexOf(search)
  if (first === -1) throw new Error(`Missing patch anchor: ${label}`)
  if (source.indexOf(search, first + search.length) !== -1) {
    throw new Error(`Patch anchor is not unique: ${label}`)
  }
  return source.replace(search, replacement)
}

const calculatorPath = "app/redesign-calculator.tsx"
const dashboardCssPath = "app/styles/redesign-dashboard.css"
const responsiveCssPath = "app/styles/redesign-responsive.css"
const layoutPath = "app/layout.tsx"

let calculator = await readFile(calculatorPath, "utf8")

calculator = replaceOnce(
  calculator,
  `  ExternalLink,\n  Gamepad2,\n  Github,\n  LoaderCircle,`,
  `  Download,\n  ExternalLink,\n  Gamepad2,\n  Globe2,\n  LoaderCircle,`,
  "store icon imports",
)

calculator = replaceOnce(
  calculator,
  `const EXTENSION_URL =\n  "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"\nconst GITHUB_URL = "https://github.com/ePlus-DEV/google-cloud-skills-boost-helper"\nconst ARCADE_CRAWLER_URL = "https://github.com/hoangsvit/arcade-crawler"`,
  `const CHROME_EXTENSION_URL =\n  "https://chromewebstore.google.com/detail/google-cloud-skills-boost/lmbhjioadhcoebhgapaidogodllonbgg"\nconst FIREFOX_EXTENSION_URL =\n  "https://addons.mozilla.org/addon/cloud-skills-boost-helper"`,
  "extension URLs",
)

calculator = replaceOnce(
  calculator,
  `        <div className="arcade-header-actions">\n          <a className="header-github" href={GITHUB_URL} target="_blank" rel="noreferrer">\n            <Github /> <span>GitHub</span>\n          </a>`,
  `        <div className="arcade-header-actions">\n          <a\n            className="header-store-link is-chrome"\n            href={CHROME_EXTENSION_URL}\n            target="_blank"\n            rel="noreferrer noopener"\n            aria-label="Install the extension from Chrome Web Store"\n          >\n            <Chrome /> <span>Chrome</span>\n          </a>\n          <a\n            className="header-store-link is-firefox"\n            href={FIREFOX_EXTENSION_URL}\n            target="_blank"\n            rel="noreferrer noopener"\n            aria-label="Install the extension from Firefox Add-ons"\n          >\n            <Globe2 /> <span>Firefox</span>\n          </a>`,
  "header store links",
)

calculator = replaceOnce(
  calculator,
  `      <section id="extension" className="extension-strip">\n        <span className="chrome-mark"><Chrome /></span>\n        <div>\n          <strong>Get points automatically with our Chrome extension</strong>\n          <span>One-click sync on Skills Boost · score tools · open source</span>\n        </div>\n        <a href={EXTENSION_URL} target="_blank" rel="noreferrer">\n          Install extension <ExternalLink />\n        </a>\n      </section>`,
  `      <section id="extension" className="extension-strip">\n        <span className="extension-store-mark"><Download /></span>\n        <div className="extension-copy-block">\n          <strong>Install the extension for your browser</strong>\n          <span>Automatic Arcade point tracking on Chrome and Firefox</span>\n        </div>\n        <div className="extension-store-actions">\n          <a\n            className="store-button is-chrome"\n            href={CHROME_EXTENSION_URL}\n            target="_blank"\n            rel="noreferrer noopener"\n          >\n            <Chrome /> Chrome <ExternalLink />\n          </a>\n          <a\n            className="store-button is-firefox"\n            href={FIREFOX_EXTENSION_URL}\n            target="_blank"\n            rel="noreferrer noopener"\n          >\n            <Globe2 /> Firefox <ExternalLink />\n          </a>\n        </div>\n      </section>`,
  "extension store strip",
)

calculator = replaceOnce(
  calculator,
  `              <p className="tier-note">\n                Total and remaining spots are loaded from{" "}\n                <a href={ARCADE_CRAWLER_URL} target="_blank" rel="noreferrer noopener">\n                  arcade-crawler\n                </a>{" "}\n                dataset, which is refreshed every 6 hours. Your personal queue position is not included in that data.\n              </p>`,
  `              <p className="tier-note">\n                Total and remaining spots are refreshed automatically every 6 hours. Your personal queue position is not included in the public data.\n              </p>`,
  "slot source note",
)

calculator = replaceOnce(
  calculator,
  `        <div>\n          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>\n          <a href={EXTENSION_URL} target="_blank" rel="noreferrer">Extension</a>\n        </div>`,
  `        <div className="footer-store-links">\n          <a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer noopener">\n            <Chrome /> Chrome\n          </a>\n          <a href={FIREFOX_EXTENSION_URL} target="_blank" rel="noreferrer noopener">\n            <Globe2 /> Firefox\n          </a>\n        </div>`,
  "footer store links",
)

if (/Github|GITHUB_URL|ARCADE_CRAWLER_URL|EXTENSION_URL/.test(calculator)) {
  throw new Error("GitHub or legacy extension references remain in calculator UI")
}

await writeFile(calculatorPath, calculator, "utf8")

let dashboardCss = await readFile(dashboardCssPath, "utf8")
dashboardCss = dashboardCss
  .replaceAll(".header-github", ".header-store-link")
  .replace(
    `.chrome-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:conic-gradient(#ef4444 0 33%,#facc15 0 66%,#22c55e 0);color:#fff;box-shadow:inset 0 0 0 8px #2563eb}.chrome-mark svg{width:19px;height:19px}.extension-strip > div{display:grid;gap:3px}.extension-strip strong{font-size:0.82rem}.extension-strip span{color:var(--arcade-muted);font-size:0.72rem}.extension-strip > a{min-height:39px;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:0 14px;border:1px solid rgba(139,92,246,0.42);border-radius:8px;background:rgba(55,35,112,0.2);color:#eee8ff;text-decoration:none;font-size:0.75rem;font-weight:700}.extension-strip > a:hover{background:rgba(124,58,237,0.28)}.extension-strip > a svg{width:15px;height:15px}`,
    `.extension-store-mark{display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(139,92,246,.38);border-radius:10px;background:linear-gradient(145deg,#202b55,#4c2387);color:#fff}.extension-store-mark svg{width:19px;height:19px}.extension-copy-block{display:grid;gap:3px}.extension-strip strong{font-size:0.82rem}.extension-strip span{color:var(--arcade-muted);font-size:0.72rem}.extension-store-actions{display:flex;align-items:center;gap:8px}.extension-store-actions a{min-height:39px;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:0 13px;border:1px solid rgba(139,92,246,0.34);border-radius:8px;background:rgba(55,35,112,0.18);color:#eee8ff;text-decoration:none;font-size:0.73rem;font-weight:700}.extension-store-actions a:hover{background:rgba(124,58,237,0.26)}.extension-store-actions a.is-firefox{border-color:rgba(255,145,0,.32);background:rgba(112,55,10,.16)}.extension-store-actions a.is-firefox:hover{background:rgba(160,75,8,.24)}.extension-store-actions a svg{width:15px;height:15px}.footer-store-links a{display:inline-flex;align-items:center;gap:5px}.footer-store-links svg{width:14px;height:14px}`,
  )

if (dashboardCss.includes(".chrome-mark") || dashboardCss.includes(".extension-strip > a")) {
  throw new Error("Legacy extension strip CSS remains")
}

await writeFile(dashboardCssPath, dashboardCss, "utf8")

let responsiveCss = await readFile(responsiveCssPath, "utf8")
responsiveCss = responsiveCss
  .replaceAll(".header-github", ".header-store-link")
  .replace(
    `.extension-strip > a{grid-column:1 / -1;width:100%}`,
    `.extension-store-actions{grid-column:1 / -1;display:grid;grid-template-columns:1fr 1fr;width:100%}.extension-store-actions a{width:100%}`,
  )
await writeFile(responsiveCssPath, responsiveCss, "utf8")

let layout = await readFile(layoutPath, "utf8")
layout = layout.replace(
  "check score eligibility and install the open-source Google Cloud Skills Boost Helper extension.",
  "check score eligibility and install the Google Cloud Skills Boost Helper extension for Chrome or Firefox.",
)
await writeFile(layoutPath, layout, "utf8")
