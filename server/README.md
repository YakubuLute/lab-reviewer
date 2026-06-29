# Lab Reviewer — Backend

Node.js + Express backend that powers the three AI features.

## Setup

```bash
cp server/.env.example server/.env
# Edit server/.env with real values (see comments in the file)
```

### Required environment variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Get from https://console.anthropic.com |
| `ANTHROPIC_MODEL` | Default: `claude-sonnet-4-6` |
| `PORT` | Default: `3001` |
| `SMTP_HOST` | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | e.g. `587` |
| `SMTP_USER` | Sending account email |
| `SMTP_PASS` | App-specific password (see below) |
| `MAIL_FROM_NAME` | Display name in From header |
| `MAIL_FROM_ADDRESS` | From email address |
| `CC_EMAIL` | Always CC'd on every report |

### Optional

| Variable | Description |
|---|---|
| `GITHUB_TOKEN` | Raises GitHub rate limit from 60 → 5000 req/hour. Create at https://github.com/settings/tokens (read:packages scope is enough) |

### Gmail / Outlook app-specific password

**Gmail**: Enable 2-Step Verification, then generate an App Password at
https://myaccount.google.com/apppasswords. Use that 16-char password as `SMTP_PASS`.

**Outlook/Office 365**: Use `smtp.office365.com`, port `587`. Enable SMTP AUTH on
the account. Use your account password or an app password if MFA is enabled.

## Running

```bash
# Both frontend and backend together (recommended)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client
```

## API routes

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| POST | `/api/fetch-repo` | Fetch source files from a GitHub repo |
| POST | `/api/analyze` | Analyze code + notes with Claude |
| POST | `/api/send-email` | Send the report email via SMTP |
