# Nexora — Phase 3

Phase 3 adds the first commerce-intelligence layer on top of the existing Phase 1 + Phase 2 systems without replacing them.

## Included

- Store analytics API: `/api/dashboard/analytics`
- Analytics dashboard: `/dashboard/analytics`
- Customer intelligence derived from existing orders: `/dashboard/customers`
- Dashboard navigation links to the new modules
- Shared Phase 3 types in `src/types/phase3.ts`

## Data model

No new database tables are required for this Phase 3 slice. Analytics and customer views are derived from the existing `orders`, `order_items`, `products`, and `store_members` data.

## Security

The analytics API uses the existing canonical server auth helpers and derives the store from the authenticated owner. It never accepts a client-supplied store id for authorization.

The customer page uses the existing Supabase client and the existing owner-scoped RLS model.

## Preserved systems

- Phase 1 business core
- Phase 2 theme/customization
- Authentication
- Subscription/payment workflows
- Support workflows
- Existing checkout/order creation
- Existing atomic order RPC and fallback
