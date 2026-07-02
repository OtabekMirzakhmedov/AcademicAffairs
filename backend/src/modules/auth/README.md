# auth

JWT authentication. Issues an access token (`JWT_EXPIRES_IN`, default 30m) and a refresh token (`JWT_REFRESH_EXPIRES_IN`, 7d — or `JWT_REFRESH_EXPIRES_IN_REMEMBER_ME`, 30d, when `rememberMe: true` on login).

## Endpoints
- `POST /auth/login` — body: `{ login, password, rememberMe? }`. Returns tokens + user (with `role`, `mustChangePassword` flag).
- `POST /auth/refresh` — body: `{ refreshToken }`. Returns a new access token.
- `POST /auth/logout` — server-side token invalidation (if implemented as a deny-list).
- `POST /auth/change-password` — body: `{ currentPassword, newPassword }`. Clears `mustChangePassword`.
- `GET /auth/profile` — returns the current user with relations.

## Gotchas
- Newly-seeded and admin-created users have `mustChangePassword: true`. The frontend redirects to the change-password page when this is set; honour the flag if writing new clients.
- `JwtAuthGuard` is the default. Endpoints that must skip it use `@Public()`.
- `RolesGuard` + `@Roles('admin', 'departmenthead', ...)` enforces RBAC; see `glossary.md` for role values.

## Related
- `users` for user creation.
- `docs/api-examples.md#auth` for curl examples.
