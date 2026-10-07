# Seamless business setup

Keep the agreed three steps: working hours, first service, booking template.
Registration and email verification remain required. Completing business details
establishes the Admin session from the verified onboarding ticket, without retaining
the password or presenting another login screen. Google follows the same setup entry.

1. Test and implement onboarding session issuance, refresh cookie, and safe profile response.
2. Adopt the returned session through the existing Admin AuthProvider.
3. Move setup pages into their own protected route group, retaining the Admin provider
   and private query cache. Use the shared BookingBase header without Dashboard chrome.
4. Center progress and step headings; keep forms wide, responsive, and keyboard accessible.
5. Preserve backend progress, skip/resume, Staff bypass, and completion to Dashboard.
6. Verify API and Web tests, lint, types, builds, UI token validation, and browser flow.

The reference's providers, multiple services, channel selection, and branding editor
are outside this change. Template previews are illustrative; this does not publish a website.

## Verification

- Web: 100 tests passed. API: 59 suites / 273 tests passed.
- Web/API lint, typecheck, and production builds passed; UI token validation passed.
  API lint reports existing warnings, with no errors.
- Real API browser smoke passed all three steps, reload, skip/resume, existing service,
  Staff bypass, error toast, keyboard template selection, and vi/en mobile layouts.
- A disposable verified Owner completed the actual two-step business form and reached
  standalone setup without a login request. Checked safe response, HttpOnly Admin
  refresh cookie, full reload, desktop, and Vietnamese mobile layout.
- Read-only independent review found no important defects in the new session handoff
  or route group. No development servers were started for these checks.

## Contact availability on blur

Username and optional phone are checked when their input loses focus, with localized
inline errors and a checking status. Both email and Google onboarding use a new
cookie-authorized contact check endpoint. The current pending Owner's own values
remain available. Before advancing or creating the Business, the form awaits these
checks; network failures block advancement and stale responses are discarded.
The final creation API still enforces uniqueness. Blank optional phone skips the check.

Verification: 102 Web tests and 277 API tests passed, including stale response,
concurrent blur/submit, unavailable contact, pending identity, and expired session.
A real API browser check verified duplicate username/phone errors on blur, correction,
successful submission, and the original session handoff. Disposable records removed.
