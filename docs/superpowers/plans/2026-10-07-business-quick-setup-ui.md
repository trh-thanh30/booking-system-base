# ONB-002 Business Quick Setup UI

Implement inline on the current branch, using the committed ONB-001 API. No additional setup steps beyond working hours, first service, and template selection.

The later seamless registration journey is documented in
`2026-10-07-seamless-business-setup.md`: setup now uses its own protected layout,
and verified email business onboarding establishes the Admin session automatically.

- Create feature views at `apps/web/src/views/admin/business-setup/` with role folders for components, hooks, constants, types and utilities.
- Use protected routes `/admin/business-setup` and `/admin/business-setup/entry`. The entry route checks backend summary after default login/Google onboarding. Explicit return destinations and direct Dashboard access remain available.
- Owner NOT_STARTED/IN_PROGRESS opens the first incomplete step. SKIPPED/COMPLETED and Staff go to Dashboard. Dashboard/Settings show an explicit resume action for incomplete Owner setup.
- Store each step through real APIs. Pin requests and query keys to the selected Business. No setup progress in local/session storage. Use existing Admin session and cache.
- Compose Design System controls, Plus Jakarta Sans and semantic tokens; use clear 3-step progress, 44px controls, responsive seven-day hours, service fields and accessible radio template selection with illustrative previews. Support vi/en, toast API errors, focus management and retry states.
- Add tests for navigation, service reuse, request scope, persistence/error contracts and rendered controls. Verify Web lint/tokens/typecheck/tests/build and UI tokens. Exercise browser flow against real API if available.

## Execution

- [x] Shared navigation allowance, scoped services, query keys and behavior tests.
- [x] Tour forms, template previews, progress, skip and resume entries.
- [x] Default post-auth entry routing without changing Auth credentials or registration contracts.
- [x] Verification and real API browser smoke.

## Verification

- Web lint and semantic token validation pass; typecheck and production build pass.
- Web tests: 99 passed. API tests: 58 suites / 271 tests passed; API build passed.
- UI `validate:tokens` passed.
- `scripts/smoke-business-setup-browser.cjs` passed against the real local API and PostgreSQL with disposable Owner/Staff/Tenant records, removed in `finally`.
- Browser coverage: interval validation, API error toast without progress changes, seven saved days and Business timezone, reload, skip preservation, resume, existing active Service reuse, template keyboard selection, completion, Staff bypass, vi/en and mobile overflow.
- Browser preflight uncovered missing `X-Tenant-Id` and `X-Business-Id` in API CORS allowed headers; both are now allowed and verified by the smoke script.
- Final review corrected stale-cache redirects on both setup entry and direct setup routes. Owners now wait for a successful fresh backend summary; regression tests cover cached completion, refetch and API failures.
- Template thumbnails are illustrative layouts; this feature saves the existing template IDs and does not publish or render a public booking website.
- Working hours now use shadcn hour/minute Select controls in 24-hour format. Service price input groups integers by vi/en locale, retains the caret while editing, and submits the unformatted integer to the API. Focused browser checks with intercepted API requests passed for both locales, including paste, middle edits, empty validation and the numeric payload.

For local browser verification, run API on port 3000 and Web on an allowed CORS origin (default port 3002). Run `node scripts/smoke-business-setup-browser.cjs`; use `FRONTEND_SMOKE_URL` to point at port 3001 instead. Screenshots are saved in the ignored `.next-setup-artifacts/` folder. Verification builds use `NEXT_DIST_DIR=.next-setup-verification` to avoid sharing cache with `next dev`.
