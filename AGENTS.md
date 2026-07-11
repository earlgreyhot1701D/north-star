# North Star Repository Instructions

## Objective

Build the smallest secure working version of North Star for the AWS Weekend Productivity Challenge.

## Priority Order

1. Working deployed application
2. Amazon Bedrock integration
3. Secure backend architecture
4. Responsive dieselpunk interface
5. Clean public repository
6. Optional polish

## Required Stack

Frontend: Next.js with TypeScript

Hosting: Vercel

Backend: AWS Lambda

AI: Amazon Bedrock using Amazon Nova Lite

Monitoring: Amazon CloudWatch

Persistence: browser localStorage only

## Constraints

1. Do not add authentication
2. Do not add DynamoDB
3. Do not add LinkedIn integration
4. Do not add portfolio crawling
5. Do not add RAG
6. Do not add payments
7. Do not create unnecessary abstractions
8. Do not expose AWS credentials to the browser
9. Do not log user profile or decision content
10. Do not expand scope without explicit approval

## Design Rule

Read `docs/design-reference.html`.

Use it as visual guidance.

Rebuild the interface as reusable React components.

Do not paste the entire reference file into one component.

## Security Rule

1. Validate every request on the server
2. Use least privilege IAM
3. Restrict CORS
4. Keep the system prompt server side
5. Treat user content as untrusted data
6. Validate model output
7. Do not expose internal errors
8. Do not commit secrets

## Required Validation

Before completion:

1. Run lint
2. Run type checking
3. Run production build
4. Test the evaluation endpoint
5. Confirm mobile responsiveness
6. Confirm CORS allows only configured origins
7. Confirm inputs have length limits
8. Confirm errors do not expose internal details
9. Confirm no secrets appear in the client bundle
10. Confirm logs exclude user content

## Completion Rule

A task is complete only when the application builds successfully and the README contains setup and deployment instructions.

## Implementation Status

The MVP is implemented. Frontend (Next.js App Router + TypeScript) is in `src/`,
the deployable backend (AWS SAM: Lambda + API Gateway + Bedrock Nova Lite) is in
`infra/`. All required validation passes: `npm run lint`, `npm run typecheck`,
`npm test`, `npm run build`, and `npm run sam:validate`. See `README.md` for
setup, deployment, security, and privacy details. The AWS infrastructure is
ready for review/deploy via Kiro or the SAM CLI but is **not** deployed by this
repository.
