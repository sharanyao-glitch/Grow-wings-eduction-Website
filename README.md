# Grow Wings website

Built from the **Grow Wings website** canvas design (9 pages + shared nav, footer and loader).

## Structure

| Path | What it is |
|---|---|
| `design/pages/*.dc.html` | The design files: **edit these to change the site** |
| `design/images/` | Photos and logos used by the design |
| `src/dc-runtime.js` | Small runtime that renders the design files (Preact) |
| `build/build.mjs` | Turns the design into static pages in `site/` |
| `site/` | **The finished website**: deploy this folder |

## Pages

`index.html` (Home) · `corporates.html` · `campus.html` · `skills-irl.html` · `case-studies.html` · `blog.html` · `about.html` · `contact.html` · `guides.html`

## Commands

```
npm install      # once
npm run build    # rebuild site/ from design/
npm run serve    # preview at http://localhost:5173
```

Each page is pre-rendered to plain HTML (fast and search-engine friendly), then made interactive in the browser (program tabs, photo stack, brochure and contact forms, blog search).

## SEO

The build adds these for `https://growwings.in` (set `SITE_URL` in `build/build.mjs` to change the domain):

- A title, description, canonical link, Open Graph and Twitter tags on each page. Descriptions come from each page's first long paragraph unless the page sets `description` in `PAGES`.
- A link-preview image, `src/og-image.png` (1200×630). It is built from `build/og-image.html` by `build/og-image.mjs`.
- Structured data on the home page: the organization's name, contact details and Pune address.
- `sitemap.xml` and `robots.txt`. After going live, submit `https://growwings.in/sitemap.xml` in Google Search Console.

## Still to wire up

- Forms (contact, brochure download, newsletter) are front-end only. They validate and show a "thanks" state but don't send anything yet. Hook them to a backend or a form service (Formspree, etc.).
- Placeholder `href="#"` links need real targets: Instagram and LinkedIn (footer), the brochure "Download PDF" buttons (Corporates, Campus), the guide and card downloads (Guides), and the blog article cards (there are no article pages yet).
