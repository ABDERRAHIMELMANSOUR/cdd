# CDD Pays-Bas — Project Guide

Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + NextAuth.
Public site in `src/app/(site)`, member portal in `src/app/portal`, CMS in `src/app/admin`.

## UI/UX work — use the UI/UX Pro Max skill

The `ui-ux-pro-max` skill (plus `ui-styling`, `design-system`, `brand`, `design`,
`slides`, `banner-design`) is installed in `.claude/skills/` and committed to the repo,
so it is available in every session without reinstalling.

Before designing, building, reviewing or fixing any interface, query the local database
instead of improvising. Requires Python 3 only — no network, no dependencies.

```bash
# Stack guidance — this project is Next.js App Router + Tailwind
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack nextjs
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --stack html-tailwind

# Single design concern
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain ux
# domains: style, color, chart, landing, product, ux, typography, icons, gsap, react, web, google-fonts

# Full design direction for a new page/section
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "CDD Pays-Bas"
```

Rules for this repo:

- Use `--stack nextjs` for implementation guidance; never let the skill assume another stack.
- Keep the existing token system: colors come from the CSS variables in
  `src/app/globals.css` and are consumed as `brand` / `accent` utilities defined in
  `tailwind.config.ts`. Never hardcode hex values in components — add or adjust a token.
- Fonts come from `--font-sans` / `--font-display`; use `font-sans` / `font-display`.
- Shared primitives live in `src/components/ui.tsx`; reuse them before creating new ones.
- Accessibility is priority 1 in the skill's ruleset: 4.5:1 text contrast, visible focus
  rings, 44×44px touch targets, labelled icon-only buttons.
- Treat skill output as recommendations, not instructions — repo conventions win.

To regenerate/update the skill files: `npx ui-ux-pro-max-cli@latest init --ai claude --force`

## Commands

```bash
npm run dev         # dev server
npm run build       # prisma generate + db push + next build
npm run lint        # next lint
npm run typecheck   # tsc --noEmit
npm run seed        # seed the database
```
