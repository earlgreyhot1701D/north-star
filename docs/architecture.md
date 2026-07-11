# Architecture Overview

## Request Flow

```text
User Browser (Next.js UI)
    |  Personal profile + recent decisions stored in localStorage
    |
    |  HTTPS  ·  POST /api/evaluate (same origin)
    v
Next.js Route Handler on Vercel
    |  - Restrictive CORS (configured origins only)
    |  - 16 KB body limit, control-char sanitize, Zod validation
    |  - Server-side fetch to EVALUATION_API_URL
    v
Amazon API Gateway  (POST /evaluate, throttled)
    |
    v
AWS Lambda
    |  - Re-validates + sanitizes the request (Zod)
    |  - Applies the SERVER-ONLY system prompt
    |  - Treats profile/opportunity as untrusted data
    v
Amazon Bedrock — Amazon Nova Lite (amazon.nova-lite-v1:0)
    |  - Low temperature for structured output
    |  - Response parsed + Zod-validated; label reconciled to score band
    v
Amazon CloudWatch  (operational metadata only)
```

Both the proxy and the Lambda validate the request, and both validate the model
response before it reaches the browser (defense in depth).

## Storage

- The personal decision profile is stored in browser localStorage under
  `northstar.profile.v1`.
- Recent decisions are stored in browser localStorage under
  `northstar.recent.v1` (capped, newest first).
- **No decision content is stored in AWS.** No database.

## Monitoring

AWS Lambda and API Gateway write operational metadata to Amazon CloudWatch:
request id, timestamp, duration, success/failure, model id, and token usage when
available.

Profile content, opportunity content, personal notes, and model output are
**never** logged.

## Security Boundaries

1. The browser never receives AWS credentials.
2. The browser never calls Bedrock directly — only the same-origin Next.js proxy.
3. The Lambda uses least-privilege IAM: `bedrock:InvokeModel` on the selected
   model plus CloudWatch Logs. No admin policies.
4. API Gateway applies throttling; the Lambda uses reserved concurrency.
5. CORS allows configured origins only — no wildcard in production.
6. The Lambda validates requests and model responses, and returns friendly
   errors without stack traces or AWS error details.
7. The system prompt is server-side only and instructs the model to ignore
   instructions embedded in user-supplied content.

## Components (frontend)

`AppShell` · `Sidebar` · `HeroPanel` · `ProfileForm` · `ProfileSummary` ·
`DecisionForm` · `AlignmentGauge` · `RecommendationPanel` · `DecisionReport` ·
`RecentDecisions` · `LoadingState` · `ErrorNotice`

The dieselpunk design from `design-reference.html` is rebuilt as these reusable
components; the reference's embedded base64 imagery is replaced with CSS
gradients and an inline SVG compass.
