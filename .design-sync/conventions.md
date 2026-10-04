# NoctiLabs Brand for WEB

Brand system of noctilabs.com: warm off-white editorial pages, near-black ink, one electric blue accent, Inter display type set large and tight, Geist Mono for small uppercase labels. There is **no component library and no utility classes**: build with plain HTML/JSX and CSS that reads the tokens below via `var(--*)`. Never hard-code a hex that has a token.

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

- **Headlines:** `font-weight: 400; letter-spacing: -.045em; line-height: 1` at `--display`; h2 at `--h2` with about -.04em. Large, light, tight. Never bold headlines.
- **Kicker/nav labels:** `font-family: var(--font-mono); font-size: 12px–13px; text-transform: uppercase; letter-spacing: .01em–.04em`, usually `color: var(--muted)`.
- **Buttons:** always pills. On light: mono 12px uppercase, `padding: 9px 16px`, `background: var(--ink); color: var(--white)`, hover `--ink-hover`. On dark/photo: Inter 16px/500, `padding: 17px 30px`, solid `--white` with ink text, or ghost `box-shadow: inset 0 0 0 1px rgba(255,255,255,.7)`.
- **Focus:** keep the base `:focus-visible` outline (2px `--blue-link`). On dark backgrounds use `--white`.
- **Motion:** `transition: … .15s ease`, nothing showier.
- Flat surfaces, no drop shadows, hairline `--line` dividers. Copy is Spanish first.

## Example

```jsx
<section style={{ padding: '96px var(--edge)', maxWidth: 1200, margin: '0 auto' }}>
  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--muted)' }}>Producto</div>
  <h2 style={{ fontSize: 'var(--h2)', fontWeight: 400, letterSpacing: '-.04em', lineHeight: 1.05, margin: '12px 0 24px' }}>Software a medida</h2>
  <div style={{ background: 'var(--surface-3)', borderRadius: 'var(--radius-card)', padding: 32 }}>
    <p style={{ margin: 0, color: 'var(--body-2)' }}>…</p>
  </div>
  <a href="#" style={{ display: 'inline-block', marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', padding: '9px 16px', borderRadius: 'var(--radius-pill)', background: 'var(--ink)', color: 'var(--white)', textDecoration: 'none' }}>Hablemos</a>
</section>
```

The isotipo lives in `guidelines/mark.svg` (light) and `guidelines/mark-inverse.svg` (dark), next to the wordmark "NoctiLabs" in Inter 500, -.045em.
