---
# 📦 Pensatori Monorepo

Multi-tenant SaaS platform consisting of:
  - 🌍 **Marketing Website**
  - 🧑‍💼 **Client Portal**
  - 🎥 **Pensatori Meets (Video Meetings)**
  - ⚙️ **Convex Backend (DB + ACL + Realtime)**

Built with:
  - Next.js 14+
  - Turborepo
  - pnpm workspaces
  - Convex
  - Clerk (Auth + Organizations)
  - Stream Video
  - Vercel (multi-project deployment)
---

# 🏗 Architecture Overview

```
pensatori/
├── apps/
│   ├── marketing/      → pensatori.com
│   ├── portal/         → app.pensatori.com
│   └── meets/          → meet.pensatori.com
│
├── services/
│   └── convex/         → DB + business logic + Stream token signing
│
├── packages/
│   ├── ui/             → shared component library
│   └── shared/         → types, validators, constants
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### System Boundaries

- **Next.js apps** → UI + routing
- **Convex** → single source of truth (data + permissions)
- **Clerk** → identity + org management
- **Stream** → video infrastructure
- **Vercel** → app hosting (3 separate projects)

---

# 🚀 Getting Started

## 1️⃣ Install dependencies

```bash
pnpm install
```

---

## 2️⃣ Start development

### Run everything

```bash
pnpm dev
```

### Run only one app

```bash
pnpm --filter @pensatori/marketing dev
pnpm --filter @pensatori/portal dev
pnpm --filter @pensatori/meets dev
pnpm --filter @pensatori/convex dev
```

---

# 🔐 Environment Variables

Each app has its own `.env.local`.

## Marketing

```
NEXT_PUBLIC_SITE_URL=
```

## Portal / Meets

```
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_STREAM_API_KEY=
```

## Convex (in Convex dashboard)

```
STREAM_API_SECRET=
CLERK_JWT_ISSUER_DOMAIN=
EMAIL_PROVIDER_API_KEY=
```

⚠️ Stream secret and email keys must NEVER live in Next.js apps.

---

# 🧠 Multi-Tenancy Model

- **Client = Clerk Organization**
- Each client maps to a `clients` document in Convex
- Users have a `globalRole`:
  - `admin`
  - `staff`
  - `client`
  - `contractor`

Permissions are enforced in Convex via ACL helpers:

- `assertAdmin`
- `assertClientMember`
- `assertProjectAccess`
- `assertMeetingAccess`

No permissions are trusted from frontend.

---

# 🎥 Meetings Flow

1. Portal creates meeting → Convex creates DB record
2. Convex creates Stream call
3. User joins `/meet/:id`
4. Convex verifies ACL
5. Convex signs Stream token
6. Client joins call

All Stream tokens are issued server-side.

---

# 🧱 Monorepo Rules

## 🟢 Do

- Keep business logic in `services/convex`
- Keep UI in apps
- Keep shared types in `packages/shared`
- Use workspace imports (`workspace:*`)
- Use `transpilePackages` in Next configs

## 🔴 Don’t

- Put secrets in frontend apps
- Implement permission logic in React components
- Access Stream secret from client-side
- Duplicate lockfiles inside apps

---

# 🧪 Scripts

From root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm clean
```

Build specific app:

```bash
pnpm turbo run build --filter=@pensatori/portal...
```

---

# 🌍 Deployment (Vercel)

We deploy 3 independent Vercel projects:

| App       | Root Directory   | Domain             |
| --------- | ---------------- | ------------------ |
| Marketing | `apps/marketing` | pensatori.com      |
| Portal    | `apps/portal`    | app.pensatori.com  |
| Meets     | `apps/meets`     | meet.pensatori.com |

Each project:

- Uses same repo
- Has different Root Directory
- Uses Turbo filter in build command

---

# 🛠 Turbopack Configuration

To avoid workspace root warnings, each app sets:

```js
turbopack: {
  root: path.resolve(__dirname, "../../");
}
```

We use a single `pnpm-lock.yaml` at repo root.

---

# 🔎 Development Ports

| App       | Port |
| --------- | ---- |
| Marketing | 3000 |
| Portal    | 3001 |
| Meets     | 3002 |
| Convex    | 3210 |

---

# 📚 Core Concepts

### Client Portal

- Projects
- Contractor scoping
- Meeting scheduling
- File management

### Pensatori Meets

- Stream-powered
- Client/project/invite visibility
- Recording metadata stored in Convex

### Contact Form

- Stored in Convex
- Email triggered via Convex action
- Admin triage in portal

---

# 🔐 Security Principles

- All ACL logic lives in Convex
- Stream tokens issued only after authorization
- Secrets live only in Convex environment
- Strict security headers in Next configs
- Multi-tenant scoping always validated server-side

---

# 🧩 Tech Stack

| Layer    | Tech             |
| -------- | ---------------- |
| Frontend | Next.js 14       |
| Auth     | Clerk            |
| Backend  | Convex           |
| Video    | Stream           |
| Hosting  | Vercel           |
| Monorepo | Turborepo + pnpm |

---

# 📌 Future Improvements

- CSP hardening per app
- Rate limiting middleware
- Sentry per app
- E2E tests per workspace
- CI build caching via Turbo remote cache

---

# 👤 Maintainers

Pensatori Engineering Team

---

If you'd like, I can now:

- Make a **more polished “public-facing” README** (for GitHub)
- Or make a **developer-internal README** with stricter architecture enforcement rules
- Or add architecture diagrams embedded directly in Markdown (Mermaid-based)

Tell me the style you want:

- 🔥 Startup-polished
- 🧠 Enterprise-architect
- 🛠 Developer-heavy
- 🎯 Minimal and clean
