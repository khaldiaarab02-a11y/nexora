# Nexora

Nexora is a multi-store e-commerce engine for creating professional online stores for small businesses.

## Current phase

Foundation only.

Included:
- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint
- Scalable multi-store folder structure

Not included yet:
- Database
- Authentication
- Products
- Orders
- Payments
- Dashboard functionality

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```


## Phase 2 — Themes + Store Customization

Run `theme_system_schema.sql` manually in Supabase before testing theme persistence. The application falls back to Minimal when no theme row exists.
