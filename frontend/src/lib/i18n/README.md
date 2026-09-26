# Localization (Uzbek Latin)

The app is localized into Uzbek (Latin script). All user-facing strings live under
`src/lib/i18n/` as plain exported objects, grouped by feature/route — there is no
runtime locale switching yet, so this is a centralized dictionary rather than a
full i18n framework. Extend these files (or add a new one for a new feature) instead
of inlining English text in components.

## Conventions

- One file per feature/route, e.g. `nav.ts`, `dashboard.tsx` -> `dashboard.ts`.
- Each file exports one `const` object (plain strings, or functions for text with
  variables): `export const dashboardText = { title: "...", greeting: (name: string) => \`...${name}...\` }`.
- Components import only the slice(s) they need: `import { dashboardText as t } from "@/lib/i18n/dashboard"`.
- `common.ts` holds generic, reused words (Save, Cancel, Loading…, Search, etc.) —
  check there before adding a duplicate.
- `enums.ts` maps backend enum/db values (categories, ad types, booking statuses) to
  Uzbek display labels. Never change the enum/db value itself — only the label shown
  to the user. Always fall back to the raw value if a mapping is missing.
- Do NOT translate: proper names, brand/creator names, platform names (Instagram,
  TikTok, YouTube, Telegram), API/DB fields, enum values, routes, CSS classes, code.
- Uzbek Latin apostrophe: use `‘` (U+2018) for the oʻ / gʻ digraphs and other
  tutuq belgisi elisions (masalan: bo‘lish, to‘lov, ko‘proq), matching the rest of
  the app.
