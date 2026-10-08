# Setup completion screen

Approved scope: show a completion screen after saving the three setup steps, without claiming the booking website is published. Keep the existing three-step flow and existing API contracts.

- Render completion within the standalone setup view when an accepted Owner summary reports `COMPLETED`. Skip and normal login entry still go to Dashboard.
- Remove the tour's automatic Dashboard redirect for completion to avoid racing the new screen.
- Show business name, the saved nail template preview when applicable, and an explicit demo notice. Include a localized demo link and a single centered primary button to Dashboard, per the user's updated preference.
- Historical template IDs must not display the nail preview. Protect against stale summaries when switching businesses.
- Verify vi/en rendering, completed versus skipped navigation, reload, and mobile overflow with browser mocks; run Web tests and styling checks.
