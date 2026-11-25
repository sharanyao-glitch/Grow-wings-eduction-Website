# Blog article template

`design/pages/BlogSpeakingUp.dc.html` is the template for every blog post.
It uses the site's own styles (Bricolage Grotesque + Nunito, paper / ink / teal, butter accent),
so each new article matches the rest of growwings.in.

## Page structure (top to bottom)

| # | Block | Notes |
|---|---|---|
| 1 | Reading progress bar | Thin teal bar at the very top. Automatic. |
| 2 | Breadcrumb | Home / Blog / *Category* |
| 3 | Tags | Category pill (mint) + pillar pill. Pillar colours only for Mind (`#b9e8ed`), Heart (pink), Voice (`#bba4ed`). |
| 4 | H1 + deck + byline | Byline: team, date, read time. |
| 5 | Hero image | Rounded 32px, with a floating `+1 Mind/Heart/Voice` tag. |
| 6 | "The short answer" | Butter box: the whole answer in 2–3 sentences. Search engines and AI tools quote this. |
| 7 | On this page | Left sidebar on desktop (stays in view, highlights the current section); on top on phones. Plus a small dark "Talk to us" card. |
| 8 | Intro | 2 short paragraphs. |
| 9 | Question H2s | Every H2 is a question a reader would type. Each needs an `id` that matches the contents list. |
| 10 | Comparison visual | "One meeting, two people": a muted card vs a teal-deep card. |
| 11 | Bullets with bold lead-ins | `ul.gw-bullets` |
| 12 | Mid-article CTA | Teal card, two buttons. |
| 13 | Numbered steps | `ol` of `gw-step` cards with coloured number tiles. |
| 14 | Trainer's tip | Dashed teal callout with the Grow Wings mark. |
| 15 | Interactive checklist | 7 statements, live score bar, 3 result bands, each with its own CTA. |
| 16 | The bottom line | One paragraph. |
| 17 | FAQ | Accordion. Answers stay in the HTML so Google can read them; the build turns them into FAQ structured data. |
| 18 | Share row | LinkedIn, WhatsApp, X, Copy link. |
| 19 | Closing CTA | Dark band using the pillar tagline. |
| 20 | Keep reading | 3 cards in the blog-grid style. |

Writing style: short paragraphs (1–3 sentences), bold lead-ins, numbered lists for steps,
bullets for factors, one internal link per section where it fits (`class="gw-inline"`).

## Making a new post

1. Copy `design/pages/BlogSpeakingUp.dc.html` to a new name, e.g. `BlogManagerToLeader.dc.html`
   (letters only, no dashes or numbers).
2. In the copy, edit:
   - the breadcrumb category, tags, H1, deck, date (`<time datetime="…">`) and read time;
   - the hero image (`/_blob/<image id>` for any file in `design/images/`) and its `alt` text;
   - the article copy and H2s (keep each H2's `id`);
   - in the script, `article()`: `url`, `title`, `toc` (ids + labels), `checks`, `bands`, `faqs`, `related`.
   Delete any block you don't need (comparison, steps, tip, checklist): each is self-contained.
3. In `build/build.mjs`, add an entry under `// ---- Blog articles ----`:
   ```js
   BlogManagerToLeader: {
     file: 'blog/manager-to-leader.html',      // URL: growwings.in/blog/manager-to-leader
     title: 'From manager to leader: …',
     description: 'One or two sentences for Google (under 160 characters).',
     priority: 0.6,
     article: { published: '2026-12-02', section: 'Leadership', image: '<image id>' },
   },
   ```
4. In `design/pages/Blog.dc.html`, add `href: 'BlogManagerToLeader.dc.html'` to that post's entry
   in the `all` list so its card links to the new page.
5. `npm run build`, then `npm run serve` to check it at `http://localhost:5173/blog/manager-to-leader`.

The build adds, for every article: `og:type article`, published date, and Article + Breadcrumb + FAQ
structured data. The article is also added to `sitemap.xml`.
