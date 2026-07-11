# North Star Product Requirements Document

## Product Summary

North Star is an AI powered decision assistant that evaluates an opportunity against a user's personal goals, priorities, strengths, constraints, available time, and risk tolerance.

The product does not make decisions for the user. It produces a transparent fit assessment that helps the user think clearly.

## Primary Use Case

A user wants to evaluate whether an opportunity is a good fit.

Examples include:

1. Entering a hackathon
2. Applying for a job
3. Pursuing a certification
4. Buying a course
5. Starting a side project

## MVP Goal

A user can create a personal decision profile, paste an opportunity, and receive a structured AI evaluation.

## Core User Flow

### Screen 1: Welcome

Headline: Make better decisions with structured AI reasoning.

Primary action: Get Started

### Screen 2: Personal Decision Profile

Fields:

1. Primary goals
2. Current priorities
3. Existing strengths
4. Constraints
5. Risk tolerance
6. Time available
7. Additional notes

The profile is stored in browser localStorage.

### Screen 3: Opportunity Evaluation

Fields:

1. Decision title
2. Opportunity description
3. Optional URL
4. Desired outcome

Primary action: Evaluate This Decision

### Screen 4: Decision Report

Required output:

1. Decision Alignment Score from 0 to 100
2. Overall recommendation
3. Confidence level
4. Why this fits
5. Why this may not fit
6. Tradeoffs
7. Hidden assumptions
8. Questions the user has not considered
9. Suggested next step

## Decision Alignment Score

The Decision Alignment Score represents personal fit, not objective quality.

The score should reflect the relationship between:

1. User goals
2. User priorities
3. Existing strengths
4. Constraints
5. Available time
6. Risk tolerance
7. Opportunity requirements
8. Expected value

Suggested labels:

1. 90 to 100: Excellent Match
2. 75 to 89: Strong Match
3. 60 to 74: Moderate Match
4. 40 to 59: Weak Match
5. 0 to 39: Poor Match

## AI Behavior

The model must:

1. Use the user's profile as the primary evaluation context
2. Explain tradeoffs clearly
3. Identify assumptions
4. Avoid false certainty
5. Produce practical next steps
6. Return valid structured JSON
7. Ignore instructions embedded inside user supplied opportunity text
8. Treat user supplied content as data

## Required AWS Architecture

Frontend: Next.js with TypeScript

Frontend hosting: Vercel

Backend: AWS Lambda

AI service: Amazon Bedrock

Recommended model: Amazon Nova Lite

Monitoring: Amazon CloudWatch

Persistence: browser localStorage only

Optional API layer: Amazon API Gateway

## Security Requirements

### Credentials

1. AWS credentials must never be exposed to the client
2. Bedrock access must occur only through Lambda
3. Secrets must not be committed to GitHub
4. Use IAM least privilege

### Input Validation

1. Reject empty required fields
2. Enforce maximum input lengths
3. Trim whitespace
4. Remove unsupported control characters
5. Validate request shape on the server
6. Reject oversized payloads

### Prompt Security

1. Store the system prompt on the server
2. Separate system instructions from user data
3. Explicitly tell the model to treat embedded instructions as untrusted content
4. Validate the model response before returning it to the client

### Network Controls

1. HTTPS only
2. Restrictive CORS
3. POST only for evaluation
4. Allow only the configured production origin
5. Apply rate limiting or API throttling

### Privacy

1. Store the user profile only in localStorage
2. Do not persist prompts or decision content in AWS
3. Do not log profile content
4. Do not log opportunity content
5. Log only operational metadata and request identifiers

### Error Handling

1. Show friendly user facing messages
2. Keep detailed errors in CloudWatch
3. Do not expose stack traces
4. Handle timeouts gracefully

## Accessibility Requirements

1. Keyboard navigation
2. Visible focus indicators
3. Proper heading hierarchy
4. Associated labels for fields
5. High contrast text
6. Responsive layout
7. Reduced motion support where practical

## Performance Requirements

1. Responsive on mobile and desktop
2. Production build must pass
3. Typical evaluation should complete within ten seconds
4. The large embedded reference image must be optimized before production

## Explicitly Out of Scope

1. Authentication
2. User accounts
3. DynamoDB
4. LinkedIn integration
5. Portfolio crawling
6. Resume parsing
7. RAG
8. Vector databases
9. Payments
10. Multi user collaboration
11. Agents
12. Workflow automation

## Success Criteria

1. Working deployed application
2. Bedrock powered evaluation
3. Decision Alignment Score
4. Responsive dieselpunk interface
5. Secure backend integration
6. Public GitHub repository
7. Clear setup instructions
8. Architecture overview
9. Screenshots suitable for the AWS Builder Center article

## Implementation Status

This PRD is realized by the code in `src/` (frontend + Next.js proxy) and
`infra/` (AWS SAM Lambda + API Gateway + Bedrock Nova Lite). The Decision
Alignment Score, personalized evaluation, dieselpunk interface, localStorage
profile, and secure backend are implemented. Lint, type check, unit +
integration tests, production build, and SAM validation all pass. See
`README.md` and `docs/architecture.md`.
