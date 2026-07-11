# North Star

North Star is an AI powered decision assistant that evaluates an opportunity
against **your own** goals, priorities, strengths, constraints, available time,
and risk tolerance — and returns a personalized **Decision Alignment Score**
(0–100). The score represents *personal fit*, not objective quality.

It does not make decisions for you. It gives you transparent, balanced reasoning
so you can think clearly.

---

## Product Overview

1. Create a personal **decision profile** (stored only in your browser).
2. Enter an opportunity: title, description, optional URL, desired outcome.
3. North Star evaluates the opportunity **against your profile** and returns:
   - Decision Alignment Score (0–100) + label
   - Confidence level
   - Overall recommendation
   - Summary
   - Why it fits
   - Potential risks
   - Tradeoffs
   - Hidden assumptions
   - Questions you may not have considered
   - One practical next step

**Score labels**

| Score | Label |
|-------|-------|
| 90–100 | Excellent Match |
| 75–89 | Strong Match |
| 60–74 | Moderate Match |
| 40–59 | Weak Match |
| 0–39 | Poor Match |

---

## Architecture

```
Browser (Next.js UI + localStorage profile)
    │  HTTPS, POST /api/evaluate (same origin)
    ▼
Next.js Route Handler on Vercel  ── validates + restrictive CORS + 16KB limit
    │  server-side fetch (EVALUATION_API_URL)
    ▼
Amazon API Gateway (POST /evaluate, throttled)
    ▼
AWS Lambda  ── validates, sanitizes, server-only system prompt
    ▼
Amazon Bedrock — Amazon Nova Lite (amazon.nova-lite-v1:0)
    │
    ▼
Amazon CloudWatch — operational metadata only (never user content)
```

- The browser **never** receives AWS credentials and **never** calls Bedrock
  directly.
- The personal profile and recent decisions live **only** in browser
  localStorage (`northstar.profile.v1`, `northstar.recent.v1`). No decision
  content is stored in AWS.

See [`docs/architecture.md`](docs/architecture.md) for detail.

### Repository layout

```
north-star/
  src/
    app/            # App Router: layout, page, api/evaluate route (proxy)
    components/     # AppShell, Sidebar, HeroPanel, ProfileForm, ProfileSummary,
                    # DecisionForm, AlignmentGauge, RecommendationPanel,
                    # DecisionReport, RecentDecisions, LoadingState, ErrorNotice
    lib/
      evaluation/   # Zod schemas, score labels, sanitize, normalize (shared)
      storage/      # localStorage profile + recent decisions
      api/          # browser client for /api/evaluate
      server/       # CORS + metadata logger
    test/           # test setup
  infra/
    template.yaml   # AWS SAM: Lambda, API Gateway, IAM, logging, throttling
    samconfig.toml  # SAM deploy defaults
    lambda/         # TypeScript Lambda (Bedrock Nova Lite integration)
  docs/             # architecture.md, design-reference.html
  prompts/          # codex-build.md
  .env.example
```

---

## Local Development

### Required software

- Node.js **18.18+** (22+ recommended)
- npm 10+
- (For infra work) AWS SAM CLI + AWS CLI

### Setup

```bash
npm install
cp .env.example .env.local   # optional; edit as needed
npm run dev                  # http://localhost:3000
```

Without `EVALUATION_API_URL` set, the UI works and the profile persists, but
evaluation returns a friendly "service not configured" message. Point it at a
deployed API Gateway URL (below) to get live Bedrock evaluations.

### Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_NAME` | Frontend | App name in UI/title |
| `EVALUATION_API_URL` | Frontend (server) | API Gateway URL the proxy forwards to |
| `BEDROCK_MODEL_ID` | Lambda | Model id (default `amazon.nova-lite-v1:0`) |
| `ALLOWED_ORIGIN` | Lambda + Vercel | Production origin for CORS |
| `LOCAL_ORIGIN` | Lambda + Vercel | Local dev origin for CORS |
| `LOG_LEVEL` | Both | Log verbosity (metadata only) |

**Never** put AWS access keys in `.env`, the repo, or the frontend.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest (unit + integration) |
| `npm run sam:validate` | `sam validate --lint` on the template |
| `npm run sam:build` / `sam:deploy` / `sam:delete` | SAM lifecycle |

---

## AWS Prerequisites

1. An AWS account with the AWS CLI configured (`aws configure`).
2. **Amazon Bedrock model access** enabled for `amazon.nova-lite-v1:0` in your
   target region (Bedrock console → *Model access* → enable Nova Lite).
3. AWS SAM CLI installed.

## AWS SAM Deployment

```bash
cd infra
sam validate --lint          # verify the template
sam build                    # bundle the TypeScript Lambda (esbuild)
sam deploy --guided          # first deploy — pick region + parameters
```

Note the stack output **`EvaluateApiUrl`** — you'll set it as
`EVALUATION_API_URL` in Vercel.

Full infra docs, parameters, Kiro steps, and a `curl` test are in
[`infra/README.md`](infra/README.md).

## Vercel Deployment

1. Push this repo to GitHub and **Import** it in Vercel (framework: Next.js —
   auto-detected).
2. In Vercel → Project → **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_APP_NAME=North Star`
   - `EVALUATION_API_URL=` → the `EvaluateApiUrl` from the SAM output
   - `ALLOWED_ORIGIN=` → your Vercel production URL (once known)
   - `LOCAL_ORIGIN=http://localhost:3000`
   - `LOG_LEVEL=info`
3. **Deploy.** Vercel gives you a production URL (e.g.
   `https://north-star.vercel.app`).

### Connect Vercel to the AWS API

The Next.js route handler `POST /api/evaluate` forwards to `EVALUATION_API_URL`
server-side, so the browser only ever talks to your Vercel origin. Set
`EVALUATION_API_URL` to the API Gateway URL and redeploy.

### Update CORS after Vercel deployment

Once you have the Vercel production URL, allow it in the backend and redeploy the
stack:

```bash
cd infra
sam deploy --parameter-overrides \
  "AllowedOrigin=https://your-app.vercel.app" \
  "BedrockModelId=amazon.nova-lite-v1:0" \
  "LocalOrigin=http://localhost:3000" \
  "LogLevel=info"
```

Also set `ALLOWED_ORIGIN` to the same value in Vercel so the proxy's CORS matches.

### Test the Bedrock endpoint

```bash
curl -sS -X POST "$EVALUATION_API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {"goals":["Grow AWS skills"],"priorities":["Learning"],
      "strengths":["Lambda"],"constraints":["8 hours/weekend"],
      "riskTolerance":"moderate","timeAvailable":"8 hours","notes":""},
    "decision": {"title":"Enter the hackathon",
      "description":"Build an AI productivity app on AWS this weekend.",
      "url":"","desiredOutcome":"Strengthen my portfolio"}
  }' | jq
```

Expect a JSON object with `alignmentScore`, `alignmentLabel`, `recommendation`,
and the reasoning arrays.

---

## Security Decisions

- **No AWS credentials in the browser.** Bedrock is reached only through Lambda.
- **Least-privilege IAM.** The Lambda role can invoke *only* the selected Bedrock
  model and write CloudWatch logs — no admin policies.
- **Server-side system prompt.** The prompt lives in the Lambda and is never
  shipped to the client.
- **Untrusted user content.** Profile and opportunity text are treated as data;
  the system prompt instructs the model to ignore embedded instructions, and
  content is delimited and control-character-stripped server-side.
- **Validation everywhere.** Zod validates the request on the proxy *and* the
  Lambda, and validates the model response before returning it. Malformed input,
  missing required fields, and oversized bodies (>16 KB) are rejected.
- **Input limits.** Title 200, description 8000, desired outcome 1500, notes 2000
  characters.
- **Restrictive CORS.** Only configured production + local origins; no wildcard.
- **HTTPS + POST only** for evaluation.
- **Throttling** at API Gateway + Lambda reserved concurrency (no custom rate
  limiter).
- **No leaked internals.** Errors return friendly messages; stack traces and AWS
  error details stay in CloudWatch.

## Privacy Decisions

- Profile and recent decisions are stored **only** in browser localStorage.
- No decision content is persisted in AWS. No DynamoDB.
- **Logs contain metadata only** — request id, timestamp, duration, outcome,
  model id, token usage. Never profile, decision, opportunity, notes, or model
  output.
- No authentication, accounts, analytics of decision content, or user tracking.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| "The evaluation service is not configured" | `EVALUATION_API_URL` is unset — set it to the API Gateway URL and redeploy. |
| 403 / "Origin not allowed" | `ALLOWED_ORIGIN` doesn't match your Vercel URL. Update it in Vercel and in the SAM stack, redeploy both. |
| 502 from the endpoint | Bedrock model access not enabled, or the model returned invalid JSON. Enable Nova Lite in the Bedrock console for your region; check CloudWatch metadata logs. |
| 504 / "took too long" | Upstream timeout. Retry; check Lambda duration and Bedrock availability. |
| `AccessDeniedException` in Lambda logs | The IAM policy model ARN/region doesn't match `BEDROCK_MODEL_ID`. Confirm the region and model id. |
| Local build can't find `sam` | Install the AWS SAM CLI; only needed for infra work. |

## Teardown

```bash
# Remove all AWS resources (Lambda, API Gateway, IAM role, log groups)
cd infra && sam delete --stack-name north-star

# Vercel: delete the project from the dashboard, or `vercel remove <project>`
```

No user data is stored in AWS, so teardown leaves nothing behind. To wipe local
data, clear the browser's localStorage for the site.

---

## Source Documents

- [`PRD.md`](PRD.md) · [`BUILD_GUIDE.md`](BUILD_GUIDE.md) ·
  [`AGENTS.md`](AGENTS.md) · [`docs/architecture.md`](docs/architecture.md) ·
  [`docs/design-reference.html`](docs/design-reference.html) ·
  [`prompts/codex-build.md`](prompts/codex-build.md)

## Scope

Intentionally small. **Not** included: authentication, user accounts, DynamoDB,
LinkedIn integration, portfolio crawling, resume parsing, RAG, vector databases,
payments, subscriptions, multi-user collaboration, agents, workflow automation,
email/calendar integration, or complex analytics.
