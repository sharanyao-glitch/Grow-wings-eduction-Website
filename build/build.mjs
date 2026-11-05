// Builds the Grow Wings website from the canvas design files.
//
//   design/pages/*.dc.html  ->  site/*.html   (pre-rendered, then hydrated in the browser)
//   design/images/*         ->  site/assets/img/
//
// Run: npm run build

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import * as preact from 'preact';
import { renderToString } from 'preact-render-to-string';
import { parseHTML } from 'linkedom';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DESIGN = path.join(ROOT, 'design', 'pages');
const IMAGES = path.join(ROOT, 'design', 'images');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'site');

const SITE_NAME = 'Grow Wings';

// Design artboard -> published file name. Order matches the canvas.
const PAGES = {
  Main: { file: 'index.html', title: 'Grow Wings | Life skills training for teams, campuses and young minds' },
  Corporates: { file: 'corporates.html', title: 'Corporate training programs' },
  Campus: { file: 'campus.html', title: 'Campus programs' },
  YoungMinds: { file: 'skills-irl.html', title: 'SkillsIRL' },
  CaseStudies: { file: 'case-studies.html', title: 'Case studies' },
  Blog: { file: 'blog.html', title: 'Blog' },
  About: { file: 'about.html', title: 'About us' },
  Contact: { file: 'contact.html', title: 'Contact' },
  Guides: { file: 'guides.html', title: 'Guides & prints' },
};
const LOADER = 'Loader';

// ---------------------------------------------------------------- helpers

const images = Object.fromEntries(
  fs.readdirSync(IMAGES).map((f) => [path.parse(f).name, f]),
);

function rewrite(text) {
  return text
    .replace(/\/_blob\/([a-f0-9]{32})/g, (m, id) => {
      if (!images[id]) throw new Error(`Missing image for blob ${id}`);
      return `assets/img/${images[id]}`;
    })
    .replace(/\b([A-Za-z]+)\.dc\.html/g, (m, name) => {
      if (!PAGES[name]) throw new Error(`Link to unknown page ${m}`);
      return PAGES[name].file;
    });
}

function decodeAttr(s) {
  return s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function parseDc(name) {
  const raw = rewrite(fs.readFileSync(path.join(DESIGN, `${name}.dc.html`), 'utf8'));
  const helmet = (/<helmet>([\s\S]*?)<\/helmet>/.exec(raw) || [, ''])[1];
  const xdc = /<x-dc>([\s\S]*?)<\/x-dc>/.exec(raw);
  if (!xdc) throw new Error(`${name}: no <x-dc> block`);
  const template = xdc[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
  const script = /<script\b([^>]*\bdata-dc-script\b[^>]*)>([\s\S]*?)<\/script>/.exec(raw);
  let defaults = {};
  if (script) {
    const dp = /data-props='([^']*)'/.exec(script[1]);
    if (dp) {
      const spec = JSON.parse(decodeAttr(dp[1]));
      for (const [k, v] of Object.entries(spec)) {
        if (k[0] !== '$' && v && 'default' in v) defaults[k] = v.default;
      }
    }
  }
  const links = [...helmet.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const styles = [...helmet.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1].trim());
  const imports = [...new Set([...template.matchAll(/<dc-import\s+name="([^"]+)"/g)].map((m) => m[1]))];
  return { name, template, logic: script ? script[2].trim() : '', defaults, links, styles, imports };
}

// ---------------------------------------------------------------- runtime (Node side)

globalThis.preact = preact;
const runtimeSrc = fs.readFileSync(path.join(SRC, 'dc-runtime.js'), 'utf8');
vm.runInThisContext(runtimeSrc, { filename: 'dc-runtime.js' });
const DC = globalThis.DC;

const parsed = {};
function load(name) {
  if (parsed[name]) return parsed[name];
  const dc = parseDc(name);
  parsed[name] = dc;
  dc.imports.forEach(load);
  const { document } = parseHTML(`<!doctype html><html><head></head><body>${dc.template}</body></html>`);
  DC.define(name, document.body, dc.logic);
  return dc;
}

function closure(name, seen = new Set()) {
  if (seen.has(name)) return seen;
  seen.add(name);
  parsed[name].imports.forEach((n) => closure(n, seen));
  return seen;
}

function describe(html) {
  for (const m of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = m[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '’').replace(/\s+/g, ' ').trim();
    if (text.length >= 60) return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')}…` : text;
  }
  return `${SITE_NAME}: life skills training for teams, campuses and young minds.`;
}

// ---------------------------------------------------------------- loader

const loader = parseDc(LOADER);
const loaderCss = loader.styles
  .map((css) => {
    const i = css.indexOf('/* ---- Grow Wings loader ---- */');
    return i >= 0 ? css.slice(i) : '';
  })
  .join('\n');

const LOADER_CHROME = `
#gw-loader{position:fixed;inset:0;z-index:1000;transition:opacity .55s ease,visibility .55s ease}
html.gw-loaded #gw-loader{opacity:0;visibility:hidden;pointer-events:none}
html.gw-seen #gw-loader{display:none}
html:not(.gw-loaded):not(.gw-seen){overflow:hidden}`;

const HEAD_SCRIPT = `try{if(sessionStorage.getItem('gw-seen')){document.documentElement.classList.add('gw-seen')}else{sessionStorage.setItem('gw-seen','1')}}catch(e){}`;

const BOOT_SCRIPT = `
document.addEventListener('submit',function(e){e.preventDefault()});
try{DC.boot()}catch(e){console.error(e)}
(function(){var d=document.documentElement,t0=Date.now();
function done(){setTimeout(function(){d.classList.add('gw-loaded')},Math.max(0,1100-(Date.now()-t0)))}
if(d.classList.contains('gw-seen')){d.classList.add('gw-loaded');return}
if(document.readyState==='complete')done();else{window.addEventListener('load',done);setTimeout(done,3500)}})();`;

// ---------------------------------------------------------------- build

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets', 'img'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets', 'js'), { recursive: true });

for (const f of Object.values(images)) {
  fs.copyFileSync(path.join(IMAGES, f), path.join(OUT, 'assets', 'img', f));
}
fs.copyFileSync(path.join(ROOT, 'node_modules', 'preact', 'dist', 'preact.min.js'), path.join(OUT, 'assets', 'js', 'preact.min.js'));
fs.copyFileSync(path.join(SRC, 'dc-runtime.js'), path.join(OUT, 'assets', 'js', 'dc-runtime.js'));

const favicon = 'assets/img/ebc6bd594dc2b99c923776fd8ef47649.png';

for (const [name, page] of Object.entries(PAGES)) {
  const dc = load(name);
  const parts = [...closure(name)];

  const links = [...new Set(parts.flatMap((n) => parsed[n].links))];
  const styles = [...new Set(parts.flatMap((n) => parsed[n].styles))];

  const Root = DC.get(name);
  const html = renderToString(preact.h(Root, dc.defaults));

  const title = name === 'Main' ? page.title : `${page.title} | ${SITE_NAME}`;
  const description = describe(html);

  const templates = parts
    .map((n) => {
      const p = parsed[n];
      const logic = p.logic.replace(/<\/script/gi, '<\\/script');
      return `<template data-dc="${n}">\n${p.template}\n</template>\n<script type="text/x-dc" data-for="${n}">\n${logic}\n</script>`;
    })
    .join('\n');

  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escAttr(title)}</title>
<meta name="description" content="${escAttr(description)}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#33999b">
<link rel="icon" type="image/png" href="${favicon}">
<link rel="apple-touch-icon" href="${favicon}">
<script>${HEAD_SCRIPT}</script>
${links.join('\n')}
<style>
${styles.join('\n\n')}
${loaderCss}
${LOADER_CHROME}
</style>
<noscript><style>#gw-loader{display:none}</style></noscript>
</head>
<body>
<div id="gw-loader">
${loader.template}
</div>
<div id="app" data-root="${name}" data-props="${escAttr(JSON.stringify(dc.defaults))}">${html}</div>
${templates}
<script src="assets/js/preact.min.js"></script>
<script src="assets/js/dc-runtime.js"></script>
<script>${BOOT_SCRIPT}</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(OUT, page.file), doc);
  console.log(`  ${page.file.padEnd(18)} ${(doc.length / 1024).toFixed(0).padStart(4)} KB  ${title}`);
}

console.log(`\nBuilt ${Object.keys(PAGES).length} pages into ${path.relative(ROOT, OUT)}/`);
