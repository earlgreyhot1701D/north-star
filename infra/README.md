# North Star — AWS SAM Infrastructure

Deployable infrastructure for the North Star evaluation backend. One Lambda
function behind a single `POST /evaluate` API Gateway endpoint, calling Amazon
Bedrock (Nova Lite). Least-privilege IAM, CloudWatch logging, configurable CORS,
and API throttling.

> This infrastructure is **not deployed** by the repository. Review and deploy it
> yourself with Kiro or the AWS SAM CLI.

## Files

- `template.yaml` — SAM template (Lambda, API Gateway, IAM, logging, throttling).
- `samconfig.toml` — default deploy parameters (stack name, region, overrides).
- `lambda/` — TypeScript Lambda source (bundled at build time via esbuild).

## Prerequisites

- AWS account with Amazon Bedrock **model access enabled** for `amazon.nova-lite-v1:0`
  in your target region (Bedrock console → Model access).
- AWS CLI credentials configured (`aws configure`).
- AWS SAM CLI installed.
- Node.js 22+ (SAM uses esbuild to bundle the function).

## Parameters

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `BedrockModelId` | `amazon.nova-lite-v1:0` | Model used for evaluation |
| `AllowedOrigin` | _(empty)_ | Production origin for CORS (set after Vercel deploy) |
| `LocalOrigin` | `http://localhost:3000` | Local dev origin for CORS |
| `LogLevel` | `info` | Lambda log verbosity (metadata only) |
| `ThrottleRateLimit` | `5` | Steady-state requests/sec |
| `ThrottleBurstLimit` | `10` | Burst capacity |
| `ReservedConcurrency` | `5` | Reserved concurrent executions |
| `LogRetentionDays` | `14` | CloudWatch retention |

## Deploy (SAM CLI)

```bash
cd infra

# Validate
sam validate --lint

# Build (bundles the TypeScript Lambda with esbuild)
sam build

# First deploy — guided (prompts for region + parameters)
sam deploy --guided

# Subsequent deploys
sam deploy
```

After deploy, note the `EvaluateApiUrl` output. Set it as `EVALUATION_API_URL`
in Vercel.

### Redeploy with the production origin

Once Vercel gives you a production URL, redeploy so CORS allows it:

```bash
sam deploy --parameter-overrides \
  "AllowedOrigin=https://your-app.vercel.app" \
  "BedrockModelId=amazon.nova-lite-v1:0" \
  "LocalOrigin=http://localhost:3000" \
  "LogLevel=info"
```

## Deploy (Kiro)

1. Open this repository in Kiro.
2. Point Kiro at `infra/template.yaml`.
3. Review the plan: one Lambda, one API Gateway REST API with a `POST /evaluate`
   method, one execution role scoped to `bedrock:InvokeModel` on the selected
   model plus CloudWatch Logs, throttling on the stage, and log groups with
   retention.
4. Supply parameters (`AllowedOrigin`, region, model id).
5. Approve and deploy. Kiro drives the same CloudFormation change set as
   `sam deploy`.

## Test the endpoint

```bash
curl -sS -X POST "$EVALUATION_API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "goals": ["Grow AWS skills"],
      "priorities": ["Learning"],
      "strengths": ["Lambda"],
      "constraints": ["8 hours/weekend"],
      "riskTolerance": "moderate",
      "timeAvailable": "8 hours",
      "notes": ""
    },
    "decision": {
      "title": "Enter the hackathon",
      "description": "Build an AI productivity app on AWS this weekend.",
      "url": "",
      "desiredOutcome": "Strengthen my portfolio"
    }
  }' | jq
```

## Teardown

```bash
sam delete --stack-name north-star
```

This removes the Lambda, API Gateway, IAM role, and log groups. No user data is
stored in AWS, so nothing else needs to be purged.
