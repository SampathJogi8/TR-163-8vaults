# DebtScan: Core Coding Standards & Compliance

This document outlines the professional coding standards enforced by 8Vaults and expected from all contributors. Our goal is to maintain a codebase that is **Secure**, **Performant**, and **Self-Documenting**.

---

## 1. Security First (The Gold Standard)

Security is not a feature; it is a prerequisite.

### 1.1 Secrets Management
- **Rule**: NEVER commit API keys, passwords, database URLs, or secret tokens to the repository.
- **Action**: Use `.env` files and ensure they are listed in `.gitignore`. Use a secrets manager (e.g., Vault, AWS Secrets Manager) for production.
- **Detection**: DebtScan will flag any string literal that matches entropy patterns for keys (e.g., `sk-`, `ghp_`, `AIza`).

### 1.2 Input Validation & Sanitization
- **Rule**: All external data is malicious until proven otherwise.
- **Action**: Validate all request bodies, query params, and file uploads using schema validators (e.g., Zod, Joi).
- **Prevention**: Use parameterized queries for SQL to prevent SQL Injection. Avoid `dangerouslySetInnerHTML` in React unless absolutely necessary and sanitized.

---

## 2. Code Quality & Maintainability

### 2.1 The "S.O.L.I.D" Principles
- **Single Responsibility**: Each function/module should do one thing and do it well.
- **Complexity**: Keep Cyclomatic Complexity under 10. Large `switch` or nested `if/else` blocks should be refactored into strategies or lookup tables.

### 2.2 Naming Conventions
- **Variables/Functions**: Use `camelCase`. Names should be descriptive (e.g., `isSubscriptionActive` instead of `flag`).
- **Constants**: Use `SCREAMING_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Classes/Components**: Use `PascalCase` (e.g., `AuditReportGenerator`).

### 2.3 Error Handling
- **Rule**: Avoid "silent failures."
- **Action**: Always wrap async calls in `try/catch`. Provide meaningful error messages and log them to a monitoring service (not just `console.log`).

---

## 3. Performance & Optimization

### 3.1 Asynchronous Operations
- Avoid `await` inside loops. Use `Promise.all()` or batching for concurrent operations.
- Use lazy loading for heavy components or modules.

### 3.2 Memory Hygiene
- Cleanup effects in React (`useEffect` returns).
- Use streams for large file processing on the server instead of reading buffer into memory.

---

## 4. Documentation & Clarity

### 4.1 Comments
- **Rule**: "Code should explain *How*, comments should explain *Why*."
- **Preference**: Self-documenting code is preferred over excessive comments. If a comment explains what a line does, the code is likely too complex.

### 4.2 API Documentation
- Every API endpoint must have a JSDoc block describing its inputs, outputs, and status codes.

---

## 5. Review Checklist (Before Every Commit)

- [ ] Does this commit contain any secrets or API keys?
- [ ] Are all new functions unit-testable?
- [ ] Have I handled potential null/undefined values?
- [ ] Is the cyclomatic complexity low?
- [ ] Does it meet the team's styling (Prettier/ESLint passed)?

*Compiled by DebtScan Analysis Engine — 2026*
