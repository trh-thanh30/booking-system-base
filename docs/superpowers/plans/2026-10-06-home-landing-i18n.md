# Home Landing i18n Implementation Plan

> **For agentic workers:** Execute this plan inline, task by task, using executing-plans. Track steps with checkboxes. Do not commit or push unless the user explicitly requests it.

**Goal:** Home landing displays Vietnamese at `/vi` and English at `/en`, including interactive states and demo content.

**Architecture:** Reuse next-intl and the existing per-locale JSON files. Place Home copy under `landing_page_home`, with a namespace for each section. Components translate text; static data keeps stable identifiers, icons, images, numbers and translation keys. Use ICU messages for counts and rich messages for highlighted headings.

**Tech Stack:** Next.js App Router, React, TypeScript, next-intl, existing Node test runner and browser verification.

## Constraints

- Scope: the sections rendered by `src/views/home/home.view.tsx` and their children. Unmounted legacy sections, Admin and Nail/Barber templates are outside this task.
- Support only existing `vi` and `en`; do not change locale routing or introduce a translation service.
- Namespace is exactly `landing_page_home`; section keys: `navigation`, `hero`, `pillars`, `industrySolutions`, `features`, `customization`, `pricing`, `faq`, `footer`, `metadata`.
- Keep the existing locale JSON files. Adding another language later means adding the same key structure in its locale file; do not put locale branches in components.
- Preserve design tokens, images, animations, IDs, anchors, plan prices and pricing calculations.
- Keep brand names, proper names, product identifiers and currency codes where translation is unnecessary. Translate explanatory demo copy.
- Shared Navigation translations remain shared; do not remove keys consumed by other views. Home-specific menu copy belongs in the new namespace.
- Do not use translated labels as React keys, selected values, carousel indices or navigation state identifiers.
- Follow role folders for new supporting files. Page components remain server components.
- Current branch: `fix/enhance-home-view-1`. Preserve the unrelated untracked file `read`.
- No automatic commits, branch changes or pushes.

## Task 1: Establish the namespace and translation coverage checks

**Files:**

- Modify: `apps/web/src/messages/en.json`, `apps/web/src/messages/vi.json`.
- Create: `apps/web/test/home-landing-messages.spec.mjs`.
- Inspect: `apps/web/src/i18n/request.ts`, `apps/web/test/run.mjs`.

- [ ] Inventory rendered content in Home and its children, including dialog, hover, toast, alt and aria text. Map it to the section namespaces above.
- [ ] Add the namespace to both JSON files, preserving unrelated namespaces. Populate English with current copy and Vietnamese with natural equivalents.
- [ ] Add an executable test that recursively collects leaf paths from both namespace objects, asserts equal key sets, and rejects empty string leaves.
- [ ] Compare ICU argument names and rich-tag names across matching messages so interpolations remain compatible. Exclude escaped ICU syntax when extracting arguments; use the installed ICU parser if available rather than a naive brace regex.
- [ ] Run `pnpm --filter @repo/web test`. The new spec is automatically discovered by `test/run.mjs`.

Example structure and component interface:

```json
{
  "landing_page_home": {
    "hero": {
      "title": "One platform for <highlight>every business</highlight>",
      "getStarted": "Get started"
    }
  }
}
```

```tsx
const t = useTranslations("landing_page_home.hero");
t.rich("title", {
  highlight: (chunks) => <span className="text-primary">{chunks}</span>,
});
```

**Acceptance:** Both locales have identical message keys; existing JSON namespaces and request loading remain valid. Later tasks consume `useTranslations("landing_page_home.<section>")`.

## Task 2: Translate navigation and Hero

**Files:**

- Modify: `apps/web/src/views/home/sections/header.tsx`.
- Modify: `apps/web/src/views/home/constants/home.constants.ts` (only active navigation records).
- Modify: `apps/web/src/views/home/sections/hero/HeroSection.tsx`.
- Modify: `apps/web/src/views/home/sections/hero/components/TemplateCard.tsx`.
- Modify: `apps/web/src/views/home/sections/hero/data/hero.data.ts`.
- Modify: `apps/web/src/views/home/sections/hero/types/hero.types.ts`.
- Modify: the two locale JSON files.

- [ ] Translate desktop/mobile menu labels, submenu descriptions and Home-specific actions. Keep shared open/close/skip translations where already appropriate.
- [ ] Use stable menu IDs for dropdown state and React keys before translating labels.
- [ ] Translate Hero heading with rich text, subtitle, buttons, assurances, industry labels and card demo descriptions.
- [ ] Replace translatable card data values with message keys resolved by TemplateCard; retain names, images, rating values and IDs.
- [ ] Use next-intl formatting for displayed ratings/review counts; do not embed rendered JSX into JSON.
- [ ] Verify both locales: dropdowns, mobile menu, Hero cards and links still work after locale navigation.

**Acceptance:** Header/Hero switch language together; card descriptions do not remain English on `/vi`; highlighted headings retain their style.

## Task 3: Translate Pillars and industry solutions

**Files:**

- Modify: `apps/web/src/views/home/sections/pillars/PillarsSection.tsx`.
- Modify: `apps/web/src/views/home/sections/pillars/data/pillars.data.ts`.
- Modify: `apps/web/src/views/home/sections/pillars/types/pillars.types.ts`.
- Modify: `apps/web/src/views/home/sections/industry-solutions/IndustrySolutionsSection.tsx`.
- Modify: `apps/web/src/views/home/sections/industry-solutions/data/industry-solutions.data.ts`.
- Modify: `apps/web/src/views/home/sections/industry-solutions/types/industry-solutions.types.ts`.
- Modify: the two locale JSON files.

- [ ] Translate headings, pillar text, labels and the rendered biography/demo copy.
- [ ] Give industry text stable keys: label, badge, title, description and highlight title/description. Keep icons/images separate from messages.
- [ ] Translate setup CTA using one ICU argument, e.g. `Explore {industry} setup`, so Vietnamese can reorder words.
- [ ] Translate image alt and previous/next button aria labels.
- [ ] Verify selection by index still works: click tabs, swipe cards, resize desktop to mobile with the last industry selected, then switch locale.

**Acceptance:** All five industries and their controls are translated; tab/card synchronization and complete focus outlines remain intact.

## Task 4: Translate features and customization demos

**Files:**

- Modify: `apps/web/src/views/home/sections/features/BentoFeaturesSection.tsx`.
- Modify: `apps/web/src/views/home/sections/features/constants/bento-features.constants.ts`.
- Modify: `apps/web/src/views/home/sections/customization/CustomizationSection.tsx`.
- Modify: the two locale JSON files.

- [ ] Translate main headings, focus-dashboard explanation, feature tabs, feature names/descriptions, CTA and the trailing “and more” message.
- [ ] Keep group IDs `core`, `business`, `client`; replace hardcoded labels/descriptions with translation keys.
- [ ] Remove assumptions that a tab label always has exactly two English words. Provide explicit locale-specific label parts only where the two-line mobile design needs them.
- [ ] Use `t.rich()` for colored heading fragments; let each locale control phrase order without sentence concatenation.
- [ ] Translate customization mockup content, including reviews, video copy, FAQ entries and action buttons. Preserve proper names and logos.
- [ ] Verify all three feature groups at desktop/mobile, including animated transitions and four/eight-card limits.

**Acceptance:** Tabs and hover descriptions use the current locale; Vietnamese headings/tabs stay readable without changing the established layout.

## Task 5: Translate Pricing and its interactive content

**Files:**

- Modify: `apps/web/src/views/home/sections/pricing.tsx`.
- Create if needed: `apps/web/src/views/home/sections/pricing/constants/pricing.constants.ts`, `types/pricing.types.ts`, `utils/pricing.utils.ts` for supporting data/types/formatting extracted from this section.
- Modify: the two locale JSON files.

- [ ] Translate section copy, plan explanations, billing labels, feature lists, tooltips, CTA, comparison groups/rows and dialog content.
- [ ] Translate confirmation/error toast text and social-proof wording. Use ICU arguments for business counts, ratings, reviews and savings rather than joining fragments.
- [ ] Preserve plan IDs, amounts, currency selection, discounts and billing state. Locale selection does not automatically select VND or change a price.
- [ ] Format display values with the current locale and selected currency, using explicit fraction settings to preserve the current product's precision policy.
- [ ] Keep any supporting extraction limited to code touched for translation; do not refactor unrelated pricing behavior.
- [ ] Verify both locales, monthly/annual switching, each existing currency option, comparison dialog and CTA actions.

**Acceptance:** Visible and interactive pricing copy is localized; the same plan/currency/billing combination has unchanged numeric values.

## Task 6: Translate FAQ and Footer

**Files:**

- Modify: `apps/web/src/views/home/sections/faq.tsx`.
- Modify: `apps/web/src/views/home/sections/footer.tsx`.
- Modify: `apps/web/src/views/home/constants/home.constants.ts` if these rendered sections consume its records.
- Modify: the two locale JSON files.

- [ ] Translate FAQ headings, questions, answers and contact actions.
- [ ] Translate Footer links, descriptions, legal text and accessible labels; retain BookingBase watermark, product names and destinations.
- [ ] Use rich messages for inline links/emphasis in long answers; do not store raw HTML or split complete sentences around translated fragments.
- [ ] Verify accordion open/close, footer links and locale navigation.

**Acceptance:** FAQ/Footer are translated; anchors and links retain their current targets.

## Task 7: Localize Home metadata and audit hidden text

**Files:**

- Modify: `apps/web/app/[locale]/(marketing)/page.tsx`.
- Modify: `apps/web/src/views/home/home.view.tsx` only if Home-specific accessible copy remains.
- Modify: the two locale JSON files.
- Inspect: `apps/web/src/config` and existing marketing metadata patterns before adding metadata.

- [ ] Add server-side `generateMetadata` using `getTranslations` for `landing_page_home.metadata` with the route locale; keep Page rendering HomeView without `"use client"`.
- [ ] Reuse existing public-origin configuration for any absolute metadata URLs; do not hardcode a domain in the page.
- [ ] Audit rendered sections for remaining alt, title, aria-label, placeholder, hover, modal, disabled/loading and toast text.
- [ ] Confirm that brand names, IDs and unmounted legacy sections are not misclassified as untranslated copy.
- [ ] Verify title/description in `/vi` and `/en`; check for missing-message console errors.

**Acceptance:** Metadata and non-obvious UI text use the selected language; no Admin provider is introduced into marketing.

## Task 8: Verify translation coverage, responsive behavior and diff

**Files:**

- Extend: `apps/web/test/home-landing-messages.spec.mjs` for any content arguments introduced by completed tasks.
- Inspect: `apps/web/test/landing-locale.spec.mjs` (existing switch behavior).
- Inspect: all changed Home and message files through `git diff`.

- [ ] Run `pnpm --filter @repo/shared build` before checks when its dist is stale.
- [ ] Run `pnpm --filter @repo/web lint`, `pnpm --filter @repo/web check-types`, `pnpm --filter @repo/web test`, and `pnpm --filter @repo/web build`.
- [ ] Run `pnpm --filter @repo/ui validate:tokens` and `git diff --check`.
- [ ] If a user dev server is running, isolate the build using the existing `NEXT_DIST_DIR` support and restore Next-generated tracked-file changes after verification.
- [ ] Browser-check `/vi` and `/en` at 375, 768 and 1440px. Switch locale through the existing selector; verify URL/query/hash behavior, selected language and visible copy.
- [ ] Check wrapping in Hero/feature headings, mobile tabs/CTA, pricing social proof and industry pills; no unintended horizontal page overflow.
- [ ] Verify hidden content after interactions, including feature descriptions, FAQ answers, pricing dialogs and notifications.
- [ ] Review `git diff`: no token changes, Admin/template edits, dead keys, locale conditionals or automatic commits. Record unrelated baseline failures separately.

**Acceptance:** Both locales work end to end, checks pass or have an explicit independently verified baseline limitation, and the diff contains only the approved Home translation scope.

## Execution order

1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Review the result of each task before progressing. No new package, translation backend or locale is required.
