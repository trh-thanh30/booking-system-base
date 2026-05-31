# Telegram CI/CD Notifications

This repo ships a reusable Telegram notification package at `packages/telegram`.

## Modes

- `text` sends a Telegram `sendMessage` payload with `parse_mode: HTML`.
- `image` renders a styled PNG card and sends it with `sendPhoto`.
- `both` sends the HTML message and the PNG card.

Telegram does not render arbitrary CSS or Tailwind classes inside normal text messages. For rich styling, use `image` or `both`.

## Required Environment Variables

- `CI_TELEGRAM_BOT_TOKEN` - bot token from BotFather.
- `CI_TELEGRAM_CHAT_ID` - target chat, group, channel, or supergroup id.

Only those two values are required. Store them as GitHub Actions repository secrets:

- `CI_TELEGRAM_BOT_TOKEN`
- `CI_TELEGRAM_CHAT_ID`

All CI metadata is passed as CLI flags from the workflow.

## CLI Usage

```bash
pnpm notify:telegram \
  --event deploy \
  --status success \
  --mode both \
  --project booking-system-base \
  --environment production \
  --repository owner/repo \
  --branch main \
  --commit abc123def \
  --message "Deploy production" \
  --author thanh \
  --duration 2m10s \
  --dashboard-url https://example.com
```

Preview without sending:

```bash
pnpm notify:telegram --dry-run --mode image --status failed
```

Render a GitHub Actions-style text message:

```bash
pnpm notify:telegram \
  --dry-run \
  --mode text \
  --event ci \
  --status success \
  --project booking-system-base \
  --repository booking-system-base\
  --branch feat/admin \
  --commit 382d886 \
  --message "feat: Introduce Admin, Feedback, and Notification modules" \
  --author trh-thanh30 \
  --workflow CI \
  --job "Build & Type Check & Test & Lint" \
  --duration 62.00s \
  --passed 1
```

Dry-run writes:

- `telegram-notification.preview.html`
- `telegram-notification.preview.png`
