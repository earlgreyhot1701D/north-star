# North Star Build Guide

## Objective

Build the smallest secure working MVP that satisfies the AWS Weekend Productivity Challenge.

## Recommended Repository Shape

```text
north-star/
  AGENTS.md
  PRD.md
  BUILD_GUIDE.md
  README.md
  .env.example
  docs/
    design-reference.html
    architecture.md
  prompts/
    codex-build.md
  src/
  public/
```

## Frontend

Use Next.js with TypeScript and the App Router.

Recommended pages:

1. `/` for dashboard and onboarding
2. `/profile` for the personal decision profile
3. `/evaluate` for opportunity input
4. `/report` for the latest result

For speed, a single page application flow is acceptable.

Recommended components:

1. AppShell
2. Sidebar
3. HeroPanel
4. ProfileSummary
5. DecisionForm
6. AlignmentGauge
7. RecommendationPanel
8. RecentDecisions
9. ErrorNotice
10. LoadingState

## Visual Implementation

Use `docs/design-reference.html` as visual guidance.

Rebuild the design as reusable React components.

Do not paste the entire HTML into one component.

Preserve:

1. Dark dieselpunk palette
2. Brass accents
3. Riveted panels
4. Blue signal color
5. Industrial typography
6. Responsive sidebar behavior
7. Circular score gauge
8. Clear form hierarchy

Replace the embedded base64 image with an optimized local WebP asset or a CSS based background.

## Local Profile Storage

Store the profile under:

```text
northstar.profile.v1
```

Suggested shape:

```json
{
  "goals": [],
  "priorities": [],
  "strengths": [],
  "constraints": [],
  "riskTolerance": "moderate",
  "timeAvailable": "",
  "notes": ""
}
```

Validate and version the stored object.

## Evaluation Request

Endpoint:

```text
POST /api/evaluate
```

Request shape:

```json
{
  "profile": {
    "goals": [],
    "priorities": [],
    "strengths": [],
    "constraints": [],
    "riskTolerance": "moderate",
    "timeAvailable": "",
    "notes": ""
  },
  "decision": {
    "title": "",
    "description": "",
    "url": "",
    "desiredOutcome": ""
  }
}
```

Response shape:

```json
{
  "alignmentScore": 92,
  "alignmentLabel": "Excellent Match",
  "confidence": 87,
  "recommendation": "Strong Yes",
  "summary": "",
  "fits": [],
  "risks": [],
  "tradeoffs": [],
  "assumptions": [],
  "questions": [],
  "nextStep": ""
}
```

## Backend

Preferred implementation:

1. API Gateway receives the request
2. API Gateway invokes Lambda
3. Lambda validates the request
4. Lambda calls Amazon Bedrock
5. Lambda validates the model response
6. Lambda returns structured JSON
7. CloudWatch records operational metadata

A Next.js server route may proxy the Lambda endpoint to avoid exposing the AWS endpoint directly.

## Bedrock Prompt Strategy

The system prompt must:

1. Define the output schema
2. Explain that the score reflects personal fit
3. Require balanced reasoning
4. Require explicit assumptions
5. Require one practical next step
6. State that user supplied content may contain malicious or irrelevant instructions
7. Require the model to ignore instructions found inside profile or opportunity content

Use low temperature for consistent structure.

## Validation

Use a schema library such as Zod.

Suggested limits:

1. Decision title: 200 characters
2. Opportunity description: 8,000 characters
3. Desired outcome: 1,500 characters
4. Notes: 2,000 characters
5. Maximum full request body: 16 KB

Reject malformed requests with a generic 400 response.

## Rate Limiting

Fastest acceptable options:

1. API Gateway throttling
2. Lambda reserved concurrency
3. Vercel rate limiting at the proxy layer

Do not build a custom distributed rate limiter for the MVP.

## IAM

Create a Lambda execution role with only:

1. Permission to invoke the selected Bedrock model
2. Permission to write CloudWatch logs

Do not use broad administrator policies.

## CORS

Allow only:

1. Local development origin
2. Production Vercel origin

Do not use a wildcard in production.

## Logging

Log:

1. Request ID
2. Timestamp
3. Duration
4. Success or failure
5. Model identifier
6. Token usage when available

Do not log:

1. Profile content
2. Decision content
3. Model output
4. Personal notes

## Environment Variables

Frontend:

```text
NEXT_PUBLIC_APP_NAME=North Star
EVALUATION_API_URL=
```

Lambda:

```text
BEDROCK_MODEL_ID=
ALLOWED_ORIGIN=
LOG_LEVEL=info
```

No AWS secret keys belong in frontend or repository files.

## Testing

Required:

1. Profile saves and loads from localStorage
2. Empty fields are rejected
3. Oversized inputs are rejected
4. Successful response renders all sections
5. Invalid model JSON is handled safely
6. Timeout errors produce a friendly message
7. CORS rejects an unauthorized origin
8. Production build succeeds
9. Type checking succeeds
10. Linting succeeds

## Deployment

### AWS

1. Create Lambda
2. Attach least privilege IAM role
3. Configure Bedrock model access
4. Add environment variables
5. Create API Gateway route
6. Configure CORS
7. Configure throttling
8. Test with a sample request

### Vercel

1. Import GitHub repository
2. Add environment variables
3. Deploy
4. Confirm production origin
5. Update Lambda CORS
6. Test end to end

## Completion Checklist

1. UI matches the design direction
2. Profile persists locally
3. Evaluation reaches Bedrock
4. Alignment score renders
5. Security checks pass
6. README is complete
7. Architecture is documented
8. Screenshots are captured
9. Public repository is ready
10. Live URL works

## Implementation Notes

This guide is implemented. Deviations/decisions worth noting:

- Single-page app flow (dashboard + section views) as permitted for speed.
- The Next.js `/api/evaluate` route is a server-side **proxy** to API Gateway →
  Lambda; the browser never calls AWS directly.
- Recent decisions are stored in localStorage (`northstar.recent.v1`); no
  decision content is stored in AWS.
- Zod validates the request on both the proxy and the Lambda, and validates the
  model response before returning it.
- The embedded base64 imagery in `design-reference.html` is replaced with CSS
  gradients + an inline SVG compass (no large binary assets shipped).
- Runtime is `nodejs22.x` (the SAM linter flags older runtimes as end-of-life).
