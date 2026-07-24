# Architecture Notes

## Assumptions
- MVP uses in-memory storage for users and items to keep setup simple.
- JWT secret is read from `JWT_SECRET` and falls back to a development value.
- Protected UI route is `/dashboard` and is guarded by token presence checks in the dashboard client.
- No seeded default user is included in runtime data.

## Audit Notes
- See `docs/AUDIT-1-CLARIFICATION.md` for legal review follow-up and corrective actions.

## Layer Overview
- `src/app`: Routes and API handlers.
- `src/components`: UI components split by domain (`auth`, `dashboard`, `layout`).
- `src/services`: Client-side API abstractions.
- `src/hooks`: Reusable state logic.
- `src/lib`: JWT, auth helpers, and data store.
- `src/constants`: Shared constant values.

## Authentication Design
1. `POST /api/auth/login` validates credentials.
2. Server generates JWT.
3. JWT is returned in response body for Authorization header usage.
4. JWT is also stored in `httpOnly` cookie for middleware route protection.
5. `/dashboard` requires valid cookie in middleware.
6. CRUD APIs require `Authorization: Bearer <token>`.

## CRUD Design
- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/:id`
- `DELETE /api/items/:id`

All item operations are scoped to the authenticated user from JWT payload.
