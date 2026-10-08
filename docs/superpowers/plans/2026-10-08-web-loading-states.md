# Web loading states

Scope: implement the approved loading audit in apps/web without changing API contracts.

1. Add reusable onboarding and Auth route skeletons; keep session/redirect spinners and existing forms during refetch.
2. Add a loading mode to StatsCard for Users/Businesses and a placeholder for the Owner setup resume card.
3. Give template loading three card placeholders instead of working-hours rows.
4. Add route loading boundaries for Auth and Setup, importing feature views from thin route files.
5. Show a fixed-size map skeleton while Leaflet initializes and a small indicator for pending tiles, with terminal errors clearing pending states.
6. Verify localized loading semantics, reduced motion, delayed API responses, refetch preservation, mobile layout, Web/UI lint and tokens, typechecks, tests and production build. Do not start servers, commit, or push.
