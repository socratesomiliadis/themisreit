# @pensatori/meet

Meeting app for Pensatori staff and clients.

## Features

- Instant meetings
- Scheduled meetings
- Invite links
- Guest join without Clerk sign-in
- Stream Video rooms with Convex-issued tokens

## Required Environment Variables

### `apps/meet/.env.local`

```bash
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

### Convex environment (`services/convex` deployment)

```bash
STREAM_API_KEY=
STREAM_API_SECRET=
CLERK_JWT_ISSUER_DOMAIN=
```

## Local Development

```bash
pnpm --filter @pensatori/meet dev
```

Routes:

- `/` dashboard (auth required)
- `/join/:inviteCode` guest/auth invite entry
- `/room/:callId` video room
