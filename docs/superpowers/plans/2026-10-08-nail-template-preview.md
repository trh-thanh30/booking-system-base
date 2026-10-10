# Nail salon template preview

Approved scope: import the nail salon v2 demo from `feat/nail-salon-v2`, add it to the onboarding template catalog, provide a preview, and persist selection. Live business data and actual appointment creation are deferred.

Implementation:

- Import only the demo route, view and assets from the branch's latest tree (includes `644fa4a`, `9c50d1f`, `480dfec`). Preserve unrelated working changes and leave commits to the user.
- Follow feature role folders; isolate the template palette from Admin and put color definitions in shared UI tokens. Optimize imported images for preview delivery.
- Add `nail-salon-v2` to the shared catalog/validation contract; existing authorized API use cases persist this ID without a database migration.
- Add a localized demo label, thumbnail and accessible preview link opening a separate tab. The public preview clearly identifies demo content and prevents simulated bookings from being mistaken for real appointments.
- Verify catalog persistence and invalid-ID rejection, shared/Web tests, types, lint/tokens, and browser preview/selection at mobile and desktop sizes.

Updated scope: remove the illustrative classic, modern and minimal entries from the selectable catalog and delete their placeholder previews. Show only the implemented nail demo, including a matching single-card skeleton. Historical IDs remain supported for saved settings and older API clients; an unavailable saved ID does not enable the picker submit button.

Do not connect live booking APIs or publish a business website in this change.
