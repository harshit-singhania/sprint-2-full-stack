# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

---

## Project Overview

Full-stack used car buy-and-sell marketplace. Backend is complete; `frontend/` is an empty directory not yet implemented.

## Backend Commands (from `backend/`)

```bash
# Run dev server (port 8080)
mvn spring-boot:run

# Build production JAR
mvn clean package
java -jar target/used-car-management-0.0.1-SNAPSHOT.jar

# Run tests (uses H2 in-memory DB)
mvn test

# Run a single test class
mvn test -Dtest=ClassName
```

## Backend Architecture

**Stack:** Spring Boot 3.3.5, Java 17, Apache Derby (file-based, default), MySQL (via env vars), Spring Data JPA, BCrypt, SpringDoc OpenAPI

**Package root:** `com.example.usedcars`

- `controller/` — REST layer; one controller per domain (Auth, Car, Admin, Purchase, Wishlist, Feedback, SupportTicket)
- `service/` + `service/impl/` — Business logic; interfaces in `service/`, implementations in `impl/`
- `repository/` — Spring Data JPA repositories
- `model/` — JPA entities + enums (`Role`, `ApprovalStatus`, `OrderStatus`, `PaymentStatus`, `TicketStatus`)
- `dto/` — Request/response DTOs decoupled from entities
- `exception/` — `ApiException` + `GlobalExceptionHandler` for uniform error responses
- `config/` — CORS (`CorsConfig`), AOP logging (`LoggingAspect`), OpenAPI (`OpenApiConfig`)

**Authentication:** Custom session tokens (no JWT). Login returns a token stored server-side; all protected endpoints require the `X-Session-Token` header. Session expiry defaults to 120 minutes.

**Roles:** `USER` (acts as buyer or seller) and `ADMIN`. First registered `ADMIN` bootstraps the system.

**Purchase flow (multi-step approval):**
1. Seller lists car → Admin approves listing
2. Buyer purchases → Admin approves order → Seller approves sale → order complete

**Database:** Derby file DB (`usedcarsdb/`) by default; override via `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER` env vars for MySQL. Schema auto-updates via `JPA_DDL_AUTO=update`.

**Swagger UI:** `http://localhost:8080/swagger-ui.html` — available in dev for manual API testing.

## Key Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:derby:usedcarsdb;create=true` | Datasource URL |
| `DB_USERNAME` / `DB_PASSWORD` | empty | DB credentials |
| `DB_DRIVER` | Derby autoloaded driver | JDBC driver class |
| `SESSION_EXPIRATION_MINUTES` | `120` | Session TTL |
| `NOTIFICATION_EMAIL_ENABLED` | `false` | Toggle email notifications |
| `PORT` | `8080` | Server port |
| `JPA_DDL_AUTO` | `update` | Hibernate DDL mode |

See `backend/.env.example` for the full list including SMTP settings.

## API Notes

- All protected endpoints require `X-Session-Token: <token>` header
- Errors return uniform JSON via `GlobalExceptionHandler`
- Full endpoint reference: `backend/API_SCHEMA.md`

---

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |

Admin: demoadmin / Demo@1234
Buyer/Seller: demouser / Demo@1234
Verified roles: ADMIN and USER
