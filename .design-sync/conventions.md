# NoctiLabs Brand for WEB

Brand system of noctilabs.com: warm off-white editorial pages, near-black ink, one electric blue accent, Inter display type set large and tight, Geist Mono for small uppercase labels. There is **no JS component library**: build with plain HTML/JSX and CSS that reads the tokens below via `var(--*)`, plus the handful of shared classes listed under Idiom. Never hard-code a hex that has a token, and don't invent other class names expecting them to be styled.

## Setup

Load `styles.css` (it imports fonts, tokens and the base reset). With it, `body` already has `background: var(--bg)`, `color: var(--ink)`, Inter 16px / 1.55, and links in `--blue-link`. Without it, nothing is on-brand. Read `tokens/tokens.css` before styling, because the type scale and gutter change at **1000px**, the single breakpoint (mobile-first).

## Tokens

- **Surfaces:** `--bg` (page), `--surface`, `--surface-2`, `--surface-3` (cards, subtle fills), `--white`, `--dark` (dark sections), `--line` (1px borders/dividers).
- **Text:** `--ink` (primary), `--body-2`, `--body-3`, `--muted` (secondary, captions, kickers). Hover on ink fills: `--ink-hover`.
- **Accent:** `--blue` (brand blue, sparingly), `--blue-link` (links, focus ring), `--blue-light` (blue on dark backgrounds).
- **Glass:** `background: var(--glass); backdrop-filter: var(--glass-filter)` (the floating header capsule).
- **Type:** `--font-sans` (Inter), `--font-mono` (Geist Mono). Sizes: `--display` (hero h1), `--h2`.
- **Layout:** `--edge` (side gutter). Radii: `--radius-pill` (buttons, chips), `--radius-capsule` (header), `--radius-card` (cards, media).

## Idiom

- **Headlines:** use the shared classes. `.h1-int` is the page h1 (`--display`, weight 500, -.05em, lh .96), `.h2` is the section title (`--h2`, 500, -.045em, lh 1.02), and `.lead-hero` is the muted 17px intro under an h1. Large, tight, medium weight; never 600+. The one exception is the home hero over a photo: weight 400, -.045em, lh 1, white.
- **Kicker:** `font-family: var(--font-mono); font-size: 12px; letter-spacing: .04em; text-transform: uppercase; line-height: 1.4`, in `--muted` (`--blue-link` for emphasis). On dark panels use #7A7A80 (muted) or #9FBEFF (accent).
- **Buttons:** always pills, Inter weight 500. md is `padding: 16px 26px; font-size: 15px`, lg is `17px 30px; 16px`. Variants: dark (`--ink` bg, white text, hover `--ink-hover`), white (`--white` bg, ink text, hover `--surface-3`), and ghost-light on dark/photo (`box-shadow: inset 0 0 0 1px rgba(255,255,255,.7)`). The header CTA alone is mono 12px uppercase, `9px 16px`.
- **Panels:** CardBig is `--white` with a 1px `--line` border. DarkBig is `--dark` with `color: var(--bg)`. Both use radius `clamp(19.7px, 2.5vw, 29.5px)` and generous clamp padding (see `components/brand/Surfaces`).
- **Layout:** sections sit in a container of `max-width: 1200px; margin: 0 auto; padding: 0 var(--edge)`. A head row has the title block (flex `2 1 520px`) and a muted lead (flex `1 1 320px`), bottom-aligned with `gap: 20px 64px`.
- **Articles:** wrap long-form body in `.prose-article` (from `tokens/article.css`). It styles p, h2, lists, blockquote and `.lead`.
- `.sr-only` hides text visually but keeps it for screen readers.
- **Focus:** keep the base `:focus-visible` outline (2px `--blue-link`). On dark backgrounds use `--white`.
- **Motion:** `transition: … .15s ease`, nothing showier.
- Flat surfaces, no drop shadows, hairline `--line` dividers. Copy is Spanish first.

## Example

```jsx
<section style={{ padding: '96px var(--edge)', maxWidth: 1200, margin: '0 auto' }}>
  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>Producto</div>
  <h2 className="h2" style={{ margin: '14px 0 24px' }}>Software a medida</h2>
  <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'clamp(19.7px, 2.5vw, 29.5px)', padding: 32 }}>
    <p style={{ margin: 0, color: 'var(--body-2)' }}>…</p>
  </div>
  <a href="#" style={{ display: 'inline-block', marginTop: 24, padding: '16px 26px', fontSize: 15, fontWeight: 500, borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: 'var(--white)', textDecoration: 'none' }}>Hablemos</a>
</section>
```

The isotipo lives in `guidelines/mark.svg` (light) and `guidelines/mark-inverse.svg` (dark), next to the wordmark "NoctiLabs" in Inter 500, -.045em.
