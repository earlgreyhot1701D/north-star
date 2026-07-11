Read `AGENTS.md`, `PRD.md`, `BUILD_GUIDE.md`, `README.md`, `docs/architecture.md`, and `docs/design-reference.html` before making changes.

Build the smallest secure production capable MVP of North Star.

North Star evaluates an opportunity against a locally stored personal decision profile and returns a personalized Decision Alignment Score, recommendation, risks, tradeoffs, assumptions, questions, and next step.

Use Next.js and TypeScript for the frontend. Use AWS Lambda and Amazon Bedrock Nova Lite for evaluation. Keep the user profile in browser localStorage.

Do not add authentication, DynamoDB, RAG, scraping, LinkedIn integration, portfolio crawling, payments, or unrelated features.

Recreate the dieselpunk design as reusable responsive components. Treat `docs/design-reference.html` as visual guidance, not production architecture.

Before implementing, produce:

1. Proposed file structure
2. Implementation checklist
3. Conflicts or ambiguities found in the specifications

Then implement in phases:

1. Scaffold the application
2. Build the responsive frontend with mocked results
3. Implement the Lambda and Bedrock integration
4. Add validation, CORS, rate controls, logging safeguards, and error handling
5. Add tests
6. Complete the README and deployment instructions

Before declaring completion, run:

1. Lint
2. Type checking
3. Production build
4. Endpoint tests
5. Input validation checks
6. CORS review
7. Secret exposure review
8. Logging privacy review

Do not expand scope without explicit approval.
