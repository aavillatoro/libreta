# Libreta

Bookkeeping by voice, for vendors who get paid in cash. A vendor talks to Moni, a Spanish-speaking ElevenLabs voice agent, in the web app. Code saves every entry and does all the math. The vendor can create an income and expense statement in English for a lender, benefits office, or tax preparer.

Built at the Latinos x AI Hackathon NYC (October 10, 2026), Finance track.

## How Libreta uses Base44

- Database: the Vendor and Entry entities store every sale and expense in cents, and Base44 timestamps each record. Both are locked, so the browser can't read them directly; only backend functions can.
- Backend functions as Moni's tools: add-entry, correct-entry, and get-totals each have their own HTTP endpoint. The ElevenLabs agent calls them mid-conversation, protected by a shared secret stored in Base44 secrets. The functions do all the math, convert dollars to cents, and turn "today" or "yesterday" into a date in New York time.
- Ledger and statements: a get-ledger function returns a vendor's entries and totals only for their private token, and the statement is built from those saved records.
- Hosting: the React app is deployed on Base44 at https://libreta-942cd7e9.base44.app.
- Workflow: built with the Base44 CLI and Base44's agent skills in Claude Code, so the entities, functions, and site are all code in the public repo.

## How it's built

**Stack:** Base44 (entities, backend functions, hosting) + React (Vite) + ElevenLabs React SDK for the live talk button.

**Core rule: the AI only listens; code keeps the books.** Moni never calculates. All totals and statements come from saved entries.

**Entities**
- Vendor: business name, owner first name or nickname, private link token (long random string).
- Entry: vendor, type (sale or expense), item, category, quantity (optional), amount in cents, date, timestamp.
- Both are closed to the browser. Only backend functions read or write them.

**Data rules**
- Money is stored in cents (8750, not 87.50). Moni sends dollars as spoken; the function converts.
- Moni sends "today" or "yesterday"; the function sets the date in New York time.
- Profit = sales minus expenses, calculated only in code.

**Backend functions for Moni (called over HTTP by ElevenLabs)**
- add-entry(user_token, type, item, category, quantity?, unit_price or amount, date?) → saves one entry, returns a short confirmation.
- correct-entry(user_token, item, new value) → updates an existing entry, or returns "not found."
- get-totals(user_token) → today's sales, expenses, profit.
- Each checks a shared secret in the `x-moni-secret` header and uses service-role access. The secret lives in Base44 secrets as `MONI_SECRET`, never in code or the frontend.

**Backend functions for the web page**
- get-ledger(user_token) → that vendor's entries plus totals calculated in code. No shared secret; the token is the key.
- create-vendor(business_name, owner_name) → creates a vendor with a new random token and returns it. Open to anyone; it only creates.
- get-statement(user_token, period) → income by item, expenses by category, net profit, and every entry for the last 1, 3, or 12 full calendar months, calculated in code. Same key.

**Web app (two screens)**
- Viewer: opened by a private link with the user's token. Moni's image, a passbook-style hero card (sales, expenses, saldo), a notebook-style ledger, and a talk button. The page passes user_token to the agent as a dynamic variable and reloads the ledger from get-ledger after each Moni message.
- Statement: "Crear mi estado de cuenta" → préstamo (1 month), beneficios o vivienda (3 months), impuestos (12 months). Income and expenses by category, net profit, appendix of all entries. English by default, Spanish toggle, print-friendly page to save as PDF.
- "Empezar mi libreta" button: asks for a business name and a first name or nickname, then opens the new vendor's private link.
- "Ver demo" button: opens a sample vendor with 3 months of labeled sample entries, created by `scripts/seed-demo.ts`.

**Privacy:** no location, legal name, ID, or immigration questions. Private random-token links. Vendors decide who sees their statements.

**Out of scope today:** login, WhatsApp (connected, waiting on Meta business verification), multiple businesses, CSV export.
