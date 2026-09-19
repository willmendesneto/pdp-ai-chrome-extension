# Review extension change

Review the current diff using [`docs/CODE-REVIEW-STANDARDS.md`](../../docs/CODE-REVIEW-STANDARDS.md).

Cover:

1. Security (API key, HTML exfiltration, permissions)
2. Message / JSON contract consistency (grep all `type:` handlers)
3. MAIN vs isolated world boundaries
4. Docs updated for touched features
5. Manual test plan (`docs/TESTING-GUIDE.md`)

Output: bullet findings by severity (blocker / should-fix / nit).
