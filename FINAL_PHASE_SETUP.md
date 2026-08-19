# Nexora — Final Product Phase

This archive continues the existing Phase 1 + Phase 2 project.

## Manual SQL

Run **`final_phase_schema.sql`** manually in Supabase SQL Editor. It is additive and is not executed by the application.

## Supabase Storage

The SQL creates the private `payment-proofs` bucket. Payment proof is uploaded by the server using the service-role key and is only exposed through short-lived signed URLs to authenticated admins.

## Pricing

Commercial prices are intentionally centralized in `src/config/pricing.ts` and are `null` until Nexora's final prices are approved. Do not scatter prices through UI components.

## Environment

Server-side routes require one of:
- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

and the existing public Supabase URL/anon key.

## Build validation

The working environment was unable to complete `npm install` within the available execution window, so a real `next build` could not be executed here. TypeScript/TSX syntax was independently validated with TypeScript 5.8.3 and all `page.tsx` routes contain a default export.
